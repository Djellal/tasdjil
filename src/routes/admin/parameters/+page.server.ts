import { asc, eq } from 'drizzle-orm';
import { fail } from '@sveltejs/kit';
import { requireAdmin } from '$lib/server/auth-guard';
import { db } from '$lib/server/db';
import { applicationParameter, registrationSession } from '$lib/server/db/schema';
import type { Actions, PageServerLoad } from './$types';

const globalParametersId = 1;

function readOptionalId(value: FormDataEntryValue | null) {
	if (!value) return null;
	const id = Number(value);
	return Number.isSafeInteger(id) && id > 0 ? id : undefined;
}

async function sessionExists(id: number) {
	const session = await db
		.select({ id: registrationSession.id })
		.from(registrationSession)
		.where(eq(registrationSession.id, id))
		.limit(1);
	return session.length > 0;
}

export const load: PageServerLoad = async ({ locals }) => {
	requireAdmin(locals);

	const [parameters, sessions] = await Promise.all([
		db
			.select({ currentSessionId: applicationParameter.currentSessionId })
			.from(applicationParameter)
			.where(eq(applicationParameter.id, globalParametersId))
			.limit(1),
		db
			.select({
				id: registrationSession.id,
				nameSession: registrationSession.nameSession,
				startRegistrationsDate: registrationSession.startRegistrationsDate,
				endRegistrationsDate: registrationSession.endRegistrationsDate
			})
			.from(registrationSession)
			.orderBy(asc(registrationSession.startRegistrationsDate))
	]);

	return {
		currentSessionId: parameters[0]?.currentSessionId ?? null,
		sessions
	};
};

export const actions: Actions = {
	default: async ({ locals, request }) => {
		requireAdmin(locals);
		const currentSessionId = readOptionalId((await request.formData()).get('currentSessionId'));

		if (currentSessionId === undefined) {
			return fail(400, { message: 'Invalid session.' });
		}
		if (currentSessionId !== null && !(await sessionExists(currentSessionId))) {
			return fail(400, { message: 'The selected session does not exist.' });
		}

		await db
			.insert(applicationParameter)
			.values({ id: globalParametersId, currentSessionId })
			.onConflictDoUpdate({
				target: applicationParameter.id,
				set: { currentSessionId }
			});

		return { success: true, message: 'Global parameters saved successfully.' };
	}
};
