-- =========================================================
-- Roles
-- =========================================================
DO $$ BEGIN
  CREATE TYPE public.app_role AS ENUM ('admin','broker','sales','compliance','operations','finance','viewer');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "read own roles" ON public.user_roles
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role
  );
$$;

REVOKE ALL ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated, service_role;

-- =========================================================
-- Commodities master
-- =========================================================
CREATE TABLE IF NOT EXISTS public.commodities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  category text NOT NULL DEFAULT 'Other',
  sub_category text,
  hs_code text,
  unit text NOT NULL DEFAULT 'MT',
  description text,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.commodities TO authenticated;
GRANT INSERT, UPDATE, DELETE ON public.commodities TO authenticated;
GRANT ALL ON public.commodities TO service_role;
ALTER TABLE public.commodities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "commodities readable by signed in users" ON public.commodities
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "admins insert commodities" ON public.commodities
  FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "admins update commodities" ON public.commodities
  FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "admins delete commodities" ON public.commodities
  FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER commodities_updated_at BEFORE UPDATE ON public.commodities
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

INSERT INTO public.commodities (name, slug, category, sub_category, hs_code, unit, description) VALUES
  ('Gold', 'gold', 'Metals', 'Precious metals', '7108', 'KG', 'Doré bars, bullion and refined gold'),
  ('Silver', 'silver', 'Metals', 'Precious metals', '7106', 'KG', 'Refined silver bars and granules'),
  ('Copper Cathode', 'copper-cathode', 'Metals', 'Base metals', '7403', 'MT', 'LME Grade A copper cathodes 99.99%'),
  ('Copper Concentrate', 'copper-concentrate', 'Minerals', 'Concentrates', '2603', 'MT', 'Copper concentrate, typically 20-30% Cu'),
  ('Aluminium Ingot', 'aluminium-ingot', 'Metals', 'Base metals', '7601', 'MT', 'A7/A8 primary aluminium ingots'),
  ('Aluminium Scrap', 'aluminium-scrap', 'Metals', 'Scrap', '7602', 'MT', 'Taint tabor, tense and other ISRI grades'),
  ('Bauxite Ore', 'bauxite-ore', 'Minerals', 'Ores', '2606', 'MT', 'Metallurgical and refractory grade bauxite'),
  ('Iron Ore Fines', 'iron-ore-fines', 'Minerals', 'Ores', '2601', 'MT', 'Fe 58-65% iron ore fines'),
  ('Manganese Ore', 'manganese-ore', 'Minerals', 'Ores', '2602', 'MT', 'Mn 35-48% manganese ore'),
  ('Chrome Ore', 'chrome-ore', 'Minerals', 'Ores', '2610', 'MT', 'Chrome ore and concentrate'),
  ('Lithium Carbonate', 'lithium-carbonate', 'Chemicals', 'Battery materials', '2836', 'MT', 'Battery and technical grade lithium carbonate'),
  ('Rice', 'rice', 'Agriculture', 'Grains', '1006', 'MT', 'Long grain white, parboiled and basmati rice'),
  ('Wheat', 'wheat', 'Agriculture', 'Grains', '1001', 'MT', 'Milling and feed wheat'),
  ('Corn', 'corn', 'Agriculture', 'Grains', '1005', 'MT', 'Yellow corn, feed and food grade'),
  ('Soybean', 'soybean', 'Agriculture', 'Oilseeds', '1201', 'MT', 'Non-GMO and GMO soybeans'),
  ('Sugar ICUMSA 45', 'sugar-icumsa-45', 'Food', 'Sweeteners', '1701', 'MT', 'Refined white sugar ICUMSA 45'),
  ('Refined Sunflower Oil', 'refined-sunflower-oil', 'Food', 'Edible oils', '1512', 'MT', 'Refined, bleached and deodorised sunflower oil'),
  ('Crude Palm Oil', 'crude-palm-oil', 'Food', 'Edible oils', '1511', 'MT', 'CPO for refining'),
  ('Green Coffee Beans', 'green-coffee', 'Food', 'Beverages', '0901', 'MT', 'Arabica and robusta green beans'),
  ('Cocoa Beans', 'cocoa-beans', 'Food', 'Beverages', '1801', 'MT', 'Fermented and dried cocoa beans'),
  ('EN590 10ppm Diesel', 'en590', 'Energy', 'Refined products', '2710', 'MT', 'EN590 automotive diesel, 10ppm sulphur'),
  ('Jet A1', 'jet-a1', 'Energy', 'Refined products', '2710', 'MT', 'Aviation turbine fuel Jet A1'),
  ('LNG', 'lng', 'Energy', 'Gas', '2711', 'MT', 'Liquefied natural gas'),
  ('LPG', 'lpg', 'Energy', 'Gas', '2711', 'MT', 'Liquefied petroleum gas'),
  ('Thermal Coal', 'thermal-coal', 'Energy', 'Coal', '2701', 'MT', 'Steam coal by GCV specification'),
  ('Caustic Soda', 'caustic-soda', 'Chemicals', 'Inorganic', '2815', 'MT', 'Caustic soda flakes, pearls and lye'),
  ('Sulphuric Acid', 'sulphuric-acid', 'Chemicals', 'Inorganic', '2807', 'MT', 'Technical grade sulphuric acid'),
  ('Urea 46% Prilled', 'urea-46-prilled', 'Fertilizers', 'Nitrogen', '3102', 'MT', 'Urea 46% N prilled and granular'),
  ('DAP Fertilizer', 'dap', 'Fertilizers', 'Phosphate', '3105', 'MT', 'Diammonium phosphate 18-46-0'),
  ('NPK Fertilizer', 'npk', 'Fertilizers', 'Compound', '3105', 'MT', 'NPK blends to buyer formulation'),
  ('Muriate of Potash', 'mop', 'Fertilizers', 'Potash', '3104', 'MT', 'MOP standard and granular')
