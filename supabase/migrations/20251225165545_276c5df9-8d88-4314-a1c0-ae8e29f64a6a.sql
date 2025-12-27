-- Create surveys table
CREATE TABLE public.surveys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  -- Common info
  shop_name TEXT NOT NULL,
  owner_name TEXT,
  phone_number TEXT,
  shop_type TEXT NOT NULL,
  bills_per_day TEXT NOT NULL,
  billing_handler TEXT NOT NULL,
  location_lat DOUBLE PRECISION,
  location_lng DOUBLE PRECISION,
  surveyor_name TEXT NOT NULL,
  
  -- Path selection
  has_billing_software BOOLEAN NOT NULL,
  
  -- Software path data (JSON for flexibility)
  software_path JSONB,
  
  -- No software path data (JSON for flexibility)
  no_software_path JSONB,
  
  -- Attachments (store as JSON with URLs/base64)
  attachments JSONB DEFAULT '{"photos": []}'::jsonb,
  
  -- Additional fields
  additional_notes TEXT,
  consent_given BOOLEAN NOT NULL DEFAULT false,
  status TEXT NOT NULL DEFAULT 'draft',
  
  -- Meta information
  start_time TIMESTAMP WITH TIME ZONE,
  end_time TIMESTAMP WITH TIME ZONE,
  total_duration INTEGER,
  is_reviewed BOOLEAN DEFAULT false,
  tags TEXT[],
  admin_notes TEXT,
  priority TEXT DEFAULT 'normal'
);

-- Enable RLS
ALTER TABLE public.surveys ENABLE ROW LEVEL SECURITY;

-- Create policy for public read (since surveyors may not be authenticated)
CREATE POLICY "Anyone can read surveys" 
ON public.surveys 
FOR SELECT 
USING (true);

-- Create policy for public insert
CREATE POLICY "Anyone can insert surveys" 
ON public.surveys 
FOR INSERT 
WITH CHECK (true);

-- Create policy for public update
CREATE POLICY "Anyone can update surveys" 
ON public.surveys 
FOR UPDATE 
USING (true);

-- Create policy for public delete
CREATE POLICY "Anyone can delete surveys" 
ON public.surveys 
FOR DELETE 
USING (true);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_surveys_updated_at
BEFORE UPDATE ON public.surveys
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime for surveys table
ALTER PUBLICATION supabase_realtime ADD TABLE public.surveys;