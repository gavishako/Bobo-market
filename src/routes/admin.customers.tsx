import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/customers")({ component: AdminCustomers });

function AdminCustomers() {
  const qc = useQueryClient();
  const { data = [] } = useQuery({
    queryKey: ["admin-customers"],
    queryFn: async () => {
      const { data: profiles, error } = await supabase.from("profiles").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      const { data: roles } = await supabase.from("user_roles").select("user_id,role");
      return (profiles ?? []).map((p: any) => ({ ...p, roles: (roles ?? []).filter((r: any) => r.user_id === p.id).map((r: any) => r.role) }));
    },
  });

  async function toggleAdmin(userId: string, isAdmin: boolean) {
    if (isAdmin) {
      const { error } = await supabase.from("user_roles").delete().eq("user_id", userId).eq("role", "admin");
      if (error) return toast.error(error.message);
    } else {
      const { error } = await supabase.from("user_roles").insert({ user_id: userId, role: "admin" });
      if (error) return toast.error(error.message);
    }
    toast.success("Mis à jour");
    qc.invalidateQueries({ queryKey: ["admin-customers"] });
  }

  async function del(id: string) {
    if (!confirm("Supprimer ce profil ?")) return;
    const { error } = await supabase.from("profiles").delete().eq("id", id);
    if (error) toast.error(error.message); else { toast.success("Supprimé"); qc.invalidateQueries({ queryKey: ["admin-customers"] }); }
  }

  return (
    <div>
      <h1 className="font-display text-4xl text-primary">Clients</h1>
      <div className="mt-8 overflow-hidden rounded-xl bg-card shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-secondary text-left text-xs uppercase">
            <tr><th className="p-3">Nom</th><th className="p-3">Email</th><th className="p-3">Téléphone</th><th className="p-3">Rôle</th><th className="p-3"></th></tr>
          </thead>
          <tbody>
            {data.map((c: any) => {
              const isAdmin = c.roles?.includes("admin");
              return (
                <tr key={c.id} className="border-t border-border">
                  <td className="p-3">{c.full_name || "—"}</td>
                  <td className="p-3">{c.email}</td>
                  <td className="p-3">{c.phone || "—"}</td>
                  <td className="p-3">{isAdmin ? <span className="rounded bg-gold/20 px-2 py-0.5">Admin</span> : "Client"}</td>
                  <td className="p-3 text-right">
                    <Button size="sm" variant="outline" onClick={() => toggleAdmin(c.id, isAdmin)}>{isAdmin ? "Retirer admin" : "Faire admin"}</Button>
                    <Button size="sm" variant="ghost" className="ml-2 text-destructive" onClick={() => del(c.id)}>Supprimer</Button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
