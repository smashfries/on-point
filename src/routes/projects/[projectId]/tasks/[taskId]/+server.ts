import { error, json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { db } from "$lib/server/db";
import { projects, tasks } from "$lib/server/db/schema";
import { eq } from "drizzle-orm";

export const PATCH: RequestHandler = async ({request, locals, params}) => {
    const user = locals.user
    const body = await request.json()

    if (!user) {
        error(400, 'unauthorized')
    }

    const project = await db.select({userId: projects.userId}).from(projects).where(eq(projects.id, params.projectId))

    if (project.length === 0) {
        error(400, 'project-not-found')
    }

    if (project[0].userId !== user) {
        error(400, 'unauthorized')
    }

    type UpdateObject = {
        completed: boolean | undefined,
        completedAt: Date | undefined
    }
    const updateObject: UpdateObject = {
        completed: undefined,
        completedAt: undefined
    };

    if (body?.completed && typeof body.completed === 'boolean') {
        updateObject.completed = body.completed

        if (updateObject.completed) {
            updateObject.completedAt = new Date()
        }
    }

    try {
        await db.update(tasks).set(updateObject).where(eq(tasks.id, params.taskId))
    } catch (e) {
        console.log(e)
        
        error(500, 'db-error')
    }

    return json({
        success: true
    })
}
