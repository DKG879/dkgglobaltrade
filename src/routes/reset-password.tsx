import { useEffect, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Anchor, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/reset-password")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Set a new password — BrokerDesk" },
      {
        name: "description",
        content: "Choose a new password for your BrokerDesk commodity brokerage workspace.",
      },
      { property: "og:title", content: "Set a new password — BrokerDesk" },
      { property: "og:description", content: "Complete your password reset and get back to your deals." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ResetPasswordPage,
});

function ResetPasswordPage() {
  const navigate = useNavigate();
  const [ready, setReady] = useState(false);
  const [invalid, setInvalid] = useState(false);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY" || event === "SIGNED_IN") {
        if (!cancelled) {
          setReady(true);
          setInvalid(false);
        }
      }
    });

    const hash = window.location.hash ?? "";
    const params = new URLSearchParams(hash.replace(/^#/, ""));
    const errorDescription = params.get("error_description");

    (async () => {
      if (errorDescription) {
        if (!cancelled) setInvalid(true);
        return;
      }
      const { data } = await supabase.auth.getSession();
      if (cancelled) return;
      if (data.session) setReady(true);
      else if (!/type=recovery|access_token/.test(hash)) setInvalid(true);
    })();

    return () => {
      cancelled = true;
      sub.subscription.unsubscribe();
    };
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 8) {
      toast.error("Use at least 8 characters.");
      return;
    }
    if (password !== confirm) {
      toast.error("The two passwords don't match.");
      return;
    }
    setBusy(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      setDone(true);
      toast.success("Password updated. You're signed in.");
      setTimeout(() => navigate({ to: "/deals" }), 2500);
    } catch (err) {
      const raw = err instanceof Error ? err.message : "Could not update the password";
      if (/expired|invalid/i.test(raw)) {
        toast.error("This reset link has expired. Request a new one from the sign-in page.");
      } else if (/weak|pwned|should be/i.test(raw)) {
        toast.error("Please choose a stronger password (8+ characters, mix letters and numbers).");
      } else {
        toast.error(raw);
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-16">
      <div className="grid-lines pointer-events-none absolute inset-0 opacity-20" aria-hidden />
      <div className="panel relative w-full max-w-md p-8">
        <Link to="/" className="flex items-center gap-2 font-display text-sm font-bold">
          <Anchor className="h-5 w-5 text-primary" /> BrokerDesk
        </Link>

        {done ? (
          <div className="mt-6">
            <CheckCircle2 className="h-10 w-10 text-primary" />
            <h1 className="mt-4 text-2xl font-bold">Password updated</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Your new password is active and you're signed in. Taking you to your deal board…
            </p>
            <Button className="mt-6 w-full" onClick={() => navigate({ to: "/deals" })}>
              Go to deal board
            </Button>
          </div>
        ) : invalid ? (
          <div className="mt-6">
            <h1 className="text-2xl font-bold">Link no longer valid</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Reset links can only be used once and expire after a while. Request a fresh one from the sign-in
              page.
            </p>
            <Button className="mt-6 w-full" onClick={() => navigate({ to: "/auth" })}>
              Back to sign in
            </Button>
          </div>
        ) : (
          <>
            <h1 className="mt-6 text-2xl font-bold">Set a new password</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {ready
                ? "Choose a password you haven't used before."
                : "Verifying your reset link…"}
            </p>
            <form onSubmit={submit} className="mt-6 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password">New password</Label>
                <Input
                  id="password"
                  type="password"
                  required
                  minLength={8}
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm">Confirm new password</Label>
                <Input
                  id="confirm"
                  type="password"
                  required
                  minLength={8}
                  autoComplete="new-password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                />
              </div>
              <Button type="submit" className="w-full" disabled={busy || !ready}>
                {busy ? "Updating…" : "Update password"}
              </Button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
