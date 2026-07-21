import { randomUUID } from 'node:crypto';
import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { and, asc, eq, inArray } from 'drizzle-orm';
import { error, fail, redirect } from '@sveltejs/kit';
import { localizeHref } from '$lib/paraglide/runtime';
import { db } from '$lib/server/db';
import {
	applicationParameter,
	domaine,
	educationalSystem,
	establissement,
	registrationApplication,
	registrationSession,
	speciality,
	studyLevel,
	user
} from '$lib/server/db/schema';
import type { Actions, PageServerLoad } from './$types';

type EducationalSystem = (typeof educationalSystem.enumValues)[number];

const averageCounts: Record<EducationalSystem, number> = {
	DEUA: 3,
	LMD: 3,
	'Classic (4 years)': 4,
	'Classic (5 years)': 5,
	'Medical Sciences': 6
};
const attachmentTypes: Record<string, string> = {
	'application/pdf': 'pdf',
	'image/jpeg': 'jpg',
	'image/png': 'png',
	'image/webp': 'webp'
};
const maxAttachmentSize = 10 * 1024 * 1024;

function requireUser(locals: App.Locals) {
	if (!locals.user) redirect(303, localizeHref('/login'));
	return locals.user;
}

function isAdministrator(role: string | null | undefined) {
	return role === 'admin' || role === 'adminfac';
}

function readPositiveInteger(value: FormDataEntryValue | null) {
	const number = Number(value);
	return Number.isSafeInteger(number) && number > 0 ? number : null;
}

function readNonNegativeInteger(value: FormDataEntryValue | null) {
	const number = Number(value);
	return Number.isSafeInteger(number) && number >= 0 ? number : null;
}

function readAverage(value: FormDataEntryValue | null) {
	const number = Number(value);
	return Number.isFinite(number) && number >= 0 && number <= 20 ? number : null;
}

function enumValue<T extends readonly string[]>(values: T, value: FormDataEntryValue | null) {
	const candidate = value?.toString() ?? '';
	return values.includes(candidate) ? (candidate as T[number]) : null;
}

async function getCurrentSession() {
	const rows = await db
		.select({
			id: registrationSession.id,
			nameSession: registrationSession.nameSession,
			registrationOpened: registrationSession.registrationOpened
		})
		.from(applicationParameter)
		.innerJoin(
			registrationSession,
			eq(applicationParameter.currentSessionId, registrationSession.id)
		)
		.where(eq(applicationParameter.id, 1))
		.limit(1);
	return rows[0] ?? null;
}

async function saveAttachment(file: File) {
	const extension = attachmentTypes[file.type];
	if (!extension || file.size === 0 || file.size > maxAttachmentSize) return null;

	const directory = resolve('uploads/registration-applications');
	const filename = `${randomUUID()}.${extension}`;
	await mkdir(directory, { recursive: true });
	await writeFile(resolve(directory, filename), new Uint8Array(await file.arrayBuffer()));
	return filename;
}

export const load: PageServerLoad = async ({ locals, url }) => {
	const authenticatedUser = requireUser(locals);
	const currentSession = await getCurrentSession();
	const administrator = isAdministrator(authenticatedUser.role);
	const requestedApplicationId = administrator
		? readPositiveInteger(url.searchParams.get('application'))
		: null;

	const [establishments, domains, specialities, applications] = await Promise.all([
		db.select().from(establissement).orderBy(asc(establissement.name)),
		db.select().from(domaine).orderBy(asc(domaine.name)),
		db.select().from(speciality).orderBy(asc(speciality.name)),
		administrator && currentSession
			? db
					.select({
						id: registrationApplication.id,
						studentName: user.name,
						isProcessed: registrationApplication.isProcessed
					})
					.from(registrationApplication)
					.innerJoin(user, eq(registrationApplication.userId, user.id))
					.where(eq(registrationApplication.sessionId, currentSession.id))
					.orderBy(asc(user.name))
			: Promise.resolve([])
	]);

	let application = null;
	if (currentSession) {
		const condition = requestedApplicationId
			? and(
					eq(registrationApplication.id, requestedApplicationId),
					eq(registrationApplication.sessionId, currentSession.id)
				)
			: and(
					eq(registrationApplication.userId, authenticatedUser.id),
					eq(registrationApplication.sessionId, currentSession.id)
				);
		application =
			(await db.select().from(registrationApplication).where(condition).limit(1))[0] ?? null;
	}

	return {
		currentSession,
		application,
		applications,
		establishments,
		domains,
		specialities,
		educationalSystems: educationalSystem.enumValues,
		studyLevels: studyLevel.enumValues,
		isAdministrator: administrator,
		isOwnApplication: !application || application.userId === authenticatedUser.id
	};
};

