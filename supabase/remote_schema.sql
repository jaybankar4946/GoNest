


SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


CREATE SCHEMA IF NOT EXISTS "public";


ALTER SCHEMA "public" OWNER TO "pg_database_owner";


COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE TYPE "public"."listing_purpose" AS ENUM (
    'sale',
    'rent'
);


ALTER TYPE "public"."listing_purpose" OWNER TO "postgres";


CREATE TYPE "public"."listing_status" AS ENUM (
    'draft',
    'pending_review',
    'active',
    'rejected',
    'archived'
);


ALTER TYPE "public"."listing_status" OWNER TO "postgres";


CREATE TYPE "public"."poster_type" AS ENUM (
    'owner',
    'agent'
);


ALTER TYPE "public"."poster_type" OWNER TO "postgres";


CREATE TYPE "public"."property_type" AS ENUM (
    'apartment',
    'villa',
    'house',
    'plot',
    'commercial',
    'office',
    'pg'
);


ALTER TYPE "public"."property_type" OWNER TO "postgres";


CREATE TYPE "public"."user_role" AS ENUM (
    'buyer',
    'owner',
    'agent',
    'admin'
);


ALTER TYPE "public"."user_role" OWNER TO "postgres";


CREATE TYPE "public"."verification_level" AS ENUM (
    'unverified',
    'verified',
    'platform_verified'
);


ALTER TYPE "public"."verification_level" OWNER TO "postgres";


CREATE TYPE "public"."visit_status" AS ENUM (
    'requested',
    'confirmed',
    'completed',
    'cancelled'
);


ALTER TYPE "public"."visit_status" OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."adjust_saved_count"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
begin
  if tg_op = 'INSERT' then
    update public.listings set saved_count = saved_count + 1 where id = new.listing_id;
    return new;
  elsif tg_op = 'DELETE' then
    update public.listings set saved_count = greatest(saved_count - 1, 0) where id = old.listing_id;
    return old;
  end if;
  return null;
end;
$$;


ALTER FUNCTION "public"."adjust_saved_count"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."admin_moderate_listing"("p_listing_id" "uuid", "p_new_status" "public"."listing_status", "p_new_verification" "public"."verification_level", "p_reason" "text" DEFAULT NULL::"text") RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
declare
  v_old_status listing_status;
  v_old_verification verification_level;
  v_action text;
begin
  if not is_admin() then
    raise exception 'Only admins can moderate listings';
  end if;

  select status, verification_level into v_old_status, v_old_verification
  from listings where id = p_listing_id;

  update listings
  set status = p_new_status,
      verification_level = p_new_verification,
      rejection_reason = case when p_new_status = 'rejected' then p_reason else null end
  where id = p_listing_id;

  v_action := case
    when p_new_status = 'rejected' then 'rejected'
    when p_new_status = 'active' and p_new_verification = 'platform_verified' then 'platform_verified'
    when p_new_status = 'active' and p_new_verification = 'verified' then 'verified'
    when p_new_status = 'active' then 'approved'
    when p_new_status = 'archived' then 'archived'
    else 'flagged'
  end;

  insert into verification_log (listing_id, actor_id, action, previous_status, new_status, previous_verification, new_verification, reason)
  values (p_listing_id, auth.uid(), v_action, v_old_status, p_new_status, v_old_verification, p_new_verification, p_reason);
end;
$$;


