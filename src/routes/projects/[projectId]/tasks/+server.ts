import { error, json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { db } from "$lib/server/db";
import { projects, tasks } from "$lib/server/db/schema";
import { and, asc, eq } from "drizzle-orm";

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

    if (!body?.order) {
        error(400, 'order-missing')
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
            completed: false,
            order: body.order
        })
    } catch (e) {
        console.log(e)
        
        error(500, 'db-error')
    }

    return json({
        success: true
    })
}

// rebalance all tasks (completed) in project
export const PATCH: RequestHandler = async ({request, locals, params}) => {
    const user = locals.user;

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
    
    const tasksToUpdate = await db.select({id: tasks.id}).from(tasks).where(and(eq(tasks.projectId, params.projectId), eq(tasks.completed, false))).orderBy(asc(tasks.order))

    try {
        await db.transaction(async (tx) => {
            let order = 1000;
            for (const task of tasksToUpdate) {
                await tx.update(tasks).set({order}).where(eq(tasks.id, task.id))

                order += 1000;
            }
        })

        return json({
            success: true
        })
    } catch (e) {
        console.log(e)

        return error(500, 'db-error')
    }
}