import { redirect } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";
import { db } from "$lib/server/db";
import { projects, tasks } from "$lib/server/db/schema";
import { and, eq } from "drizzle-orm";

export const load: PageServerLoad = async ({ locals, params }) => {
    const projectId = params.projectId
    const user = locals.user;

    if (!user) {
        redirect(303, '/login');
    }

    const project = await db.select({
        name: projects.name,
        description: projects.description,
        score: projects.score,
    }).from(projects).where(eq(projects.id, projectId));

    const projectTasks = await db.select({
        id: tasks.id,
        title: tasks.title,
        completed: tasks.completed
    }).from(tasks).where(and(eq(tasks.projectId, projectId), eq(tasks.userId, user), eq(tasks.completed, false)))

    return {
        project: {...project[0], id: projectId},
        tasks: projectTasks
    }
}
