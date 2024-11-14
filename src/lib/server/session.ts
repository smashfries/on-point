import * as argon2 from 'argon2';
import { sessions } from "$lib/server/db/schema.js";
import { db } from "$lib/server/db/index.js";
import * as jwt from 'jose';
import { getSessionInfo } from "$lib";
import { env } from "$env/dynamic/private";

export const createSession = async (userId: string, ip: string | null, userAgent: string | null): Promise<{ accessToken: string, refreshToken: string }> => {
    try {
        const randomValues = new Uint32Array(16);
        crypto.getRandomValues(randomValues)

        const refreshToken = Array.from(randomValues, num => num.toString(32)).join('');
        const refreshTokenHash = await argon2.hash(refreshToken);

        const { browser, os, device, country, region, city } = await getSessionInfo(userAgent, ip)
        const session = await db.insert(sessions).values({
            userId,
            refreshTokenHash,
            ip,
            browser,
            os,
            device,
            city,
            region,
            country
        }).returning()

        const secret = new TextEncoder().encode(env.SECRET);
        const accessToken = await new jwt.SignJWT({
            userId,
            sessionId: session[0].id
        })
            .setProtectedHeader({ alg: 'HS256' })
            .setIssuedAt()
            .setExpirationTime('1 min')
            .sign(secret)

        return { accessToken, refreshToken }

    } catch (e) {
        throw e;
    }
}