import { randomUUID } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { and, eq, sql } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { hashPassword } from 'better-auth/crypto';
import { parse } from 'csv-parse/sync';
import { account, user } from './auth.schema';
import { domaine, establissement, faculte, speciality, studyLevel } from './schema';

type StudyLevel = (typeof studyLevel.enumValues)[number];

type WithSeedId<T> = Omit<T, 'id'> & { id: number };
type FacultySeed = WithSeedId<typeof faculte.$inferInsert>;
type EstablishmentSeed = WithSeedId<typeof establissement.$inferInsert>;
type DomainSeed = WithSeedId<typeof domaine.$inferInsert>;
type SpecialitySeed = WithSeedId<typeof speciality.$inferInsert>;

const docsDirectory = fileURLToPath(new URL('../../../../docs/', import.meta.url));

function positiveInteger(value: string, field: string, filename: string) {
	const parsed = Number(value);
	if (!Number.isSafeInteger(parsed) || parsed <= 0) {
		throw new Error(`${filename}: ${field} must be a positive integer, received "${value}".`);
	}
	return parsed;
}

function requiredText(value: string, field: string, filename: string) {
	const trimmed = value.trim();
	if (!trimmed) throw new Error(`${filename}: ${field} cannot be empty.`);
	return trimmed;
}

async function readCsv(filename: string, expectedHeaders: string[]) {
	const content = await readFile(`${docsDirectory}${filename}`, 'utf8');
	return parse(content, {
		bom: true,
		columns(headers: string[]) {
			if (headers.join(',') !== expectedHeaders.join(',')) {
				throw new Error(
					`${filename}: expected headers ${expectedHeaders.join(',')}, received ${headers.join(',')}.`
				);
			}
			return headers;
		},
		skip_empty_lines: true,
		trim: true
	}) as Record<string, string>[];
}

function assertUniqueIds(rows: { id: number }[], filename: string) {
	const ids = new Set<number>();
	for (const row of rows) {
		if (ids.has(row.id)) throw new Error(`${filename}: duplicate id ${row.id}.`);
		ids.add(row.id);
	}
}

async function readReferenceData() {
	const [facultyRows, establishmentRows, domainRows, specialityRows] = await Promise.all([
		readCsv('Facultes.csv', ['Id', 'name']),
		readCsv('Etablissements.csv', ['Id', 'name']),
		readCsv('Domaines.csv', ['Id', 'facultyId', 'NomDomaine', 'Niveau']),
		readCsv('Specialites.csv', ['Id', 'NomSpecialite', 'domaineId'])
	]);

	const faculties: FacultySeed[] = facultyRows.map((row) => {
		const name = requiredText(row.name, 'name', 'Facultes.csv');
		return {
			id: positiveInteger(row.Id, 'Id', 'Facultes.csv'),
			name,
			nameAr: name
		};
	});
	const establishments: EstablishmentSeed[] = establishmentRows.map((row) => {
		const name = requiredText(row.name, 'name', 'Etablissements.csv');
		return {
			id: positiveInteger(row.Id, 'Id', 'Etablissements.csv'),
			name,
			nameAr: name
		};
	});
	const domains: DomainSeed[] = domainRows.map((row) => {
		const name = requiredText(row.NomDomaine, 'NomDomaine', 'Domaines.csv');
		const level = requiredText(row.Niveau, 'Niveau', 'Domaines.csv');
		if (!studyLevel.enumValues.includes(level as StudyLevel)) {
			throw new Error(`Domaines.csv: invalid study level "${level}".`);
		}
		return {
			id: positiveInteger(row.Id, 'Id', 'Domaines.csv'),
			facultyId: positiveInteger(row.facultyId, 'facultyId', 'Domaines.csv'),
			name,
			nameAr: name,
			studyLevel: level as StudyLevel
		};
	});
	const specialities: SpecialitySeed[] = specialityRows.map((row) => {
		const name = requiredText(row.NomSpecialite, 'NomSpecialite', 'Specialites.csv');
		return {
			id: positiveInteger(row.Id, 'Id', 'Specialites.csv'),
			domaineId: positiveInteger(row.domaineId, 'domaineId', 'Specialites.csv'),
			name,
			nameAr: name
		};
	});

	assertUniqueIds(faculties, 'Facultes.csv');
	assertUniqueIds(establishments, 'Etablissements.csv');
	assertUniqueIds(domains, 'Domaines.csv');
	assertUniqueIds(specialities, 'Specialites.csv');

	const facultyIds = new Set(faculties.map(({ id }) => id));
	const domainIds = new Set(domains.map(({ id }) => id));
	for (const domain of domains) {
		if (!facultyIds.has(domain.facultyId)) {
			throw new Error(`Domaines.csv: faculty ${domain.facultyId} does not exist.`);
		}
	}
	for (const savedSpeciality of specialities) {
		if (!domainIds.has(savedSpeciality.domaineId)) {
			throw new Error(`Specialites.csv: domaine ${savedSpeciality.domaineId} does not exist.`);
		}
	}

	return { faculties, establishments, domains, specialities };
}

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

const referenceData = await readReferenceData();

const client = postgres(databaseUrl);
const db = drizzle(client);

try {
	await db.transaction(async (tx) => {
		for (const row of referenceData.faculties) {
			await tx
				.insert(faculte)
				.values(row)
				.onConflictDoUpdate({
					target: faculte.id,
					set: { name: row.name, nameAr: row.nameAr }
				});
		}
		for (const row of referenceData.establishments) {
			await tx
				.insert(establissement)
				.values(row)
				.onConflictDoUpdate({
					target: establissement.id,
					set: { name: row.name, nameAr: row.nameAr }
				});
		}
		for (const row of referenceData.domains) {
			await tx
				.insert(domaine)
				.values(row)
				.onConflictDoUpdate({
					target: domaine.id,
					set: {
						facultyId: row.facultyId,
						studyLevel: row.studyLevel,
						name: row.name,
						nameAr: row.nameAr
					}
				});
		}
		for (const row of referenceData.specialities) {
			await tx
				.insert(speciality)
				.values(row)
				.onConflictDoUpdate({
					target: speciality.id,
					set: { domaineId: row.domaineId, name: row.name, nameAr: row.nameAr }
				});
		}

		await tx.execute(
			sql`SELECT setval(pg_get_serial_sequence('faculte', 'id'), MAX(id), true) FROM ${faculte}`
		);
		await tx.execute(
			sql`SELECT setval(pg_get_serial_sequence('establissement', 'id'), MAX(id), true) FROM ${establissement}`
		);
		await tx.execute(
			sql`SELECT setval(pg_get_serial_sequence('domaine', 'id'), MAX(id), true) FROM ${domaine}`
		);
		await tx.execute(
			sql`SELECT setval(pg_get_serial_sequence('speciality', 'id'), MAX(id), true) FROM ${speciality}`
		);
	});

	console.log(
		`Seeded reference data: ${referenceData.faculties.length} faculties, ` +
			`${referenceData.establishments.length} establishments, ${referenceData.domains.length} domaines, ` +
			`${referenceData.specialities.length} specialities.`
	);

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
