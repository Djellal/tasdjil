import { relations } from 'drizzle-orm';
import { boolean, date, index, integer, pgEnum, pgTable, serial, text } from 'drizzle-orm/pg-core';

export const task = pgTable('task', {
	id: serial('id').primaryKey(),
	title: text('title').notNull(),
	priority: integer('priority').notNull().default(1)
});

export const faculte = pgTable('faculte', {
	id: serial('id').primaryKey(),
	name: text('name').notNull(),
	nameAr: text('name_ar').notNull()
});

export const studyLevel = pgEnum('study_level', ['Master1', 'Master2', 'Licence']);

export const domaine = pgTable(
	'domaine',
	{
		id: serial('id').primaryKey(),
		facultyId: integer('faculty_id')
			.notNull()
			.references(() => faculte.id),
		studyLevel: studyLevel('study_level').notNull(),
		name: text('name').notNull(),
		nameAr: text('name_ar').notNull()
	},
	(table) => [index('domaine_faculty_id_idx').on(table.facultyId)]
);

export const speciality = pgTable(
	'speciality',
	{
		id: serial('id').primaryKey(),
		domaineId: integer('domaine_id')
			.notNull()
			.references(() => domaine.id),
		name: text('name').notNull(),
		nameAr: text('name_ar').notNull()
	},
	(table) => [index('speciality_domaine_id_idx').on(table.domaineId)]
);

export const registrationSession = pgTable('registration_session', {
	id: serial('id').primaryKey(),
	nameSession: text('name_session').notNull(),
	startRegistrationsDate: date('start_registrations_date').notNull(),
	endRegistrationsDate: date('end_registrations_date').notNull(),
	registrationOpened: boolean('registration_opened').notNull().default(false)
});

export const applicationParameter = pgTable('application_parameter', {
	id: integer('id').primaryKey().default(1),
	currentSessionId: integer('current_session_id').references(() => registrationSession.id, {
		onDelete: 'set null'
	})
});

export const faculteRelations = relations(faculte, ({ many }) => ({
	domaines: many(domaine)
}));

export const domaineRelations = relations(domaine, ({ one, many }) => ({
	faculty: one(faculte, {
		fields: [domaine.facultyId],
		references: [faculte.id]
	}),
	specialities: many(speciality)
}));

export const specialityRelations = relations(speciality, ({ one }) => ({
	domaine: one(domaine, {
		fields: [speciality.domaineId],
		references: [domaine.id]
	})
}));

export * from './auth.schema';
