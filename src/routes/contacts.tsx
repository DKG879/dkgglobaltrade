import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Trash2, Mail, Phone } from "lucide-react";
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
import { roleOptions, trustLevels } from "@/lib/playbooks";

export const Route = createFileRoute("/contacts")({
  head: () => ({
    meta: [
      { title: "Counterparty directory — BrokerDesk" },
      {
        name: "description",
        content:
          "Keep buyers, mines, mandates, inspectors, forwarders and banks organised with roles and trust levels.",
      },
      { property: "og:title", content: "Counterparty directory — BrokerDesk" },
      {
        property: "og:description",
        content: "Every buyer, seller, inspector, forwarder and bank in one verified directory.",
      },
    ],
  }),
  component: () => (
    <AppShell
      title="Counterparties"
      subtitle="Who is who — and how far you have verified them."
      actions={<NewContactDialog />}
    >
      <RequireAuth>
        <ContactList />
      </RequireAuth>
    </AppShell>
  ),
});

const trustTone: Record<string, string> = {
  unverified: "border-border text-muted-foreground",
  documents_seen: "border-accent/50 text-accent",
  verified: "border-primary/50 text-primary",
  blacklisted: "border-destructive/60 text-destructive",
};

function ContactList() {
  const qc = useQueryClient();
  const [filter, setFilter] = useState("all");

  const { data, isLoading } = useQuery({
    queryKey: ["contacts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("counterparties")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("counterparties").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["contacts"] });
      toast.success("Counterparty removed");
    },
  });

  if (isLoading) return <p className="text-sm text-muted-foreground">Loading contacts…</p>;
  const rows = (data ?? []).filter((c) => filter === "all" || c.role === filter);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap gap-2">
        {[{ value: "all", label: "All" }, ...roleOptions].map((r) => (
          <button
            key={r.value}
            onClick={() => setFilter(r.value)}
            className={`rounded-full border px-3 py-1 text-xs transition-colors ${
              filter === r.value
                ? "border-primary bg-primary/15 text-primary"
                : "border-border text-muted-foreground hover:text-foreground"
            }`}
          >
            {r.label}
          </button>
        ))}
      </div>

      {rows.length === 0 ? (
        <div className="panel p-10 text-center text-sm text-muted-foreground">
          No counterparties here yet. Add the people behind your live deals.
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {rows.map((c) => (
            <div key={c.id} className="panel-3d p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-lg font-semibold">{c.name}</h3>
                  <p className="text-sm text-muted-foreground">{c.company || "—"}</p>
                </div>
                <span
                  className={`rounded-full border px-2 py-0.5 text-xs ${trustTone[c.trust_level] ?? ""}`}
                >
                  {trustLevels.find((t) => t.value === c.trust_level)?.label ?? c.trust_level}
                </span>
              </div>
              <p className="mt-3 font-mono text-xs uppercase tracking-widest text-accent">
                {roleOptions.find((r) => r.value === c.role)?.label ?? c.role}
                {c.country ? ` · ${c.country}` : ""}
              </p>
              {c.commodities ? <p className="mt-2 text-sm">{c.commodities}</p> : null}
              <div className="mt-3 space-y-1 text-sm text-muted-foreground">
                {c.email ? (
                  <p className="flex items-center gap-2">
                    <Mail className="h-3.5 w-3.5" />
                    {c.email}
                  </p>
                ) : null}
                {c.phone ? (
                  <p className="flex items-center gap-2">
                    <Phone className="h-3.5 w-3.5" />
                    {c.phone}
                  </p>
                ) : null}
              </div>
              {c.notes ? <p className="mt-3 text-sm text-muted-foreground">{c.notes}</p> : null}
              <Button
                variant="ghost"
                size="sm"
                className="mt-3"
                onClick={() => remove.mutate(c.id)}
              >
                <Trash2 className="mr-1 h-4 w-4" /> Remove
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function NewContactDialog() {
  const [open, setOpen] = useState(false);
  const { user } = useAuth();
  const qc = useQueryClient();
  const [form, setForm] = useState({
    name: "",
    company: "",
    role: "buyer",
    commodities: "",
    country: "",
    email: "",
    phone: "",
    trust_level: "unverified",
    notes: "",
  });
  const set = (k: keyof typeof form, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const create = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("Not signed in");
      const { error } = await supabase.from("counterparties").insert({ ...form, user_id: user.id });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["contacts"] });
      toast.success("Counterparty saved");
      setOpen(false);
      setForm((f) => ({ ...f, name: "", company: "", email: "", phone: "", notes: "" }));
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Could not save"),
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-1 h-4 w-4" /> Add counterparty
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>New counterparty</DialogTitle>
        </DialogHeader>
        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            create.mutate();
          }}
        >
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" required value={form.name} onChange={(e) => set("name", e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="company">Company</Label>
              <Input id="company" value={form.company} onChange={(e) => set("company", e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <select
                id="role"
                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                value={form.role}
                onChange={(e) => set("role", e.target.value)}
              >
                {roleOptions.map((r) => (
                  <option key={r.value} value={r.value}>
                    {r.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="trust">Trust level</Label>
              <select
                id="trust"
                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                value={form.trust_level}
                onChange={(e) => set("trust_level", e.target.value)}
              >
                {trustLevels.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="commodities">Commodities</Label>
              <Input
                id="commodities"
                placeholder="Gold doré, copper cathode"
                value={form.commodities}
                onChange={(e) => set("commodities", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="country">Country</Label>
              <Input id="country" value={form.country} onChange={(e) => set("country", e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cemail">Email</Label>
              <Input id="cemail" type="email" value={form.email} onChange={(e) => set("email", e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cphone">Phone</Label>
              <Input id="cphone" value={form.phone} onChange={(e) => set("phone", e.target.value)} />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="cnotes">Notes</Label>
            <Textarea
              id="cnotes"
              placeholder="Which documents you have seen, who introduced them, last conversation…"
              value={form.notes}
              onChange={(e) => set("notes", e.target.value)}
            />
          </div>
          <Button type="submit" className="w-full" disabled={create.isPending}>
            {create.isPending ? "Saving…" : "Save counterparty"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
