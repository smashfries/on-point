import { db } from "$lib/server/db/index.js";
import { users } from "$lib/server/db/schema.js";
import { fail, redirect } from "@sveltejs/kit";
import { eq } from "drizzle-orm";
import * as argon2 from 'argon2';
import { createSession } from "$lib/server/session";
import type { PageServerLoad, Actions } from "../$types";

export const actions: Actions = {
    default: async ({ request, cookies }) => {
        const data = await request.formData();
        const name = data.get('name') as string;
        const email = data.get('email') as string;
        const password = data.get('password') as string;

        if (!name) {
            return fail(400, { name, email, error: 'name-missing', errorPath: 'name', errorMessage: 'Name is required.' })
        }

        if (!email) {
            return fail(400, { name, email, error: 'email-missing', errorPath: 'email', errorMessage: 'Email is required' })
        }

        if (!password) {
            return fail(400, { name, email, error: 'password-missing', errorPath: 'password', errorMessage: 'Password is required' })
        }

        try {
            const userInDb = await db.select().from(users).where(eq(users.email, email)).limit(1)

            if (userInDb.length > 0) {
                return fail(400, { name, email, error: 'account-exists', errorPath: null, errorMessage: 'An account with this email already exists' });
            }

            const passwordHash = await argon2.hash(password);

            const newUser = await db.insert(users).values({
                email,
                name,
                passwordHash,
            }).returning()

            const userAgent = request.headers.get('User-Agent')
            const ip = request.headers.get('X-Real-IP')

            const { accessToken, refreshToken } = await createSession(newUser[0].id, ip, userAgent);

            const cookieOptions = { httpOnly: true, path: '/', sameSite: 'strict' as 'strict', expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) }

            cookies.set('accessToken', accessToken, cookieOptions)
            cookies.set('refreshToken', refreshToken, cookieOptions)

        } catch (e) {
            console.log(e);
            return fail(500, { name, email, error: 'database-query-failed', errorPath: null, errorMessage: 'Failed to query DB' })
        }

        redirect(303, '/projects')
    }
} satisfies Actions;

export const load: PageServerLoad = async ({ locals }) => {
    const user = locals.user;

    if (user) {
        redirect(303, '/projects');
    }
}