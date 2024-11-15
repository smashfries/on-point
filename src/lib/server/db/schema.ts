import { relations } from 'drizzle-orm';
import { pgTable, text, uuid, timestamp, boolean, integer } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
	id: uuid('id').defaultRandom().primaryKey(),
	email: text('email').notNull(),
	name: text('name').notNull(),
	passwordHash: text('password_hash'),
	updatedAt: timestamp('updated_at').defaultNow().notNull(),
	createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const usersRelations = relations(users, ({many}) => ({
	sessions: many(sessions),
	projects: many(projects),
	tasks: many(tasks)
}))

export const sessions = pgTable('sessions', {
	id: uuid('id').defaultRandom().primaryKey(),
	userId: uuid('user_id').notNull().references(() => users.id),
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

export const sessionsRelations = relations(sessions, ({one}) => ({
	users: one(users)
}))

export const projects = pgTable('projects', {
	id: uuid('id').defaultRandom().primaryKey(),
	userId: uuid('user_id').notNull().references(() => users.id),
	name: text('name').notNull(),
	description: text('description').notNull(),
	score: integer('score').notNull(),
	updatedAt: timestamp('updated_at').defaultNow().notNull(),
	createdAt: timestamp('created_at').defaultNow().notNull()
})

export const projectsRelations = relations(projects, ({one, many}) => ({
	users: one(users),
	tasks: many(tasks)
}))

export const tasks = pgTable('tasks', {
	id: uuid('id').defaultRandom().primaryKey(),
	projectId: uuid('project_id').references(() => projects.id),
	userId: uuid('user_id').references(() => users.id).notNull(),
	title: text('title').notNull(),
	completed: boolean('completed').notNull(),
	completedAt: timestamp('completed_at'),
	updatedAt: timestamp('updated_at').notNull().defaultNow(),
	createdAt: timestamp('created_at').notNull().defaultNow()
})

export const tasksRelations = relations(tasks, ({one}) => ({
	users: one(users),
	projects: one(projects)
}))