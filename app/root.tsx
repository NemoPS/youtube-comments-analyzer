import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  isRouteErrorResponse,
  useRouteError,
  useLoaderData,
} from "@remix-run/react";
import "./tailwind.css";
import { LoaderFunctionArgs, json } from "@remix-run/node";
import Nav from "./components/Nav";
import { sb } from "./api/sb";
import "./styles/tailwind.css";
import "./styles/transitions.css";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const env = {
    SUPABASE_URL: process.env.SUPABASE_URL ?? '',
    SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY ?? ''
  }

  if (!env.SUPABASE_URL || !env.SUPABASE_ANON_KEY) {
    throw new Error("Missing Supabase environment variables");
  }

  const headers = new Headers()
  const supabase = sb(request, headers);

  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError && userError.message !== "Auth session missing!") {
      console.error("Error fetching user:", userError);
    }

    let profile = null;
    let avatarUrl = null;
    if (user) {
      const { data, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileError) {
        console.error("Error fetching profile:", profileError);
      } else {
        profile = data;
        avatarUrl = profile?.avatar_url || user?.user_metadata?.avatar_url || null;
      }
    }

    return json({ env, user, profile, avatarUrl }, { headers });
  } catch (error) {
    console.error("Unexpected error:", error);
    return json({ env, user: null, profile: null, avatarUrl: null }, { headers });
  }
}

export default function App() {
  const { env, user, profile, avatarUrl } = useLoaderData<typeof loader>();

  return (
    <html lang="en" data-theme="mytheme">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body className="bg-base-100 text-base-content">
        <Nav env={env} user={user} profile={profile} avatarUrl={avatarUrl} />
        <Outlet />
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export function ErrorBoundary() {
  const error = useRouteError();

  if (isRouteErrorResponse(error) && error.status === 404 && error.data.includes("react_devtools_backend_compact.js.map")) {
    return null;
  }

  return (
    <html lang="en" data-theme="mytheme">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body className="bg-base-100 text-base-content">
        <h1>Something went wrong</h1>
        <p>{isRouteErrorResponse(error) ? error.data : error instanceof Error ? error.message : String(error)}</p>
        <Scripts />
      </body>
    </html>
  );
}

