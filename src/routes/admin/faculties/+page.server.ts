import { asc, eq } from 'drizzle-orm';
import { fail } from '@sveltejs/kit';
import { requireAdmin } from '$lib/server/auth-guard';
import { db } from '$lib/server/db';
import { faculte } from '$lib/server/db/schema';
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
	requireAdmin(locals);

	return {
		faculties: await db.select().from(faculte).orderBy(asc(faculte.name))
	};
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
		requireAdmin(locals);
		const formData = await request.formData();
		const id = readId(formData);
		const values = readFaculty(formData);

		if (!id) return fail(400, { message: 'Invalid faculty.' });
		if (!values.name || !values.nameAr) {
			return fail(400, { message: 'Both faculty names are required.' });
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

		const deleted = await db
			.delete(faculte)
			.where(eq(faculte.id, id))
			.returning({ id: faculte.id });

		if (!deleted.length) return fail(404, { message: 'Faculty not found.' });
		return { success: true, message: 'Faculty deleted successfully.' };
	}
};
