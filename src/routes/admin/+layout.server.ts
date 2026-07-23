import { requireAdminOrAdminFac } from '$lib/server/auth-guard';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = ({ locals }) => {
	requireAdminOrAdminFac(locals);
};
