
ALTER TABLE public.profiles
ADD COLUMN welcome_email_sent BOOLEAN NOT NULL DEFAULT false;
