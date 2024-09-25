import type { MetaFunction, LoaderFunctionArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import { sb } from "~/api/sb";
import { Button } from "~/components/Button";
import { Card } from "~/components/Card";
import { useEffect, useRef } from "react";
import Footer from "~/components/Footer";

export const meta: MetaFunction = () => {
  return [
    { title: "TubeVoice - YouTube Comment Analyzer" },
    { name: "description", content: "Unlock the power of YouTube comment analysis with TubeVoice" },
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
  const parallaxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (parallaxRef.current) {
        const scrollPosition = window.pageYOffset;
        parallaxRef.current.style.transform = `translateY(${scrollPosition * 0.1}px)`;
      }
    };

    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <div className="flex flex-col min-h-screen relative overflow-hidden">
      <div
        ref={parallaxRef}
        className="absolute inset-0 opacity-20 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(135deg, transparent 0%, transparent 35%, rgba(59, 130, 246, 0.2) 40%, rgba(59, 130, 246, 0.4) 50%, rgba(59, 130, 246, 0.2) 60%, transparent 65%, transparent 100%),
            url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32' width='32' height='32' fill='none' stroke='rgb(255 255 255 / 0.05)'%3e%3cpath d='M0 .5H31.5V32'/%3e%3c/svg%3e")
          `,
          backgroundSize: '100% 100%, 32px 32px',
          backgroundPosition: '0% 0%, 0% 0%',
        }}
      ></div>
      <main className="flex-1 relative z-10">
        <section className="w-full py-8 md:py-12 lg:py-24">
          <div className="container mx-auto px-4 md:px-6">
            <div className="flex flex-col md:flex-row items-center gap-8">
              <div className="w-full md:w-1/2 space-y-4">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl lg:text-5xl">
                  Stop <s className="text-error">guessing</s> . Start <span className="text-primary">knowing</span> what your audience craves.
                </h1>
                <p className="text-base-content/70 md:text-lg">
                  Tired of wasting time on videos that don't resonate? Our AI decodes your audience's desires in minutes, not days. While others struggle to connect, you'll be creating content that captivates, driving explosive channel growth.
                </p>
                <div className="flex flex-col sm:flex-row gap-2">
                  <Button variant="primary">
                    <Link to="/dashboard">Get Started Now</Link>
                  </Button>
                  <Button variant="secondary">
                    <Link to="#features">Learn More</Link>
                  </Button>
                </div>
              </div>
              <div className="w-full md:w-1/2">
                <img
                  src="/placeholder.svg"
                  alt="Hero"
                  className="w-full max-w-md mx-auto aspect-video md:aspect-square rounded-xl object-cover"
                />
              </div>
            </div>
          </div>
        </section>
        <section className="w-full py-12  bg-base-200/50 shadow-top-light">
          <div className="container mx-auto px-4 md:px-6 max-w-5xl">
            <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
              <div className="flex flex-col items-center space-y-4">
                <svg className="h-12 w-12 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <h3 className="text-2xl font-bold text-center">Sentiment Analysis</h3>
                <p className="text-base-content/70 text-center">
                  Understand the sentiment of your YouTube comments with our advanced AI-powered analysis. Identify
                  positive, negative, and neutral sentiments to better engage with your audience and find the pain
                  points they are experiencing.
                </p>
              </div>
              <div className="flex flex-col items-center space-y-4">
                <svg className="h-12 w-12 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                </svg>
                <h3 className="text-2xl font-bold text-center">Topic Clustering</h3>
                <p className="text-base-content/70 text-center">
                  Discover the most discussed topics in your YouTube comments and gain valuable insights to inform your
                  content strategy and address the pain points of your audience.
                </p>
              </div>
              <div className="flex flex-col items-center space-y-4">
                <svg className="h-12 w-12 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
                <h3 className="text-2xl font-bold text-center">Trend Analysis</h3>
                <p className="text-base-content/70 text-center">
                  Identify emerging trends and patterns in your YouTube comments over time. Gain valuable
                  insights into shifting audience interests and concerns to stay ahead of the curve and
                  address evolving pain points in your content strategy.
                </p>
              </div>
            </div>
          </div>
        </section>
        <section id="features" className="w-full py-12 md:py-24 bg-base-100">
          <div className="container mx-auto px-4 md:px-6 max-w-5xl">
            <div className="flex flex-col items-center justify-center space-y-6 text-center">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl">Discover What TubeVoice Can Do for You</h2>
              <p className="max-w-[900px] text-base-content/70 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                TubeVoice is your AI-powered YouTube comment analyzer. Here's what our platform offers:
              </p>
              <ul className="text-left text-base-content/70 md:text-lg space-y-4 max-w-[800px]">
                <li className="flex items-start">
                  <svg className="h-6 w-6 text-primary mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span><strong>YouTube Comment Analysis:</strong> Input a YouTube video URL, and our AI will analyze the comments to provide valuable insights.</span>
                </li>
                <li className="flex items-start">
                  <svg className="h-6 w-6 text-primary mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span><strong>Pain Point Identification:</strong> We identify the top 3 pain points expressed in the comments, helping you understand your audience's concerns.</span>
                </li>
                <li className="flex items-start">
                  <svg className="h-6 w-6 text-primary mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span><strong>Topic Analysis:</strong> Discover the top 5 most discussed topics in your video's comments.</span>
                </li>
                <li className="flex items-start">
                  <svg className="h-6 w-6 text-primary mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span><strong>Credit-Based System:</strong> Use credits to analyze videos, with different packages available to suit your needs.</span>
                </li>
              </ul>
              <p className="max-w-[900px] text-base-content/70 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed mt-4">
                TubeVoice helps you understand your audience better, allowing you to create more targeted and engaging content for your YouTube channel.
              </p>
              <Button variant="primary" className="mt-6">
                <Link to="/dashboard">Start Analyzing Now</Link>
              </Button>
            </div>
          </div>
        </section>
        <section className="w-full py-12 md:py-24 lg:py-32">
          <div className="container mx-auto px-4 md:px-6 max-w-5xl">
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
              <Card >
                <div className="flex flex-col justify-center space-y-4">
                  <div className="space-y-2">
                    <div className="inline-block rounded-lg bg-base-200 px-3 py-1 text-sm">"Invaluable Insights"</div>
                    <h3 className="text-2xl font-bold">
                      "The YouTubeComment Analyzer has been invaluable for understanding our audience's pain points and
                      improving our content to better address their needs."
                    </h3>
                    <p className="text-base-content/70">- John Doe, Content Creator</p>
                  </div>
                </div>
              </Card>
              <Card >
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
      <Footer />
    </div>
  );
}
