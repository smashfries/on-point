import * as jwt from 'jose';
import type { Handle } from "@sveltejs/kit";
import { env } from '$env/dynamic/private';
import * as argon2 from 'argon2';
import { JWTExpired } from 'jose/errors';
import { sessions } from '$lib/server/db/schema';
import { db } from '$lib/server/db';
import { eq } from 'drizzle-orm';

export const handle: Handle = async ({event, resolve}) => {
    const accessToken = event.cookies.get('accessToken');
    event.locals.user = null;

    if (!accessToken) {
        const response = await resolve(event);
        return response;
    }

    const secret = new TextEncoder().encode(env.SECRET)
    try {
        const {payload} = await jwt.jwtVerify(accessToken, secret);

        event.locals.user = payload.userId as string;
        const response = await resolve(event);
        return response;
    } catch (e) {
        if (e instanceof JWTExpired) {
            const payload = jwt.decodeJwt(accessToken);
            const sessionId = payload.sessionId as string;

            const randomValues = new Uint32Array(16);
            crypto.getRandomValues(randomValues)

            const refreshToken = Array.from(randomValues, num => num.toString(32)).join('');
            const refreshTokenHash = await argon2.hash(refreshToken);

            try {
                await db.update(sessions).set({refreshTokenHash}).where(eq(sessions.id, sessionId))
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