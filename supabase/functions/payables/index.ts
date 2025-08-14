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
  const segments = url.pathname.replace(/^\/payables/, "").split("/").filter(Boolean);

  if (req.method !== "POST" || segments.length !== 2 || segments[1] !== "pay") {
    return new Response("Not found", { status: 404, headers: corsHeaders });
  }

  const id = segments[0];
  const { account_id, paid_at } = await req.json();

  const client = await pool.connect();
  try {
    await client.queryArray`BEGIN`;

    const existingTx = await client.queryObject<{ id: string }>`
      SELECT id FROM financial_transactions
      WHERE reference_type = 'account_payable' AND reference_id = ${id}
    `;
    if (existingTx.rows.length > 0) {
      const payable = await client.queryObject`SELECT * FROM accounts_payable WHERE id = ${id}`;
      await client.queryArray`COMMIT`;
      return new Response(JSON.stringify(payable.rows[0] ?? null), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const payableQuery = await client.queryObject<any>`
      SELECT * FROM accounts_payable WHERE id = ${id} FOR UPDATE
    `;
    if (payableQuery.rows.length === 0) {
      await client.queryArray`ROLLBACK`;
      return new Response(JSON.stringify({ error: "Conta a pagar não encontrada" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const payable = payableQuery.rows[0];
    if (payable.status !== "pending" && payable.status !== "overdue") {
      await client.queryArray`ROLLBACK`;
      return new Response(JSON.stringify({ error: "Status inválido" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const paidAt = paid_at ? new Date(paid_at).toISOString() : new Date().toISOString();

    await client.queryArray`INSERT INTO financial_transactions (
      saas_client_id, bank_account_id, type, amount, description, category, transaction_date, reference_type, reference_id
    ) VALUES (
      ${payable.saas_client_id}, ${account_id}, 'expense', ${payable.amount}, ${payable.description}, ${payable.category}, ${paidAt}, 'account_payable', ${id}
    )`;

    await client.queryArray`UPDATE accounts_payable SET status='paid', paid_date=${paidAt}, bank_account_id=${account_id}, updated_at=now() WHERE id=${id}`;

    const updated = await client.queryObject`SELECT * FROM accounts_payable WHERE id = ${id}`;
    await client.queryArray`COMMIT`;
    return new Response(JSON.stringify(updated.rows[0] ?? null), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("payables-pay error", err);
    await client.queryArray`ROLLBACK`;
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } finally {
    client.release();
  }
});
