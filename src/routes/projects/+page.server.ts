import { redirect } from "@sveltejs/kit";
import type { PageServerLoad } from "../$types";
import { db } from "$lib/server/db";
import { projects } from "$lib/server/db/schema";
import { eq } from "drizzle-orm";

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
