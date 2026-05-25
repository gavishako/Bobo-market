import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { Header, Footer } from "@/components/site-chrome";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

export const Route = createFileRoute("/account/")({ component: AccountPage });

function AccountPage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => { if (!loading && !user) navigate({ to: "/auth" }); }, [user, loading]);

  useEffect(() => {
    if (!user) return;
    supabase.from("profiles").select("*").eq("id", user.id).single().then(({ data }) => {
      if (data) { setFullName(data.full_name ?? ""); setPhone(data.phone ?? ""); setAddress(data.address ?? ""); }
    });
  }, [user]);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    const { error } = await supabase.from("profiles").update({ full_name: fullName, phone, address }).eq("id", user.id);
    setSaving(false);
    if (error) toast.error(error.message);
    else toast.success("Profil mis à jour");
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <form onSubmit={save} className="mx-auto w-full max-w-xl space-y-3 sm:space-y-4 px-3 sm:px-4 md:px-6 py-6 sm:py-8 md:py-12">
        <h1 className="font-display text-2xl sm:text-3xl md:text-4xl lg:text-5xl text-primary">Mon compte</h1>
        <div>
          <Label className="text-xs sm:text-sm">Nom complet</Label>
          <Input value={fullName} onChange={(e) => setFullName(e.target.value)} className="mt-1 text-xs sm:text-sm" />
        </div>
        <div>
          <Label className="text-xs sm:text-sm">Téléphone</Label>
          <Input value={phone} onChange={(e) => setPhone(e.target.value)} className="mt-1 text-xs sm:text-sm" />
        </div>
        <div>
          <Label className="text-xs sm:text-sm">Adresse</Label>
          <Textarea value={address} onChange={(e) => setAddress(e.target.value)} className="mt-1 text-xs sm:text-sm" />
        </div>
        <Button type="submit" disabled={saving} size="sm">{saving ? "…" : "Enregistrer"}</Button>
      </form>
      <Footer />
    </div>
  );
}
