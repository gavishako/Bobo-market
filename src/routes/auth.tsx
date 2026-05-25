import { createFileRoute, useNavigate, useSearch } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Header, Footer } from "@/components/site-chrome";
import { Eye, EyeOff } from "lucide-react";
import { z } from "zod";

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
  const [showSigninPassword, setShowSigninPassword] = useState(false);
  const [signupName, setSignupName] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [showSignupPassword, setShowSignupPassword] = useState(false);

  async function handleSignIn(e: React.FormEvent) {
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
    window.location.assign(dest);
  }


  async function handleSignUp(e: React.FormEvent) {
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

        <Button variant="outline" disabled className="h-11 opacity-50 cursor-not-allowed">
          <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38z"/></svg>
          Continuer avec Google (non configuré)
        </Button>

        <div className="relative my-2 text-center text-xs text-muted-foreground"><span className="bg-background px-2">ou</span><div className="absolute inset-x-0 top-1/2 -z-10 border-t border-border" /></div>

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
                  <Input type={showSigninPassword ? "text" : "password"} required value={signinPassword} onChange={(e) => setSigninPassword(e.target.value)} />
                  <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground" onClick={() => setShowSigninPassword(!showSigninPassword)}>
                    {showSigninPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
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
                  <Input type={showSignupPassword ? "text" : "password"} required minLength={6} value={signupPassword} onChange={(e) => setSignupPassword(e.target.value)} />
                  <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground" onClick={() => setShowSignupPassword(!showSignupPassword)}>
                    {showSignupPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
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
