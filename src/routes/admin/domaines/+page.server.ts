import { asc, eq } from 'drizzle-orm';
import { error, fail } from '@sveltejs/kit';
import { requireAdminOrAdminFac } from '$lib/server/auth-guard';
import { db } from '$lib/server/db';
import { domaine, faculte, speciality, studyLevel } from '$lib/server/db/schema';
import type { Actions, PageServerLoad } from './$types';

type StudyLevel = (typeof studyLevel.enumValues)[number];

function readId(value: FormDataEntryValue | null) {
	const id = Number(value);
	return Number.isSafeInteger(id) && id > 0 ? id : null;
}

function isStudyLevel(value: string): value is StudyLevel {
	return studyLevel.enumValues.some((level) => level === value);
}

function readDomaine(formData: FormData) {
	const level = formData.get('studyLevel')?.toString() ?? '';

	return {
		facultyId: readId(formData.get('facultyId')),
		studyLevel: isStudyLevel(level) ? level : null,
		name: formData.get('name')?.toString().trim() ?? '',
		nameAr: formData.get('nameAr')?.toString().trim() ?? ''
	};
}

async function facultyExists(id: number) {
	const faculty = await db
		.select({ id: faculte.id })
		.from(faculte)
		.where(eq(faculte.id, id))
		.limit(1);
	return faculty.length > 0;
}

export const load: PageServerLoad = async ({ locals }) => {
	const user = requireAdminOrAdminFac(locals);
	const isAdmin = user.role === 'admin';
	const facultyId = user.facultyId;

	const faculties = isAdmin
		? await db.select().from(faculte).orderBy(asc(faculte.name))
		: await db.select().from(faculte).where(eq(faculte.id, facultyId!));

	const domainesQuery = isAdmin
		? db
				.select({
					id: domaine.id,
					facultyId: domaine.facultyId,
					studyLevel: domaine.studyLevel,
					name: domaine.name,
					nameAr: domaine.nameAr,
					facultyName: faculte.name
				})
				.from(domaine)
				.innerJoin(faculte, eq(domaine.facultyId, faculte.id))
		: db
				.select({
					id: domaine.id,
					facultyId: domaine.facultyId,
					studyLevel: domaine.studyLevel,
					name: domaine.name,
					nameAr: domaine.nameAr,
					facultyName: faculte.name
				})
				.from(domaine)
				.innerJoin(faculte, eq(domaine.facultyId, faculte.id))
				.where(eq(domaine.facultyId, facultyId!));

	return {
		studyLevels: studyLevel.enumValues,
		faculties,
		domaines: await domainesQuery.orderBy(asc(domaine.name))
	};
};

export const actions: Actions = {
	create: async ({ locals, request }) => {
		const user = requireAdminOrAdminFac(locals);
		const values = readDomaine(await request.formData());

		if (!values.facultyId || !values.studyLevel || !values.name || !values.nameAr) {
			return fail(400, { message: 'Faculty, study level, and both names are required.' });
		}
		if (!(await facultyExists(values.facultyId))) {
			return fail(400, { message: 'The selected faculty does not exist.' });
		}

		if (user.role === 'adminfac' && values.facultyId !== user.facultyId) {
			error(403, 'You can only create domaines for your own faculty.');
		}

		await db.insert(domaine).values({
			facultyId: values.facultyId,
			studyLevel: values.studyLevel,
			name: values.name,
			nameAr: values.nameAr
		});
		return { success: true, message: 'Domaine created successfully.' };
	},
	update: async ({ locals, request }) => {
		const user = requireAdminOrAdminFac(locals);
		const formData = await request.formData();
		const id = readId(formData.get('id'));
		const values = readDomaine(formData);

		if (!id) return fail(400, { message: 'Invalid domaine.' });
		if (!values.facultyId || !values.studyLevel || !values.name || !values.nameAr) {
			return fail(400, { message: 'Faculty, study level, and both names are required.' });
		}
		if (!(await facultyExists(values.facultyId))) {
			return fail(400, { message: 'The selected faculty does not exist.' });
		}

		if (user.role === 'adminfac' && values.facultyId !== user.facultyId) {
			error(403, 'You can only update domaines for your own faculty.');
		}

		const updated = await db
			.update(domaine)
			.set({
				facultyId: values.facultyId,
				studyLevel: values.studyLevel,
				name: values.name,
				nameAr: values.nameAr
			})
			.where(eq(domaine.id, id))
			.returning({ id: domaine.id });

		if (!updated.length) return fail(404, { message: 'Domaine not found.' });
		return { success: true, message: 'Domaine updated successfully.' };
	},
	delete: async ({ locals, request }) => {
		const user = requireAdminOrAdminFac(locals);
		const id = readId((await request.formData()).get('id'));

		if (!id) return fail(400, { message: 'Invalid domaine.' });

		if (user.role === 'adminfac') {
			const domaineRecord = await db
				.select({ facultyId: domaine.facultyId })
				.from(domaine)
				.where(eq(domaine.id, id))
				.limit(1);

			if (!domaineRecord.length) return fail(404, { message: 'Domaine not found.' });
			if (domaineRecord[0].facultyId !== user.facultyId) {
				error(403, 'You can only delete domaines from your own faculty.');
			}
		}

		const dependentSpeciality = await db
			.select({ id: speciality.id })
			.from(speciality)
			.where(eq(speciality.domaineId, id))
			.limit(1);
		if (dependentSpeciality.length) {
			return fail(409, { message: "Delete this domaine's specialities first." });
		}

		const deleted = await db
			.delete(domaine)
			.where(eq(domaine.id, id))
			.returning({ id: domaine.id });

		if (!deleted.length) return fail(404, { message: 'Domaine not found.' });
		return { success: true, message: 'Domaine deleted successfully.' };
	}
};
