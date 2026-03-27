/*
  # Add admin policies for prayer_groups and prayer_prays

  Allows admins to view all prayer_groups and prayer_prays records
  so the admin panel can load all prayers with their related data.
*/

CREATE POLICY "Admins can view all prayer_groups"
  ON public.prayer_groups FOR SELECT TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true)
  );

CREATE POLICY "Admins can view all prayer_prays"
  ON public.prayer_prays FOR SELECT TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true)
  );
