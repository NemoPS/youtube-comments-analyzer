import type { MetaFunction, LoaderFunctionArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import { sb } from "~/api/sb";
import { Button } from "~/components/Button";
import { Card } from "~/components/Card";

export const meta: MetaFunction = () => {
  return [
    { title: "InsighTube - YouTube Comment Analyzer" },
    { name: "description", content: "Unlock the power of YouTube comment analysis with InsighTube" },
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

  return json({ headers });
}

export default function Index() {
  const { headers } = useLoaderData<typeof loader>();

  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32">
          <div className="container mx-auto px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px]">
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-2">
                  <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none">
                    Unlock the Power of YouTube Comment Analysis
                  </h1>
                  <p className="max-w-[600px] text-base-content/70 md:text-xl">
                    Our AI-powered platform analyzes your YouTube comments to find the pain points of people and provide
                    valuable insights, sentiment analysis, and moderation tools to help you better understand your
                    audience and improve your content.
                  </p>
                </div>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  <Button variant="primary">
                    <Link to="/dashboard">Get Started</Link>
                  </Button>
                  <Button variant="secondary">
                    <Link to="#features">Learn More</Link>
                  </Button>
                </div>
              </div>
              <img
                src="/placeholder.svg"
                alt="Hero"
                className="mx-auto aspect-video overflow-hidden rounded-xl object-cover sm:w-full lg:order-last lg:aspect-square"
                width="550"
                height="550"
              />
            </div>
          </div>
        </section>
        <section id="features" className="w-full py-12 md:py-24 lg:py-32 bg-base-200">
          <div className="container mx-auto px-4 md:px-6">
            <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
              <Card>
                <div className="flex flex-col items-start space-y-4">
                  <svg className="h-12 w-12 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  <h3 className="text-2xl font-bold">Sentiment Analysis</h3>
                  <p className="text-base-content/70">
                    Understand the sentiment of your YouTube comments with our advanced AI-powered analysis. Identify
                    positive, negative, and neutral sentiments to better engage with your audience and find the pain
                    points they are experiencing.
                  </p>
                </div>
              </Card>
              <Card>
                <div className="flex flex-col items-start space-y-4">
                  <svg className="h-12 w-12 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                  </svg>
                  <h3 className="text-2xl font-bold">Topic Clustering</h3>
                  <p className="text-base-content/70">
                    Discover the most discussed topics in your YouTube comments and gain valuable insights to inform your
                    content strategy and address the pain points of your audience.
                  </p>
                </div>
              </Card>
              <Card>
                <div className="flex flex-col items-start space-y-4">
                  <svg className="h-12 w-12 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  <h3 className="text-2xl font-bold">Comment Moderation</h3>
                  <p className="text-base-content/70">
                    Automatically detect and moderate inappropriate or spam-like comments, allowing you to focus on
                    engaging with your community and addressing their pain points.
                  </p>
                </div>
              </Card>
            </div>
          </div>
        </section>
        <section className="w-full py-12 md:py-24 lg:py-32">
          <div className="container mx-auto px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <div className="inline-block rounded-lg bg-base-200 px-3 py-1 text-sm">Customer Testimonials</div>
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">What Our Customers Say</h2>
                <p className="max-w-[900px] text-base-content/70 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Hear from the creators and brands who have used our YouTube comment analysis tools to better
                  understand their audience, address their pain points, and improve their content.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl items-center gap-6 py-12 lg:grid-cols-2 lg:gap-12">
              <Card>
                <div className="flex flex-col justify-center space-y-4">
                  <div className="space-y-2">
                    <div className="inline-block rounded-lg bg-base-200 px-3 py-1 text-sm">"Invaluable Insights"</div>
                    <h3 className="text-2xl font-bold">
                      "The YouTube Comment Analyzer has been invaluable for understanding our audience's pain points and
                      improving our content to better address their needs."
                    </h3>
                    <p className="text-base-content/70">- John Doe, Content Creator</p>
                  </div>
                </div>
              </Card>
              <Card>
                <div className="flex flex-col justify-center space-y-4">
                  <div className="space-y-2">
                    <div className="inline-block rounded-lg bg-base-200 px-3 py-1 text-sm">"Streamlined Moderation"</div>
                    <h3 className="text-2xl font-bold">
                      "The comment moderation tools have saved us so much time and helped us maintain a positive
                      community by addressing the pain points expressed in the comments."
                    </h3>
                    <p className="text-base-content/70">- Jane Smith, Brand Manager</p>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </section>
      </main>
      <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t border-base-300">
        <p className="text-xs text-base-content/70">&copy; 2024 InsighTube. All rights reserved.</p>
        <nav className="sm:ml-auto flex gap-4 sm:gap-6">
          <Link to="#" className="text-xs hover:underline underline-offset-4">
            Terms of Service
          </Link>
          <Link to="#" className="text-xs hover:underline underline-offset-4">
            Privacy
          </Link>
        </nav>
      </footer>
    </div>
  );
}