ON CONFLICT (slug) DO NOTHING;

-- =========================================================
-- Companies
-- =========================================================
CREATE TABLE IF NOT EXISTS public.companies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  legal_name text NOT NULL,
  trading_name text,
  company_type text NOT NULL DEFAULT 'other',
  country text,
  city text,
  address text,
  website text,
  registration_number text,
  tax_number text,
  industry text,
  description text,
  status text NOT NULL DEFAULT 'active',
  risk_level text NOT NULL DEFAULT 'unknown',
  verification_status text NOT NULL DEFAULT 'not_reviewed',
  legacy_counterparty_id uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.companies TO authenticated;
GRANT ALL ON public.companies TO service_role;
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "own companies" ON public.companies
  FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TRIGGER companies_updated_at BEFORE UPDATE ON public.companies
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE INDEX IF NOT EXISTS companies_user_idx ON public.companies(user_id);
CREATE INDEX IF NOT EXISTS companies_country_idx ON public.companies(country);

-- =========================================================
-- Contacts
-- =========================================================
CREATE TABLE IF NOT EXISTS public.contacts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  company_id uuid REFERENCES public.companies(id) ON DELETE CASCADE,
  full_name text NOT NULL,
  job_title text,
  department text,
  email text,
  phone text,
  whatsapp text,
  country text,
  preferred_language text,
  status text NOT NULL DEFAULT 'active',
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.contacts TO authenticated;
GRANT ALL ON public.contacts TO service_role;
ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "own contacts" ON public.contacts
  FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TRIGGER contacts_updated_at BEFORE UPDATE ON public.contacts
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE INDEX IF NOT EXISTS contacts_company_idx ON public.contacts(company_id);

-- =========================================================
-- Company roles (many-to-many)
-- =========================================================
CREATE TABLE IF NOT EXISTS public.company_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  company_id uuid NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  role text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (company_id, role)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.company_roles TO authenticated;
GRANT ALL ON public.company_roles TO service_role;
ALTER TABLE public.company_roles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "own company roles" ON public.company_roles
  FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- =========================================================
-- Company commodities (interest list)
-- =========================================================
CREATE TABLE IF NOT EXISTS public.company_commodities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  company_id uuid NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  commodity_id uuid NOT NULL REFERENCES public.commodities(id) ON DELETE CASCADE,
  side text NOT NULL DEFAULT 'both',
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (company_id, commodity_id, side)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.company_commodities TO authenticated;
GRANT ALL ON public.company_commodities TO service_role;
ALTER TABLE public.company_commodities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "own company commodities" ON public.company_commodities
  FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- =========================================================
-- Commodity specifications
-- =========================================================
CREATE TABLE IF NOT EXISTS public.commodity_specifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  commodity_id uuid NOT NULL REFERENCES public.commodities(id) ON DELETE CASCADE,
  name text NOT NULL,
  spec jsonb NOT NULL DEFAULT '{}'::jsonb,
  is_template boolean NOT NULL DEFAULT false,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.commodity_specifications TO authenticated;
