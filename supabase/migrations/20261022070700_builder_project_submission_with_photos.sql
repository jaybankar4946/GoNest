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

REVOKE ALL ON FUNCTION public.submit_builder_project_with_media(text,text,text,text,text,uuid,uuid,text,text,text,text,text,jsonb,text[]) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.submit_builder_project_with_media(text,text,text,text,text,uuid,uuid,text,text,text,text,text,jsonb,text[]) TO authenticated;
