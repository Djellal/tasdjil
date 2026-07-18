import { asc, eq } from 'drizzle-orm';
import { fail } from '@sveltejs/kit';
import { requireAdmin } from '$lib/server/auth-guard';
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

export const load: PageServerLoad = async ({ locals }) => {
	requireAdmin(locals);

	return {
		domaines: await db
			.select({
				id: domaine.id,
				name: domaine.name,
				studyLevel: domaine.studyLevel,
				facultyName: faculte.name
			})
			.from(domaine)
			.innerJoin(faculte, eq(domaine.facultyId, faculte.id))
			.orderBy(asc(domaine.name)),
		specialities: await db
			.select({
				id: speciality.id,
				domaineId: speciality.domaineId,
				name: speciality.name,
				nameAr: speciality.nameAr,
				domaineName: domaine.name
			})
			.from(speciality)
			.innerJoin(domaine, eq(speciality.domaineId, domaine.id))
			.orderBy(asc(speciality.name))
	};
};

export const actions: Actions = {
	create: async ({ locals, request }) => {
		requireAdmin(locals);
		const values = readSpeciality(await request.formData());

		if (!values.domaineId || !values.name || !values.nameAr) {
			return fail(400, { message: 'Domaine and both speciality names are required.' });
		}
		if (!(await domaineExists(values.domaineId))) {
			return fail(400, { message: 'The selected domaine does not exist.' });
		}

		await db.insert(speciality).values({ ...values, domaineId: values.domaineId });
		return { success: true, message: 'Speciality created successfully.' };
	},
	update: async ({ locals, request }) => {
		requireAdmin(locals);
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

		const updated = await db
			.update(speciality)
			.set({ ...values, domaineId: values.domaineId })
			.where(eq(speciality.id, id))
			.returning({ id: speciality.id });

		if (!updated.length) return fail(404, { message: 'Speciality not found.' });
		return { success: true, message: 'Speciality updated successfully.' };
	},
	delete: async ({ locals, request }) => {
		requireAdmin(locals);
		const id = readId((await request.formData()).get('id'));

		if (!id) return fail(400, { message: 'Invalid speciality.' });

		const deleted = await db
			.delete(speciality)
			.where(eq(speciality.id, id))
			.returning({ id: speciality.id });

		if (!deleted.length) return fail(404, { message: 'Speciality not found.' });
		return { success: true, message: 'Speciality deleted successfully.' };
	}
};