ALTER FUNCTION "public"."admin_moderate_listing"("p_listing_id" "uuid", "p_new_status" "public"."listing_status", "p_new_verification" "public"."verification_level", "p_reason" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."bump_lead_count"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
begin
  update public.listings set lead_count = lead_count + 1 where id = new.listing_id;
  return new;
end;
$$;


ALTER FUNCTION "public"."bump_lead_count"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."handle_new_user"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
begin
  insert into public.profiles (id, full_name, email)
  values (new.id, new.raw_user_meta_data->>'full_name', new.email);
  return new;
end;
$$;


ALTER FUNCTION "public"."handle_new_user"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."increment_listing_views"("listing_id" "uuid") RETURNS "void"
    LANGUAGE "sql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
  update listings set view_count = view_count + 1 where id = listing_id;
$$;


ALTER FUNCTION "public"."increment_listing_views"("listing_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."is_admin"() RETURNS boolean
    LANGUAGE "sql" STABLE SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
  select exists (
    select 1 from profiles
    where id = auth.uid() and role = 'admin'
  );
$$;


ALTER FUNCTION "public"."is_admin"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."recalc_total_listings"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
declare
  target_id uuid;
begin
  target_id := coalesce(new.posted_by, old.posted_by);
  update public.profiles
  set total_listings = (
    select count(*) from public.listings
    where posted_by = target_id and status = 'active'
  )
  where id = target_id;
  return coalesce(new, old);
end;
$$;


ALTER FUNCTION "public"."recalc_total_listings"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."set_listing_published_at"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
begin
  if new.status = 'active' and new.published_at is null then
    new.published_at := now();
  end if;
  return new;
end;
$$;


ALTER FUNCTION "public"."set_listing_published_at"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."set_listing_slug"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
begin
  if new.slug is null or length(trim(new.slug)) = 0 then
    new.slug := public.slugify(new.title) || '-' || substr(new.id::text, 1, 8);
  end if;
  return new;
end;
$$;


ALTER FUNCTION "public"."set_listing_slug"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."set_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    SET "search_path" TO 'public'
    AS $$
begin
  new.updated_at = now();
  return new;
end;
$$;


ALTER FUNCTION "public"."set_updated_at"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."slugify"("input" "text") RETURNS "text"
    LANGUAGE "sql" IMMUTABLE
    SET "search_path" TO 'public'
    AS $$
  select trim(both '-' from regexp_replace(lower(coalesce(input, '')), '[^a-z0-9]+', '-', 'g'));
$$;


ALTER FUNCTION "public"."slugify"("input" "text") OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."cities" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "state" "text" NOT NULL,
    "slug" "text" NOT NULL,
    "is_active" boolean DEFAULT true NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."cities" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."leads" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "listing_id" "uuid" NOT NULL,
    "buyer_id" "uuid",
    "buyer_name" "text" NOT NULL,
    "buyer_phone" "text" NOT NULL,
    "buyer_email" "text",
    "message" "text",
    "status" "text" DEFAULT 'new'::"text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "leads_status_check" CHECK (("status" = ANY (ARRAY['new'::"text", 'contacted'::"text", 'closed'::"text", 'spam'::"text"]))),
    CONSTRAINT "phone_not_empty" CHECK (("char_length"(TRIM(BOTH FROM "buyer_phone")) >= 8))
);


ALTER TABLE "public"."leads" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."listing_images" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "listing_id" "uuid" NOT NULL,
    "storage_path" "text" NOT NULL,
    "sort_order" smallint DEFAULT 0 NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."listing_images" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."listing_reports" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "listing_id" "uuid" NOT NULL,
    "reporter_id" "uuid",
    "reason" "text" NOT NULL,
    "details" "text",
    "status" "text" DEFAULT 'open'::"text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "listing_reports_status_check" CHECK (("status" = ANY (ARRAY['open'::"text", 'reviewed'::"text", 'dismissed'::"text"])))
);


ALTER TABLE "public"."listing_reports" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."listing_reviews" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "listing_id" "uuid" NOT NULL,
    "reviewer_id" "uuid",
    "reviewer_name" "text" NOT NULL,
    "rating" integer NOT NULL,
    "comment" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "listing_reviews_rating_check" CHECK ((("rating" >= 1) AND ("rating" <= 5)))
);


