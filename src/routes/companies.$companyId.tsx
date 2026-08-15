import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Mail, Phone, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import type { TablesUpdate } from "@/integrations/supabase/types";
import { useAuth } from "@/hooks/useAuth";
import { AppShell, RequireAuth } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  commoditySides,
  companyRoles,
  companyStatuses,
  companyTypes,
  labelOf,
  riskLevels,
  riskTone,
  verificationStatuses,
  verificationTone,
} from "@/lib/crm";

export const Route = createFileRoute("/companies/$companyId")({
  head: () => ({
    meta: [
      { title: "Company profile — DKG Global Trade" },
      {
        name: "description",
        content:
          "Company overview, contacts, roles, commodities, verification status and risk in one CRM profile.",
      },
      { property: "og:title", content: "Company profile — DKG Global Trade" },
      {
        property: "og:description",
        content: "Contacts, roles, traded commodities, verification and risk for one counterparty.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: () => (
    <AppShell title="Company" subtitle="Overview, contacts, roles, commodities and verification.">
      <RequireAuth>
        <CompanyProfile />
      </RequireAuth>
    </AppShell>
  ),
});

function CompanyProfile() {
  const { companyId } = Route.useParams();
  const { user } = useAuth();
  const qc = useQueryClient();

  const companyQuery = useQuery({
    queryKey: ["company", companyId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("companies")
        .select("*")
        .eq("id", companyId)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  const contactsQuery = useQuery({
    queryKey: ["company-contacts", companyId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("contacts")
        .select("*")
        .eq("company_id", companyId)
        .order("full_name");
      if (error) throw error;
      return data;
    },
  });

  const rolesQuery = useQuery({
    queryKey: ["company-roles", companyId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("company_roles")
        .select("*")
        .eq("company_id", companyId);
      if (error) throw error;
      return data;
    },
  });

  const commoditiesQuery = useQuery({
    queryKey: ["commodities"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("commodities")
        .select("id, name, category, unit")
        .eq("active", true)
        .order("category")
        .order("name");
      if (error) throw error;
      return data;
    },
  });

  const companyCommoditiesQuery = useQuery({
    queryKey: ["company-commodities", companyId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("company_commodities")
        .select("*, commodities(name, category, unit)")
        .eq("company_id", companyId);
      if (error) throw error;
      return data;
    },
  });

  const updateCompany = useMutation({
    mutationFn: async (patch: TablesUpdate<"companies">) => {
      const { error } = await supabase.from("companies").update(patch).eq("id", companyId);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["company", companyId] });
      qc.invalidateQueries({ queryKey: ["companies"] });
      toast.success("Company updated");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const addRole = useMutation({
    mutationFn: async (role: string) => {
      if (!user) throw new Error("Sign in first");
      const { error } = await supabase
        .from("company_roles")
        .insert({ user_id: user.id, company_id: companyId, role });
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["company-roles", companyId] }),
    onError: () => toast.error("That role is already on this company"),
  });

  const removeRole = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("company_roles").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["company-roles", companyId] }),
  });

  const addCommodity = useMutation({
    mutationFn: async ({ commodityId, side }: { commodityId: string; side: string }) => {
      if (!user) throw new Error("Sign in first");
      const { error } = await supabase
        .from("company_commodities")
        .insert({ user_id: user.id, company_id: companyId, commodity_id: commodityId, side });
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["company-commodities", companyId] }),
    onError: () => toast.error("Already on the list"),
  });

  const removeCommodity = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("company_commodities").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["company-commodities", companyId] }),
  });

  if (companyQuery.isLoading) {
    return <p className="text-sm text-muted-foreground">Loading company…</p>;
  }
  if (companyQuery.error) {
    return (
      <div className="panel p-6">
        <h2 className="text-lg font-semibold">Could not load this company</h2>
        <p className="mt-2 text-sm text-muted-foreground">{(companyQuery.error as Error).message}</p>
      </div>
    );
  }
  const company = companyQuery.data;
  if (!company) {
    return (
      <div className="panel p-6">
        <h2 className="text-lg font-semibold">Company not found</h2>
        <Button asChild className="mt-4" size="sm" variant="ghost">
          <Link to="/companies">Back to companies</Link>
        </Button>
      </div>
    );
  }

  const roles = rolesQuery.data ?? [];
  const contacts = contactsQuery.data ?? [];
  const commodities = commoditiesQuery.data ?? [];
  const companyCommodities = companyCommoditiesQuery.data ?? [];

  return (
    <div className="space-y-6">
      <Button asChild variant="ghost" size="sm">
        <Link to="/companies">
          <ArrowLeft className="mr-1 h-4 w-4" /> All companies
        </Link>
      </Button>

      <div className="panel p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <span className="font-mono text-xs uppercase tracking-widest text-accent">
              {labelOf(companyTypes, company.company_type)}
            </span>
            <h2 className="mt-1 text-2xl font-bold">{company.legal_name}</h2>
            <p className="text-sm text-muted-foreground">
              {[company.trading_name, company.city, company.country].filter(Boolean).join(" · ") ||
                "No location recorded"}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <span
              className={`rounded-full border px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider ${
                verificationTone[company.verification_status] ?? "border-border"
              }`}
            >
              {labelOf(verificationStatuses, company.verification_status)}
            </span>
            <span
              className={`rounded-full border px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider ${
                riskTone[company.risk_level] ?? "border-border"
              }`}
            >
              Risk: {labelOf(riskLevels, company.risk_level)}
            </span>
          </div>
        </div>
      </div>

      <Tabs defaultValue="overview">
        <TabsList className="flex-wrap">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="contacts">Contacts ({contacts.length})</TabsTrigger>
          <TabsTrigger value="roles">Roles ({roles.length})</TabsTrigger>
          <TabsTrigger value="commodities">Commodities ({companyCommodities.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-4">
          <form
            className="panel grid gap-4 p-6 sm:grid-cols-2"
            onSubmit={(e) => {
              e.preventDefault();
              const form = new FormData(e.currentTarget);
              const value = (k: string) => {
                const v = String(form.get(k) ?? "").trim();
                return v === "" ? null : v;
              };
              updateCompany.mutate({
                legal_name: value("legal_name") ?? company.legal_name,
                trading_name: value("trading_name"),
                country: value("country"),
                city: value("city"),
                address: value("address"),
                website: value("website"),
                registration_number: value("registration_number"),
                tax_number: value("tax_number"),
                industry: value("industry"),
                description: value("description"),
                status: value("status") ?? "active",
                risk_level: value("risk_level") ?? "unknown",
                verification_status: value("verification_status") ?? "not_reviewed",
              });
            }}
          >
            <TextField name="legal_name" label="Legal name" defaultValue={company.legal_name} />
            <TextField name="trading_name" label="Trading name" defaultValue={company.trading_name} />
            <TextField name="country" label="Country" defaultValue={company.country} />
            <TextField name="city" label="City" defaultValue={company.city} />
            <TextField name="website" label="Website" defaultValue={company.website} />
            <TextField name="industry" label="Industry" defaultValue={company.industry} />
            <TextField
              name="registration_number"
              label="Registration no."
              defaultValue={company.registration_number}
            />
            <TextField name="tax_number" label="Tax no." defaultValue={company.tax_number} />
            <SelectField
              name="status"
              label="Status"
              defaultValue={company.status}
              options={companyStatuses}
            />
            <SelectField
              name="verification_status"
              label="Verification"
              defaultValue={company.verification_status}
              options={verificationStatuses}
            />
            <SelectField
              name="risk_level"
              label="Risk level"
              defaultValue={company.risk_level}
              options={riskLevels}
            />
            <div className="sm:col-span-2">
              <Label className="text-xs">Address</Label>
              <Input name="address" defaultValue={company.address ?? ""} className="mt-1" />
            </div>
            <div className="sm:col-span-2">
              <Label className="text-xs">Description / notes</Label>
              <Textarea
                name="description"
                rows={4}
                defaultValue={company.description ?? ""}
                className="mt-1"
              />
            </div>
            <Button type="submit" disabled={updateCompany.isPending} className="sm:col-span-2">
              {updateCompany.isPending ? "Saving…" : "Save changes"}
            </Button>
          </form>
        </TabsContent>

        <TabsContent value="contacts" className="mt-4 space-y-4">
          <NewContactDialog companyId={companyId} />
          {contacts.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No contacts yet. Add the person you actually speak to.
            </p>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {contacts.map((c) => (
                <div key={c.id} className="panel p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="font-semibold">{c.full_name}</h3>
                      <p className="text-xs text-muted-foreground">
                        {[c.job_title, c.department].filter(Boolean).join(" · ") || "Role not recorded"}
                      </p>
                    </div>
                    <ContactDeleteButton contactId={c.id} companyId={companyId} />
                  </div>
                  <div className="mt-3 space-y-1 text-sm text-muted-foreground">
                    {c.email ? (
                      <p className="flex items-center gap-2">
                        <Mail className="h-3.5 w-3.5" /> {c.email}
                      </p>
                    ) : null}
                    {c.phone ? (
                      <p className="flex items-center gap-2">
                        <Phone className="h-3.5 w-3.5" /> {c.phone}
                      </p>
                    ) : null}
                    {c.whatsapp ? <p>WhatsApp: {c.whatsapp}</p> : null}
                    {c.country ? <p>Country: {c.country}</p> : null}
                  </div>
                  {c.notes ? (
                    <p className="mt-3 rounded-md bg-secondary/60 p-3 text-sm text-muted-foreground">
                      {c.notes}
                    </p>
                  ) : null}
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="roles" className="mt-4 space-y-4">
          <div className="panel p-5">
            <p className="text-sm text-muted-foreground">
              A company can hold several roles at once — a trader can be both buyer and seller.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {roles.map((r) => (
                <span
                  key={r.id}
                  className="flex items-center gap-2 rounded-full border border-border px-3 py-1 text-xs"
                >
                  {labelOf(companyTypes, r.role)}
                  <button
                    type="button"
                    aria-label={`Remove role ${r.role}`}
                    className="text-muted-foreground hover:text-destructive"
                    onClick={() => removeRole.mutate(r.id)}
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </span>
              ))}
              {roles.length === 0 ? (
                <span className="text-sm text-muted-foreground">No roles yet.</span>
              ) : null}
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {companyRoles
                .filter((r) => !roles.some((existing) => existing.role === r.value))
                .map((r) => (
                  <Button
                    key={r.value}
                    size="sm"
                    variant="ghost"
                    onClick={() => addRole.mutate(r.value)}
                  >
                    <Plus className="mr-1 h-3 w-3" /> {r.label}
                  </Button>
                ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="commodities" className="mt-4 space-y-4">
          <form
            className="panel grid gap-3 p-5 sm:grid-cols-[2fr_1fr_auto] sm:items-end"
            onSubmit={(e) => {
              e.preventDefault();
              const form = new FormData(e.currentTarget);
              const commodityId = String(form.get("commodity_id") ?? "");
              if (!commodityId) return;
              addCommodity.mutate({ commodityId, side: String(form.get("side") ?? "both") });
            }}
          >
            <div>
              <Label className="text-xs">Commodity</Label>
              <select
                name="commodity_id"
                className="mt-1 h-9 w-full rounded-md border border-input bg-background px-2 text-sm"
              >
                {commodities.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.category} — {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label className="text-xs">Side</Label>
              <select
                name="side"
                className="mt-1 h-9 w-full rounded-md border border-input bg-background px-2 text-sm"
                defaultValue="both"
              >
                {commoditySides.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>
            <Button type="submit" size="sm">
              Add
            </Button>
          </form>

          {companyCommodities.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No commodities linked yet. Link them so the matching engine can use this company.
            </p>
          ) : (
            <div className="panel divide-y divide-border/70">
              {companyCommodities.map((cc) => (
                <div key={cc.id} className="flex items-center justify-between gap-3 p-4">
                  <div>
                    <p className="text-sm font-semibold">{cc.commodities?.name ?? "Commodity"}</p>
                    <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                      {cc.commodities?.category} · {labelOf(commoditySides, cc.side)}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    aria-label="Remove commodity"
                    onClick={() => removeCommodity.mutate(cc.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

function ContactDeleteButton({ contactId, companyId }: { contactId: string; companyId: string }) {
  const qc = useQueryClient();
  const remove = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("contacts").delete().eq("id", contactId);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["company-contacts", companyId] });
      toast.success("Contact removed");
    },
  });
  return (
    <Button variant="ghost" size="sm" aria-label="Delete contact" onClick={() => remove.mutate()}>
      <Trash2 className="h-4 w-4" />
    </Button>
  );
}

function NewContactDialog({ companyId }: { companyId: string }) {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);

  const create = useMutation({
    mutationFn: async (form: FormData) => {
      if (!user) throw new Error("Sign in first");
      const value = (k: string) => {
        const v = String(form.get(k) ?? "").trim();
        return v === "" ? null : v;
      };
      const fullName = value("full_name");
      if (!fullName || fullName.length < 2) throw new Error("Enter the contact's full name");
      const { error } = await supabase.from("contacts").insert({
        user_id: user.id,
        company_id: companyId,
        full_name: fullName,
        job_title: value("job_title"),
        department: value("department"),
        email: value("email"),
        phone: value("phone"),
        whatsapp: value("whatsapp"),
        country: value("country"),
        preferred_language: value("preferred_language"),
        notes: value("notes"),
      });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["company-contacts", companyId] });
      toast.success("Contact added");
      setOpen(false);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus className="mr-1 h-4 w-4" /> New contact
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Add a contact</DialogTitle>
        </DialogHeader>
        <form
          className="grid gap-3 sm:grid-cols-2"
          onSubmit={(e) => {
            e.preventDefault();
            create.mutate(new FormData(e.currentTarget));
          }}
        >
          <div className="sm:col-span-2">
            <Label className="text-xs">Full name</Label>
            <Input name="full_name" required className="mt-1" />
          </div>
          <TextField name="job_title" label="Job title" />
          <TextField name="department" label="Department" />
          <TextField name="email" label="Email" type="email" />
          <TextField name="phone" label="Phone" />
          <TextField name="whatsapp" label="WhatsApp" />
          <TextField name="country" label="Country" />
          <TextField name="preferred_language" label="Preferred language" />
          <div className="sm:col-span-2">
            <Label className="text-xs">Notes</Label>
            <Textarea name="notes" rows={3} className="mt-1" />
          </div>
          <Button type="submit" className="sm:col-span-2" disabled={create.isPending}>
            {create.isPending ? "Saving…" : "Save contact"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function TextField({
  name,
  label,
  defaultValue,
  type,
}: {
  name: string;
  label: string;
  defaultValue?: string | null;
  type?: string;
}) {
  return (
    <div>
      <Label className="text-xs" htmlFor={name}>
        {label}
      </Label>
      <Input
        id={name}
        name={name}
        type={type ?? "text"}
        defaultValue={defaultValue ?? ""}
        className="mt-1"
      />
    </div>
  );
}

function SelectField({
  name,
  label,
  defaultValue,
  options,
}: {
  name: string;
  label: string;
  defaultValue: string;
  options: ReadonlyArray<{ value: string; label: string }>;
}) {
  return (
    <div>
      <Label className="text-xs">{label}</Label>
      <select
        name={name}
        defaultValue={defaultValue}
        className="mt-1 h-9 w-full rounded-md border border-input bg-background px-2 text-sm"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}
