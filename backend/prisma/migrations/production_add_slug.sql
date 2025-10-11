-- Production Database Migration: Add slug field with auto-generation
-- Run this in Supabase SQL Editor

-- Step 1: Add slug column (allows NULL temporarily)
ALTER TABLE "Salon" ADD COLUMN IF NOT EXISTS "slug" TEXT;

-- Step 2: Create function to generate slug from name
CREATE OR REPLACE FUNCTION generate_slug(name TEXT) 
RETURNS TEXT AS $$
DECLARE
  slug TEXT;
BEGIN
  slug := LOWER(name);
  -- Replace Danish characters
  slug := REPLACE(slug, 'æ', 'ae');
  slug := REPLACE(slug, 'ø', 'oe');
  slug := REPLACE(slug, 'å', 'aa');
  slug := REPLACE(slug, 'Æ', 'ae');
  slug := REPLACE(slug, 'Ø', 'oe');
  slug := REPLACE(slug, 'Å', 'aa');
  -- Replace spaces and special characters with dashes
  slug := REGEXP_REPLACE(slug, '[^a-z0-9]+', '-', 'g');
  -- Remove leading/trailing dashes
  slug := TRIM(BOTH '-' FROM slug);
  RETURN slug;
END;
$$ LANGUAGE plpgsql;

-- Step 3: Generate slugs for all existing salons
UPDATE "Salon" 
SET "slug" = generate_slug("name")
WHERE "slug" IS NULL OR "slug" = '';

-- Step 4: Handle duplicate slugs by adding numbers
DO $$
DECLARE
  salon_record RECORD;
  new_slug TEXT;
  counter INT;
BEGIN
  -- Find salons with duplicate slugs
  FOR salon_record IN 
    SELECT id, name, slug
    FROM "Salon"
    WHERE slug IN (
      SELECT slug 
      FROM "Salon" 
      GROUP BY slug 
      HAVING COUNT(*) > 1
    )
    ORDER BY id
  LOOP
    counter := 1;
    new_slug := salon_record.slug || '-' || counter;
    
    -- Find unique slug
    WHILE EXISTS (SELECT 1 FROM "Salon" WHERE slug = new_slug) LOOP
      counter := counter + 1;
      new_slug := salon_record.slug || '-' || counter;
    END LOOP;
    
    -- Update with unique slug
    UPDATE "Salon" 
    SET slug = new_slug 
    WHERE id = salon_record.id;
    
    RAISE NOTICE 'Salon "%" (ID: %) → slug: "%"', salon_record.name, salon_record.id, new_slug;
  END LOOP;
END $$;

-- Step 5: Make slug NOT NULL and add unique constraint
ALTER TABLE "Salon" ALTER COLUMN "slug" SET NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS "Salon_slug_key" ON "Salon"("slug");

-- Step 6: Show results
SELECT id, name, slug FROM "Salon" ORDER BY id;
