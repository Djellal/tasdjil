import { asc, eq } from 'drizzle-orm';
import { fail } from '@sveltejs/kit';
import { requireAdmin } from '$lib/server/auth-guard';
import { db } from '$lib/server/db';
import { establissement } from '$lib/server/db/schema';
import type { Actions, PageServerLoad } from './$types';

function readEstablishment(formData: FormData) {
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
		establishments: await db.select().from(establissement).orderBy(asc(establissement.name))
	};
};

export const actions: Actions = {
	create: async ({ locals, request }) => {
		requireAdmin(locals);
		const values = readEstablishment(await request.formData());

		if (!values.name || !values.nameAr) {
			return fail(400, { message: 'Both establishment names are required.' });
		}

		await db.insert(establissement).values(values);
		return { success: true, message: 'Establishment created successfully.' };
	},
	update: async ({ locals, request }) => {
		requireAdmin(locals);
		const formData = await request.formData();
		const id = readId(formData);
		const values = readEstablishment(formData);

		if (!id) return fail(400, { message: 'Invalid establishment.' });
		if (!values.name || !values.nameAr) {
			return fail(400, { message: 'Both establishment names are required.' });
		}

		const updated = await db
			.update(establissement)
			.set(values)
			.where(eq(establissement.id, id))
			.returning({ id: establissement.id });

		if (!updated.length) return fail(404, { message: 'Establishment not found.' });
		return { success: true, message: 'Establishment updated successfully.' };
	},
	delete: async ({ locals, request }) => {
		requireAdmin(locals);
		const id = readId(await request.formData());

		if (!id) return fail(400, { message: 'Invalid establishment.' });

		const deleted = await db
			.delete(establissement)
			.where(eq(establissement.id, id))
			.returning({ id: establissement.id });

		if (!deleted.length) return fail(404, { message: 'Establishment not found.' });
		return { success: true, message: 'Establishment deleted successfully.' };
	}
};
