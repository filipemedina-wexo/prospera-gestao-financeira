/* eslint-env deno */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { Pool } from "https://deno.land/x/postgres@v0.17.0/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const DATABASE_URL = Deno.env.get("SUPABASE_DB_URL") || Deno.env.get("DATABASE_URL");
if (!DATABASE_URL) {
  console.error("Missing SUPABASE_DB_URL/DATABASE_URL environment variable");
}

const pool = DATABASE_URL ? new Pool(DATABASE_URL, 3, true) : null;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (!pool) {
    return new Response(JSON.stringify({ error: "Database not configured" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const url = new URL(req.url);
  const segments = url.pathname.replace(/^\/receivables/, "").split("/").filter(Boolean);

  if (req.method !== "POST" || segments.length !== 2 || segments[1] !== "receive") {
    return new Response("Not found", { status: 404, headers: corsHeaders });
  }

  const id = segments[0];
  const { account_id, received_at } = await req.json();

  const client = await pool.connect();
  try {
    await client.queryArray`BEGIN`;

    const existingTx = await client.queryObject<{ id: string }>`
      SELECT id FROM financial_transactions
      WHERE reference_type = 'account_receivable' AND reference_id = ${id}
    `;
    if (existingTx.rows.length > 0) {
      const receivable = await client.queryObject`SELECT * FROM accounts_receivable WHERE id = ${id}`;
      await client.queryArray`COMMIT`;
      return new Response(JSON.stringify(receivable.rows[0] ?? null), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const receivableQuery = await client.queryObject<any>`
      SELECT * FROM accounts_receivable WHERE id = ${id} FOR UPDATE
    `;
    if (receivableQuery.rows.length === 0) {
      await client.queryArray`ROLLBACK`;
      return new Response(JSON.stringify({ error: "Conta a receber não encontrada" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const receivable = receivableQuery.rows[0];
    if (receivable.status !== "pending" && receivable.status !== "overdue") {
      await client.queryArray`ROLLBACK`;
      return new Response(JSON.stringify({ error: "Status inválido" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const receivedAt = received_at ? new Date(received_at).toISOString() : new Date().toISOString();

    await client.queryArray`INSERT INTO financial_transactions (
      saas_client_id, bank_account_id, type, amount, description, category, transaction_date, reference_type, reference_id
    ) VALUES (
      ${receivable.saas_client_id}, ${account_id}, 'income', ${receivable.amount}, ${receivable.description}, ${receivable.category}, ${receivedAt}, 'account_receivable', ${id}
    )`;

    await client.queryArray`UPDATE accounts_receivable SET status='received', received_date=${receivedAt}, bank_account_id=${account_id}, updated_at=now() WHERE id=${id}`;

    const updated = await client.queryObject`SELECT * FROM accounts_receivable WHERE id = ${id}`;
    await client.queryArray`COMMIT`;
    return new Response(JSON.stringify(updated.rows[0] ?? null), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("receivables-receive error", err);
    await client.queryArray`ROLLBACK`;
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } finally {
    client.release();
  }
});
