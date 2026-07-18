import { APIError } from 'better-auth/api';
import { fail, redirect } from '@sveltejs/kit';
import { localizeHref } from '$lib/paraglide/runtime';
import { auth } from '$lib/server/auth';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = ({ locals }) => {
	if (locals.user) redirect(303, localizeHref('/'));
};

export const actions: Actions = {
	default: async ({ request }) => {
		const formData = await request.formData();
		const name = formData.get('name')?.toString().trim() ?? '';
		const email = formData.get('email')?.toString().trim() ?? '';
		const password = formData.get('password')?.toString() ?? '';
		const confirmPassword = formData.get('confirmPassword')?.toString() ?? '';
		const values = { name, email };

		if (!name || !email || !password) {
			return fail(400, { ...values, message: 'All fields are required.' });
		}

		if (password.length < 8) {
			return fail(400, { ...values, message: 'Password must be at least 8 characters.' });
		}

		if (password !== confirmPassword) {
			return fail(400, { ...values, message: 'Passwords do not match.' });
		}

		try {
			await auth.api.signUpEmail({ body: { name, email, password } });
		} catch (error) {
			if (error instanceof APIError) {
				return fail(400, { ...values, message: error.message || 'Unable to create account.' });
			}

			return fail(500, {
				...values,
				message: 'An unexpected error occurred. Please try again.'
			});
		}

		redirect(303, localizeHref('/'));
	}
};