GRANT ALL ON public.commodity_specifications TO service_role;
ALTER TABLE public.commodity_specifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "read own or template specifications" ON public.commodity_specifications
  FOR SELECT TO authenticated USING (auth.uid() = user_id OR is_template = true);
CREATE POLICY "insert own specifications" ON public.commodity_specifications
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "update own specifications" ON public.commodity_specifications
  FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "delete own specifications" ON public.commodity_specifications
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE TRIGGER commodity_specifications_updated_at BEFORE UPDATE ON public.commodity_specifications
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- =========================================================
-- Deals: relational upgrade (additive, non-destructive)
-- =========================================================
ALTER TABLE public.deals
  ADD COLUMN IF NOT EXISTS buyer_company_id uuid REFERENCES public.companies(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS seller_company_id uuid REFERENCES public.companies(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS commodity_id uuid REFERENCES public.commodities(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS owner_id uuid,
  ADD COLUMN IF NOT EXISTS match_score numeric,
  ADD COLUMN IF NOT EXISTS risk_level text NOT NULL DEFAULT 'unknown',
  ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'open',
  ADD COLUMN IF NOT EXISTS price_formula text,
  ADD COLUMN IF NOT EXISTS payment_terms text,
  ADD COLUMN IF NOT EXISTS delivery_window text;

UPDATE public.deals SET owner_id = user_id WHERE owner_id IS NULL;

UPDATE public.deals d
SET commodity_id = c.id
FROM public.commodities c
WHERE d.commodity_id IS NULL
  AND (
    c.slug = d.commodity
    OR (d.commodity = 'copper' AND c.slug = 'copper-cathode')
    OR (d.commodity = 'aluminium' AND c.slug = 'aluminium-ingot')
    OR (d.commodity = 'bauxite' AND c.slug = 'bauxite-ore')
  );

-- =========================================================
-- Backfill: counterparties -> companies + contacts + roles
-- =========================================================
INSERT INTO public.companies (
  user_id, legal_name, trading_name, company_type, country, website, description,
  verification_status, risk_level, legacy_counterparty_id, created_at, updated_at
)
SELECT
  cp.user_id,
  COALESCE(NULLIF(cp.company, ''), cp.name),
  NULLIF(cp.company, ''),
  cp.role,
  cp.country,
  NULL,
  cp.notes,
  CASE cp.trust_level
    WHEN 'verified' THEN 'verified'
    WHEN 'trusted' THEN 'verified'
    WHEN 'blacklisted' THEN 'rejected'
    ELSE 'not_reviewed'
  END,
  CASE cp.trust_level WHEN 'blacklisted' THEN 'high' ELSE 'unknown' END,
  cp.id,
  cp.created_at,
  cp.updated_at
FROM public.counterparties cp
WHERE NOT EXISTS (
  SELECT 1 FROM public.companies co WHERE co.legacy_counterparty_id = cp.id
);

INSERT INTO public.contacts (
  user_id, company_id, full_name, job_title, email, phone, country, notes, created_at, updated_at
)
SELECT
  cp.user_id, co.id, cp.name, NULLIF(cp.role, ''), cp.email, cp.phone, cp.country, cp.notes,
  cp.created_at, cp.updated_at
FROM public.counterparties cp
JOIN public.companies co ON co.legacy_counterparty_id = cp.id
WHERE NOT EXISTS (
  SELECT 1 FROM public.contacts ct WHERE ct.company_id = co.id AND ct.full_name = cp.name
);

INSERT INTO public.company_roles (user_id, company_id, role)
SELECT co.user_id, co.id, cp.role
FROM public.counterparties cp
JOIN public.companies co ON co.legacy_counterparty_id = cp.id
WHERE cp.role IS NOT NULL AND cp.role <> ''
ON CONFLICT (company_id, role) DO NOTHING;

INSERT INTO public.company_commodities (user_id, company_id, commodity_id, side)
SELECT DISTINCT co.user_id, co.id, cm.id,
  CASE WHEN cp.role = 'buyer' THEN 'buy' WHEN cp.role IN ('seller','producer','mine','refinery') THEN 'sell' ELSE 'both' END
FROM public.counterparties cp
JOIN public.companies co ON co.legacy_counterparty_id = cp.id
JOIN public.commodities cm ON cp.commodities ILIKE '%' || split_part(cm.name, ' ', 1) || '%'
WHERE cp.commodities IS NOT NULL AND cp.commodities <> ''
ON CONFLICT (company_id, commodity_id, side) DO NOTHING;