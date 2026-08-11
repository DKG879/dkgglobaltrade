import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { AppShell, RequireAuth } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { commodityOptions, stages, getPlaybook } from "@/lib/playbooks";

export const Route = createFileRoute("/deals/")({
  head: () => ({
    meta: [
      { title: "Deal board — BrokerDesk" },
      {
        name: "description",
        content: "Track every commodity deal: commodity, buyer, seller, quantity, Incoterm and current stage.",
      },
      { property: "og:title", content: "Deal board — BrokerDesk" },
      { property: "og:description", content: "Your commodity brokerage pipeline, stage by stage." },
    ],
  }),
  component: () => (
    <AppShell
      title="Deal board"
      subtitle="Every live mandate with its counterparties, terms and current stage."
      actions={<NewDealDialog />}
    >
      <RequireAuth>
        <DealList />
      </RequireAuth>
    </AppShell>
  ),
});

const stageLabel = (value: string) => stages.find((s) => s.value === value)?.label ?? value;
const commodityLabel = (value: string) =>
  commodityOptions.find((c) => c.value === value)?.label ?? value;

function DealList() {
  const { data, isLoading } = useQuery({
    queryKey: ["deals"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("deals")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  if (isLoading) return <p className="text-sm text-muted-foreground">Loading deals…</p>;
  if (!data?.length)
    return (
      <div className="panel p-10 text-center">
        <h2 className="text-lg font-semibold">No deals yet</h2>
        <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
          Add your first mandate. BrokerDesk will build the procedure checklist for that commodity
          automatically.
        </p>
      </div>
    );

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {data.map((deal) => (
        <Link
          key={deal.id}
          to="/deals/$dealId"
          params={{ dealId: deal.id }}
          className="panel-3d block p-5"
        >
          <div className="flex items-center justify-between gap-3">
            <span className="font-mono text-xs uppercase tracking-widest text-accent">
              {commodityLabel(deal.commodity)}
            </span>
            <span className="rounded-full border border-primary/40 bg-primary/10 px-2 py-0.5 text-xs text-primary">
              {stageLabel(deal.stage)}
            </span>
          </div>
          <h3 className="mt-3 text-lg font-semibold">{deal.title}</h3>
          <dl className="mt-3 space-y-1 text-sm text-muted-foreground">
            <div>Buyer: {deal.buyer_name || "—"}</div>
            <div>Seller: {deal.seller_name || "—"}</div>
            <div>
              {deal.quantity ? `${deal.quantity} ${deal.unit ?? ""}` : "Quantity TBC"} ·{" "}
              {deal.incoterm || "Incoterm TBC"}
            </div>
            <div>
              {deal.origin || "Origin ?"} → {deal.destination || "Destination ?"}
            </div>
          </dl>
          <span className="mt-4 inline-flex items-center text-sm text-primary">
            Open checklist <ArrowRight className="ml-1 h-4 w-4" />
          </span>
        </Link>
      ))}
    </div>
  );
}

function NewDealDialog() {
  const [open, setOpen] = useState(false);
  const { user } = useAuth();
  const qc = useQueryClient();
  const [form, setForm] = useState({
    title: "",
    commodity: "gold",
    buyer_name: "",
    seller_name: "",
    quantity: "",
    unit: "MT",
    price: "",
    currency: "USD",
    incoterm: "CIF",
    origin: "",
    destination: "",
    stage: "lead",
    notes: "",
  });

  const set = (key: keyof typeof form, value: string) => setForm((f) => ({ ...f, [key]: value }));

  const create = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("Not signed in");
      const { data, error } = await supabase
        .from("deals")
        .insert({
          user_id: user.id,
          title: form.title,
          commodity: form.commodity,
          buyer_name: form.buyer_name || null,
          seller_name: form.seller_name || null,
          quantity: form.quantity ? Number(form.quantity) : null,
          unit: form.unit,
          price: form.price ? Number(form.price) : null,
          currency: form.currency,
          incoterm: form.incoterm,
          origin: form.origin || null,
          destination: form.destination || null,
          stage: form.stage,
          notes: form.notes || null,
        })
        .select()
        .single();
      if (error) throw error;

      const playbook = getPlaybook(form.commodity);
      if (playbook) {
        const steps = playbook.steps.map((step, i) => ({
          user_id: user.id,
          deal_id: data.id,
          label: step.label,
          detail: step.detail,
          owner_role: step.owner,
          step_order: i,
        }));
        const { error: stepError } = await supabase.from("deal_steps").insert(steps);
        if (stepError) throw stepError;
      }
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["deals"] });
      toast.success("Deal added with its procedure checklist.");
      setOpen(false);
      setForm((f) => ({ ...f, title: "", buyer_name: "", seller_name: "", notes: "" }));
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Could not create deal"),
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-1 h-4 w-4" /> New deal
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>New deal</DialogTitle>
        </DialogHeader>
        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            create.mutate();
          }}
        >
          <div className="space-y-2">
            <Label htmlFor="title">Deal name</Label>
            <Input
              id="title"
              required
              placeholder="500 MT P1020 ingots — Jebel Ali to Izmir"
              value={form.title}
              onChange={(e) => set("title", e.target.value)}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="commodity">Commodity</Label>
              <select
                id="commodity"
                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                value={form.commodity}
                onChange={(e) => set("commodity", e.target.value)}
              >
                {commodityOptions.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="stage">Stage</Label>
              <select
                id="stage"
                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                value={form.stage}
                onChange={(e) => set("stage", e.target.value)}
              >
                {stages.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="buyer">Buyer</Label>
              <Input id="buyer" value={form.buyer_name} onChange={(e) => set("buyer_name", e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="seller">Seller / mine</Label>
              <Input
                id="seller"
                value={form.seller_name}
                onChange={(e) => set("seller_name", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="quantity">Quantity</Label>
              <Input
                id="quantity"
                type="number"
                value={form.quantity}
                onChange={(e) => set("quantity", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="unit">Unit</Label>
              <Input id="unit" value={form.unit} onChange={(e) => set("unit", e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="price">Price / unit</Label>
              <Input
                id="price"
                type="number"
                value={form.price}
                onChange={(e) => set("price", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="incoterm">Incoterm</Label>
              <Input id="incoterm" value={form.incoterm} onChange={(e) => set("incoterm", e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="origin">Origin</Label>
              <Input id="origin" value={form.origin} onChange={(e) => set("origin", e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="destination">Destination</Label>
              <Input
                id="destination"
                value={form.destination}
                onChange={(e) => set("destination", e.target.value)}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea id="notes" value={form.notes} onChange={(e) => set("notes", e.target.value)} />
          </div>
          <Button type="submit" className="w-full" disabled={create.isPending}>
            {create.isPending ? "Saving…" : "Create deal"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
