
-- Create clients table to store real names associated with phone numbers
CREATE TABLE public.clients (
  phone_number TEXT PRIMARY KEY,
  full_name TEXT NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;

-- Policies for authenticated users (salon staff)
CREATE POLICY "Authenticated users can view all clients"
  ON public.clients FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can manage clients"
  ON public.clients FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Allow service role (edge functions) to manage clients
CREATE POLICY "Service role can manage clients"
  ON public.clients FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Trigger for updated_at
CREATE TRIGGER update_clients_updated_at
  BEFORE UPDATE ON public.clients
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
