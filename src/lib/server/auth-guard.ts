import { error, redirect } from '@sveltejs/kit';
import { localizeHref } from '$lib/paraglide/runtime';

export function requireAdmin(locals: App.Locals) {
	if (!locals.user) redirect(303, localizeHref('/login'));
	if (locals.user.role !== 'admin') error(403, 'This page is restricted to administrators.');

	return locals.user;
}
