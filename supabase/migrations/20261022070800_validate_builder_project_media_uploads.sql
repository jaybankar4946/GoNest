UPDATE storage.buckets
SET file_size_limit = 8388608,
    allowed_mime_types = ARRAY['image/jpeg','image/png','image/webp']
WHERE id = 'project-images';

CREATE OR REPLACE FUNCTION public.submit_builder_project_with_media(
  p_registered_name text,
  p_operating_brand text,
  p_website_url text,
  p_rera_registration text,
  p_project_name text,
  p_city_id uuid,
  p_locality_id uuid,
  p_public_address text,
  p_rera_number text,
  p_construction_status text,
  p_project_category text,
  p_official_project_url text,
  p_inventory jsonb,
  p_media_paths text[]
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public, storage, pg_temp
AS $function$
DECLARE
  v_user uuid := auth.uid();
  v_project_id uuid;
  v_path text;
  v_order integer := 0;
BEGIN
  IF v_user IS NULL THEN
    RAISE EXCEPTION USING errcode='28000', message='not_authenticated';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE id=v_user AND role::text='builder') THEN
    RAISE EXCEPTION USING errcode='42501', message='builder_account_required';
  END IF;
  IF nullif(trim(p_registered_name),'') IS NULL OR nullif(trim(p_project_name),'') IS NULL OR p_city_id IS NULL THEN
    RAISE EXCEPTION USING errcode='22023', message='builder_name_project_name_and_city_required';
  END IF;
  IF coalesce(p_website_url,'') !~* '^https?://[^[:space:]]+$'
     OR coalesce(p_official_project_url,'') !~* '^https?://[^[:space:]]+$' THEN
    RAISE EXCEPTION USING errcode='22023', message='valid_developer_and_project_source_urls_required';
  END IF;
  IF p_project_category NOT IN ('residential','commercial','plotted','mixed_use','industrial','other') THEN
    RAISE EXCEPTION USING errcode='22023', message='invalid_project_category';
  END IF;
  IF p_construction_status NOT IN ('upcoming','under_construction','completed','on_hold','cancelled','unknown') THEN
    RAISE EXCEPTION USING errcode='22023', message='invalid_construction_status';
  END IF;
  IF p_inventory IS NOT NULL AND jsonb_typeof(p_inventory) <> 'array' THEN
    RAISE EXCEPTION USING errcode='22023', message='inventory_must_be_an_array';
  END IF;
  IF EXISTS (
    SELECT 1 FROM jsonb_array_elements(coalesce(p_inventory,'[]'::jsonb)) i(value)
    WHERE nullif(i.value->>'configuration','') IS NOT NULL
      AND coalesce(i.value->>'source_url','') !~* '^https?://[^[:space:]]+$'
  ) THEN
    RAISE EXCEPTION USING errcode='22023', message='inventory_source_url_required';
  END IF;
  IF coalesce(array_length(p_media_paths, 1), 0) NOT BETWEEN 1 AND 8 THEN
    RAISE EXCEPTION USING errcode='22023', message='upload_between_1_and_8_project_photos';
  END IF;
  FOREACH v_path IN ARRAY p_media_paths LOOP
    IF v_path IS NULL OR split_part(v_path, '/', 1) <> v_user::text OR
       NOT EXISTS (SELECT 1 FROM storage.objects o WHERE o.bucket_id='project-images' AND o.name=v_path) THEN
      RAISE EXCEPTION USING errcode='22023', message='invalid_project_photo_path';
    END IF;
  END LOOP;

  v_project_id := public.submit_builder_project(
    p_registered_name, p_operating_brand, p_website_url, p_rera_registration,
    p_project_name, p_city_id, p_locality_id, p_public_address, p_rera_number,
    p_construction_status, p_project_category, p_official_project_url, coalesce(p_inventory, '[]'::jsonb)
  );

  FOREACH v_path IN ARRAY p_media_paths LOOP
    INSERT INTO public.project_media(project_id, storage_path, alt_text, sort_order, created_by_user_id, is_sample)
    VALUES (v_project_id, v_path, 'Builder-submitted project photo', v_order, v_user, false);
    v_order := v_order + 1;
  END LOOP;

  RETURN v_project_id;
END;
$function$;
