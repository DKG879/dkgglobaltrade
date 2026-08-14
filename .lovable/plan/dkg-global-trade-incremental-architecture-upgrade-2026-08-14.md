# DKG Global Trade — Incremental Architecture Upgrade

## What exists today (inspected)

- Routes: landing, auth, deals board + deal detail, contacts, playbooks (index + detail), public intake, submissions inbox.
- Tables: `profiles`, `counterparties`, `deals`, `deal_steps`, `counterparty_submissions` — all owner-scoped by `user_id` with RLS.
- Playbooks (Gold, Aluminium, Bauxite, Copper) are hardcoded in `src/lib/playbooks.ts` and drive deal checklists.
- Design system: navy/ocean + gold, `panel` utilities, animated globe. Keep as-is.

Nothing existing gets deleted. Old tables and routes keep working while the new relational layer grows beside them.

## Delivery in phases

This is far too large for one pass. Each phase ends with a working app, typecheck + build clean, and existing routes verified. I'll do them in order and you approve as we go.

### Phase 1 — Relational foundation + data migration (this phase)
New tables (all owner-scoped RLS, GRANTs included):
- `companies`, `contacts`, `company_roles` (many-to-many roles — a company can be buyer *and* seller)
- `commodities` (seeded: Metals/Minerals/Agriculture/Food/Energy/Chemicals/Fertilizers incl. Gold, Aluminium, Bauxite, Copper, Rice, EN590, Urea…), `commodity_specifications`
- `user_roles` + `app_role` enum (Admin, Broker, Sales, Compliance, Operations, Finance, Viewer) with a `has_role()` security-definer function
- Backfill: each `counterparties` row → one `companies` row + one `contacts` row + `company_roles` entry, preserving IDs and `created_at`. `deals` gains nullable `buyer_company_id`, `seller_company_id`, `commodity_id`, `owner_id`, `match_score`, `risk_level`, `status`, `price_formula`, `payment_terms`, `delivery_window`; `buyer_name`/`seller_name` stay for compatibility.
- CRM shell: Companies list + company profile page (Overview, Contacts, Roles, Commodities, Notes), with country/role/commodity/verification/risk filters. Contacts page keeps working and links into companies.

### Phase 2 — Requirements, offers, matching engine
`mandates`, `buyer_requirements`, `seller_offers` (JSONB specs / required_documents / required_procedure). Transparent scorer: per-dimension 0–100 (commodity, spec, quantity, origin, destination, incoterm, payment, price, delivery, procedure) → weighted overall, with an explanation list. Match score shown separately from a **Risk / Missing information** panel — never as proof of legitimacy. Match browser: pick a requirement, rank sellers, see why each matches or fails, promote a match to a Deal.

### Phase 3 — Procedure engine + procedure compatibility
`procedures`, `procedure_stages`, `procedure_requirements`, `procedure_dependencies`, plus `deal_procedure_stages` instances. Procedure templates selectable by commodity, deal type, payment method, incoterm, country. The four hardcoded playbooks become editable templates (Admin-editable in the UI, source unchanged). Buyer-vs-seller procedure comparison → Compatible / Partial / Incompatible / Needs clarification with the exact mismatch and a recommended action.

### Phase 4 — Documents, timeline, tasks, commission
`documents`, `document_requirements`, `document_verifications`, `document_versions` on a private storage bucket with signed URLs; verification states Not reviewed → Received → Under review → Verified → Rejected → Expired. `activity_events` timeline on companies and deals, `tasks` linked to any entity, and `commission_agreements` / `commission_parties` / `commission_payments` supporting multi-intermediary chains.

### Phase 5 — AI Trade Agent, Deal Copilot, dashboard, universal search
Database-grounded agent (server-side, Lovable AI) with read tools over your own rows only; every answer labels DATABASE FACT / AI INFERENCE / MISSING INFORMATION / UNVERIFIED, and never invents companies, prices, documents or availability. Deal Copilot panel on each deal (stage, next action, missing docs, procedure issues, risk, match). Executive dashboard (active deals, pipeline value, commission forecast, buyers/sellers, pending verification, blocked deals, top commodities/countries, charts, alerts). Universal search across all entities.

Acceptance test (European Food Importer / Rice 10,000 MT CIF France LC + 5 sellers, through to commission and AI summary) is exercised end to end once Phase 5 lands; the matching part is verified at the end of Phase 2.

## Technical notes

- All server work uses TanStack `createServerFn`; matching and AI logic run server-side. No edge functions.
- RLS everywhere: rows scoped to the owning user, with role checks via `has_role()` for admin-only edits (playbook/procedure templates). Public intake keeps its insert-only anon policy.
- No destructive DDL: additive migrations, backfills, nullable new columns. Old columns retained.
- Typecheck + build run after every phase; existing routes smoke-tested in a browser pass.

Approve and I'll start with Phase 1.
