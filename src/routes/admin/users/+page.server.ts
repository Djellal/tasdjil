import { and, asc, eq, ilike, or } from 'drizzle-orm';
import { fail } from '@sveltejs/kit';
import { requireAdmin } from '$lib/server/auth-guard';
import { auth } from '$lib/server/auth';
import { db } from '$lib/server/db';
import { faculte, user } from '$lib/server/db/schema';
import type { Actions, PageServerLoad } from './$types';

const validRoles = ['admin', 'adminfac', 'student'] as const;
type ValidRole = (typeof validRoles)[number];

function isValidRole(value: string): value is ValidRole {
	return validRoles.some((role) => role === value);
}

function readId(value: FormDataEntryValue | null) {
	const id = Number(value);
	return Number.isSafeInteger(id) && id > 0 ? id : null;
}

function readUser(formData: FormData) {
	const role = formData.get('role')?.toString() ?? '';
	const facultyId = formData.get('facultyId');

	return {
		name: formData.get('name')?.toString().trim() ?? '',
		email: formData.get('email')?.toString().trim() ?? '',
		role: isValidRole(role) ? role : null,
		facultyId: facultyId ? readId(facultyId) : null
	};
}

export const load: PageServerLoad = async ({ locals, url }) => {
	requireAdmin(locals);

	const search = url.searchParams.get('search')?.trim() ?? '';
	const role = url.searchParams.get('role') ?? '';

	const conditions = [];
	if (search) {
		conditions.push(or(ilike(user.name, `%${search}%`), ilike(user.email, `%${search}%`)));
	}
	if (role && isValidRole(role)) {
		conditions.push(eq(user.role, role));
	}

	const users = await db
		.select({
			id: user.id,
			name: user.name,
			email: user.email,
			role: user.role,
			facultyId: user.facultyId,
			createdAt: user.createdAt
		})
		.from(user)
		.where(conditions.length ? and(...conditions) : undefined)
		.orderBy(asc(user.name));

	const faculties = await db.select().from(faculte).orderBy(asc(faculte.name));

	return { users, faculties, search, role };
};

export const actions: Actions = {
	create: async ({ locals, request }) => {
		requireAdmin(locals);
		const formData = await request.formData();
		const values = readUser(formData);
		const password = formData.get('password')?.toString() ?? '';

		if (!values.name || !values.email || !values.role) {
			return fail(400, { message: 'Name, email, and role are required.' });
		}
		if (!password || password.length < 8) {
			return fail(400, { message: 'Password must be at least 8 characters.' });
		}
		if (values.role === 'adminfac' && !values.facultyId) {
			return fail(400, { message: 'Faculty is required for adminfac role.' });
		}

		try {
			const result = await auth.api.signUpEmail({
				body: {
					name: values.name,
					email: values.email,
					password
				}
			});

			if (result.user) {
				const updateData: Record<string, unknown> = { role: values.role };
				if (values.role === 'adminfac') {
					updateData.facultyId = values.facultyId;
				}

				await db.update(user).set(updateData).where(eq(user.id, result.user.id));
			}

			return { success: true, message: 'User created successfully.' };
		} catch {
			return fail(400, { message: 'Failed to create user. Email may already be in use.' });
		}
	},
	update: async ({ locals, request }) => {
		requireAdmin(locals);
		const formData = await request.formData();
		const id = formData.get('id')?.toString();
		const values = readUser(formData);

		if (!id) return fail(400, { message: 'Invalid user.' });
		if (!values.name || !values.email || !values.role) {
			return fail(400, { message: 'Name, email, and role are required.' });
		}
		if (values.role === 'adminfac' && !values.facultyId) {
			return fail(400, { message: 'Faculty is required for adminfac role.' });
		}

		const updateData: Record<string, unknown> = {
			name: values.name,
			email: values.email,
			role: values.role,
			facultyId: values.role === 'adminfac' ? values.facultyId : null
		};

		const updated = await db.update(user).set(updateData).where(eq(user.id, id)).returning({
			id: user.id
		});

		if (!updated.length) return fail(404, { message: 'User not found.' });
		return { success: true, message: 'User updated successfully.' };
	},
	delete: async ({ locals, request }) => {
		requireAdmin(locals);
		const id = (await request.formData()).get('id')?.toString();

		if (!id) return fail(400, { message: 'Invalid user.' });

		const deleted = await db.delete(user).where(eq(user.id, id)).returning({ id: user.id });

		if (!deleted.length) return fail(404, { message: 'User not found.' });
		return { success: true, message: 'User deleted successfully.' };
	}
};
