CREATE TABLE public.counterparty_submissions (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  broker_user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  company text,
  role text NOT NULL DEFAULT 'buyer',
  commodities text,
  country text,
  email text,
  phone text,
  website text,
  message text,
  status text NOT NULL DEFAULT 'pending',
  reviewed_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

GRANT INSERT ON public.counterparty_submissions TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.counterparty_submissions TO authenticated;
GRANT ALL ON public.counterparty_submissions TO service_role;

ALTER TABLE public.counterparty_submissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "anyone can submit intake"
  ON public.counterparty_submissions FOR INSERT TO anon, authenticated
  WITH CHECK (status = 'pending' AND reviewed_at IS NULL);

CREATE POLICY "broker reads own submissions"
  ON public.counterparty_submissions FOR SELECT TO authenticated
  USING (auth.uid() = broker_user_id);

CREATE POLICY "broker updates own submissions"
  ON public.counterparty_submissions FOR UPDATE TO authenticated
  USING (auth.uid() = broker_user_id) WITH CHECK (auth.uid() = broker_user_id);

CREATE POLICY "broker deletes own submissions"
  ON public.counterparty_submissions FOR DELETE TO authenticated
  USING (auth.uid() = broker_user_id);

CREATE INDEX counterparty_submissions_broker_idx
  ON public.counterparty_submissions (broker_user_id, status, created_at DESC);

CREATE TRIGGER counterparty_submissions_updated_at
  BEFORE UPDATE ON public.counterparty_submissions
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();