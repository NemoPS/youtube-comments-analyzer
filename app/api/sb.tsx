import { createServerClient, parseCookieHeader, serializeCookieHeader } from "@supabase/ssr"
export const sb = (request: Request, headers: Headers) => createServerClient(process.env.SUPABASE_URL!, process.env.SUPABASE_ANON_KEY!, {
    cookies: {
        getAll() {
            return parseCookieHeader(request.headers.get('Cookie') ?? '')
        },
        setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) =>
                headers.append('Set-Cookie', serializeCookieHeader(name, value, options))
            )
        },
    },
})