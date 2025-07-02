
-- Create enum types for better data integrity
CREATE TYPE public.shipment_status AS ENUM ('draft', 'active', 'in_transit', 'delivered', 'delayed', 'cancelled');
CREATE TYPE public.custody_action AS ENUM ('created', 'picked_up', 'checkpoint_passed', 'delivered', 'transferred');
CREATE TYPE public.app_role AS ENUM ('admin', 'carrier', 'customer', 'warehouse');

-- Create profiles table for additional user information
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  company_name TEXT,
  phone TEXT,
  role app_role NOT NULL DEFAULT 'customer',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create carriers table
CREATE TABLE public.carriers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  contact_email TEXT NOT NULL,
  contact_phone TEXT,
  license_number TEXT,
  rating DECIMAL(3,2) DEFAULT 0.00,
  is_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create shipments table
CREATE TABLE public.shipments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shipment_number TEXT UNIQUE NOT NULL,
  customer_id UUID REFERENCES public.profiles(id) NOT NULL,
  carrier_id UUID REFERENCES public.carriers(id),
  origin_address TEXT NOT NULL,
  destination_address TEXT NOT NULL,
  description TEXT NOT NULL,
  value_usd DECIMAL(12,2) NOT NULL,
  status shipment_status DEFAULT 'draft',
  expected_delivery TIMESTAMP WITH TIME ZONE,
  penalty_per_day DECIMAL(8,2) DEFAULT 0.00,
  progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create custody_chain table for NFT-like tracking
CREATE TABLE public.custody_chain (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shipment_id UUID REFERENCES public.shipments(id) ON DELETE CASCADE NOT NULL,
  holder_id UUID REFERENCES public.profiles(id),
  holder_name TEXT NOT NULL,
  action custody_action NOT NULL,
  location TEXT,
  timestamp_occurred TIMESTAMP WITH TIME ZONE DEFAULT now(),
  blockchain_hash TEXT,
  signature TEXT,
  is_verified BOOLEAN DEFAULT false,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create tracking_events table for detailed shipment tracking
CREATE TABLE public.tracking_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shipment_id UUID REFERENCES public.shipments(id) ON DELETE CASCADE NOT NULL,
  event_type TEXT NOT NULL,
  description TEXT NOT NULL,
  location TEXT,
  timestamp_occurred TIMESTAMP WITH TIME ZONE DEFAULT now(),
  recorded_by UUID REFERENCES public.profiles(id),
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.carriers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shipments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.custody_chain ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tracking_events ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check user roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE id = _user_id AND role = _role
  )
$$;

-- RLS Policies for profiles
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- RLS Policies for carriers (public read, admin write)
CREATE POLICY "Anyone can view carriers"
  ON public.carriers FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can manage carriers"
  ON public.carriers FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for shipments
CREATE POLICY "Users can view their own shipments"
  ON public.shipments FOR SELECT
  TO authenticated
  USING (
    customer_id = auth.uid() OR
    public.has_role(auth.uid(), 'admin') OR
    public.has_role(auth.uid(), 'carrier')
  );

CREATE POLICY "Customers can create shipments"
  ON public.shipments FOR INSERT
  TO authenticated
  WITH CHECK (customer_id = auth.uid());

CREATE POLICY "Customers and carriers can update shipments"
  ON public.shipments FOR UPDATE
  TO authenticated
  USING (
    customer_id = auth.uid() OR
    public.has_role(auth.uid(), 'admin') OR
    public.has_role(auth.uid(), 'carrier')
  );

-- RLS Policies for custody_chain
CREATE POLICY "Anyone can view custody chain for accessible shipments"
  ON public.custody_chain FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.shipments s
      WHERE s.id = shipment_id AND (
        s.customer_id = auth.uid() OR
        public.has_role(auth.uid(), 'admin') OR
        public.has_role(auth.uid(), 'carrier')
      )
    )
  );

CREATE POLICY "Authorized users can add custody records"
  ON public.custody_chain FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.shipments s
      WHERE s.id = shipment_id AND (
        s.customer_id = auth.uid() OR
        public.has_role(auth.uid(), 'admin') OR
        public.has_role(auth.uid(), 'carrier')
      )
    )
  );

-- RLS Policies for tracking_events
CREATE POLICY "Anyone can view tracking events for accessible shipments"
  ON public.tracking_events FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.shipments s
      WHERE s.id = shipment_id AND (
        s.customer_id = auth.uid() OR
        public.has_role(auth.uid(), 'admin') OR
        public.has_role(auth.uid(), 'carrier')
      )
    )
  );

CREATE POLICY "Authorized users can add tracking events"
  ON public.tracking_events FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.shipments s
      WHERE s.id = shipment_id AND (
        s.customer_id = auth.uid() OR
        public.has_role(auth.uid(), 'admin') OR
        public.has_role(auth.uid(), 'carrier')
      )
    )
  );

-- Create function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', ''),
    'customer'
  );
  RETURN NEW;
END;
$$;

-- Create trigger to automatically create profile on user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Insert some sample carriers
INSERT INTO public.carriers (name, contact_email, contact_phone, license_number, rating, is_verified) VALUES
  ('SecureLogistics Inc.', 'contact@securelogistics.com', '+1-555-0101', 'SL-2024-001', 4.8, true),
  ('FastTrack Express', 'support@fasttrack.com', '+1-555-0102', 'FT-2024-002', 4.5, true),
  ('NorthWest Freight', 'info@nwfreight.com', '+1-555-0103', 'NW-2024-003', 4.2, true),
  ('Global Transport Co.', 'hello@globaltransport.com', '+1-555-0104', 'GT-2024-004', 4.6, true);

-- Create function to generate unique shipment numbers
CREATE OR REPLACE FUNCTION public.generate_shipment_number()
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  new_number TEXT;
  counter INTEGER := 1;
BEGIN
  LOOP
    new_number := 'SP-' || TO_CHAR(NOW(), 'YYYY') || '-' || LPAD(counter::TEXT, 3, '0');
    
    IF NOT EXISTS (SELECT 1 FROM public.shipments WHERE shipment_number = new_number) THEN
      EXIT;
    END IF;
    
    counter := counter + 1;
  END LOOP;
  
  RETURN new_number;
END;
$$;