ALTER TABLE "public"."listing_reviews" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."listings" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "posted_by" "uuid" NOT NULL,
    "poster_type" "public"."poster_type" NOT NULL,
    "title" "text" NOT NULL,
    "description" "text",
    "property_type" "public"."property_type" NOT NULL,
    "purpose" "public"."listing_purpose" NOT NULL,
    "city_id" "uuid" NOT NULL,
    "locality_id" "uuid" NOT NULL,
    "address_line" "text",
    "latitude" numeric(9,6),
    "longitude" numeric(9,6),
    "price" bigint NOT NULL,
    "maintenance_monthly" bigint,
    "security_deposit" bigint,
    "bedrooms" smallint DEFAULT 0 NOT NULL,
    "bathrooms" smallint DEFAULT 0 NOT NULL,
    "sqft" integer,
    "floor_number" smallint,
    "total_floors" smallint,
    "furnishing" "text",
    "property_age" smallint,
    "status" "public"."listing_status" DEFAULT 'pending_review'::"public"."listing_status" NOT NULL,
    "rejection_reason" "text",
    "flagged_count" integer DEFAULT 0 NOT NULL,
    "view_count" integer DEFAULT 0 NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "expires_at" timestamp with time zone,
    "verification_level" "public"."verification_level" DEFAULT 'unverified'::"public"."verification_level" NOT NULL,
    "verified" boolean GENERATED ALWAYS AS (("verification_level" <> 'unverified'::"public"."verification_level")) STORED,
    "landmark" "text",
    "balconies" smallint DEFAULT 0 NOT NULL,
    "carpet_area" integer,
    "price_negotiable" boolean DEFAULT false NOT NULL,
    "brokerage" "text",
    "facing" "text",
    "available_from" "date",
    "featured" boolean DEFAULT false NOT NULL,
    "lead_count" integer DEFAULT 0 NOT NULL,
    "saved_count" integer DEFAULT 0 NOT NULL,
    "slug" "text",
    "published_at" timestamp with time zone,
    CONSTRAINT "bedrooms_valid" CHECK ((("bedrooms" >= 0) AND ("bedrooms" <= 20))),
    CONSTRAINT "listings_facing_check" CHECK ((("facing" IS NULL) OR ("facing" = ANY (ARRAY['north'::"text", 'south'::"text", 'east'::"text", 'west'::"text", 'north-east'::"text", 'north-west'::"text", 'south-east'::"text", 'south-west'::"text"])))),
    CONSTRAINT "listings_furnishing_check" CHECK (("furnishing" = ANY (ARRAY['unfurnished'::"text", 'semi-furnished'::"text", 'fully-furnished'::"text"]))),
    CONSTRAINT "listings_price_check" CHECK (("price" > 0)),
    CONSTRAINT "price_positive" CHECK (("price" > 0)),
    CONSTRAINT "title_not_empty" CHECK (("char_length"(TRIM(BOTH FROM "title")) > 3))
);


ALTER TABLE "public"."listings" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."localities" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "city_id" "uuid" NOT NULL,
    "name" "text" NOT NULL,
    "slug" "text" NOT NULL,
    "latitude" numeric(9,6),
    "longitude" numeric(9,6),
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."localities" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."profiles" (
    "id" "uuid" NOT NULL,
    "full_name" "text",
    "phone" "text",
    "phone_verified" boolean DEFAULT false NOT NULL,
    "role" "public"."user_role" DEFAULT 'buyer'::"public"."user_role" NOT NULL,
    "agency_name" "text",
    "rera_number" "text",
    "agent_verified" boolean DEFAULT false NOT NULL,
    "avatar_url" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "email" "text",
    "bio" "text",
    "total_listings" integer DEFAULT 0 NOT NULL,
    "rating" numeric(3,2),
    "review_count" integer DEFAULT 0 NOT NULL
);


