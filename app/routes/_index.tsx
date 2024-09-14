import type { MetaFunction, LoaderFunctionArgs } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { sb } from "~/api/sb";

export const meta: MetaFunction = () => {
  return [
    { title: "Welcome to Our App" },
    { name: "description", content: "Welcome to our amazing app!" },
  ];
};

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const headers = new Headers()
  const supabase = sb(request, headers);

  const { data: { user } } = await supabase.auth.getUser();

  if (user) {
    // Redirect to dashboard if user is logged in
    return redirect("/dashboard", { headers });
  }

  return { headers };
}

export default function Index() {
  return (
    <div className="font-sans p-4">
      <h1 className="text-2xl mb-4">Welcome to Our App</h1>
      <p>Please sign in to access your dashboard.</p>
    </div>
  );
}
