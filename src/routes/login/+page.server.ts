import { db } from "$lib/server/db/index.js";
import { users } from "$lib/server/db/schema.js";
import { fail, type Actions } from "@sveltejs/kit";
import { eq } from "drizzle-orm";
import * as argon2 from 'argon2';

export const actions: Actions = {
    default: async ({request}) => {
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

            console.log(userInDb)

            if (userInDb.length < 1) {
                return fail(400, {email, error: 'invalid-credentials', errorPath: null, errorMessage: 'Invalid credentials.'});
            }

            // Currently all users must use password authentication. In the future when other methods are supported
            // this logic must change
            const passwordMatch = await argon2.verify(userInDb[0].passwordHash as string, password);

            if (!passwordMatch) {
                return fail(400, {email, error: 'invalid-credentials', errorPath: null, errorMessage: 'Invalid credentials'});
            }

            return { success: true }
        } catch (e) {
            console.log(e);
            return fail(500, { email, error: 'database-query-failed', errorPath: null, errorMessage: 'Failed to query DB' })
        }

        return {};
    }
}