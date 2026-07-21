import { readFile } from 'node:fs/promises';
import { extname, resolve } from 'node:path';
import { eq } from 'drizzle-orm';
import { error } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { registrationApplication } from '$lib/server/db/schema';
import type { RequestHandler } from './$types';

const contentTypes: Record<string, string> = {
	'.pdf': 'application/pdf',
	'.jpg': 'image/jpeg',
	'.png': 'image/png',
	'.webp': 'image/webp'
};

export const GET: RequestHandler = async ({ locals, params }) => {
	if (!locals.user) error(401, 'Authentication required.');

	const id = Number(params.id);
	if (!Number.isSafeInteger(id) || id <= 0) error(404, 'Attachment not found.');

	const application = (
		await db
			.select({
				userId: registrationApplication.userId,
				attachment: registrationApplication.attachment
			})
			.from(registrationApplication)
			.where(eq(registrationApplication.id, id))
			.limit(1)
	)[0];
	if (!application) error(404, 'Attachment not found.');

	const administrator = locals.user.role === 'admin' || locals.user.role === 'adminfac';
	if (application.userId !== locals.user.id && !administrator) error(403, 'Access denied.');
	if (!/^[0-9a-f-]+\.(pdf|jpg|png|webp)$/.test(application.attachment)) {
		error(404, 'Attachment not found.');
	}

	try {
		const file = await readFile(
			resolve('uploads/registration-applications', application.attachment)
		);
		return new Response(file, {
			headers: {
				'content-type': contentTypes[extname(application.attachment)] ?? 'application/octet-stream',
				'content-disposition': `inline; filename="${application.attachment}"`,
				'cache-control': 'private, no-store'
			}
		});
	} catch {
		error(404, 'Attachment not found.');
	}
};
