import { redirect } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";
import { db } from "$lib/server/db";
import { projects, tasks } from "$lib/server/db/schema";
import { and, asc, eq } from "drizzle-orm";

export const load: PageServerLoad = async ({ locals, params, url }) => {
    const projectId = params.projectId
    const user = locals.user;

    if (!user) {
        redirect(303, '/login');
    }

    const showCompleted = url.searchParams.has('showCompleted')

    const project = await db.select({
        name: projects.name,
        description: projects.description,
        score: projects.score,
        userId: projects.userId
    }).from(projects).where(eq(projects.id, projectId));

    if (project.length === 0) {
        redirect(303, '/projects');
    }

    if (project[0].userId !== user) {
        redirect(303, '/projects');
    }

    const projectTasks = await db.select({
        id: tasks.id,
        title: tasks.title,
        completed: tasks.completed,
        order: tasks.order
    }).from(tasks).where(and(eq(tasks.projectId, projectId), eq(tasks.userId, user), eq(tasks.completed, showCompleted ? true : false))).orderBy(asc(tasks.order))

    return {
        project: { ...project[0], id: projectId },
        tasks: projectTasks,
        showCompleted
    }
}
