import { pgTable, text, uuid, timestamp, boolean } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
	id: uuid('id').defaultRandom().primaryKey(),
	email: text('email').notNull(),
	name: text('name').notNull(),
	passwordHash: text('password_hash'),
	updatedAt: timestamp('updated_at').defaultNow().notNull(),
	createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const sessions = pgTable('sessions', {
	id: uuid('id').defaultRandom().primaryKey(),
	browser: text('browser'),
	device: text('device'),
	os: text('os'),
	ip: text('ip'),
	city: text('city'),
	region: text('region'),
	country: text('country'),
	refreshTokenHash: text('refresh_token_hash').notNull(),
	isActive: boolean('is_active').default(true).notNull(),
	updatedAt: timestamp('updated_at').defaultNow().notNull(),
	createdAt: timestamp('created_at').defaultNow().notNull()
})