export const actions: Actions = {
	save: async ({ locals, request }) => {
		const authenticatedUser = requireUser(locals);
		const currentSession = await getCurrentSession();
		if (!currentSession || !currentSession.registrationOpened) {
			return fail(403, { message: 'Registration is currently closed.' });
		}

		const existing = (
			await db
				.select()
				.from(registrationApplication)
				.where(
					and(
						eq(registrationApplication.userId, authenticatedUser.id),
						eq(registrationApplication.sessionId, currentSession.id)
					)
				)
				.limit(1)
		)[0];
		if (existing?.isProcessed) {
			return fail(403, { message: 'A processed application can no longer be changed.' });
		}

		const formData = await request.formData();
		const system = enumValue(educationalSystem.enumValues, formData.get('educationalSystem'));
		const requestedLevel = enumValue(studyLevel.enumValues, formData.get('requestedLevel'));
		const establishmentId = readPositiveInteger(formData.get('establishmentId'));
		const domainId = readPositiveInteger(formData.get('domainId'));
		const preference1 = readPositiveInteger(formData.get('preference1'));
		const preference2 = readPositiveInteger(formData.get('preference2'));
		const preference3 = readPositiveInteger(formData.get('preference3'));
		const graduationYear = readPositiveInteger(formData.get('graduationYear'));
		const baccalaureateYear = readPositiveInteger(formData.get('baccalaureateYear'));
		const admissionsAfterMakeupExamsCount = readNonNegativeInteger(
			formData.get('admissionsAfterMakeupExamsCount')
		);
		const admissionsWithDebtsCount = readNonNegativeInteger(
			formData.get('admissionsWithDebtsCount')
		);
		const repeatedYearsCount = readNonNegativeInteger(formData.get('repeatedYearsCount'));
		const text = (name: string) => formData.get(name)?.toString().trim() ?? '';
		const requiredText = [
			'lastName',
			'firstName',
			'lastNameAr',
			'firstNameAr',
			'dateOfBirth',
			'placeOfBirth',
			'phoneNumber',
			'fieldOfStudy',
			'specialization',
			'baccalaureateNumber'
		];

		if (
			!system ||
			!requestedLevel ||
			!establishmentId ||
			!domainId ||
			!preference1 ||
			!preference2 ||
			!preference3 ||
			!graduationYear ||
			!baccalaureateYear ||
			admissionsAfterMakeupExamsCount === null ||
			admissionsWithDebtsCount === null ||
			repeatedYearsCount === null ||
			requiredText.some((name) => !text(name))
		) {
			return fail(400, { message: 'Complete all required application fields.' });
		}

		const averageCount = averageCounts[system];
		const averages = Array.from({ length: 6 }, (_, index) =>
			index < averageCount ? readAverage(formData.get(`generalAverageYear${index + 1}`)) : null
		);
		if (averages.slice(0, averageCount).some((average) => average === null)) {
			return fail(400, { message: 'Each visible annual average must be between 0 and 20.' });
		}

		const preferenceIds = [preference1, preference2, preference3];
		const [establishment, domain, savedSpecialities] = await Promise.all([
			db
				.select({ id: establissement.id })
				.from(establissement)
				.where(eq(establissement.id, establishmentId))
				.limit(1),
			db
				.select({ id: domaine.id })
				.from(domaine)
				.where(and(eq(domaine.id, domainId), eq(domaine.studyLevel, requestedLevel)))
				.limit(1),
			db
				.select({ id: speciality.id })
				.from(speciality)
				.where(and(eq(speciality.domaineId, domainId), inArray(speciality.id, preferenceIds)))
		]);
		const savedSpecialityIds = new Set(savedSpecialities.map(({ id }) => id));
		if (
			!establishment.length ||
			!domain.length ||
			preferenceIds.some((id) => !savedSpecialityIds.has(id))
		) {
			return fail(400, {
				message: 'Select a valid establishment, requested level, domaine, and specialities.'
			});
		}

		const attachmentEntry = formData.get('attachment');
		let attachment: string | null = existing?.attachment ?? null;
		if (attachmentEntry instanceof File && attachmentEntry.size > 0) {
			attachment = await saveAttachment(attachmentEntry);
			if (!attachment) {
				return fail(400, {
					message: 'The attachment must be a PDF, JPEG, PNG, or WebP file under 10 MB.'
				});
			}
		}
		if (!attachment) return fail(400, { message: 'An attachment is required.' });

		const values = {
			establishmentId,
			lastName: text('lastName'),
			firstName: text('firstName'),
			lastNameAr: text('lastNameAr'),
			firstNameAr: text('firstNameAr'),
			dateOfBirth: text('dateOfBirth'),
			placeOfBirth: text('placeOfBirth'),
			phoneNumber: text('phoneNumber'),
			fieldOfStudy: text('fieldOfStudy'),
			specialization: text('specialization'),
			graduationYear,
			baccalaureateYear,
			baccalaureateNumber: text('baccalaureateNumber'),
			educationalSystem: system,
			generalAverageYear1: averages[0]!,
			generalAverageYear2: averages[1]!,
			generalAverageYear3: averages[2]!,
			generalAverageYear4: averages[3],
			generalAverageYear5: averages[4],
			generalAverageYear6: averages[5],
			admissionsAfterMakeupExamsCount,
			admissionsWithDebtsCount,
			repeatedYearsCount,
			attachment,
			requestedLevel,
			domainId,
			preference1,
			preference2,
			preference3
		};

		if (existing) {
			await db
				.update(registrationApplication)
				.set(values)
				.where(eq(registrationApplication.id, existing.id));
			return { success: true, message: 'Registration application updated successfully.' };
		}

		const inserted = await db
			.insert(registrationApplication)
			.values({ ...values, userId: authenticatedUser.id, sessionId: currentSession.id })
			.onConflictDoNothing({
				target: [registrationApplication.userId, registrationApplication.sessionId]
			})
			.returning({ id: registrationApplication.id });
		if (!inserted.length) {
			return fail(409, { message: 'You already have an application for this session.' });
		}
		return { success: true, message: 'Registration application submitted successfully.' };
	},
	process: async ({ locals, request }) => {
		const authenticatedUser = requireUser(locals);
		if (!isAdministrator(authenticatedUser.role))
			error(403, 'This action is restricted to administrators.');

		const formData = await request.formData();
		const id = readPositiveInteger(formData.get('id'));
		const decision = formData.get('isAccepted')?.toString();
		if (!id || (decision !== 'true' && decision !== 'false')) {
			return fail(400, { message: 'Select an acceptance decision.' });
		}

		const updated = await db
			.update(registrationApplication)
			.set({
				isAccepted: decision === 'true',
				remark: formData.get('remark')?.toString().trim() || null,
				isProcessed: true
			})
			.where(eq(registrationApplication.id, id))
			.returning({ id: registrationApplication.id });
		if (!updated.length) return fail(404, { message: 'Registration application not found.' });
		return {
			success: true,
			message: 'Administrative decision saved and application marked as processed.'
		};
	}
};
