
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useState } from "react";
import { ClientList } from "./ClientList";
import { ClientForm } from "./ClientForm";

const Clients = () => {
  const [openForm, setOpenForm] = useState(false);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Clientes</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground text-sm mb-4">
          Gerencie sua base de clientes de maneira eficiente. Use busca, adicione e visualize clientes.
        </p>
        <ClientList onAddClient={() => setOpenForm(true)} />
        <ClientForm open={openForm} onClose={() => setOpenForm(false)} />
      </CardContent>
    </Card>
  );
};

export default Clients;
