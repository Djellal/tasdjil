import { pgTable, serial, integer, text } from 'drizzle-orm/pg-core';

export const task = pgTable('task', {
	id: serial('id').primaryKey(),
	title: text('title').notNull(),
	priority: integer('priority').notNull().default(1)
});

export const faculte = pgTable('faculte', {
	id: serial('id').primaryKey(),
	name: text('name').notNull(),
	nameAr: text('name_ar').notNull()
});

export * from './auth.schema';
