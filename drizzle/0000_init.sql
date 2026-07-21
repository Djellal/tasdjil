CREATE TYPE "public"."educational_system" AS ENUM('DEUA', 'LMD', 'Classic (4 years)', 'Classic (5 years)', 'Medical Sciences');--> statement-breakpoint
CREATE TYPE "public"."study_level" AS ENUM('Master1', 'Master2', 'Licence');--> statement-breakpoint
CREATE TABLE "application_parameter" (
	"id" integer PRIMARY KEY DEFAULT 1 NOT NULL,
	"current_session_id" integer
);
--> statement-breakpoint
CREATE TABLE "domaine" (
	"id" serial PRIMARY KEY NOT NULL,
	"faculty_id" integer NOT NULL,
	"study_level" "study_level" NOT NULL,
	"name" text NOT NULL,
	"name_ar" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "establissement" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"name_ar" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "faculte" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"name_ar" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "registration_application" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"session_id" integer NOT NULL,
	"establishment_id" integer NOT NULL,
	"last_name" text NOT NULL,
	"first_name" text NOT NULL,
	"last_name_ar" text NOT NULL,
	"first_name_ar" text NOT NULL,
	"date_of_birth" date NOT NULL,
	"place_of_birth" text NOT NULL,
	"phone_number" text NOT NULL,
	"field_of_study" text NOT NULL,
	"specialization" text NOT NULL,
	"graduation_year" integer NOT NULL,
	"baccalaureate_year" integer NOT NULL,
	"baccalaureate_number" text NOT NULL,
	"educational_system" "educational_system" NOT NULL,
	"general_average_year_1" double precision NOT NULL,
	"general_average_year_2" double precision NOT NULL,
	"general_average_year_3" double precision NOT NULL,
	"general_average_year_4" double precision,
	"general_average_year_5" double precision,
	"general_average_year_6" double precision,
	"admissions_after_makeup_exams_count" integer NOT NULL,
	"admissions_with_debts_count" integer NOT NULL,
	"repeated_years_count" integer NOT NULL,
	"attachment" text NOT NULL,
	"requested_level" "study_level" NOT NULL,
	"domain_id" integer NOT NULL,
	"preference_1" integer NOT NULL,
	"preference_2" integer NOT NULL,
	"preference_3" integer NOT NULL,
	"is_accepted" boolean DEFAULT false NOT NULL,
	"remark" text,
	"is_processed" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE "registration_session" (
	"id" serial PRIMARY KEY NOT NULL,
	"name_session" text NOT NULL,
	"start_registrations_date" date NOT NULL,
	"end_registrations_date" date NOT NULL,
	"registration_opened" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE "speciality" (
	"id" serial PRIMARY KEY NOT NULL,
	"domaine_id" integer NOT NULL,
	"name" text NOT NULL,
	"name_ar" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "task" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"priority" integer DEFAULT 1 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "account" (
	"id" text PRIMARY KEY NOT NULL,
	"account_id" text NOT NULL,
	"provider_id" text NOT NULL,
	"user_id" text NOT NULL,
	"access_token" text,
	"refresh_token" text,
	"id_token" text,
	"access_token_expires_at" timestamp,
	"refresh_token_expires_at" timestamp,
	"scope" text,
	"password" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "session" (
	"id" text PRIMARY KEY NOT NULL,
	"expires_at" timestamp NOT NULL,
	"token" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"user_id" text NOT NULL,
	CONSTRAINT "session_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "user" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"email_verified" boolean DEFAULT false NOT NULL,
	"image" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"role" text DEFAULT 'student',
	CONSTRAINT "user_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "verification" (
	"id" text PRIMARY KEY NOT NULL,
	"identifier" text NOT NULL,
	"value" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "application_parameter" ADD CONSTRAINT "application_parameter_current_session_id_registration_session_id_fk" FOREIGN KEY ("current_session_id") REFERENCES "public"."registration_session"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "domaine" ADD CONSTRAINT "domaine_faculty_id_faculte_id_fk" FOREIGN KEY ("faculty_id") REFERENCES "public"."faculte"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "registration_application" ADD CONSTRAINT "registration_application_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "registration_application" ADD CONSTRAINT "registration_application_session_id_registration_session_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."registration_session"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "registration_application" ADD CONSTRAINT "registration_application_establishment_id_establissement_id_fk" FOREIGN KEY ("establishment_id") REFERENCES "public"."establissement"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "registration_application" ADD CONSTRAINT "registration_application_domain_id_domaine_id_fk" FOREIGN KEY ("domain_id") REFERENCES "public"."domaine"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "registration_application" ADD CONSTRAINT "registration_application_preference_1_speciality_id_fk" FOREIGN KEY ("preference_1") REFERENCES "public"."speciality"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "registration_application" ADD CONSTRAINT "registration_application_preference_2_speciality_id_fk" FOREIGN KEY ("preference_2") REFERENCES "public"."speciality"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "registration_application" ADD CONSTRAINT "registration_application_preference_3_speciality_id_fk" FOREIGN KEY ("preference_3") REFERENCES "public"."speciality"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "speciality" ADD CONSTRAINT "speciality_domaine_id_domaine_id_fk" FOREIGN KEY ("domaine_id") REFERENCES "public"."domaine"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "account" ADD CONSTRAINT "account_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session" ADD CONSTRAINT "session_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "domaine_faculty_id_idx" ON "domaine" USING btree ("faculty_id");--> statement-breakpoint
CREATE UNIQUE INDEX "registration_application_user_session_unique" ON "registration_application" USING btree ("user_id","session_id");--> statement-breakpoint
CREATE INDEX "registration_application_user_id_idx" ON "registration_application" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "registration_application_session_id_idx" ON "registration_application" USING btree ("session_id");--> statement-breakpoint
CREATE INDEX "registration_application_establishment_id_idx" ON "registration_application" USING btree ("establishment_id");--> statement-breakpoint
CREATE INDEX "registration_application_domain_id_idx" ON "registration_application" USING btree ("domain_id");--> statement-breakpoint
CREATE INDEX "speciality_domaine_id_idx" ON "speciality" USING btree ("domaine_id");--> statement-breakpoint
CREATE INDEX "account_userId_idx" ON "account" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "session_userId_idx" ON "session" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "verification_identifier_idx" ON "verification" USING btree ("identifier");