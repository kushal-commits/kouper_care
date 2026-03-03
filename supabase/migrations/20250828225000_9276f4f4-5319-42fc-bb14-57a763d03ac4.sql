-- Fix HIPAA violation: Implement role-based access control for patient medical records
-- Step 1: Drop ALL existing policies first to avoid conflicts

-- Drop all existing policies for patients table
DROP POLICY IF EXISTS "Authenticated users can view all patients" ON public.patients;
DROP POLICY IF EXISTS "Authenticated users can create patients" ON public.patients;
DROP POLICY IF EXISTS "Authenticated users can update patients" ON public.patients;
DROP POLICY IF EXISTS "Admins can view all patients" ON public.patients;
DROP POLICY IF EXISTS "Clinical staff can view assigned patients" ON public.patients;
DROP POLICY IF EXISTS "Clinical staff can create patients" ON public.patients;
DROP POLICY IF EXISTS "Admins can update all patients" ON public.patients;
DROP POLICY IF EXISTS "Clinical staff can update assigned patients" ON public.patients;

-- Drop policies for related tables
DROP POLICY IF EXISTS "Authenticated users can view all episodes" ON public.episodes;
DROP POLICY IF EXISTS "Admins can view all episodes" ON public.episodes;
DROP POLICY IF EXISTS "Clinical staff can view assigned episodes" ON public.episodes;

DROP POLICY IF EXISTS "Authenticated users can view all assessments" ON public.assessments;
DROP POLICY IF EXISTS "Admins can view all assessments" ON public.assessments;
DROP POLICY IF EXISTS "Clinical staff can view assessments for assigned patients" ON public.assessments;

DROP POLICY IF EXISTS "Authenticated users can view all interventions" ON public.interventions;
DROP POLICY IF EXISTS "Admins can view all interventions" ON public.interventions;
DROP POLICY IF EXISTS "Clinical staff can view interventions for assigned patients" ON public.interventions;

DROP POLICY IF EXISTS "Authenticated users can view all alerts" ON public.alerts;
DROP POLICY IF EXISTS "Admins can view all alerts" ON public.alerts;
DROP POLICY IF EXISTS "Clinical staff can view alerts for assigned patients" ON public.alerts;