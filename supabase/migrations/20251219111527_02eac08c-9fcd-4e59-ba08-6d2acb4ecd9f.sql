-- Create messages table for WhatsApp conversations
CREATE TABLE public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone_number TEXT NOT NULL,
  message_content TEXT NOT NULL,
  sender TEXT NOT NULL CHECK (sender IN ('client', 'assistant')),
  received_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  read BOOLEAN DEFAULT FALSE
);

-- Create indexes for messages
CREATE INDEX idx_messages_phone ON public.messages(phone_number);
CREATE INDEX idx_messages_received_at ON public.messages(received_at DESC);

-- Enable RLS for messages
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Create appointments table
CREATE TABLE public.appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone_number TEXT NOT NULL,
  client_name TEXT NOT NULL,
  appointment_date TIMESTAMP WITH TIME ZONE NOT NULL,
  service_type TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled')),
  reminder_sent BOOLEAN DEFAULT FALSE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for appointments
CREATE INDEX idx_appointments_date ON public.appointments(appointment_date);
CREATE INDEX idx_appointments_status ON public.appointments(status);
CREATE INDEX idx_appointments_phone ON public.appointments(phone_number);

-- Enable RLS for appointments
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;

-- Create salon_settings table (singleton pattern)
CREATE TABLE public.salon_settings (
  id INTEGER PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  salon_name TEXT DEFAULT 'Peluquería Reyna',
  salon_address TEXT DEFAULT 'C. Alcalde Suárez Llanos, 19, 03012 Alicante',
  salon_phone TEXT,
  salon_email TEXT,
  working_hours JSONB DEFAULT '{
    "tuesday_saturday": "10:00-14:00, 16:00-20:00",
    "lunch_break": "14:00-16:00",
    "closed": ["sunday", "monday"]
  }'::jsonb,
  services TEXT[] DEFAULT ARRAY[
    'Corte/Peinado - 45 min',
    'Tratamiento de Cauterización - Desde 60€ - 3h',
    'Tratamiento Células Madre - Desde 35€ - 1h 30min',
    'Tintes/Baños de Color - Precio estándar - 2h',
    'Keratina (Alisado) - Desde 150€ - 4h 30min',
    'Botox Capilar - Desde 80€ - 4h 30min',
    'Reconstrucción (Radiante Glock) - Desde 50€ - 4h'
  ],
  about_salon TEXT DEFAULT 'Peluquería Reyna - Tu belleza es nuestra pasión',
  whatsapp_webhook_url TEXT,
  timezone TEXT DEFAULT 'Europe/Madrid',
  google_maps_url TEXT DEFAULT 'https://www.google.es/maps/place/Sal%C3%B3n+de+Belleza+Reina/@38.3549848,-2.9195577,8z',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS for salon_settings
ALTER TABLE public.salon_settings ENABLE ROW LEVEL SECURITY;

-- Create profiles table for authenticated users who can manage the salon
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  role TEXT DEFAULT 'staff' CHECK (role IN ('admin', 'staff')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS for profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create trigger function to auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (new.id, new.email, new.raw_user_meta_data ->> 'full_name');
  RETURN new;
END;
$$;

-- Create trigger for new user signups
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_salon_settings_updated_at
  BEFORE UPDATE ON public.salon_settings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- RLS Policies for profiles (users can only see/edit their own profile)
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- RLS Policies for salon_settings (authenticated users can read, admins can update)
CREATE POLICY "Authenticated users can view salon settings"
  ON public.salon_settings FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can update salon settings"
  ON public.salon_settings FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert salon settings"
  ON public.salon_settings FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- RLS Policies for messages (authenticated users can manage all messages)
CREATE POLICY "Authenticated users can view all messages"
  ON public.messages FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert messages"
  ON public.messages FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update messages"
  ON public.messages FOR UPDATE
  TO authenticated
  USING (true);

-- Allow service role (edge functions) to manage messages
CREATE POLICY "Service role can manage messages"
  ON public.messages FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- RLS Policies for appointments (authenticated users can manage all appointments)
CREATE POLICY "Authenticated users can view all appointments"
  ON public.appointments FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert appointments"
  ON public.appointments FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update appointments"
  ON public.appointments FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can delete appointments"
  ON public.appointments FOR DELETE
  TO authenticated
  USING (true);

-- Allow service role (edge functions) to manage appointments
CREATE POLICY "Service role can manage appointments"
  ON public.appointments FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Enable realtime for messages table
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;

-- Enable realtime for appointments table
ALTER PUBLICATION supabase_realtime ADD TABLE public.appointments;