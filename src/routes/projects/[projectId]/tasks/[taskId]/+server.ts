import { error, json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { db } from "$lib/server/db";
import { tasks, projects } from "$lib/server/db/schema";
import { and, eq, gte, lte, sql } from "drizzle-orm";

export const PATCH: RequestHandler = async ({ request, locals, params }) => {
    const user = locals.user
    const body = await request.json()

    if (!user) {
        error(400, 'unauthorized')
    }

    const task = await db.select({ userId: tasks.userId, projectId: tasks.projectId, completedAt: tasks.completedAt, completed: tasks.completed }).from(tasks).where(eq(tasks.id, params.taskId))

    if (task.length === 0) {
        error(400, 'task-not-found')
    }

    if (task[0].userId !== user) {
        error(400, 'unauthorized')
    }

    type UpdateObject = {
        completed: boolean | undefined,
        completedAt: Date | null | undefined,
        order: number | undefined,
    }
    const updateObject: UpdateObject = {
        completed: undefined,
        completedAt: undefined,
        order: undefined,
    };

    if (body?.completed !== undefined && typeof body.completed === 'boolean') {
        updateObject.completed = body.completed

        if (updateObject.completed) {

            // only update project score, and task completedAt if task was previously 'not' complete
            if (!task[0].completed) {
                const startOfDay = new Date()
                startOfDay.setHours(0, 0, 0, 0)

                const endOfDay = new Date()
                endOfDay.setHours(23, 59, 59, 999)
                const tasksCompletedToday = await db.select({ id: tasks.id }).from(tasks).where(
                    and(
                        eq(tasks.projectId, task[0].projectId as string),
                        and(
                            gte(tasks.completedAt, startOfDay),
                            lte(tasks.completedAt, endOfDay)
                        )
                    )
                )

                if (tasksCompletedToday.length === 0) {
                    await db.update(projects).set({
                        score: sql`${projects.score} + 20`
                    }).where(eq(projects.id, task[0].projectId as string))
                }

                updateObject.completedAt = new Date()
            }
        } else {
            updateObject.completedAt = null;

            if (task[0].completed) {
                const startOfDay = new Date(task[0].completedAt as Date)
                startOfDay?.setHours(0,0,0,0)

                const endOfDay = new Date(task[0].completedAt as Date)
                endOfDay?.setHours(23, 59, 59, 999)

                const tasksCompletedInDay = await db.select().from(tasks).where(
                    and(
                        eq(tasks.projectId, task[0].projectId as string),
                        and(
                            gte(tasks.completedAt, startOfDay),
                            lte(tasks.completedAt, endOfDay)
                        )
                    )
                )

                if (tasksCompletedInDay.length === 1 && tasksCompletedInDay[0].id === params.taskId) {
                    await db.update(projects).set({
                        score: sql`${projects.score} - 20`
                    }).where(eq(projects.id, task[0].projectId as string))
                }
            }
        }
    }

    if (body?.order !== undefined && typeof body.order === 'number' && Number.isInteger(body.order)) {
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

export const DELETE: RequestHandler = async ({ locals, params }) => {
    const user = locals.user

    if (!user) {
        error(400, 'unauthorized')
    }

    const task = await db.select({ userId: tasks.userId }).from(tasks).where(eq(tasks.id, params.taskId))

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