import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = ({cookies}) => {
    const accessToken = cookies.get('accessToken')
    console.log(accessToken)

    return {
        loggedIn: accessToken ? true : false
    }
}