CREATE TYPE "public"."study_level" AS ENUM('Master1', 'Master2', 'Licence');--> statement-breakpoint
CREATE TABLE "domaine" (
	"id" serial PRIMARY KEY NOT NULL,
	"faculty_id" integer NOT NULL,
	"study_level" "study_level" NOT NULL,
	"name" text NOT NULL,
	"name_ar" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "speciality" (
	"id" serial PRIMARY KEY NOT NULL,
	"domaine_id" integer NOT NULL,
	"name" text NOT NULL,
	"name_ar" text NOT NULL
);
--> statement-breakpoint
ALTER TABLE "domaine" ADD CONSTRAINT "domaine_faculty_id_faculte_id_fk" FOREIGN KEY ("faculty_id") REFERENCES "public"."faculte"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "speciality" ADD CONSTRAINT "speciality_domaine_id_domaine_id_fk" FOREIGN KEY ("domaine_id") REFERENCES "public"."domaine"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "domaine_faculty_id_idx" ON "domaine" USING btree ("faculty_id");--> statement-breakpoint
CREATE INDEX "speciality_domaine_id_idx" ON "speciality" USING btree ("domaine_id");