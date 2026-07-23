import { asc, eq } from 'drizzle-orm';
import { error, fail } from '@sveltejs/kit';
import { requireAdmin, requireAdminOrAdminFac } from '$lib/server/auth-guard';
import { db } from '$lib/server/db';
import { domaine, faculte } from '$lib/server/db/schema';
import type { Actions, PageServerLoad } from './$types';

function readFaculty(formData: FormData) {
	return {
		name: formData.get('name')?.toString().trim() ?? '',
		nameAr: formData.get('nameAr')?.toString().trim() ?? ''
	};
}

function readId(formData: FormData) {
	const id = Number(formData.get('id'));
	return Number.isSafeInteger(id) && id > 0 ? id : null;
}

export const load: PageServerLoad = async ({ locals }) => {
	const user = requireAdminOrAdminFac(locals);

	const faculties =
		user.role === 'admin'
			? await db.select().from(faculte).orderBy(asc(faculte.name))
			: await db.select().from(faculte).where(eq(faculte.id, user.facultyId!));

	return { faculties, isAdmin: user.role === 'admin' };
};

export const actions: Actions = {
	create: async ({ locals, request }) => {
		requireAdmin(locals);
		const values = readFaculty(await request.formData());

		if (!values.name || !values.nameAr) {
			return fail(400, { message: 'Both faculty names are required.' });
		}

		await db.insert(faculte).values(values);
		return { success: true, message: 'Faculty created successfully.' };
	},
	update: async ({ locals, request }) => {
		const user = requireAdminOrAdminFac(locals);
		const formData = await request.formData();
		const id = readId(formData);
		const values = readFaculty(formData);

		if (!id) return fail(400, { message: 'Invalid faculty.' });
		if (!values.name || !values.nameAr) {
			return fail(400, { message: 'Both faculty names are required.' });
		}

		if (user.role === 'adminfac' && id !== user.facultyId) {
			error(403, 'You can only edit your own faculty.');
		}

		const updated = await db
			.update(faculte)
			.set(values)
			.where(eq(faculte.id, id))
			.returning({ id: faculte.id });

		if (!updated.length) return fail(404, { message: 'Faculty not found.' });
		return { success: true, message: 'Faculty updated successfully.' };
	},
	delete: async ({ locals, request }) => {
		requireAdmin(locals);
		const id = readId(await request.formData());

		if (!id) return fail(400, { message: 'Invalid faculty.' });

		const dependentDomaine = await db
			.select({ id: domaine.id })
			.from(domaine)
			.where(eq(domaine.facultyId, id))
			.limit(1);
		if (dependentDomaine.length) {
			return fail(409, { message: "Delete this faculty's domaines first." });
		}

		const deleted = await db
			.delete(faculte)
			.where(eq(faculte.id, id))
			.returning({ id: faculte.id });

		if (!deleted.length) return fail(404, { message: 'Faculty not found.' });
		return { success: true, message: 'Faculty deleted successfully.' };
	}
};
