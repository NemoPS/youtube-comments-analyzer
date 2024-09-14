import { sb } from "../sb";




export default async function getUser(request: Request) {

    const headers = new Headers()
    const supabase = sb(request, headers);
    const { data } = await supabase.auth.getUser()

    // make sure I have data.data.user



    return { user: data.user, headers: headers }


}