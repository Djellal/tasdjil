import { error, redirect } from '@sveltejs/kit';
import { localizeHref } from '$lib/paraglide/runtime';

export function requireAdmin(locals: App.Locals) {
	if (!locals.user) redirect(303, localizeHref('/login'));
	if (locals.user.role !== 'admin') error(403, 'This page is restricted to administrators.');

	return locals.user;
}

export function requireAdminFac(locals: App.Locals) {
	if (!locals.user) redirect(303, localizeHref('/login'));
	if (locals.user.role !== 'adminfac')
		error(403, 'This page is restricted to faculty administrators.');
	if (!locals.user.facultyId) error(403, 'No faculty assigned to this account.');

	return locals.user;
}

export function requireAdminOrAdminFac(locals: App.Locals) {
	if (!locals.user) redirect(303, localizeHref('/login'));
	if (locals.user.role !== 'admin' && locals.user.role !== 'adminfac') {
		error(403, 'This page is restricted to administrators.');
	}

	return locals.user;
}
