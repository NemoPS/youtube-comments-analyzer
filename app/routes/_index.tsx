import type { MetaFunction, LoaderFunctionArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { useSearchParams, useNavigate } from "@remix-run/react";
import { sb } from "~/api/sb";
import { Button } from "~/components/Button";
import { Card } from "~/components/Card";
import { useEffect, useRef } from "react";
import Footer from "~/components/Footer";
import { toast } from "react-hot-toast";
import HeroImage from '~/components/HeroImage';
import { useGoogleAnalytics } from '~/hooks/useGoogleAnalytics';

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
  useGoogleAnalytics('/home');

  const parallaxRef = useRef<HTMLDivElement>(null);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const hasShownToast = useRef(false);

  useEffect(() => {
    if (hasShownToast.current) return;

    const showErrorToast = (errorDescription: string) => {
      const decodedErrorDescription = decodeURIComponent(errorDescription.replace(/\+/g, " "));
      toast.error(`Login Error: ${decodedErrorDescription}`, {
        duration: 5000,
        position: "top-center",
      });
      hasShownToast.current = true;
    };

    const searchError = searchParams.get("error");
    const searchErrorDescription = searchParams.get("error_description");

    if (searchError && searchErrorDescription) {
      showErrorToast(searchErrorDescription);
      // Remove error params from URL
      navigate("/", { replace: true });
    } else {
      // Check hash params if search params don't have the error
      const hashParams = new URLSearchParams(window.location.hash.slice(1));
      const hashError = hashParams.get("error");
      const hashErrorDescription = hashParams.get("error_description");

      if (hashError && hashErrorDescription) {
        showErrorToast(hashErrorDescription);
        // Remove error params from hash
        window.history.replaceState(null, "", window.location.pathname);
      }
    }
  }, [searchParams, navigate]);

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

  const openLoginModal = () => {
    const loginButton = document.querySelector('.btn.btn-sm[data-login-button]') as HTMLButtonElement | null;
    if (loginButton) {
      loginButton.click();
    }
  };

  return (
    <div className="flex flex-col min-h-screen relative overflow-hidden">
      <div
        ref={parallaxRef}
        className="absolute inset-0 opacity-20 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(135deg, transparent 0%, transparent 25%, rgba(59, 130, 246, 0.2) 30%, rgba(59, 130, 246, 0.4) 35%, rgba(59, 130, 246, 0.2) 45%, transparent 55%, transparent 100%),
            url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32' width='32' height='32' fill='none' stroke='rgb(255 255 255 / 0.05)'%3e%3cpath d='M0 .5H31.5V32'/%3e%3c/svg%3e")
          `,
          backgroundSize: '100% 100%, 32px 32px',
          backgroundPosition: '0% 0%, 0% 0%',
        }}
      ></div>
      <main className="flex-1 relative z-10">

        <section className="w-full py-8 md:py-12 lg:py-24 ">
          <div className="container mx-auto px-4 md:px-6 max-w-5xl">
            <div className="flex flex-col md:flex-row items-center gap-8">
              <div className="w-full md:w-1/2 space-y-4">
                <h1 className="text-white text-3xl font-normal tracking-tight sm:text-4xl lg:text-5xl">
                  Stop <span className="font-bold tracking-normal">guessing</span>. <span className="text-error italic tracking-normal font-extrabold">Know</span> what your audience craves.
                </h1>
                <p className="text-base-content/70 md:text-lg">
                  The time you waste on market research could be used to make new videos! Our AI decodes your audience's desires in minutes, not days. While others struggle to connect, you&apos;ll be creating content that captivates, driving explosive channel growth.
                </p>
                <div className="flex flex-col sm:flex-row gap-2">
                  <Button variant="primary" onClick={openLoginModal}>
                    Get Started For FREE Now
                  </Button>
                  <Button variant="secondary">
                    <a href="#features">Learn More</a>
                  </Button>
                </div>
              </div>
              <HeroImage />
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
                <h3 className="text-2xl font-bold text-center">Learn what people hate</h3>
                <p className="text-base-content/70 text-center">
                  Uncover the top 3 struggles and complaints expressed in your YouTube video comments. Gain valuable insights into your audience's concerns and frustrations to improve your content strategy.
                </p>
              </div>
              <div className="flex flex-col items-center space-y-4">
                <svg className="h-12 w-12 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                </svg>
                <h3 className="text-2xl font-bold text-center">What people talk about</h3>
                <p className="text-base-content/70 text-center">
                  Discover the top 5 most discussed topics in your YouTube video comments. Understand what resonates with your audience and tailor your content to their interests.
                </p>
              </div>
              <div className="flex flex-col items-center space-y-4">
                <svg className="h-12 w-12 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
                <h3 className="text-2xl font-bold text-center">AI-Powered Insights</h3>
                <p className="text-base-content/70 text-center">
                  Leverage advanced AI technology to analyze YouTube comments quickly and efficiently. Get actionable insights to improve your content and grow your channel.
                </p>
              </div>
            </div>
          </div>
        </section>
        <section id="features" className="w-full py-12 md:py-24 bg-base-100">
          <div className="container mx-auto px-4 md:px-6 max-w-5xl">
            <div className="flex flex-col items-center justify-center space-y-6 text-center">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl">LESS TIME spent researching = MORE TIME making videos</h2>
              <p className="max-w-[900px] text-base-content/70 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                TubeVoice is your AI-powered YouTube comment analyzer. Here&apos;s what our platform offers:
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
                  <span><strong>Pain Point Identification:</strong> We identify the top 3 pain points expressed in the comments, helping you understand your audience&apos;s concerns.</span>
                </li>
                <li className="flex items-start">
                  <svg className="h-6 w-6 text-primary mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span><strong>Topic Analysis:</strong> Discover the top 5 most discussed topics in your video&apos;s comments.</span>
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
              <Button variant="primary" className="mt-6" onClick={openLoginModal}>
                Start Analyzing Now
              </Button>
              <small>You will get 2 FREE CREDITS, valid for 2 searches, as you sign up 🙂</small>
            </div>
          </div>
        </section>

        {/* New Pricing Section */}
        <section className="w-full py-12 md:py-24" id="pricing">
          <div className="container mx-auto px-4 md:px-6 max-w-5xl">
            <div className="text-center space-y-4 mb-10">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl">Pricing for Everyone</h2>
              <p className="max-w-[900px] mx-auto text-base-content/70 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                Choose the perfect plan to unlock the power of AI-driven YouTube comment analysis. Whether you&apos;re just starting out or scaling up, we&apos;ve got you covered.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
              <Card className="flex flex-col items-center text-center gap-4">
                <div className="flex items-center justify-center w-full">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="w-12 h-12 text-primary"
                  >
                    <path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1"></path>
                    <path d="M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4"></path>
                  </svg>
                </div>
                <div className="space-y-2">
                  <h3 className="text-2xl font-bold">5 Credits</h3>
                  <p className="text-3xl font-bold">$5</p>
                  <p className="text-base-content/70">
                    Perfect for casual users. Ideal for those just starting out or with occasional analysis needs. Get a taste of our powerful insights without a big commitment.
                  </p>
                </div>
              </Card>
              <Card className="flex flex-col items-center text-center gap-4">
                <div className="flex items-center justify-center w-full">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="w-12 h-12 text-primary"
                  >
                    <path d="M19 5c-1.5 0-2.8 1.4-3 2-3.5-1.5-11-.3-11 5 0 1.8 0 3 2 4.5V20h4v-2h3v2h4v-4c1-.5 1.7-1 2-2h2v-4h-2c0-1-.5-1.5-1-2h0V5z"></path>
                    <path d="M2 9v1c0 1.1.9 2 2 2h1"></path>
                    <path d="M16 11h0"></path>
                  </svg>
                </div>
                <div className="space-y-2">
                  <h3 className="text-2xl font-bold">25 Credits</h3>
                  <p className="text-3xl font-bold">$10</p>
                  <p className="text-base-content/70">
                    Great for power users and small teams. Dive deeper into your content analysis with more credits. Unlock the full potential of our platform for regular use.
                  </p>
                </div>
              </Card>
              <Card className="flex flex-col items-center text-center gap-4">
                <div className="flex items-center justify-center w-full">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="w-12 h-12 text-primary"
                  >
                    <path d="M6 3h12l4 6-10 13L2 9Z"></path>
                    <path d="M11 3 8 9l4 13 4-13-3-6"></path>
                    <path d="M2 9h20"></path>
                  </svg>
                </div>
                <div className="space-y-2">
                  <h3 className="text-2xl font-bold">50 Credits</h3>
                  <p className="text-3xl font-bold">$15</p>
                  <p className="text-base-content/70">
                    Designed for pros and large teams with high-volume needs. Maximize your insights with our most comprehensive package and next-level your channel.
                  </p>
                </div>
              </Card>
            </div>
            <div className="text-center">
              <Button variant="primary" size="lg" className="px-8 py-3 text-lg" onClick={openLoginModal}>
                Try Now for Free
              </Button>
              <p><small>1 credit = 1 search. 2 FREE CREDITS on sign up</small></p>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
