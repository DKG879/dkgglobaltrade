import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Building2, Plus, Search } from "lucide-react";
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
import {
  companyStatuses,
  companyTypes,
  labelOf,
  riskLevels,
  riskTone,
  verificationStatuses,
  verificationTone,
} from "@/lib/crm";

export const Route = createFileRoute("/companies/")({
  head: () => ({
    meta: [
      { title: "Companies — DKG Global Trade" },
      {
        name: "description",
        content:
          "Relational CRM for buyers, sellers, producers, mines, refineries, mandates, inspectors, logistics and banks.",
      },
      { property: "og:title", content: "Companies — DKG Global Trade" },
      {
        property: "og:description",
        content: "Every counterparty company with roles, commodities, verification and risk in one place.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: () => (
    <AppShell
      title="Companies"
      subtitle="The relational core of the desk: one record per company, many roles, many contacts."
      actions={<NewCompanyDialog />}
    >
      <RequireAuth>
        <CompanyList />
      </RequireAuth>
    </AppShell>
  ),
});

type Filters = {
  q: string;
  role: string;
  country: string;
  verification: string;
  risk: string;
};

function CompanyList() {
  const [filters, setFilters] = useState<Filters>({
    q: "",
    role: "all",
    country: "all",
    verification: "all",
    risk: "all",
  });

  const companiesQuery = useQuery({
    queryKey: ["companies"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("companies")
        .select("*, company_roles(role), contacts(id, full_name, email)")
        .order("legal_name");
      if (error) throw error;
      return data;
    },
  });

  if (companiesQuery.isLoading) {
    return <p className="text-sm text-muted-foreground">Loading companies…</p>;
  }
  if (companiesQuery.error) {
    return (
      <div className="panel p-6">
        <h2 className="text-lg font-semibold">Could not load companies</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          {(companiesQuery.error as Error).message}
        </p>
        <Button className="mt-4" size="sm" onClick={() => companiesQuery.refetch()}>
          Try again
        </Button>
      </div>
    );
  }

  const companies = companiesQuery.data ?? [];
  const countries = Array.from(
    new Set(companies.map((c) => c.country).filter((c): c is string => Boolean(c))),
  ).sort();

  const visible = companies.filter((c) => {
    const roles = (c.company_roles ?? []).map((r) => r.role);
    const haystack = [c.legal_name, c.trading_name, c.country, c.city, c.industry]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();
    if (filters.q && !haystack.includes(filters.q.toLowerCase())) return false;
    if (filters.role !== "all" && !roles.includes(filters.role) && c.company_type !== filters.role)
      return false;
    if (filters.country !== "all" && c.country !== filters.country) return false;
    if (filters.verification !== "all" && c.verification_status !== filters.verification) return false;
    if (filters.risk !== "all" && c.risk_level !== filters.risk) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="panel grid gap-3 p-4 sm:grid-cols-2 lg:grid-cols-5">
        <div className="relative sm:col-span-2 lg:col-span-1">
          <Search className="pointer-events-none absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            className="pl-8"
            placeholder="Search name, country, industry"
            value={filters.q}
            onChange={(e) => setFilters({ ...filters, q: e.target.value })}
            aria-label="Search companies"
          />
        </div>
        <FilterSelect
          label="Role"
          value={filters.role}
          onChange={(v) => setFilters({ ...filters, role: v })}
          options={companyTypes.map((t) => ({ value: t.value, label: t.label }))}
        />
        <FilterSelect
          label="Country"
          value={filters.country}
          onChange={(v) => setFilters({ ...filters, country: v })}
          options={countries.map((c) => ({ value: c, label: c }))}
        />
        <FilterSelect
          label="Verification"
          value={filters.verification}
          onChange={(v) => setFilters({ ...filters, verification: v })}
          options={verificationStatuses.map((s) => ({ value: s.value, label: s.label }))}
        />
        <FilterSelect
          label="Risk"
          value={filters.risk}
          onChange={(v) => setFilters({ ...filters, risk: v })}
          options={riskLevels.map((s) => ({ value: s.value, label: s.label }))}
        />
      </div>

      {companies.length === 0 ? (
        <div className="panel flex flex-col items-center p-10 text-center">
          <Building2 className="h-8 w-8 text-primary" />
          <h2 className="mt-3 text-lg font-semibold">No companies yet</h2>
          <p className="mt-2 max-w-md text-sm text-muted-foreground">
            Add your first buyer, seller, mine or mandate. Counterparties you already saved were
            imported automatically — if you had none, start here.
          </p>
          <div className="mt-4">
            <NewCompanyDialog />
          </div>
        </div>
      ) : visible.length === 0 ? (
        <p className="text-sm text-muted-foreground">No company matches these filters.</p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {visible.map((c) => {
            const roles = Array.from(
              new Set([c.company_type, ...(c.company_roles ?? []).map((r) => r.role)]),
            );
            return (
              <Link
                key={c.id}
                to="/companies/$companyId"
                params={{ companyId: c.id }}
                className="panel block p-5 transition-transform hover:-translate-y-0.5"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-display text-base font-bold">{c.legal_name}</h3>
                    <p className="text-xs text-muted-foreground">
                      {[c.city, c.country].filter(Boolean).join(", ") || "Location not recorded"}
                    </p>
                  </div>
                  <span
                    className={`rounded-full border px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider ${
                      verificationTone[c.verification_status] ?? "border-border text-muted-foreground"
                    }`}
                  >
                    {labelOf(verificationStatuses, c.verification_status)}
                  </span>
                </div>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {roles.map((r) => (
                    <span
                      key={r}
                      className="rounded bg-secondary px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-muted-foreground"
                    >
                      {labelOf(companyTypes, r)}
                    </span>
                  ))}
                </div>
                <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
                  <span>{(c.contacts ?? []).length} contact(s)</span>
                  <span
                    className={`rounded-full border px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider ${
                      riskTone[c.risk_level] ?? "border-border"
                    }`}
                  >
                    Risk: {labelOf(riskLevels, c.risk_level)}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

function FilterSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <div>
      <Label className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
        {label}
      </Label>
      <select
        className="mt-1 h-9 w-full rounded-md border border-input bg-background px-2 text-sm"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        <option value="all">All</option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}

function NewCompanyDialog() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);

  const create = useMutation({
    mutationFn: async (form: FormData) => {
      if (!user) throw new Error("Sign in first");
      const value = (k: string) => String(form.get(k) ?? "").trim();
      const legalName = value("legal_name");
      if (legalName.length < 2) throw new Error("Legal name is too short");
      const type = value("company_type") || "other";

      const { data, error } = await supabase
        .from("companies")
        .insert({
          user_id: user.id,
          legal_name: legalName,
          trading_name: value("trading_name") || null,
          company_type: type,
          country: value("country") || null,
          city: value("city") || null,
          website: value("website") || null,
          registration_number: value("registration_number") || null,
          industry: value("industry") || null,
          description: value("description") || null,
          status: value("status") || "active",
        })
        .select("id")
        .single();
      if (error) throw error;

      const { error: roleError } = await supabase
        .from("company_roles")
        .insert({ user_id: user.id, company_id: data.id, role: type });
      if (roleError) throw roleError;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["companies"] });
      toast.success("Company added");
      setOpen(false);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus className="mr-1 h-4 w-4" /> New company
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Add a company</DialogTitle>
        </DialogHeader>
        <form
          className="grid gap-3 sm:grid-cols-2"
          onSubmit={(e) => {
            e.preventDefault();
            create.mutate(new FormData(e.currentTarget));
          }}
        >
          <Field className="sm:col-span-2" name="legal_name" label="Legal name" required />
          <Field name="trading_name" label="Trading name" />
          <div>
            <Label className="text-xs">Primary role</Label>
            <select
              name="company_type"
              className="mt-1 h-9 w-full rounded-md border border-input bg-background px-2 text-sm"
              defaultValue="buyer"
            >
              {companyTypes.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>
          <Field name="country" label="Country" />
          <Field name="city" label="City" />
          <Field name="website" label="Website" />
          <Field name="registration_number" label="Registration no." />
          <Field name="industry" label="Industry" />
          <div>
            <Label className="text-xs">Status</Label>
            <select
              name="status"
              className="mt-1 h-9 w-full rounded-md border border-input bg-background px-2 text-sm"
              defaultValue="active"
            >
              {companyStatuses.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>
          <div className="sm:col-span-2">
            <Label className="text-xs">Description / notes</Label>
            <Textarea name="description" rows={3} className="mt-1" />
          </div>
          <Button type="submit" className="sm:col-span-2" disabled={create.isPending}>
            {create.isPending ? "Saving…" : "Save company"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function Field({
  name,
  label,
  required,
  className,
}: {
  name: string;
  label: string;
  required?: boolean;
  className?: string;
}) {
  return (
    <div className={className}>
      <Label className="text-xs" htmlFor={name}>
        {label}
      </Label>
      <Input id={name} name={name} required={required} className="mt-1" />
    </div>
  );
}
