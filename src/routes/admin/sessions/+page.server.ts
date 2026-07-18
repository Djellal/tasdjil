import { asc, eq } from 'drizzle-orm';
import { fail } from '@sveltejs/kit';
import { requireAdmin } from '$lib/server/auth-guard';
import { db } from '$lib/server/db';
import { registrationSession } from '$lib/server/db/schema';
import type { Actions, PageServerLoad } from './$types';

const datePattern = /^\d{4}-\d{2}-\d{2}$/;

function readId(value: FormDataEntryValue | null) {
	const id = Number(value);
	return Number.isSafeInteger(id) && id > 0 ? id : null;
}

function isValidDate(value: string) {
	if (!datePattern.test(value)) return false;
	const date = new Date(`${value}T00:00:00Z`);
	return !Number.isNaN(date.valueOf()) && date.toISOString().slice(0, 10) === value;
}

function readSession(formData: FormData) {
	const registrationOpened = formData.get('registrationOpened')?.toString();

	return {
		nameSession: formData.get('nameSession')?.toString().trim() ?? '',
		startRegistrationsDate: formData.get('startRegistrationsDate')?.toString() ?? '',
		endRegistrationsDate: formData.get('endRegistrationsDate')?.toString() ?? '',
		registrationOpened: registrationOpened === 'true' || registrationOpened === 'on'
	};
}

function validateSession(values: ReturnType<typeof readSession>) {
	if (!values.nameSession || !isValidDate(values.startRegistrationsDate)) {
		return 'A name and valid registration start date are required.';
	}
	if (!isValidDate(values.endRegistrationsDate)) {
		return 'A valid registration end date is required.';
	}
	if (values.endRegistrationsDate < values.startRegistrationsDate) {
		return 'The registration end date must be on or after the start date.';
	}
	return null;
}

export const load: PageServerLoad = async ({ locals }) => {
	requireAdmin(locals);

	return {
		sessions: await db
			.select()
			.from(registrationSession)
			.orderBy(asc(registrationSession.startRegistrationsDate))
	};
};

export const actions: Actions = {
	create: async ({ locals, request }) => {
		requireAdmin(locals);
		const values = readSession(await request.formData());
		const message = validateSession(values);

		if (message) return fail(400, { message });

		await db.insert(registrationSession).values(values);
		return { success: true, message: 'Session created successfully.' };
	},
	update: async ({ locals, request }) => {
		requireAdmin(locals);
		const formData = await request.formData();
		const id = readId(formData.get('id'));
		const values = readSession(formData);
		const message = validateSession(values);

		if (!id) return fail(400, { message: 'Invalid session.' });
		if (message) return fail(400, { message });

		const updated = await db
			.update(registrationSession)
			.set(values)
			.where(eq(registrationSession.id, id))
			.returning({ id: registrationSession.id });

		if (!updated.length) return fail(404, { message: 'Session not found.' });
		return { success: true, message: 'Session updated successfully.' };
	},
	delete: async ({ locals, request }) => {
		requireAdmin(locals);
		const id = readId((await request.formData()).get('id'));

		if (!id) return fail(400, { message: 'Invalid session.' });

		const deleted = await db
			.delete(registrationSession)
			.where(eq(registrationSession.id, id))
			.returning({ id: registrationSession.id });

		if (!deleted.length) return fail(404, { message: 'Session not found.' });
		return { success: true, message: 'Session deleted successfully.' };
	}
};
