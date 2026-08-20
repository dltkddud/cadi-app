/*
# Create closet items for the Cadi wardrobe

1. New Tables
- `closet_items` stores each clothing item shown in the wardrobe.
- `id` is the stable item identifier.
- `category` stores the wardrobe category.
- `name` stores the display name.
- `image_url` stores the image reference used by the app.
- `created_at` stores creation time.

2. Security
- Row level security is enabled.
- This first version has no completed account session, so the app uses the shared single-tenant demo model.
- Anonymous and authenticated clients can perform the four wardrobe operations needed by the app.

3. Important Notes
- The app intentionally uses separate policies for SELECT, INSERT, UPDATE, and DELETE.
- No existing data is modified or removed.
*/

CREATE TABLE IF NOT EXISTS public.closet_items (
  id text PRIMARY KEY,
  category text NOT NULL,
  name text NOT NULL,
  image_url text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.closet_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can read closet items" ON public.closet_items;
CREATE POLICY "Public can read closet items"
  ON public.closet_items FOR SELECT
  TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS "Public can add closet items" ON public.closet_items;
CREATE POLICY "Public can add closet items"
  ON public.closet_items FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "Public can update closet items" ON public.closet_items;
CREATE POLICY "Public can update closet items"
  ON public.closet_items FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS "Public can delete closet items" ON public.closet_items;
CREATE POLICY "Public can delete closet items"
  ON public.closet_items FOR DELETE
  TO anon, authenticated
  USING (true);
