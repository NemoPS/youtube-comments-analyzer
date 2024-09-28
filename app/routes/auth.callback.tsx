import { LoaderFunctionArgs, redirect } from "@remix-run/node";
import { sb } from "~/api/sb";

export const loader = async ({ request }: LoaderFunctionArgs) => {
    const headers = new Headers();
    const supabase = sb(request, headers);

    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');

    if (code) {
        const { data, error } = await supabase.auth.exchangeCodeForSession(code);

        if (!error && data.user) {
            // console.log("User authenticated:", data.user);

            // Create user profile if it doesn't exist, otherwise retrieve it
            const { data: profileData, error: profileError } = await supabase
                .from('profiles')
                .upsert({
                    id: data.user.id,
                    username: data.user.user_metadata.full_name || data.user.email,
                    avatar_url: data.user.user_metadata.avatar_url,
                    credits: 2, // Set initial credits only for new users
                }, {
                    onConflict: 'id',
                    ignoreDuplicates: true,
                })
                .select();

            if (profileError) {
                console.error("Error creating/retrieving profile:", profileError);
                // You might want to add some error handling here
            } else {

                // console.log("Profile created/retrieved:", profileData);
            }

            // Force a reload of the user data
            await supabase.auth.getUser();
        } else if (error) {
            console.error("Authentication error:", error);
        }
    } else {
        console.log("No code provided in callback");
    }

    // Ensure we're using the headers when redirecting
    return redirect('/', { headers });
};