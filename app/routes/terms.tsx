import type { MetaFunction } from "@remix-run/node";
import { Link } from "@remix-run/react";
import Footer from "~/components/Footer"; // Add this import
import { useGoogleAnalytics } from '~/hooks/useGoogleAnalytics';

export const meta: MetaFunction = () => {
    return [
        { title: "Terms of Service - TubeVoice" },
        { name: "description", content: "Terms of Service for TubeVoice - YouTube Comment Analysis Platform" },
    ];
};

export default function TermsOfService() {
    useGoogleAnalytics('/terms');

    return (
        <div className="flex flex-col min-h-screen">
            <main className="flex-1 container mx-auto px-4 py-8 max-w-4xl">
                <h1 className="text-3xl font-bold mb-6">Terms and Conditions</h1>

                <section className="mb-8">
                    <h2 className="text-2xl font-semibold mb-4">1. Acceptance of Terms</h2>
                    <p>By accessing or using TubeVoice, you acknowledge that you have read, understood, and agree to be bound by these Terms and Conditions.</p>
                </section>

                <section className="mb-8">
                    <h2 className="text-2xl font-semibold mb-4">2. Effective Date</h2>
                    <p>These Terms become effective immediately upon your first use of the TubeVoice platform.</p>
                </section>

                <section className="mb-8">
                    <h2 className="text-2xl font-semibold mb-4">3. Platform Overview</h2>
                    <p>TubeVoice offers AI-driven analysis of YouTube comments, helping content creators gain insights into their audience. We reserve the right to modify or update our services without prior notification.</p>
                </section>

                <section className="mb-8">
                    <h2 className="text-2xl font-semibold mb-4">4. Limitation of Guarantees</h2>
                    <p>While we strive for excellence, TubeVoice does not guarantee that our services will meet all your specific needs or operate without interruptions. We disclaim all warranties not explicitly stated in this agreement, including but not limited to implied warranties of merchantability and fitness for a particular purpose, to the fullest extent permitted by law.</p>
                </section>

                <section className="mb-8">
                    <h2 className="text-2xl font-semibold mb-4">5. Liability Constraints</h2>
                    <p>TubeVoice&apos;s liability is strictly limited. We are not responsible for any direct, indirect, incidental, or consequential damages resulting from your use of our platform. This includes, but is not limited to, loss of profits, data, or business opportunities. In the event that TubeVoice is found liable, our maximum liability is limited to the amount you have paid for our services.</p>
                </section>

                <section className="mb-8">
                    <h2 className="text-2xl font-semibold mb-4">6. User Accountability</h2>
                    <p>Users are solely responsible for their use of TubeVoice and any content they generate or analyze using our platform. TubeVoice does not assume responsibility for user-generated content or its consequences.</p>
                </section>

                <section className="mb-8">
                    <h2 className="text-2xl font-semibold mb-4">7. Data Protection and GDPR Compliance</h2>
                    <p>TubeVoice is committed to protecting your personal data and complying with applicable data protection laws, including the General Data Protection Regulation (GDPR). We process personal data in accordance with our Privacy Policy, which outlines how we collect, use, and protect your information. By using our services, you consent to our data practices as described in the Privacy Policy. You have the right to access, correct, or delete your personal data, and you may exercise these rights by contacting us as specified in our Privacy Policy.</p>
                </section>

                <section className="mb-8">
                    <h2 className="text-2xl font-semibold mb-4">8. Legal Jurisdiction</h2>
                    <p>These Terms are governed by and construed in accordance with the laws of the United States. By using TubeVoice, you agree that any legal action related to these Terms will be subject to the exclusive jurisdiction of the courts in the United States.</p>
                </section>

                <Link to="/" className="text-primary hover:underline">Back to Home</Link>
            </main>
            <Footer /> {/* Replace the existing footer with this component */}
        </div>
    );
}