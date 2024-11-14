import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = ({locals}) => {
    const user = locals.user;

    return {
        loggedIn: user ? true : false
    }
}