ALTER TABLE "public"."profiles" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."saved_listings" (
    "user_id" "uuid" NOT NULL,
    "listing_id" "uuid" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."saved_listings" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."saved_searches" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "name" "text",
    "city_id" "uuid",
    "locality_id" "uuid",
    "purpose" "public"."listing_purpose",
    "property_type" "public"."property_type",
    "min_price" bigint,
    "max_price" bigint,
    "min_bedrooms" smallint,
    "notify_enabled" boolean DEFAULT true NOT NULL,
    "last_notified_at" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."saved_searches" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."verification_log" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "listing_id" "uuid" NOT NULL,
    "actor_id" "uuid" NOT NULL,
    "action" "text" NOT NULL,
    "previous_status" "public"."listing_status",
    "new_status" "public"."listing_status",
    "previous_verification" "public"."verification_level",
    "new_verification" "public"."verification_level",
    "reason" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "verification_log_action_check" CHECK (("action" = ANY (ARRAY['approved'::"text", 'rejected'::"text", 'verified'::"text", 'platform_verified'::"text", 'flagged'::"text", 'archived'::"text"])))
);


ALTER TABLE "public"."verification_log" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."visits" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "listing_id" "uuid" NOT NULL,
    "requested_by" "uuid",
    "requester_name" "text" NOT NULL,
    "requester_phone" "text" NOT NULL,
    "requester_email" "text",
    "slot_date" "date" NOT NULL,
    "slot_time" time without time zone NOT NULL,
    "notes" "text",
    "status" "public"."visit_status" DEFAULT 'requested'::"public"."visit_status" NOT NULL,
    "confirmed_by" "uuid",
    "confirmed_at" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "visit_phone_not_empty" CHECK (("char_length"(TRIM(BOTH FROM "requester_phone")) >= 8))
);


ALTER TABLE "public"."visits" OWNER TO "postgres";


ALTER TABLE ONLY "public"."cities"
    ADD CONSTRAINT "cities_name_state_key" UNIQUE ("name", "state");



ALTER TABLE ONLY "public"."cities"
    ADD CONSTRAINT "cities_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."cities"
    ADD CONSTRAINT "cities_slug_key" UNIQUE ("slug");



ALTER TABLE ONLY "public"."leads"
    ADD CONSTRAINT "leads_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."listing_images"
    ADD CONSTRAINT "listing_images_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."listing_reports"
    ADD CONSTRAINT "listing_reports_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."listing_reviews"
    ADD CONSTRAINT "listing_reviews_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."listings"
    ADD CONSTRAINT "listings_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."localities"
    ADD CONSTRAINT "localities_city_id_slug_key" UNIQUE ("city_id", "slug");



ALTER TABLE ONLY "public"."localities"
    ADD CONSTRAINT "localities_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."saved_listings"
    ADD CONSTRAINT "saved_listings_pkey" PRIMARY KEY ("user_id", "listing_id");



ALTER TABLE ONLY "public"."saved_searches"
    ADD CONSTRAINT "saved_searches_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."verification_log"
    ADD CONSTRAINT "verification_log_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."visits"
    ADD CONSTRAINT "visits_pkey" PRIMARY KEY ("id");



CREATE INDEX "idx_leads_buyer" ON "public"."leads" USING "btree" ("buyer_id");



CREATE INDEX "idx_leads_listing" ON "public"."leads" USING "btree" ("listing_id");



CREATE INDEX "idx_listing_images_listing" ON "public"."listing_images" USING "btree" ("listing_id");



CREATE INDEX "idx_listings_city" ON "public"."listings" USING "btree" ("city_id") WHERE ("status" = 'active'::"public"."listing_status");



CREATE INDEX "idx_listings_locality" ON "public"."listings" USING "btree" ("locality_id") WHERE ("status" = 'active'::"public"."listing_status");



CREATE INDEX "idx_listings_posted_by" ON "public"."listings" USING "btree" ("posted_by");



CREATE INDEX "idx_listings_price" ON "public"."listings" USING "btree" ("price") WHERE ("status" = 'active'::"public"."listing_status");



CREATE INDEX "idx_listings_purpose" ON "public"."listings" USING "btree" ("purpose") WHERE ("status" = 'active'::"public"."listing_status");



CREATE INDEX "idx_listings_status" ON "public"."listings" USING "btree" ("status");



CREATE INDEX "idx_listings_type" ON "public"."listings" USING "btree" ("property_type") WHERE ("status" = 'active'::"public"."listing_status");



