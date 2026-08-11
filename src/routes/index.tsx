import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, ShieldCheck, Ship, Users, BookOpen, Anchor } from "lucide-react";
import { Globe } from "@/components/Globe";
import { Button } from "@/components/ui/button";
import { playbooks } from "@/lib/playbooks";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "BrokerDesk — Commodity Broker Deal & Procedure Workspace" },
      {
        name: "description",
        content:
          "Track gold, aluminium, bauxite and copper deals, know exactly whom to talk to, and follow the correct export procedure step by step.",
      },
      { property: "og:title", content: "BrokerDesk — Commodity Broker Deal & Procedure Workspace" },
      {
        property: "og:description",
        content:
          "Deal pipeline, counterparty directory and commodity procedure playbooks for international commodity brokers.",
      },
    ],
  }),
  component: Landing,
});

const features = [
  {
    icon: Ship,
    title: "Deal pipeline",
    body: "Every mandate in one board: commodity, buyer, seller, quantity, Incoterm, stage and target date.",
  },
  {
    icon: BookOpen,
    title: "Procedure playbooks",
    body: "Gold, aluminium, bauxite and copper — the exact document order from NCNDA to final settlement.",
  },
  {
    icon: Users,
    title: "Counterparty directory",
    body: "Buyers, mines, mandates, inspectors, forwarders and banks with trust level and notes.",
  },
  {
    icon: ShieldCheck,
    title: "Red-flag checks",
    body: "Know the scam patterns per commodity before you introduce anyone to anyone.",
  },
];

function Landing() {
  return (
    <div className="min-h-screen">
      <header className="mx-auto flex max-w-7xl items-center justify-between px-4 py-5">
        <span className="flex items-center gap-2 font-display text-sm font-bold">
          <Anchor className="h-5 w-5 text-primary" />
          Broker<span className="-ml-1 text-primary">Desk</span>
        </span>
        <div className="flex items-center gap-2">
          <Button asChild variant="ghost" size="sm">
            <Link to="/playbooks">Playbooks</Link>
          </Button>
          <Button asChild size="sm">
            <Link to="/auth">Open my desk</Link>
          </Button>
        </div>
      </header>

      <section className="relative overflow-hidden">
        <div className="grid-lines pointer-events-none absolute inset-0 opacity-20" aria-hidden />
        <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-4 pb-20 pt-10 lg:grid-cols-2">
          <div>
            <p className="mb-4 inline-flex rounded-full border border-primary/40 bg-primary/10 px-3 py-1 font-mono text-xs uppercase tracking-widest text-primary">
              Metals · Ores · Chemicals
            </p>
            <h1 className="text-4xl font-bold leading-[1.05] sm:text-6xl">
              Stop guessing <span className="text-gradient-gold">whom to call</span> and what comes next.
            </h1>
            <p className="mt-5 max-w-xl text-base text-muted-foreground">
              A working desk for commodity brokers: log every deal, keep buyers, sellers, inspectors and
              forwarders straight, and follow the correct procedure for each commodity from first offer to
              final settlement.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild size="lg">
                <Link to="/auth">
                  Start my deal board <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link to="/playbooks">See a procedure playbook</Link>
              </Button>
            </div>
            <dl className="mt-10 grid max-w-lg grid-cols-3 gap-4 font-mono text-xs uppercase tracking-wider text-muted-foreground">
              <div>
                <dt>Commodities</dt>
                <dd className="mt-1 font-display text-2xl font-bold text-foreground">4+</dd>
              </div>
              <div>
                <dt>Procedure steps</dt>
                <dd className="mt-1 font-display text-2xl font-bold text-foreground">32</dd>
              </div>
              <div>
                <dt>Deal stages</dt>
                <dd className="mt-1 font-display text-2xl font-bold text-foreground">9</dd>
              </div>
            </dl>
          </div>
          <div className="float-slow">
            <Globe />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-20">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((f) => (
            <div key={f.title} className="panel-3d p-6">
              <f.icon className="h-6 w-6 text-primary" />
              <h2 className="mt-4 text-lg font-semibold">{f.title}</h2>
              <p className="mt-2 text-sm text-muted-foreground">{f.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-24">
        <h2 className="text-2xl font-bold">Playbooks ready to use</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Each one names the people to talk to, the documents in order, and the traps.
        </p>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {playbooks.map((p) => (
            <Link
              key={p.slug}
              to="/playbooks/$slug"
              params={{ slug: p.slug }}
              className="panel-3d block p-6"
            >
              <span className="font-mono text-xs uppercase tracking-widest text-accent">{p.symbol}</span>
              <h3 className="mt-2 text-lg font-semibold">{p.name}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{p.tagline}</p>
              <span className="mt-4 inline-flex items-center text-sm text-primary">
                Open playbook <ArrowRight className="ml-1 h-4 w-4" />
              </span>
            </Link>
          ))}
        </div>
      </section>

      <footer className="border-t border-border/60 py-8 text-center text-xs text-muted-foreground">
        BrokerDesk — private workspace for international commodity brokerage.
      </footer>
    </div>
  );
}
