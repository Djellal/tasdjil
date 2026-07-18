CREATE TABLE "application_parameter" (
	"id" integer PRIMARY KEY DEFAULT 1 NOT NULL,
	"current_session_id" integer
);
--> statement-breakpoint
ALTER TABLE "application_parameter" ADD CONSTRAINT "application_parameter_current_session_id_registration_session_id_fk" FOREIGN KEY ("current_session_id") REFERENCES "public"."registration_session"("id") ON DELETE set null ON UPDATE no action;