CREATE INDEX "idx_localities_city" ON "public"."localities" USING "btree" ("city_id");



CREATE INDEX "idx_saved_searches_user" ON "public"."saved_searches" USING "btree" ("user_id");



CREATE INDEX "idx_verification_log_listing" ON "public"."verification_log" USING "btree" ("listing_id");



CREATE INDEX "idx_visits_listing" ON "public"."visits" USING "btree" ("listing_id");



CREATE INDEX "idx_visits_requested_by" ON "public"."visits" USING "btree" ("requested_by");



CREATE INDEX "idx_visits_slot" ON "public"."visits" USING "btree" ("slot_date", "slot_time");



CREATE INDEX "idx_visits_status" ON "public"."visits" USING "btree" ("status");



CREATE UNIQUE INDEX "listings_slug_key" ON "public"."listings" USING "btree" ("slug") WHERE ("slug" IS NOT NULL);



CREATE OR REPLACE TRIGGER "trg_adjust_saved_count" AFTER INSERT OR DELETE ON "public"."saved_listings" FOR EACH ROW EXECUTE FUNCTION "public"."adjust_saved_count"();



CREATE OR REPLACE TRIGGER "trg_bump_lead_count" AFTER INSERT ON "public"."leads" FOR EACH ROW EXECUTE FUNCTION "public"."bump_lead_count"();



CREATE OR REPLACE TRIGGER "trg_listings_updated_at" BEFORE UPDATE ON "public"."listings" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();



CREATE OR REPLACE TRIGGER "trg_recalc_total_listings" AFTER INSERT OR DELETE OR UPDATE ON "public"."listings" FOR EACH ROW EXECUTE FUNCTION "public"."recalc_total_listings"();



CREATE OR REPLACE TRIGGER "trg_set_listing_published_at" BEFORE INSERT OR UPDATE ON "public"."listings" FOR EACH ROW EXECUTE FUNCTION "public"."set_listing_published_at"();



CREATE OR REPLACE TRIGGER "trg_set_listing_slug" BEFORE INSERT ON "public"."listings" FOR EACH ROW EXECUTE FUNCTION "public"."set_listing_slug"();



CREATE OR REPLACE TRIGGER "trg_visits_updated_at" BEFORE UPDATE ON "public"."visits" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();



ALTER TABLE ONLY "public"."leads"
    ADD CONSTRAINT "leads_buyer_id_fkey" FOREIGN KEY ("buyer_id") REFERENCES "public"."profiles"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."leads"
    ADD CONSTRAINT "leads_listing_id_fkey" FOREIGN KEY ("listing_id") REFERENCES "public"."listings"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."listing_images"
    ADD CONSTRAINT "listing_images_listing_id_fkey" FOREIGN KEY ("listing_id") REFERENCES "public"."listings"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."listing_reports"
    ADD CONSTRAINT "listing_reports_listing_id_fkey" FOREIGN KEY ("listing_id") REFERENCES "public"."listings"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."listing_reports"
    ADD CONSTRAINT "listing_reports_reporter_id_fkey" FOREIGN KEY ("reporter_id") REFERENCES "auth"."users"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."listing_reviews"
    ADD CONSTRAINT "listing_reviews_listing_id_fkey" FOREIGN KEY ("listing_id") REFERENCES "public"."listings"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."listing_reviews"
    ADD CONSTRAINT "listing_reviews_reviewer_id_fkey" FOREIGN KEY ("reviewer_id") REFERENCES "auth"."users"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."listings"
    ADD CONSTRAINT "listings_city_id_fkey" FOREIGN KEY ("city_id") REFERENCES "public"."cities"("id");



ALTER TABLE ONLY "public"."listings"
    ADD CONSTRAINT "listings_locality_id_fkey" FOREIGN KEY ("locality_id") REFERENCES "public"."localities"("id");



