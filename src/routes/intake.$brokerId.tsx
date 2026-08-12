import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation } from "@tanstack/react-query";
import { Anchor, CheckCircle2, ShieldCheck } from "lucide-react";
import { z } from "zod";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Globe } from "@/components/Globe";
import { roleOptions } from "@/lib/playbooks";

export const Route = createFileRoute("/intake/$brokerId")({
  head: () => ({
    meta: [
      { title: "Counterparty intake — BrokerDesk" },
      {
        name: "description",
        content:
          "Buyers, sellers, mandates and forwarders: send your company details, commodities and contact info for review.",
      },
      { property: "og:title", content: "Counterparty intake — BrokerDesk" },
      {
        property: "og:description",
        content: "Share your trading profile so we can verify and open a file for your commodity deals.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: IntakePage,
});

const intakeSchema = z.object({
  name: z.string().trim().min(2, "Please enter your full name").max(100),
  company: z.string().trim().max(120).optional().or(z.literal("")),
  role: z.string().trim().min(1).max(40),
  commodities: z.string().trim().max(200).optional().or(z.literal("")),
  country: z.string().trim().max(80).optional().or(z.literal("")),
  email: z.string().trim().email("Enter a valid email").max(255),
  phone: z.string().trim().max(40).optional().or(z.literal("")),
  website: z.string().trim().max(200).optional().or(z.literal("")),
  message: z.string().trim().max(1500).optional().or(z.literal("")),
});

const empty = {
  name: "",
  company: "",
  role: "buyer",
  commodities: "",
  country: "",
  email: "",
  phone: "",
  website: "",
  message: "",
};

function IntakePage() {
  const { brokerId } = Route.useParams();
  const [form, setForm] = useState(empty);
  const [done, setDone] = useState(false);
  const set = (k: keyof typeof empty, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const submit = useMutation({
    mutationFn: async () => {
      const parsed = intakeSchema.parse(form);
      const { error } = await supabase.from("counterparty_submissions").insert({
        broker_user_id: brokerId,
        name: parsed.name,
        company: parsed.company || null,
        role: parsed.role,
        commodities: parsed.commodities || null,
        country: parsed.country || null,
        email: parsed.email,
        phone: parsed.phone || null,
        website: parsed.website || null,
        message: parsed.message || null,
        status: "pending",
      });
      if (error) throw error;
    },
    onSuccess: () => setDone(true),
    onError: (e) =>
      toast.error(
        e instanceof z.ZodError
          ? (e.issues[0]?.message ?? "Please check the form")
          : "Could not send — check the link and try again",
      ),
  });

  return (
    <div className="relative min-h-screen overflow-hidden">
      <div className="pointer-events-none absolute -right-32 top-10 hidden opacity-40 lg:block">
        <Globe />
      </div>

      <div className="relative mx-auto max-w-3xl px-4 py-12">
        <div className="flex items-center gap-2 font-display text-sm font-bold tracking-tight">
          <Anchor className="h-5 w-5 text-primary" />
          <span>
            Broker<span className="text-primary">Desk</span>
          </span>
        </div>

        {done ? (
          <div className="panel-3d mt-10 p-8 text-center">
            <CheckCircle2 className="mx-auto h-10 w-10 text-primary" />
            <h1 className="mt-4 text-2xl font-bold">Details received</h1>
            <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
              Your profile is queued for review. Expect contact once your documents and role have been
              checked — please keep KYC papers, proof of product or proof of funds ready.
            </p>
            <Button
              variant="ghost"
              className="mt-5"
              onClick={() => {
                setForm(empty);
                setDone(false);
              }}
            >
              Submit another profile
            </Button>
          </div>
        ) : (
          <>
            <header className="mt-8">
              <h1 className="text-3xl font-bold sm:text-4xl">Counterparty intake</h1>
              <p className="mt-2 max-w-xl text-sm text-muted-foreground">
                Tell us who you are, what you buy or sell, and where you are based. Nothing is published —
                the details go straight into a private review queue.
              </p>
              <p className="mt-3 flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-accent">
                <ShieldCheck className="h-4 w-4" /> Private submission · reviewed manually
              </p>
            </header>

            <form
              className="panel mt-8 space-y-5 p-6"
              onSubmit={(e) => {
                e.preventDefault();
                submit.mutate();
              }}
            >
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="i-name">Full name *</Label>
                  <Input
                    id="i-name"
                    required
                    maxLength={100}
                    value={form.name}
                    onChange={(e) => set("name", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="i-company">Company</Label>
                  <Input
                    id="i-company"
                    maxLength={120}
                    value={form.company}
                    onChange={(e) => set("company", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="i-role">I am a *</Label>
                  <select
                    id="i-role"
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
                  <Label htmlFor="i-country">Country</Label>
                  <Input
                    id="i-country"
                    maxLength={80}
                    value={form.country}
                    onChange={(e) => set("country", e.target.value)}
                  />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="i-commodities">Commodities & specification</Label>
                  <Input
                    id="i-commodities"
                    maxLength={200}
                    placeholder="Gold doré 22kt, copper cathode grade A, bauxite 45% Al2O3"
                    value={form.commodities}
                    onChange={(e) => set("commodities", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="i-email">Email *</Label>
                  <Input
                    id="i-email"
                    type="email"
                    required
                    maxLength={255}
                    value={form.email}
                    onChange={(e) => set("email", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="i-phone">Phone / WhatsApp</Label>
                  <Input
                    id="i-phone"
                    maxLength={40}
                    value={form.phone}
                    onChange={(e) => set("phone", e.target.value)}
                  />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="i-website">Website</Label>
                  <Input
                    id="i-website"
                    maxLength={200}
                    placeholder="https://"
                    value={form.website}
                    onChange={(e) => set("website", e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="i-message">Quantities, terms and documents you can provide</Label>
                <Textarea
                  id="i-message"
                  maxLength={1500}
                  rows={5}
                  placeholder="E.g. 500 MT/month copper cathode CIF Shanghai, LC at sight, SGS on loading, company registration + POF available."
                  value={form.message}
                  onChange={(e) => set("message", e.target.value)}
                />
              </div>

              <Button type="submit" className="w-full" disabled={submit.isPending}>
                {submit.isPending ? "Sending…" : "Send my details"}
              </Button>
              <p className="text-center text-xs text-muted-foreground">
                By submitting you agree to be contacted about commodity transactions.
              </p>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
