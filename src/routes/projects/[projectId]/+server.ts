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

export const PATCH: RequestHandler = async ({ locals, params, request }) => {
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

    const body = await request.json();
    const { name, description } = body;

    if (!name || !description) {
        return error(400, 'missing-required-fields');
    }

    try {
        await db.update(projects)
            .set({ 
                name, 
                description,
                updatedAt: new Date()
            })
            .where(eq(projects.id, params.projectId));
    } catch (e) {
        console.log(e);
        return error(400, 'db-error');
    }

    return json({
        success: true
    });
}