ALTER TABLE ONLY "public"."listings"
    ADD CONSTRAINT "listings_posted_by_fkey" FOREIGN KEY ("posted_by") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."localities"
    ADD CONSTRAINT "localities_city_id_fkey" FOREIGN KEY ("city_id") REFERENCES "public"."cities"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_id_fkey" FOREIGN KEY ("id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."saved_listings"
    ADD CONSTRAINT "saved_listings_listing_id_fkey" FOREIGN KEY ("listing_id") REFERENCES "public"."listings"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."saved_listings"
    ADD CONSTRAINT "saved_listings_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."saved_searches"
    ADD CONSTRAINT "saved_searches_city_id_fkey" FOREIGN KEY ("city_id") REFERENCES "public"."cities"("id");



ALTER TABLE ONLY "public"."saved_searches"
    ADD CONSTRAINT "saved_searches_locality_id_fkey" FOREIGN KEY ("locality_id") REFERENCES "public"."localities"("id");



ALTER TABLE ONLY "public"."saved_searches"
    ADD CONSTRAINT "saved_searches_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."verification_log"
    ADD CONSTRAINT "verification_log_actor_id_fkey" FOREIGN KEY ("actor_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."verification_log"
    ADD CONSTRAINT "verification_log_listing_id_fkey" FOREIGN KEY ("listing_id") REFERENCES "public"."listings"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."visits"
    ADD CONSTRAINT "visits_confirmed_by_fkey" FOREIGN KEY ("confirmed_by") REFERENCES "public"."profiles"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."visits"
    ADD CONSTRAINT "visits_listing_id_fkey" FOREIGN KEY ("listing_id") REFERENCES "public"."listings"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."visits"
    ADD CONSTRAINT "visits_requested_by_fkey" FOREIGN KEY ("requested_by") REFERENCES "public"."profiles"("id") ON DELETE SET NULL;



CREATE POLICY "Admins can read reports" ON "public"."listing_reports" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."role" = 'admin'::"public"."user_role")))));



CREATE POLICY "Authenticated users can submit reviews" ON "public"."listing_reviews" FOR INSERT WITH CHECK (("auth"."uid"() = "reviewer_id"));



CREATE POLICY "Reviews are publicly readable" ON "public"."listing_reviews" FOR SELECT USING (true);



ALTER TABLE "public"."cities" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "cities_admin_all" ON "public"."cities" USING ("public"."is_admin"()) WITH CHECK ("public"."is_admin"());



CREATE POLICY "cities_select_public" ON "public"."cities" FOR SELECT USING (true);



ALTER TABLE "public"."leads" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "leads_admin_all" ON "public"."leads" USING ("public"."is_admin"()) WITH CHECK ("public"."is_admin"());



CREATE POLICY "leads_insert_public" ON "public"."leads" FOR INSERT WITH CHECK (((("buyer_id" IS NULL) OR ("buyer_id" = "auth"."uid"())) AND ("status" = 'new'::"text")));



CREATE POLICY "leads_select_owner" ON "public"."leads" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."listings"
  WHERE (("listings"."id" = "leads"."listing_id") AND ("listings"."posted_by" = "auth"."uid"())))));



CREATE POLICY "leads_update_owner" ON "public"."leads" FOR UPDATE USING ((EXISTS ( SELECT 1
   FROM "public"."listings"
  WHERE (("listings"."id" = "leads"."listing_id") AND ("listings"."posted_by" = "auth"."uid"())))));



ALTER TABLE "public"."listing_images" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "listing_images_owner_all" ON "public"."listing_images" USING ((EXISTS ( SELECT 1
   FROM "public"."listings"
  WHERE (("listings"."id" = "listing_images"."listing_id") AND ("listings"."posted_by" = "auth"."uid"()))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."listings"
  WHERE (("listings"."id" = "listing_images"."listing_id") AND ("listings"."posted_by" = "auth"."uid"())))));



CREATE POLICY "listing_images_select_public" ON "public"."listing_images" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."listings"
  WHERE (("listings"."id" = "listing_images"."listing_id") AND (("listings"."status" = 'active'::"public"."listing_status") OR ("listings"."posted_by" = "auth"."uid"()) OR "public"."is_admin"())))));



