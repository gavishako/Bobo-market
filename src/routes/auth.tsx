import { createFileRoute, useNavigate, useSearch } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Header, Footer } from "@/components/site-chrome";
import { z } from "zod";
import { Eye, EyeOff } from "lucide-react";

const searchSchema = z.object({ redirect: z.string().optional() });

export const Route = createFileRoute("/auth")({
  component: AuthPage,
  validateSearch: (s) => searchSchema.parse(s),
});

function AuthPage() {
  const navigate = useNavigate();
  const { redirect } = useSearch({ from: "/auth" });
  const [loading, setLoading] = useState(false);

  const [signinEmail, setSigninEmail] = useState("");
  const [signinPassword, setSigninPassword] = useState("");
  const [signinShowPassword, setSigninShowPassword] = useState(false);
  const [signupName, setSignupName] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [signupShowPassword, setSignupShowPassword] = useState(false);

  async function handleSignIn(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    const { data, error } = await supabase.auth.signInWithPassword({ email: signinEmail, password: signinPassword });
    if (error) {
      setLoading(false);
      return toast.error(error.message);
    }
    toast.success("Connecté !");
    let dest: string = (redirect as any) || "/";
    if (data.user) {
      const { data: roles } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", data.user.id);
      if ((roles ?? []).some((r) => r.role === "admin")) dest = "/admin";
    }
    navigate({ to: dest });
  }


  async function handleSignUp(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email: signupEmail,
      password: signupPassword,
      options: { data: { full_name: signupName }, emailRedirectTo: window.location.origin },
    });
    setLoading(false);
    if (error) return toast.error(error.message);
    toast.success("Compte créé !");
    navigate({ to: "/" });
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="mx-auto grid max-w-md gap-6 px-6 py-12">
        <div className="text-center">
          <h1 className="font-display text-4xl text-primary">Bienvenue</h1>
          <p className="text-sm text-muted-foreground">Connectez-vous pour commander vos fruits et légumes.</p>
        </div>

        <Tabs defaultValue="signin">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="signin">Connexion</TabsTrigger>
            <TabsTrigger value="signup">Inscription</TabsTrigger>
          </TabsList>
          <TabsContent value="signin" className="mt-4">
            <form onSubmit={handleSignIn} className="space-y-3">
              <div><Label>Email</Label><Input type="email" required value={signinEmail} onChange={(e) => setSigninEmail(e.target.value)} /></div>
              <div>
                <Label>Mot de passe</Label>
                <div className="relative">
                  <Input
                    type={signinShowPassword ? "text" : "password"}
                    required
                    className="pr-10"
                    value={signinPassword}
                    onChange={(e) => setSigninPassword(e.target.value)}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-2 top-1/2 -translate-y-1/2"
                    onClick={() => setSigninShowPassword((show) => !show)}
                    aria-label={signinShowPassword ? "Cacher le mot de passe" : "Afficher le mot de passe"}
                  >
                    {signinShowPassword ? <EyeOff /> : <Eye />}
                  </Button>
                </div>
              </div>
              <Button type="submit" className="w-full" disabled={loading}>Se connecter</Button>
            </form>
          </TabsContent>
          <TabsContent value="signup" className="mt-4">
            <form onSubmit={handleSignUp} className="space-y-3">
              <div><Label>Nom complet</Label><Input required value={signupName} onChange={(e) => setSignupName(e.target.value)} /></div>
              <div><Label>Email</Label><Input type="email" required value={signupEmail} onChange={(e) => setSignupEmail(e.target.value)} /></div>
              <div>
                <Label>Mot de passe</Label>
                <div className="relative">
                  <Input
                    type={signupShowPassword ? "text" : "password"}
                    required
                    minLength={6}
                    className="pr-10"
                    value={signupPassword}
                    onChange={(e) => setSignupPassword(e.target.value)}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-2 top-1/2 -translate-y-1/2"
                    onClick={() => setSignupShowPassword((show) => !show)}
                    aria-label={signupShowPassword ? "Cacher le mot de passe" : "Afficher le mot de passe"}
                  >
                    {signupShowPassword ? <EyeOff /> : <Eye />}
                  </Button>
                </div>
              </div>
              <Button type="submit" className="w-full" disabled={loading}>Créer mon compte</Button>
            </form>
          </TabsContent>
        </Tabs>
      </div>
      <Footer />
    </div>
  );
}
