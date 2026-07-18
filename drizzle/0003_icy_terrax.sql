CREATE TABLE "registration_session" (
	"id" serial PRIMARY KEY NOT NULL,
	"name_session" text NOT NULL,
	"start_registrations_date" date NOT NULL,
	"end_registrations_date" date NOT NULL,
	"registration_opened" boolean DEFAULT false NOT NULL
);