ALTER TABLE "public"."listing_reports" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "listing_reports_insert_public" ON "public"."listing_reports" FOR INSERT WITH CHECK (((("reporter_id" IS NULL) OR ("reporter_id" = "auth"."uid"())) AND ("status" = 'open'::"text")));



ALTER TABLE "public"."listing_reviews" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."listings" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "listings_admin_all" ON "public"."listings" USING ("public"."is_admin"()) WITH CHECK ("public"."is_admin"());



CREATE POLICY "listings_delete_own" ON "public"."listings" FOR DELETE USING (("posted_by" = "auth"."uid"()));



CREATE POLICY "listings_insert_own" ON "public"."listings" FOR INSERT WITH CHECK ((("posted_by" = "auth"."uid"()) AND ((("poster_type" = 'owner'::"public"."poster_type") AND (EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."role" = ANY (ARRAY['owner'::"public"."user_role", 'buyer'::"public"."user_role"])))))) OR (("poster_type" = 'agent'::"public"."poster_type") AND (EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."role" = 'agent'::"public"."user_role"))))))));



CREATE POLICY "listings_select_public" ON "public"."listings" FOR SELECT USING ((("status" = 'active'::"public"."listing_status") OR ("posted_by" = "auth"."uid"()) OR "public"."is_admin"()));



CREATE POLICY "listings_update_own" ON "public"."listings" FOR UPDATE USING (("posted_by" = "auth"."uid"())) WITH CHECK (("posted_by" = "auth"."uid"()));



ALTER TABLE "public"."localities" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "localities_admin_all" ON "public"."localities" USING ("public"."is_admin"()) WITH CHECK ("public"."is_admin"());



CREATE POLICY "localities_select_public" ON "public"."localities" FOR SELECT USING (true);



ALTER TABLE "public"."profiles" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "profiles_admin_all" ON "public"."profiles" USING ("public"."is_admin"()) WITH CHECK ("public"."is_admin"());



CREATE POLICY "profiles_select_public_directory" ON "public"."profiles" FOR SELECT USING (("role" = ANY (ARRAY['agent'::"public"."user_role", 'owner'::"public"."user_role"])));



CREATE POLICY "profiles_select_self_or_admin" ON "public"."profiles" FOR SELECT USING ((("id" = "auth"."uid"()) OR "public"."is_admin"()));



CREATE POLICY "profiles_update_own" ON "public"."profiles" FOR UPDATE USING (("id" = "auth"."uid"())) WITH CHECK ((("id" = "auth"."uid"()) AND ("role" = ( SELECT "p"."role"
   FROM "public"."profiles" "p"
  WHERE ("p"."id" = "auth"."uid"()))) AND ("agent_verified" = ( SELECT "p"."agent_verified"
   FROM "public"."profiles" "p"
  WHERE ("p"."id" = "auth"."uid"())))));



ALTER TABLE "public"."saved_listings" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "saved_listings_owner_all" ON "public"."saved_listings" USING (("auth"."uid"() = "user_id")) WITH CHECK (("auth"."uid"() = "user_id"));



ALTER TABLE "public"."saved_searches" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "users manage their own saved searches" ON "public"."saved_searches" USING (("auth"."uid"() = "user_id")) WITH CHECK (("auth"."uid"() = "user_id"));



ALTER TABLE "public"."verification_log" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "verification_log_admin_all" ON "public"."verification_log" USING ("public"."is_admin"()) WITH CHECK ("public"."is_admin"());



ALTER TABLE "public"."visits" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "visits_admin_all" ON "public"."visits" USING ("public"."is_admin"()) WITH CHECK ("public"."is_admin"());



CREATE POLICY "visits_insert_public" ON "public"."visits" FOR INSERT WITH CHECK (((("requested_by" IS NULL) OR ("requested_by" = "auth"."uid"())) AND ("status" = 'requested'::"public"."visit_status") AND ("confirmed_by" IS NULL)));



