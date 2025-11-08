-- Leads captured from public landing (anon insert allowed)
CREATE TABLE IF NOT EXISTS public.leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  name text NOT NULL,
  phone text NOT NULL,
  email text,
  city text,
  address text,
  bill_range text CHECK (bill_range IN ('<30','30-60','60-100','100-150','>150')),
  rough_estimate_eur numeric,
  status text DEFAULT 'new' CHECK (status IN ('new','contacted','visit_scheduled','visited','closed')),
  preferred_contact_time text
);

ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

-- Allow anyone (including anon) to create a lead
CREATE POLICY "Anyone can create leads"
  ON public.leads FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Allow authenticated users to read all leads (demo scope)
CREATE POLICY "Authenticated can read leads"
  ON public.leads FOR SELECT
  TO authenticated
  USING (true);

-- Allow authenticated to update leads (demo scope)
CREATE POLICY "Authenticated can update leads"
  ON public.leads FOR UPDATE
  TO authenticated
  USING (true);

-- On-site checklist captured by volunteers/partners
CREATE TABLE IF NOT EXISTS public.site_visits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  lead_id uuid REFERENCES public.leads(id) ON DELETE CASCADE,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  orientation text CHECK (orientation IN ('north','northeast','east','southeast','south','southwest','west','northwest')),
  roof_type text CHECK (roof_type IN ('flat','sloped')),
  roof_angle numeric,
  shading text CHECK (shading IN ('none','light','moderate','heavy')),
  insulation_quality text CHECK (insulation_quality IN ('poor','average','good')),
  windows_quality text CHECK (windows_quality IN ('poor','average','good')),
  avg_monthly_kwh numeric,
  notes text,
  readiness_score numeric
);

ALTER TABLE public.site_visits ENABLE ROW LEVEL SECURITY;

-- Authenticated users can manage site visits (demo)
CREATE POLICY "Authenticated can insert site_visits"
  ON public.site_visits FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated can read site_visits"
  ON public.site_visits FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated can update site_visits"
  ON public.site_visits FOR UPDATE
  TO authenticated
  USING (true);

-- Generated solar report for a lead
CREATE TABLE IF NOT EXISTS public.solar_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  lead_id uuid REFERENCES public.leads(id) ON DELETE CASCADE,
  site_visit_id uuid REFERENCES public.site_visits(id) ON DELETE SET NULL,
  system_size_kw numeric,
  cost_low numeric,
  cost_high numeric,
  payback_years numeric,
  co2_saved_tons_per_year numeric,
  suggestions jsonb
);

ALTER TABLE public.solar_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can insert solar_reports"
  ON public.solar_reports FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated can read solar_reports"
  ON public.solar_reports FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated can update solar_reports"
  ON public.solar_reports FOR UPDATE
  TO authenticated
  USING (true);


