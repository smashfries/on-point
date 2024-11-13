import { pgTable, serial, text, integer, uuid, timestamp } from 'drizzle-orm/pg-core';

export const user = pgTable('user', {
	id: uuid('id').primaryKey(),
	email: text('email').notNull(),
	name: text('name').notNull(),
	passwordHash: text('password_hash'),
	updatedAt: timestamp('updated_at').defaultNow().notNull(),
	createdAt: timestamp('created_at').defaultNow().notNull(),
});
