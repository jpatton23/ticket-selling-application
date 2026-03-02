-- Update handle_new_user trigger to only auto-create profiles for email/password signups.
-- OAuth users will select their university on the /auth/select-university page.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Only auto-create profile if university is provided (email/password signups)
  -- OAuth users will select their university on the select-university page
  IF NEW.raw_user_meta_data->>'university' IS NOT NULL THEN
    INSERT INTO public.profiles (id, name, email, university)
    VALUES (
      NEW.id,
      COALESCE(NEW.raw_user_meta_data->>'name', 'User'),
      NEW.email,
      NEW.raw_user_meta_data->>'university'
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
