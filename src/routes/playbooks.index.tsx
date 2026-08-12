import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { playbooks } from "@/lib/playbooks";

export const Route = createFileRoute("/playbooks/")({
  head: () => ({
    meta: [
      { title: "Commodity procedure playbooks — gold, aluminium, bauxite, copper" },
      {
        name: "description",
        content:
          "Step-by-step export procedures for gold, aluminium, bauxite ore and copper: whom to talk to, documents in order, and the red flags.",
      },
      {
        property: "og:title",
        content: "Commodity procedure playbooks — gold, aluminium, bauxite, copper",
      },
      {
        property: "og:description",
        content: "The correct order of documents and contacts for each internationally traded commodity.",
      },
    ],
  }),
  component: PlaybookIndex,
});

function PlaybookIndex() {
  return (
    <AppShell
      title="Procedure playbooks"
      subtitle="For each commodity: the people who matter, the documents in order, and the traps that kill deals."
    >
      <div className="grid gap-5 md:grid-cols-2">
        {playbooks.map((p) => (
          <Link key={p.slug} to="/playbooks/$slug" params={{ slug: p.slug }} className="panel-3d block p-6">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs uppercase tracking-widest text-accent">{p.symbol}</span>
              <span className="text-xs text-muted-foreground">{p.steps.length} steps</span>
            </div>
            <h2 className="mt-2 text-xl font-semibold">{p.name}</h2>
            <p className="mt-2 text-sm text-muted-foreground">{p.tagline}</p>
            <p className="mt-3 text-sm">
              <span className="text-muted-foreground">Routes: </span>
              {p.routes}
            </p>
            <p className="mt-1 text-sm">
              <span className="text-muted-foreground">Incoterms: </span>
              {p.typicalIncoterms.join(", ")}
            </p>
            <span className="mt-4 inline-flex items-center text-sm text-primary">
              Open playbook <ArrowRight className="ml-1 h-4 w-4" />
            </span>
          </Link>
        ))}
      </div>
    </AppShell>
  );
}
