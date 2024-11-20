import { error, json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { db } from "$lib/server/db";
import { tasks } from "$lib/server/db/schema";
import { eq } from "drizzle-orm";

export const PATCH: RequestHandler = async ({request, locals, params}) => {
    const user = locals.user
    const body = await request.json()

    if (!user) {
        error(400, 'unauthorized')
    }

    const task = await db.select({userId: tasks.userId}).from(tasks).where(eq(tasks.id, params.taskId))

    if (task.length === 0) {
        error(400, 'project-not-found')
    }

    if (task[0].userId !== user) {
        error(400, 'unauthorized')
    }

    type UpdateObject = {
        completed: boolean | undefined,
        completedAt: Date | undefined,
        order: number | undefined
    }
    const updateObject: UpdateObject = {
        completed: undefined,
        completedAt: undefined,
        order: undefined
    };

    if (body?.completed && typeof body.completed === 'boolean') {
        updateObject.completed = body.completed

        if (updateObject.completed) {
            updateObject.completedAt = new Date()
        }
    }

    if (body?.order && typeof body.order === 'number' && Number.isInteger(body.order)) {
        updateObject.order = body.order
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

export const DELETE: RequestHandler = async ({locals, params}) => {
    const user = locals.user

    if (!user) {
        error(400, 'unauthorized')
    }

    const task = await db.select({userId: tasks.userId}).from(tasks).where(eq(tasks.id, params.taskId))

    if (task.length === 0) {
        error(400, 'project-not-found')
    }

    if (task[0].userId !== user) {
        error(400, 'unauthorized')
    }

    try {
        await db.delete(tasks).where(eq(tasks.id, params.taskId))
    } catch (e) {
        console.log(e)

        error(500, 'db-error');
    }

    return json({
        success: true
    })

}