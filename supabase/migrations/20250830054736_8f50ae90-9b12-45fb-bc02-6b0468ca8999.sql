-- Enable RLS on assessments and episodes tables that currently have it disabled
ALTER TABLE public.assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.episodes ENABLE ROW LEVEL SECURITY;