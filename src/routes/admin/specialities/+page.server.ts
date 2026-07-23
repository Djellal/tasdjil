import { asc, eq } from 'drizzle-orm';
import { error, fail } from '@sveltejs/kit';
import { requireAdminOrAdminFac } from '$lib/server/auth-guard';
import { db } from '$lib/server/db';
import { domaine, faculte, speciality } from '$lib/server/db/schema';
import type { Actions, PageServerLoad } from './$types';

function readId(value: FormDataEntryValue | null) {
	const id = Number(value);
	return Number.isSafeInteger(id) && id > 0 ? id : null;
}

function readSpeciality(formData: FormData) {
	return {
		domaineId: readId(formData.get('domaineId')),
		name: formData.get('name')?.toString().trim() ?? '',
		nameAr: formData.get('nameAr')?.toString().trim() ?? ''
	};
}

async function domaineExists(id: number) {
	const savedDomaine = await db
		.select({ id: domaine.id })
		.from(domaine)
		.where(eq(domaine.id, id))
		.limit(1);
	return savedDomaine.length > 0;
}

async function domaineBelongsToFaculty(domaineId: number, facultyId: number) {
	const record = await db
		.select({ facultyId: domaine.facultyId })
		.from(domaine)
		.where(eq(domaine.id, domaineId))
		.limit(1);
	return record.length > 0 && record[0].facultyId === facultyId;
}

export const load: PageServerLoad = async ({ locals }) => {
	const user = requireAdminOrAdminFac(locals);
	const isAdmin = user.role === 'admin';
	const facultyId = user.facultyId;

	const domainesQuery = isAdmin
		? db
				.select({
					id: domaine.id,
					name: domaine.name,
					studyLevel: domaine.studyLevel,
					facultyName: faculte.name
				})
				.from(domaine)
				.innerJoin(faculte, eq(domaine.facultyId, faculte.id))
		: db
				.select({
					id: domaine.id,
					name: domaine.name,
					studyLevel: domaine.studyLevel,
					facultyName: faculte.name
				})
				.from(domaine)
				.innerJoin(faculte, eq(domaine.facultyId, faculte.id))
				.where(eq(domaine.facultyId, facultyId!));

	const domaines = await domainesQuery.orderBy(asc(domaine.name));

	const domaineIds = domaines.map((d) => d.id);

	const specialities =
		domaineIds.length > 0
			? await db
					.select({
						id: speciality.id,
						domaineId: speciality.domaineId,
						name: speciality.name,
						nameAr: speciality.nameAr,
						domaineName: domaine.name
					})
					.from(speciality)
					.innerJoin(domaine, eq(speciality.domaineId, domaine.id))
					.where(domaineIds.length === 1 ? eq(speciality.domaineId, domaineIds[0]) : undefined)
					.orderBy(asc(speciality.name))
			: [];

	return { domaines, specialities };
};

export const actions: Actions = {
	create: async ({ locals, request }) => {
		const user = requireAdminOrAdminFac(locals);
		const values = readSpeciality(await request.formData());

		if (!values.domaineId || !values.name || !values.nameAr) {
			return fail(400, { message: 'Domaine and both speciality names are required.' });
		}
		if (!(await domaineExists(values.domaineId))) {
			return fail(400, { message: 'The selected domaine does not exist.' });
		}

		if (user.role === 'adminfac') {
			if (!(await domaineBelongsToFaculty(values.domaineId, user.facultyId!))) {
				error(403, 'You can only create specialities for domaines in your own faculty.');
			}
		}

		await db.insert(speciality).values({ ...values, domaineId: values.domaineId });
		return { success: true, message: 'Speciality created successfully.' };
	},
	update: async ({ locals, request }) => {
		const user = requireAdminOrAdminFac(locals);
		const formData = await request.formData();
		const id = readId(formData.get('id'));
		const values = readSpeciality(formData);

		if (!id) return fail(400, { message: 'Invalid speciality.' });
		if (!values.domaineId || !values.name || !values.nameAr) {
			return fail(400, { message: 'Domaine and both speciality names are required.' });
		}
		if (!(await domaineExists(values.domaineId))) {
			return fail(400, { message: 'The selected domaine does not exist.' });
		}

		if (user.role === 'adminfac') {
			if (!(await domaineBelongsToFaculty(values.domaineId, user.facultyId!))) {
				error(403, 'You can only update specialities for domaines in your own faculty.');
			}
		}

		const updated = await db
			.update(speciality)
			.set({ ...values, domaineId: values.domaineId })
			.where(eq(speciality.id, id))
			.returning({ id: speciality.id });

		if (!updated.length) return fail(404, { message: 'Speciality not found.' });
		return { success: true, message: 'Speciality updated successfully.' };
	},
	delete: async ({ locals, request }) => {
		const user = requireAdminOrAdminFac(locals);
		const id = readId((await request.formData()).get('id'));

		if (!id) return fail(400, { message: 'Invalid speciality.' });

		if (user.role === 'adminfac') {
			const specialityRecord = await db
				.select({ domaineId: speciality.domaineId })
				.from(speciality)
				.where(eq(speciality.id, id))
				.limit(1);

			if (!specialityRecord.length) return fail(404, { message: 'Speciality not found.' });
			if (!(await domaineBelongsToFaculty(specialityRecord[0].domaineId, user.facultyId!))) {
				error(403, 'You can only delete specialities from your own faculty.');
			}
		}

		const deleted = await db
			.delete(speciality)
			.where(eq(speciality.id, id))
			.returning({ id: speciality.id });

		if (!deleted.length) return fail(404, { message: 'Speciality not found.' });
		return { success: true, message: 'Speciality deleted successfully.' };
	}
};
