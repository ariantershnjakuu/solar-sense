-- Create profiles table
CREATE TABLE public.profiles (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  locale text DEFAULT 'en' CHECK (locale IN ('en', 'sq')),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Auto-create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, locale)
  VALUES (new.id, 'en');
  RETURN new;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Audits table
CREATE TABLE public.audits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  city text,
  address text,
  coords jsonb,
  dwelling_type text CHECK (dwelling_type IN ('apartment', 'house', 'office')),
  roof_type text CHECK (roof_type IN ('flat', 'sloped')),
  heating_type text CHECK (heating_type IN ('electric', 'wood', 'pellet', 'gas', 'district')),
  water_heater text CHECK (water_heater IN ('electric_tank', 'instant', 'solar')),
  water_tank_liters int,
  occupancy jsonb,
  thermostat_setpoint numeric,
  curtains text CHECK (curtains IN ('none', 'light', 'heavy')),
  insulation_level text CHECK (insulation_level IN ('poor', 'average', 'good')),
  tariff jsonb,
  weather jsonb,
  score numeric,
  end_use jsonb,
  advice jsonb
);

ALTER TABLE public.audits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own audits"
  ON public.audits FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own audits"
  ON public.audits FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own audits"
  ON public.audits FOR UPDATE
  USING (auth.uid() = user_id);

-- Actions catalog
CREATE TABLE public.actions_catalog (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text UNIQUE NOT NULL,
  title text NOT NULL,
  description text,
  safety_notes text,
  base_savings jsonb,
  difficulty int CHECK (difficulty BETWEEN 1 AND 5),
  comfort_impact int CHECK (comfort_impact BETWEEN 1 AND 5),
  i18n jsonb
);

ALTER TABLE public.actions_catalog ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view actions catalog"
  ON public.actions_catalog FOR SELECT
  TO authenticated
  USING (true);

-- User plan
CREATE TABLE public.user_plan (
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  action_id uuid REFERENCES actions_catalog(id) ON DELETE CASCADE,
  added_at timestamptz DEFAULT now(),
  schedule jsonb,
  PRIMARY KEY (user_id, action_id)
);

ALTER TABLE public.user_plan ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own plan"
  ON public.user_plan FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own plan"
  ON public.user_plan FOR ALL
  USING (auth.uid() = user_id);

-- Check-ins
CREATE TABLE public.checkins (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  action_id uuid REFERENCES actions_catalog(id) ON DELETE CASCADE,
  date date NOT NULL,
  status text CHECK (status IN ('done', 'skipped')),
  comfort int CHECK (comfort BETWEEN 1 AND 5),
  note text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.checkins ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own checkins"
  ON public.checkins FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own checkins"
  ON public.checkins FOR ALL
  USING (auth.uid() = user_id);

-- Photo audits
CREATE TABLE public.photo_audits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  audit_id uuid REFERENCES audits(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  file_url text NOT NULL,
  findings jsonb,
  quality_score numeric,
  notes text
);

ALTER TABLE public.photo_audits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own photo audits"
  ON public.photo_audits FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.audits
      WHERE audits.id = photo_audits.audit_id
      AND audits.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create photo audits"
  ON public.photo_audits FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.audits
      WHERE audits.id = photo_audits.audit_id
      AND audits.user_id = auth.uid()
    )
  );

-- Solar assessments
CREATE TABLE public.solar_assessments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  audit_id uuid REFERENCES audits(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  input jsonb,
  potential jsonb,
  economics jsonb,
  impact jsonb
);

ALTER TABLE public.solar_assessments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own solar assessments"
  ON public.solar_assessments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.audits
      WHERE audits.id = solar_assessments.audit_id
      AND audits.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create solar assessments"
  ON public.solar_assessments FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.audits
      WHERE audits.id = solar_assessments.audit_id
      AND audits.user_id = auth.uid()
    )
  );

-- Storage buckets for photos
INSERT INTO storage.buckets (id, name, public)
VALUES ('audit-photos', 'audit-photos', false);

-- Storage policies
CREATE POLICY "Users can view own photos"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'audit-photos' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can upload own photos"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'audit-photos' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete own photos"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'audit-photos' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );