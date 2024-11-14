import * as jwt from 'jose';
import { redirect } from '@sveltejs/kit';
import type { Actions } from './$types';
import { env } from '$env/dynamic/private';
import { db } from '$lib/server/db';
import { sessions } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';

export const actions = {
    default: async ({ cookies }) => {
        const accessToken = cookies.get('accessToken')

        if (accessToken) {
            const secret = new TextEncoder().encode(env.SECRET)
            try {
                const { payload } = await jwt.jwtVerify(accessToken, secret)
                if (payload) {
                    await db.update(sessions).set({ isActive: false }).where(eq(sessions.id, payload.sessionId as string))
                }
            } catch (e) {
                console.log(e)
            }
        }

        cookies.delete('accessToken', { path: '/' })
        cookies.delete('refreshToken', { path: '/' })

        redirect(303, '/login')
    }
} satisfies Actions