CREATE POLICY "visits_select_owner" ON "public"."visits" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."listings"
  WHERE (("listings"."id" = "visits"."listing_id") AND ("listings"."posted_by" = "auth"."uid"())))));



CREATE POLICY "visits_select_requester" ON "public"."visits" FOR SELECT USING (("requested_by" = "auth"."uid"()));



CREATE POLICY "visits_update_owner" ON "public"."visits" FOR UPDATE USING ((EXISTS ( SELECT 1
   FROM "public"."listings"
  WHERE (("listings"."id" = "visits"."listing_id") AND ("listings"."posted_by" = "auth"."uid"())))));



GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";



REVOKE ALL ON FUNCTION "public"."adjust_saved_count"() FROM PUBLIC;



GRANT ALL ON FUNCTION "public"."admin_moderate_listing"("p_listing_id" "uuid", "p_new_status" "public"."listing_status", "p_new_verification" "public"."verification_level", "p_reason" "text") TO "authenticated";



REVOKE ALL ON FUNCTION "public"."bump_lead_count"() FROM PUBLIC;



REVOKE ALL ON FUNCTION "public"."handle_new_user"() FROM PUBLIC;



GRANT ALL ON FUNCTION "public"."increment_listing_views"("listing_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."increment_listing_views"("listing_id" "uuid") TO "authenticated";



REVOKE ALL ON FUNCTION "public"."recalc_total_listings"() FROM PUBLIC;



REVOKE ALL ON FUNCTION "public"."set_listing_published_at"() FROM PUBLIC;



REVOKE ALL ON FUNCTION "public"."set_listing_slug"() FROM PUBLIC;



GRANT REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLE "public"."cities" TO "anon";
GRANT REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLE "public"."cities" TO "authenticated";
GRANT REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLE "public"."cities" TO "service_role";



GRANT REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLE "public"."leads" TO "anon";
GRANT REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLE "public"."leads" TO "authenticated";
GRANT REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLE "public"."leads" TO "service_role";



GRANT REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLE "public"."listing_images" TO "anon";
GRANT REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLE "public"."listing_images" TO "authenticated";
GRANT REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLE "public"."listing_images" TO "service_role";



GRANT REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLE "public"."listing_reports" TO "anon";
GRANT REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLE "public"."listing_reports" TO "authenticated";
GRANT REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLE "public"."listing_reports" TO "service_role";



GRANT REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLE "public"."listing_reviews" TO "anon";
GRANT REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLE "public"."listing_reviews" TO "authenticated";
GRANT REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLE "public"."listing_reviews" TO "service_role";



GRANT REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLE "public"."listings" TO "anon";
GRANT REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLE "public"."listings" TO "authenticated";
GRANT REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLE "public"."listings" TO "service_role";



GRANT REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLE "public"."localities" TO "anon";
GRANT REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLE "public"."localities" TO "authenticated";
GRANT REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLE "public"."localities" TO "service_role";



GRANT SELECT,REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLE "public"."profiles" TO "anon";
GRANT SELECT,REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLE "public"."profiles" TO "authenticated";
GRANT REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLE "public"."profiles" TO "service_role";



GRANT REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLE "public"."saved_listings" TO "anon";
GRANT REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLE "public"."saved_listings" TO "authenticated";
GRANT REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLE "public"."saved_listings" TO "service_role";



GRANT REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLE "public"."saved_searches" TO "anon";
GRANT REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLE "public"."saved_searches" TO "authenticated";
GRANT REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLE "public"."saved_searches" TO "service_role";



GRANT REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLE "public"."verification_log" TO "anon";
GRANT REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLE "public"."verification_log" TO "authenticated";
GRANT REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLE "public"."verification_log" TO "service_role";



GRANT REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLE "public"."visits" TO "anon";
GRANT REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLE "public"."visits" TO "authenticated";
GRANT REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLE "public"."visits" TO "service_role";



ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "postgres";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "postgres";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLES TO "service_role";







