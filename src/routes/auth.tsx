import { useEffect, useState } from "react";
import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { Anchor } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { useAuth } from "@/hooks/useAuth";
import { Globe } from "@/components/Globe";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign in — BrokerDesk commodity broker workspace" },
      {
        name: "description",
        content: "Sign in to your private commodity broker desk to manage deals, counterparties and procedures.",
      },
      { property: "og:title", content: "Sign in — BrokerDesk" },
      { property: "og:description", content: "Access your private commodity brokerage workspace." },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [busy, setBusy] = useState(false);
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && user) navigate({ to: "/deals" });
  }, [user, loading, navigate]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: window.location.origin,
            data: { full_name: fullName },
          },
        });
        if (error) throw error;
        toast.success("Account created. Signing you in…");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
    } catch (err) {
      const raw = err instanceof Error ? err.message : "Authentication failed";
      if (/invalid login credentials/i.test(raw)) {
        toast.error(
          "Email or password is wrong. If you never finished creating an account, use “Create one” below.",
        );
      } else if (/already registered|already been registered/i.test(raw)) {
        toast.error("That email already has an account — switch to Sign in.");
      } else if (/weak|pwned|compromised/i.test(raw)) {
        toast.error("Please choose a stronger password (8+ characters, mix letters and numbers).");
      } else {
        toast.error(raw);
      }
    } finally {
      setBusy(false);
    }
  };


  const google = async () => {
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
    if (result.error) {
      toast.error("Google sign-in failed. Please try again.");
      return;
    }
    if (result.redirected) return;
    navigate({ to: "/deals" });
  };

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="relative hidden flex-col justify-center overflow-hidden px-12 lg:flex">
        <div className="grid-lines pointer-events-none absolute inset-0 opacity-20" aria-hidden />
        <Link to="/" className="relative flex items-center gap-2 font-display text-sm font-bold">
          <Anchor className="h-5 w-5 text-primary" /> BrokerDesk
        </Link>
        <div className="relative mt-8 max-w-md">
          <h2 className="text-3xl font-bold">One desk for every international deal.</h2>
          <p className="mt-3 text-sm text-muted-foreground">
            Gold, aluminium, bauxite, copper — the right contact, the right document, in the right order.
          </p>
        </div>
        <div className="relative mt-6 max-w-md opacity-90">
          <Globe />
        </div>
      </div>

      <div className="flex items-center justify-center px-4 py-16">
        <div className="panel w-full max-w-md p-8">
          <h1 className="text-2xl font-bold">{mode === "signin" ? "Sign in" : "Create your desk"}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Your deals stay private to your account.
          </p>

          <Button variant="outline" className="mt-6 w-full" onClick={google} type="button">
            Continue with Google
          </Button>

          <div className="my-5 flex items-center gap-3 text-xs uppercase tracking-widest text-muted-foreground">
            <span className="h-px flex-1 bg-border" /> or email <span className="h-px flex-1 bg-border" />
          </div>

          <form onSubmit={submit} className="space-y-4">
            {mode === "signup" ? (
              <div className="space-y-2">
                <Label htmlFor="fullName">Your name</Label>
                <Input id="fullName" value={fullName} onChange={(e) => setFullName(e.target.value)} />
              </div>
            ) : null}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <Button type="submit" className="w-full" disabled={busy}>
              {busy ? "Please wait…" : mode === "signin" ? "Sign in" : "Create account"}
            </Button>
          </form>

          <button
            type="button"
            className="mt-5 w-full text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
            onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
          >
            {mode === "signin" ? "No account yet? Create one" : "Already have an account? Sign in"}
          </button>

          {mode === "signin" ? (
            <button
              type="button"
              className="mt-2 w-full text-xs text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
              onClick={async () => {
                if (!email) {
                  toast.error("Enter your email above first.");
                  return;
                }
                const { error } = await supabase.auth.resetPasswordForEmail(email, {
                  redirectTo: `${window.location.origin}/reset-password`,
                });
                if (error) {
                  if (/rate limit|over_email_send_rate_limit/i.test(error.message)) {
                    toast.error("Too many reset emails just now — wait a minute and try again.");
                  } else {
                    toast.error(error.message);
                  }
                } else {
                  toast.success(`Secure reset link sent to ${email}. Check your inbox and spam folder.`);
                }
              }}
            >
              Forgot your password?
            </button>
          ) : null}

        </div>
      </div>
    </div>
  );
}
