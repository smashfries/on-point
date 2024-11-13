import { db } from "$lib/server/db/index.js";
import { users } from "$lib/server/db/schema.js";
import { fail, redirect } from "@sveltejs/kit";
import { eq } from "drizzle-orm";
import * as argon2 from 'argon2';
import { createSession } from "$lib/server/session";
import type { PageServerLoad, Actions } from "../$types";

export const actions = {
    default: async ({ request, cookies }) => {
        const data = await request.formData();
        const email = data.get('email') as string;
        const password = data.get('password') as string;

        if (!email) {
            return fail(400, { email, error: 'email-missing', errorPath: 'email', errorMessage: 'Email is required' })
        }

        if (!password) {
            return fail(400, { email, error: 'password-missing', errorPath: 'password', errorMessage: 'Password is required' })
        }

        try {
            const userInDb = await db.select().from(users).where(eq(users.email, email)).limit(1)

            if (userInDb.length < 1) {
                return fail(400, { email, error: 'invalid-credentials', errorPath: null, errorMessage: 'Invalid credentials.' });
            }

            // Currently all users must use password authentication. In the future when other methods are supported
            // this logic must change
            const passwordMatch = await argon2.verify(userInDb[0].passwordHash as string, password);

            if (!passwordMatch) {
                return fail(400, { email, error: 'invalid-credentials', errorPath: null, errorMessage: 'Invalid credentials' });
            }

            const userAgent = request.headers.get('User-Agent')
            const ip = request.headers.get('X-Real-IP')

            const { accessToken, refreshToken } = await createSession(userInDb[0].id, ip, userAgent)

            const cookieOptions = { httpOnly: true, path: '/', sameSite: 'strict' as 'strict', expires: new Date(Date.now() + 5 * 60 * 1000) }

            cookies.set('accessToken', accessToken, cookieOptions)
            cookies.set('refreshToken', refreshToken, { ...cookieOptions, expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) })

        } catch (e) {
            console.log(e);
            return fail(500, { email, error: 'database-query-failed', errorPath: null, errorMessage: 'Failed to query DB' })
        }

        redirect(303, '/projects')
    }
} satisfies Actions;

export const load: PageServerLoad = async ({ cookies }) => {
    const accessToken = cookies.get('accessToken');

    if (accessToken) {
        redirect(303, '/projects');
    }
}