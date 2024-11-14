import { fail, redirect } from "@sveltejs/kit";
import type { Actions, PageServerLoad } from "../$types";
import { db } from "$lib/server/db";
import { projects } from "$lib/server/db/schema";
import { eq } from "drizzle-orm";

export const actions = {
    default: async ({ request, locals }) => {
        const user = locals.user;

        if (!user) {
            return redirect(303, '/login')
        }

        const data = await request.formData();
        const name = data.get('name') as string;
        const description = data.get('description') as string;

        if (!name || name.length === 0) {
            return fail(400, { error: 'name-missing', errorPath: 'name', errorMessage: 'Project name is required' })
        }

        try {
            const project = await db.insert(projects).values({
                name,
                description,
                score: 0,
                userId: user
            }).returning()

            return redirect(303, '/projects')
        } catch (e) {
            console.log(e)
            return fail(500, { error: 'server-error', errorPath: null, errorMessage: 'DB query failed' })
        }
    }
} satisfies Actions

export const load: PageServerLoad = async ({ locals }) => {
    const user = locals.user;

    if (!user) {
        redirect(303, '/login');
    }

    const userProjects = await db.select({
        id: projects.id,
        name: projects.name,
        description: projects.description,
        score: projects.score,
    }).from(projects).where(eq(projects.userId, user))

    return {
        projects: userProjects
    }
}
