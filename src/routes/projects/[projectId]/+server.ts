import { error, json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { db } from "$lib/server/db";
import { projects, tasks } from "$lib/server/db/schema";
import { eq } from "drizzle-orm";

export const DELETE: RequestHandler = async ({locals, params}) => {
    const user = locals.user;

    if (!user) {
        return error(400, 'unauthorized');
    }

    const project = await db.select({userId: projects.userId}).from(projects).where(eq(projects.id, params.projectId));

    if (project.length === 0) {
        return error(400, 'project-not-found')
    }

    if (project[0].userId !== user) {
        return error(400, 'unauthorized')
    }

    try {
        await db.delete(tasks).where(eq(tasks.projectId, params.projectId));
        await db.delete(projects).where(eq(projects.id, params.projectId));
    } catch (e) {
        console.log(e)

        return error(400, 'db-error')
    }

    return json({
        success: true
    })

}