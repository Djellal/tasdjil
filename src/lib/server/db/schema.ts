import { relations } from 'drizzle-orm';
import {
	boolean,
	date,
	doublePrecision,
	index,
	integer,
	pgEnum,
	pgTable,
	serial,
	text,
	uniqueIndex
} from 'drizzle-orm/pg-core';
import { user } from './auth.schema';

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

export const establissement = pgTable('establissement', {
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

export const educationalSystem = pgEnum('educational_system', [
	'DEUA',
	'LMD',
	'Classic (4 years)',
	'Classic (5 years)',
	'Medical Sciences'
]);

export const registrationApplication = pgTable(
	'registration_application',
	{
		id: serial('id').primaryKey(),
		userId: text('user_id')
			.notNull()
			.references(() => user.id, { onDelete: 'cascade' }),
		sessionId: integer('session_id')
			.notNull()
			.references(() => registrationSession.id),
		establishmentId: integer('establishment_id')
			.notNull()
			.references(() => establissement.id),
		lastName: text('last_name').notNull(),
		firstName: text('first_name').notNull(),
		lastNameAr: text('last_name_ar').notNull(),
		firstNameAr: text('first_name_ar').notNull(),
		dateOfBirth: date('date_of_birth').notNull(),
		placeOfBirth: text('place_of_birth').notNull(),
		phoneNumber: text('phone_number').notNull(),
		fieldOfStudy: text('field_of_study').notNull(),
		specialization: text('specialization').notNull(),
		graduationYear: integer('graduation_year').notNull(),
		baccalaureateYear: integer('baccalaureate_year').notNull(),
		baccalaureateNumber: text('baccalaureate_number').notNull(),
		educationalSystem: educationalSystem('educational_system').notNull(),
		generalAverageYear1: doublePrecision('general_average_year_1').notNull(),
		generalAverageYear2: doublePrecision('general_average_year_2').notNull(),
		generalAverageYear3: doublePrecision('general_average_year_3').notNull(),
		generalAverageYear4: doublePrecision('general_average_year_4'),
		generalAverageYear5: doublePrecision('general_average_year_5'),
		generalAverageYear6: doublePrecision('general_average_year_6'),
		admissionsAfterMakeupExamsCount: integer('admissions_after_makeup_exams_count').notNull(),
		admissionsWithDebtsCount: integer('admissions_with_debts_count').notNull(),
		repeatedYearsCount: integer('repeated_years_count').notNull(),
		attachment: text('attachment').notNull(),
		requestedLevel: studyLevel('requested_level').notNull(),
		domainId: integer('domain_id')
			.notNull()
			.references(() => domaine.id),
		preference1: integer('preference_1')
			.notNull()
			.references(() => speciality.id),
		preference2: integer('preference_2')
			.notNull()
			.references(() => speciality.id),
		preference3: integer('preference_3')
			.notNull()
			.references(() => speciality.id),
		isAccepted: boolean('is_accepted').notNull().default(false),
		remark: text('remark'),
		isProcessed: boolean('is_processed').notNull().default(false)
	},
	(table) => [
		uniqueIndex('registration_application_user_session_unique').on(table.userId, table.sessionId),
		index('registration_application_user_id_idx').on(table.userId),
		index('registration_application_session_id_idx').on(table.sessionId),
		index('registration_application_establishment_id_idx').on(table.establishmentId),
		index('registration_application_domain_id_idx').on(table.domainId)
	]
);

export const faculteRelations = relations(faculte, ({ many }) => ({
	domaines: many(domaine),
	adminUsers: many(user)
}));

export const establissementRelations = relations(establissement, ({ many }) => ({
	registrationApplications: many(registrationApplication)
}));

export const registrationSessionRelations = relations(registrationSession, ({ many }) => ({
	registrationApplications: many(registrationApplication)
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

export const registrationApplicationRelations = relations(registrationApplication, ({ one }) => ({
	user: one(user, {
		fields: [registrationApplication.userId],
		references: [user.id]
	}),
	session: one(registrationSession, {
		fields: [registrationApplication.sessionId],
		references: [registrationSession.id]
	}),
	establishment: one(establissement, {
		fields: [registrationApplication.establishmentId],
		references: [establissement.id]
	}),
	domain: one(domaine, {
		fields: [registrationApplication.domainId],
		references: [domaine.id]
	}),
	preference1: one(speciality, {
		fields: [registrationApplication.preference1],
		references: [speciality.id],
		relationName: 'registrationApplicationPreference1'
	}),
	preference2: one(speciality, {
		fields: [registrationApplication.preference2],
		references: [speciality.id],
		relationName: 'registrationApplicationPreference2'
	}),
	preference3: one(speciality, {
		fields: [registrationApplication.preference3],
		references: [speciality.id],
		relationName: 'registrationApplicationPreference3'
	})
}));

export const userFacultyRelations = relations(user, ({ one }) => ({
	faculty: one(faculte, {
		fields: [user.facultyId],
		references: [faculte.id]
	})
}));

export * from './auth.schema';
