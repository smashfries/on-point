import { redirect } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = ({cookies}) => {
    const accessToken = cookies.get('accessToken')
    if (!accessToken) {
        throw redirect(302, "/login");
    }
}