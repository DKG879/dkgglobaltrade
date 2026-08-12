import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Trash2, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { AppShell, RequireAuth } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { commodityOptions, stages, getPlaybook } from "@/lib/playbooks";

export const Route = createFileRoute("/deals/$dealId")({
  head: () => ({
    meta: [
      { title: "Deal checklist — BrokerDesk" },
      {
        name: "description",
        content: "Work a single commodity deal through its procedure checklist, contacts and documents.",
      },
      { property: "og:title", content: "Deal checklist — BrokerDesk" },
      { property: "og:description", content: "Procedure checklist and counterparties for one deal." },
    ],
  }),
  component: () => (
    <AppShell title="Deal" subtitle="Procedure checklist, terms and the people to call next.">
      <RequireAuth>
        <DealDetail />
      </RequireAuth>
    </AppShell>
  ),
});

function DealDetail() {
  const { dealId } = Route.useParams();
  const qc = useQueryClient();

  const dealQuery = useQuery({
    queryKey: ["deal", dealId],
    queryFn: async () => {
      const { data, error } = await supabase.from("deals").select("*").eq("id", dealId).single();
      if (error) throw error;
      return data;
    },
  });

  const stepsQuery = useQuery({
    queryKey: ["deal-steps", dealId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("deal_steps")
        .select("*")
        .eq("deal_id", dealId)
        .order("step_order");
      if (error) throw error;
      return data;
    },
  });

  const toggle = useMutation({
    mutationFn: async ({ id, done }: { id: string; done: boolean }) => {
      const { error } = await supabase.from("deal_steps").update({ done }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["deal-steps", dealId] }),
    onError: () => toast.error("Could not update the step"),
  });

  const setStage = useMutation({
    mutationFn: async (stage: string) => {
      const { error } = await supabase.from("deals").update({ stage }).eq("id", dealId);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["deal", dealId] });
      qc.invalidateQueries({ queryKey: ["deals"] });
    },
  });

  const remove = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("deals").delete().eq("id", dealId);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["deals"] });
      toast.success("Deal deleted");
      window.history.back();
    },
  });

  if (dealQuery.isLoading) return <p className="text-sm text-muted-foreground">Loading deal…</p>;
  const deal = dealQuery.data;
  if (!deal) return <p className="text-sm text-muted-foreground">Deal not found.</p>;

  const steps = stepsQuery.data ?? [];
  const done = steps.filter((s) => s.done).length;
  const pct = steps.length ? Math.round((done / steps.length) * 100) : 0;
  const playbook = getPlaybook(deal.commodity);
  const nextStep = steps.find((s) => !s.done);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Button asChild variant="ghost" size="sm">
          <Link to="/deals">
            <ArrowLeft className="mr-1 h-4 w-4" /> All deals
          </Link>
        </Button>
        <Button variant="ghost" size="sm" onClick={() => remove.mutate()}>
          <Trash2 className="mr-1 h-4 w-4" /> Delete deal
        </Button>
      </div>

      <div className="panel p-6">
        <span className="font-mono text-xs uppercase tracking-widest text-accent">
          {commodityOptions.find((c) => c.value === deal.commodity)?.label ?? deal.commodity}
        </span>
        <h2 className="mt-2 text-2xl font-bold">{deal.title}</h2>
        <div className="mt-4 grid gap-4 text-sm sm:grid-cols-2 lg:grid-cols-4">
          <Field label="Buyer" value={deal.buyer_name} />
          <Field label="Seller / mine" value={deal.seller_name} />
          <Field
            label="Quantity"
            value={deal.quantity ? `${deal.quantity} ${deal.unit ?? ""}` : null}
          />
          <Field
            label="Price"
            value={deal.price ? `${deal.price} ${deal.currency ?? ""} / ${deal.unit ?? "unit"}` : null}
          />
          <Field label="Incoterm" value={deal.incoterm} />
          <Field label="Origin" value={deal.origin} />
          <Field label="Destination" value={deal.destination} />
          <div>
            <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">Stage</p>
            <select
              className="mt-1 h-9 w-full rounded-md border border-input bg-background px-2 text-sm"
              value={deal.stage}
              onChange={(e) => setStage.mutate(e.target.value)}
            >
              {stages.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>
        </div>
        {deal.notes ? (
          <p className="mt-4 rounded-md bg-secondary/60 p-3 text-sm text-muted-foreground">{deal.notes}</p>
        ) : null}
      </div>

      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <div className="panel p-6">
          <div className="flex items-center justify-between gap-4">
            <h3 className="text-lg font-semibold">Procedure checklist</h3>
            <span className="font-mono text-xs text-muted-foreground">
              {done}/{steps.length} done
            </span>
          </div>
          <Progress value={pct} className="mt-3" />
          {nextStep ? (
            <p className="mt-4 rounded-md border border-primary/40 bg-primary/10 p-3 text-sm">
              <strong className="text-primary">Next:</strong> {nextStep.label}
              {nextStep.owner_role ? ` — talk to: ${nextStep.owner_role}` : ""}
            </p>
          ) : steps.length ? (
            <p className="mt-4 text-sm text-accent">All steps complete. Invoice your commission.</p>
          ) : null}

          <ol className="mt-5 space-y-3">
            {steps.map((step, i) => (
              <li key={step.id} className="flex gap-3 rounded-lg border border-border/70 p-3">
                <Checkbox
                  checked={step.done}
                  onCheckedChange={(v) => toggle.mutate({ id: step.id, done: Boolean(v) })}
                  className="mt-1"
                  aria-label={step.label}
                />
                <div>
                  <p className={`text-sm font-semibold ${step.done ? "text-muted-foreground line-through" : ""}`}>
                    {i + 1}. {step.label}
                  </p>
                  {step.detail ? (
                    <p className="mt-1 text-sm text-muted-foreground">{step.detail}</p>
                  ) : null}
                  {step.owner_role ? (
                    <p className="mt-1 font-mono text-xs uppercase tracking-wider text-accent">
                      Owner: {step.owner_role}
                    </p>
                  ) : null}
                </div>
              </li>
            ))}
          </ol>
        </div>

        <div className="space-y-6">
          {playbook ? (
            <>
              <div className="panel p-6">
                <h3 className="text-lg font-semibold">Whom to talk to</h3>
                <ul className="mt-3 space-y-3 text-sm">
                  {playbook.contacts.map((c) => (
                    <li key={c.role}>
                      <p className="font-semibold">{c.role}</p>
                      <p className="text-muted-foreground">{c.why}</p>
                      <p className="mt-1 text-accent">Ask: {c.ask}</p>
                    </li>
                  ))}
                </ul>
                <Button asChild variant="outline" size="sm" className="mt-4 w-full">
                  <Link to="/playbooks/$slug" params={{ slug: playbook.slug }}>
                    Full {playbook.name} playbook
                  </Link>
                </Button>
              </div>
              <div className="panel p-6">
                <h3 className="flex items-center gap-2 text-lg font-semibold">
                  <AlertTriangle className="h-4 w-4 text-destructive" /> Red flags
                </h3>
                <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-muted-foreground">
                  {playbook.redFlags.map((f) => (
                    <li key={f}>{f}</li>
                  ))}
                </ul>
              </div>
            </>
          ) : (
            <div className="panel p-6 text-sm text-muted-foreground">
              No built-in playbook for this commodity yet — use the checklist and your own notes.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string | number | null }) {
  return (
    <div>
      <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">{label}</p>
      <p className="mt-1">{value || "—"}</p>
    </div>
  );
}
