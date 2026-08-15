import type { ReactNode } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { Anchor, Ship, Users, BookOpen, Inbox, LogOut, Building2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";

const nav = [
  { to: "/deals", label: "Deals", icon: Ship },
  { to: "/companies", label: "Companies", icon: Building2 },
  { to: "/contacts", label: "Counterparties", icon: Users },
  { to: "/playbooks", label: "Playbooks", icon: BookOpen },
  { to: "/submissions", label: "Intake", icon: Inbox },
] as const;

export function AppShell({
  title,
  subtitle,
  children,
  actions,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
  actions?: ReactNode;
}) {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-30 border-b border-border/70 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center gap-6 px-4 py-3">
          <Link to="/" className="flex items-center gap-2 font-display text-sm font-bold tracking-tight">
            <Anchor className="h-5 w-5 text-primary" />
            <span>
              Broker<span className="text-primary">Desk</span>
            </span>
          </Link>
          <nav className="flex flex-1 items-center gap-1">
            {nav.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className="rounded-md px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                activeProps={{ className: "bg-secondary text-foreground" }}
              >
                <span className="flex items-center gap-2">
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </span>
              </Link>
            ))}
          </nav>
          {user ? (
            <div className="flex items-center gap-3">
              <span className="hidden text-xs text-muted-foreground sm:inline">{user.email}</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={async () => {
                  await supabase.auth.signOut();
                  navigate({ to: "/auth" });
                }}
              >
                <LogOut className="mr-1 h-4 w-4" /> Sign out
              </Button>
            </div>
          ) : (
            <Button size="sm" onClick={() => navigate({ to: "/auth" })}>
              Sign in
            </Button>
          )}
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">{title}</h1>
            {subtitle ? <p className="mt-1 max-w-2xl text-sm text-muted-foreground">{subtitle}</p> : null}
          </div>
          {actions}
        </div>
        {children}
      </main>
    </div>
  );
}

export function RequireAuth({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  if (loading) {
    return <p className="text-sm text-muted-foreground">Loading your desk…</p>;
  }
  if (!user) {
    return (
      <div className="panel max-w-md p-6">
        <h2 className="text-lg font-semibold">Sign in required</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Your deals and counterparties are private to your account.
        </p>
        <Button className="mt-4" onClick={() => navigate({ to: "/auth" })}>
          Go to sign in
        </Button>
      </div>
    );
  }
  return <>{children}</>;
}
