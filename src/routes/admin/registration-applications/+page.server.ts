import { and, asc, desc, eq, ilike, or } from 'drizzle-orm';
import { requireAdminOrAdminFac } from '$lib/server/auth-guard';
import { db } from '$lib/server/db';
import {
	domaine,
	registrationApplication,
	registrationSession,
	speciality,
	user
} from '$lib/server/db/schema';
import type { PageServerLoad } from './$types';

const statusValues = ['pending', 'processed', 'accepted', 'rejected'] as const;
type StatusValue = (typeof statusValues)[number];

function isValidStatus(value: string): value is StatusValue {
	return statusValues.some((s) => s === value);
}

export const load: PageServerLoad = async ({ locals, url }) => {
	const currentUser = requireAdminOrAdminFac(locals);
	const isAdmin = currentUser.role === 'admin';
	const facultyId = currentUser.facultyId;

	const search = url.searchParams.get('search')?.trim() ?? '';
	const session = url.searchParams.get('session') ?? '';
	const status = url.searchParams.get('status') ?? '';
	const domain = url.searchParams.get('domain') ?? '';

	const pref1 = db
		.$with('pref1')
		.as(db.select({ id: speciality.id, name: speciality.name }).from(speciality));
	const pref2 = db
		.$with('pref2')
		.as(db.select({ id: speciality.id, name: speciality.name }).from(speciality));
	const pref3 = db
		.$with('pref3')
		.as(db.select({ id: speciality.id, name: speciality.name }).from(speciality));

	const conditions = [];

	if (search) {
		conditions.push(or(ilike(user.name, `%${search}%`), ilike(user.email, `%${search}%`)));
	}
	if (session) {
		const sessionId = Number(session);
		if (Number.isSafeInteger(sessionId) && sessionId > 0) {
			conditions.push(eq(registrationApplication.sessionId, sessionId));
		}
	}
	if (domain) {
		const domainId = Number(domain);
		if (Number.isSafeInteger(domainId) && domainId > 0) {
			conditions.push(eq(registrationApplication.domainId, domainId));
		}
	}
	if (status && isValidStatus(status)) {
		if (status === 'pending') {
			conditions.push(eq(registrationApplication.isProcessed, false));
		} else if (status === 'processed') {
			conditions.push(eq(registrationApplication.isProcessed, true));
		} else if (status === 'accepted') {
			conditions.push(eq(registrationApplication.isProcessed, true));
			conditions.push(eq(registrationApplication.isAccepted, true));
		} else if (status === 'rejected') {
			conditions.push(eq(registrationApplication.isProcessed, true));
			conditions.push(eq(registrationApplication.isAccepted, false));
		}
	}

	if (!isAdmin && facultyId) {
		conditions.push(eq(domaine.facultyId, facultyId));
	}

	const whereClause = conditions.length ? and(...conditions) : undefined;

	const applications = await db
		.with(pref1, pref2, pref3)
		.select({
			id: registrationApplication.id,
			studentName: user.name,
			studentEmail: user.email,
			sessionId: registrationApplication.sessionId,
			sessionName: registrationSession.nameSession,
			domainId: registrationApplication.domainId,
			domainName: domaine.name,
			studyLevel: registrationApplication.requestedLevel,
			preference1Name: pref1.name,
			preference2Name: pref2.name,
			preference3Name: pref3.name,
			isAccepted: registrationApplication.isAccepted,
			isProcessed: registrationApplication.isProcessed,
			remark: registrationApplication.remark
		})
		.from(registrationApplication)
		.innerJoin(user, eq(registrationApplication.userId, user.id))
		.innerJoin(registrationSession, eq(registrationApplication.sessionId, registrationSession.id))
		.innerJoin(domaine, eq(registrationApplication.domainId, domaine.id))
		.innerJoin(pref1, eq(registrationApplication.preference1, pref1.id))
		.innerJoin(pref2, eq(registrationApplication.preference2, pref2.id))
		.innerJoin(pref3, eq(registrationApplication.preference3, pref3.id))
		.where(whereClause)
		.orderBy(desc(registrationApplication.id));

	const [sessions, domains] = await Promise.all([
		db
			.select({
				id: registrationSession.id,
				name: registrationSession.nameSession
			})
			.from(registrationSession)
			.orderBy(asc(registrationSession.startRegistrationsDate)),
		isAdmin
			? db.select({ id: domaine.id, name: domaine.name }).from(domaine).orderBy(asc(domaine.name))
			: db
					.select({ id: domaine.id, name: domaine.name })
					.from(domaine)
					.where(eq(domaine.facultyId, facultyId!))
					.orderBy(asc(domaine.name))
	]);

	return {
		applications,
		sessions,
		domains,
		search,
		session,
		status,
		domain
	};
};
