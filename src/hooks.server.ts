import * as jwt from 'jose';
import type { Handle } from "@sveltejs/kit";
import { env } from '$env/dynamic/private';
import * as argon2 from 'argon2';
import { JWTExpired } from 'jose/errors';
import { sessions } from '$lib/server/db/schema';
import { db } from '$lib/server/db';
import { eq } from 'drizzle-orm';

export const handle: Handle = async ({ event, resolve }) => {
    const accessToken = event.cookies.get('accessToken');
    event.locals.user = null;

    if (!accessToken) {
        const response = await resolve(event);
        return response;
    }

    const secret = new TextEncoder().encode(env.SECRET)
    try {
        const { payload } = await jwt.jwtVerify(accessToken, secret);

        event.locals.user = payload.userId as string;
        const response = await resolve(event);
        return response;
    } catch (e) {
        if (e instanceof JWTExpired) {
            const refreshToken = event.cookies.get('refreshToken')

            if (!refreshToken) {
                const response = await resolve(event);
                return response;
            }

            const payload = jwt.decodeJwt(accessToken);
            const sessionId = payload.sessionId as string;

            try {
                const session = await db.select({ id: sessions.id, isActive: sessions.isActive, refreshTokenHash: sessions.refreshTokenHash }).from(sessions).where(eq(sessions.id, sessionId))

                if (session.length < 0) {
                    throw new Error('Session not found')
                }

                if (!session[0].isActive) {
                    throw new Error('Session not active')
                }

                if (!(await argon2.verify(session[0].refreshTokenHash, refreshToken))) {
                    const response = await resolve(event);
                    return response;
                }
            } catch (e) {
                console.log(e)
                const response = await resolve(event);
                return response;
            }

            const randomValues = new Uint32Array(16);
            crypto.getRandomValues(randomValues)

            const newRefreshToken = Array.from(randomValues, num => num.toString(32)).join('');
            const newRefreshTokenHash = await argon2.hash(newRefreshToken);

            try {
                await db.update(sessions).set({ refreshTokenHash: newRefreshTokenHash }).where(eq(sessions.id, sessionId))
            } catch (e) {
                console.log(e)
                const response = await resolve(event);
                return response;
            }

            const secret = new TextEncoder().encode(env.SECRET);
            const newAccessToken = await new jwt.SignJWT({
                userId: payload.userId as string,
                sessionId
            })
                .setProtectedHeader({ alg: 'HS256' })
                .setIssuedAt()
                .setExpirationTime('5 min')
                .sign(secret)

            const cookieOptions = { httpOnly: true, path: '/', sameSite: 'strict' as 'strict', expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) }

            event.cookies.set('accessToken', newAccessToken, cookieOptions)
            event.cookies.set('refreshToken', refreshToken, cookieOptions)

            event.locals.user = payload.userId as string;
            const response = await resolve(event);
            return response;

        } else {
            const response = await resolve(event);
            return response;
        }
    }
}