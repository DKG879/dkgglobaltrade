import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { AlertTriangle, ArrowLeft, FileText } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { getPlaybook, playbooks, type Playbook } from "@/lib/playbooks";

export const Route = createFileRoute("/playbooks/$slug")({
  loader: ({ params }) => {
    const playbook = getPlaybook(params.slug);
    if (!playbook) throw notFound();
    return { playbook };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return { meta: [{ title: "Playbook not found — BrokerDesk" }, { name: "robots", content: "noindex" }] };
    }
    const { playbook } = loaderData;
    const title = `${playbook.name} trading procedure — whom to talk to and document order`;
    const description = `${playbook.name}: ${playbook.tagline} Contacts, ${playbook.steps.length} procedure steps, documents and red flags for brokers.`;
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
      ],
    };
  },
  component: PlaybookDetail,
});

function PlaybookDetail() {
  const { playbook } = Route.useLoaderData() as { playbook: Playbook };


  return (
    <AppShell title={`${playbook.name} playbook`} subtitle={playbook.tagline}>
      <div className="mb-6 flex flex-wrap items-center gap-2">
        <Button asChild variant="ghost" size="sm">
          <Link to="/playbooks">
            <ArrowLeft className="mr-1 h-4 w-4" /> All playbooks
          </Link>
        </Button>
        {playbooks
          .filter((p) => p.slug !== playbook.slug)
          .map((p) => (
            <Button key={p.slug} asChild variant="outline" size="sm">
              <Link to="/playbooks/$slug" params={{ slug: p.slug }}>
                {p.name}
              </Link>
            </Button>
          ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        <div className="space-y-6">
          <div className="panel p-6">
            <h2 className="text-xl font-semibold">Whom to talk to, in order</h2>
            <ul className="mt-4 space-y-4">
              {playbook.contacts.map((c, i) => (
                <li key={c.role} className="rounded-lg border border-border/70 p-4">
                  <p className="font-mono text-xs uppercase tracking-widest text-accent">
                    Contact {i + 1}
                  </p>
                  <p className="mt-1 font-semibold">{c.role}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{c.why}</p>
                  <p className="mt-2 text-sm text-primary">Ask them: {c.ask}</p>
                </li>
              ))}
            </ul>
          </div>

          <div className="panel p-6">
            <h2 className="text-xl font-semibold">Execution procedure</h2>
            <ol className="mt-4 space-y-4">
              {playbook.steps.map((s, i) => (
                <li key={s.label} className="relative border-l border-border pl-6">
                  <span className="absolute -left-[9px] top-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary font-mono text-[10px] text-primary-foreground">
                    {i + 1}
                  </span>
                  <p className="font-semibold">{s.label}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{s.detail}</p>
                  <p className="mt-1 font-mono text-xs uppercase tracking-wider text-accent">
                    Owner: {s.owner}
                  </p>
                  {s.docs?.length ? (
                    <ul className="mt-2 flex flex-wrap gap-2">
                      {s.docs.map((d) => (
                        <li
                          key={d}
                          className="rounded-full border border-border bg-secondary/50 px-2 py-0.5 text-xs text-muted-foreground"
                        >
                          {d}
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </li>
              ))}
            </ol>
          </div>
        </div>

        <aside className="space-y-6">
          <div className="panel p-6">
            <h2 className="text-lg font-semibold">Deal facts</h2>
            <dl className="mt-3 space-y-3 text-sm">
              <div>
                <dt className="font-mono text-xs uppercase tracking-widest text-muted-foreground">Units</dt>
                <dd>{playbook.units}</dd>
              </div>
              <div>
                <dt className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
                  Typical Incoterms
                </dt>
                <dd>{playbook.typicalIncoterms.join(", ")}</dd>
              </div>
              <div>
                <dt className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
                  Common routes
                </dt>
                <dd>{playbook.routes}</dd>
              </div>
            </dl>
          </div>

          <div className="panel p-6">
            <h2 className="flex items-center gap-2 text-lg font-semibold">
              <FileText className="h-4 w-4 text-primary" /> Document set
            </h2>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-muted-foreground">
              {playbook.documents.map((d) => (
                <li key={d}>{d}</li>
              ))}
            </ul>
          </div>

          <div className="panel p-6">
            <h2 className="flex items-center gap-2 text-lg font-semibold">
              <AlertTriangle className="h-4 w-4 text-destructive" /> Red flags
            </h2>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-muted-foreground">
              {playbook.redFlags.map((f) => (
                <li key={f}>{f}</li>
              ))}
            </ul>
          </div>

          <div className="panel p-6">
            <h2 className="text-lg font-semibold">Run this as a deal</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Create a deal with this commodity and every step above becomes a tickable checklist.
            </p>
            <Button asChild className="mt-4 w-full">
              <Link to="/deals">Go to deal board</Link>
            </Button>
          </div>
        </aside>
      </div>
    </AppShell>
  );
}
