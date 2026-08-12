import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Check, Copy, Inbox, Link2, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { AppShell, RequireAuth } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { roleOptions } from "@/lib/playbooks";

export const Route = createFileRoute("/submissions")({
  head: () => ({
    meta: [
      { title: "Intake inbox — BrokerDesk" },
      {
        name: "description",
        content:
          "Review buyer and seller profiles submitted through your public intake link, then approve them into your counterparty directory.",
      },
      { property: "og:title", content: "Intake inbox — BrokerDesk" },
      {
        property: "og:description",
        content: "Approve or reject incoming buyer and seller profiles before they enter your directory.",
      },
    ],
  }),
  component: () => (
    <AppShell
      title="Intake inbox"
      subtitle="Profiles buyers and sellers sent through your public link. Approve to file them as counterparties."
    >
      <RequireAuth>
        <SubmissionsView />
      </RequireAuth>
    </AppShell>
  ),
});

type Submission = {
  id: string;
  name: string;
  company: string | null;
  role: string;
  commodities: string | null;
  country: string | null;
  email: string | null;
  phone: string | null;
  website: string | null;
  message: string | null;
  status: string;
  created_at: string;
};

const statusTone: Record<string, string> = {
  pending: "border-accent/50 text-accent",
  approved: "border-primary/50 text-primary",
  rejected: "border-destructive/60 text-destructive",
};

function SubmissionsView() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [tab, setTab] = useState("pending");

  const { data, isLoading } = useQuery({
    queryKey: ["submissions"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("counterparty_submissions")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as Submission[];
    },
  });

  const approve = useMutation({
    mutationFn: async (s: Submission) => {
      if (!user) throw new Error("Not signed in");
      const notes = [
        s.message?.trim(),
        s.website?.trim() ? `Website: ${s.website.trim()}` : null,
        `Submitted via intake form on ${new Date(s.created_at).toLocaleDateString()}`,
      ]
        .filter(Boolean)
        .join("\n\n");

      const { error: insertError } = await supabase.from("counterparties").insert({
        user_id: user.id,
        name: s.name,
        company: s.company,
        role: s.role,
        commodities: s.commodities,
        country: s.country,
        email: s.email,
        phone: s.phone,
        trust_level: "unverified",
        notes,
      });
      if (insertError) throw insertError;

      const { error } = await supabase
        .from("counterparty_submissions")
        .update({ status: "approved", reviewed_at: new Date().toISOString() })
        .eq("id", s.id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["submissions"] });
      qc.invalidateQueries({ queryKey: ["contacts"] });
      toast.success("Added to your counterparty directory");
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Could not approve"),
  });

  const reject = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("counterparty_submissions")
        .update({ status: "rejected", reviewed_at: new Date().toISOString() })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["submissions"] });
      toast.success("Marked as rejected");
    },
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("counterparty_submissions").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["submissions"] });
      toast.success("Submission deleted");
    },
  });

  const rows = (data ?? []).filter((s) => tab === "all" || s.status === tab);
  const pendingCount = (data ?? []).filter((s) => s.status === "pending").length;

  return (
    <div className="space-y-6">
      <IntakeLinkCard userId={user?.id} />

      <div className="flex flex-wrap gap-2">
        {[
          { value: "pending", label: `Pending${pendingCount ? ` (${pendingCount})` : ""}` },
          { value: "approved", label: "Approved" },
          { value: "rejected", label: "Rejected" },
          { value: "all", label: "All" },
        ].map((t) => (
          <button
            key={t.value}
            onClick={() => setTab(t.value)}
            className={`rounded-full border px-3 py-1 text-xs transition-colors ${
              tab === t.value
                ? "border-primary bg-primary/15 text-primary"
                : "border-border text-muted-foreground hover:text-foreground"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Loading submissions…</p>
      ) : rows.length === 0 ? (
        <div className="panel flex flex-col items-center p-10 text-center text-sm text-muted-foreground">
          <Inbox className="mb-3 h-8 w-8 opacity-60" />
          Nothing here yet. Share your intake link with buyers and sellers and their profiles will land in
          this queue.
        </div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {rows.map((s) => (
            <div key={s.id} className="panel-3d p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-lg font-semibold">{s.name}</h3>
                  <p className="text-sm text-muted-foreground">{s.company || "—"}</p>
                </div>
                <span className={`rounded-full border px-2 py-0.5 text-xs ${statusTone[s.status] ?? ""}`}>
                  {s.status}
                </span>
              </div>

              <p className="mt-3 font-mono text-xs uppercase tracking-widest text-accent">
                {roleOptions.find((r) => r.value === s.role)?.label ?? s.role}
                {s.country ? ` · ${s.country}` : ""}
                {` · ${new Date(s.created_at).toLocaleDateString()}`}
              </p>

              {s.commodities ? <p className="mt-2 text-sm">{s.commodities}</p> : null}

              <div className="mt-3 space-y-1 text-sm text-muted-foreground">
                {s.email ? <p>{s.email}</p> : null}
                {s.phone ? <p>{s.phone}</p> : null}
                {s.website ? <p className="break-all">{s.website}</p> : null}
              </div>

              {s.message ? (
                <p className="mt-3 whitespace-pre-line rounded-md border border-border/70 bg-secondary/40 p-3 text-sm text-muted-foreground">
                  {s.message}
                </p>
              ) : null}

              <div className="mt-4 flex flex-wrap gap-2">
                {s.status === "pending" ? (
                  <>
                    <Button size="sm" disabled={approve.isPending} onClick={() => approve.mutate(s)}>
                      <Check className="mr-1 h-4 w-4" /> Approve to directory
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => reject.mutate(s.id)}>
                      <X className="mr-1 h-4 w-4" /> Reject
                    </Button>
                  </>
                ) : null}
                <Button size="sm" variant="ghost" onClick={() => remove.mutate(s.id)}>
                  <Trash2 className="mr-1 h-4 w-4" /> Delete
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function IntakeLinkCard({ userId }: { userId?: string }) {
  const [copied, setCopied] = useState(false);
  if (!userId) return null;
  const origin = typeof window === "undefined" ? "" : window.location.origin;
  const link = `${origin}/intake/${userId}`;

  return (
    <div className="panel p-5">
      <p className="flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-accent">
        <Link2 className="h-4 w-4" /> Your public intake link
      </p>
      <p className="mt-2 text-sm text-muted-foreground">
        Send this to any buyer, seller, mandate or forwarder. They fill in their details without an
        account, and the profile arrives here for your approval.
      </p>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <code className="flex-1 break-all rounded-md border border-border/70 bg-secondary/40 px-3 py-2 text-xs">
          {link}
        </code>
        <Button
          size="sm"
          variant="outline"
          onClick={async () => {
            try {
              await navigator.clipboard.writeText(link);
              setCopied(true);
              toast.success("Intake link copied");
              setTimeout(() => setCopied(false), 2000);
            } catch {
              toast.error("Copy failed — select the link manually");
            }
          }}
        >
          {copied ? <Check className="mr-1 h-4 w-4" /> : <Copy className="mr-1 h-4 w-4" />}
          {copied ? "Copied" : "Copy link"}
        </Button>
      </div>
    </div>
  );
}
