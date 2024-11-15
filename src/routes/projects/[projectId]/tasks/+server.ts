import { error, json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { db } from "$lib/server/db";
import { projects, tasks } from "$lib/server/db/schema";
import { eq } from "drizzle-orm";

export const POST: RequestHandler = async ({request, locals, params}) => {
    const user = locals.user
    const body = await request.json()

    if (!user) {
        error(400, 'unauthorized')
    }

    if (!body?.id) {
        error(400, 'id-missing')
    }

    if (!body?.title) {
        error(400, 'title-missing')
    }

    const project = await db.select({userId: projects.userId}).from(projects).where(eq(projects.id, params.projectId))

    if (project.length === 0) {
        error(400, 'project-not-found')
    }

    if (project[0].userId !== user) {
        error(400, 'unauthorized')
    }

    try {
        await db.insert(tasks).values({
            id: body.id,
            title: body.title,
            userId: user,
            projectId: params.projectId,
            completed: false
        })
    } catch (e) {
        console.log(e)
        
        error(500, 'db-error')
    }

    return json({
        success: true
    })
}