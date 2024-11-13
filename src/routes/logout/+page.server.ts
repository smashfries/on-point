import { redirect } from '@sveltejs/kit';
import type { Actions } from './$types';

export const actions = {
    default: async ({ cookies }) => {
        cookies.delete('accessToken', { path: '/' })
        cookies.delete('refreshToken', { path: '/' })

        redirect(303, '/login')
    }
} satisfies Actions
