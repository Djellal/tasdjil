import { randomUUID } from 'node:crypto';
import { and, eq } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { hashPassword } from 'better-auth/crypto';
import { account, user } from './auth.schema';

const seedUsers = [
	{
		name: 'Djellal',
		email: 'djellal@univ-setif.dz',
		password: 'dhb571982',
		role: 'admin' as const
	}
];

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) throw new Error('DATABASE_URL is not set');

const client = postgres(databaseUrl);
const db = drizzle(client);

try {
	for (const seedUser of seedUsers) {
		await db.transaction(async (tx) => {
			const now = new Date();
			const [savedUser] = await tx
				.insert(user)
				.values({
					id: randomUUID(),
					name: seedUser.name,
					email: seedUser.email,
					emailVerified: true,
					role: seedUser.role,
					createdAt: now,
					updatedAt: now
				})
				.onConflictDoUpdate({
					target: user.email,
					set: {
						name: seedUser.name,
						emailVerified: true,
						role: seedUser.role,
						updatedAt: now
					}
				})
				.returning({ id: user.id });

			const password = await hashPassword(seedUser.password);
			const [credentialAccount] = await tx
				.select({ id: account.id })
				.from(account)
				.where(and(eq(account.userId, savedUser.id), eq(account.providerId, 'credential')))
				.limit(1);

			if (credentialAccount) {
				await tx
					.update(account)
					.set({ password, updatedAt: now })
					.where(eq(account.id, credentialAccount.id));
			} else {
				await tx.insert(account).values({
					id: randomUUID(),
					accountId: savedUser.id,
					providerId: 'credential',
					userId: savedUser.id,
					password,
					createdAt: now,
					updatedAt: now
				});
			}
		});

		console.log(`Seeded ${seedUser.role} user: ${seedUser.email}`);
	}
} finally {
	await client.end();
}
