import { eq } from 'drizzle-orm';
import { db } from '$lib/server/db';
import { applicationParameter, registrationSession } from '$lib/server/db/schema';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals }) => {
	const parameters = await db
		.select({
			id: registrationSession.id,
			nameSession: registrationSession.nameSession,
			startRegistrationsDate: registrationSession.startRegistrationsDate,
			endRegistrationsDate: registrationSession.endRegistrationsDate,
			registrationOpened: registrationSession.registrationOpened
		})
		.from(applicationParameter)
		.innerJoin(
			registrationSession,
			eq(applicationParameter.currentSessionId, registrationSession.id)
		)
		.where(eq(applicationParameter.id, 1))
		.limit(1);

	return {
		user: locals.user,
		currentSession: parameters[0] ?? null
	};
};
