import type { MetaFunction } from "@remix-run/node";
import { Link } from "@remix-run/react";
import Footer from "~/components/Footer";

export const meta: MetaFunction = () => {
    return [
        { title: "Privacy Policy - TubeVoice" },
        { name: "description", content: "Privacy Policy for TubeVoice - YouTube Comment Analysis Platform" },
    ];
};

export default function PrivacyPolicy() {
    return (
        <div className="flex flex-col min-h-screen">
            <main className="flex-1 container mx-auto px-4 py-8 max-w-4xl">
                <h1 className="text-3xl font-bold mb-6">Privacy Policy</h1>

                <section className="mb-8">
                    <h2 className="text-2xl font-semibold mb-4">1. Introduction</h2>
                    <p>At TubeVoice, we are committed to protecting your privacy and ensuring the security of your personal information. This Privacy Policy explains how we collect, use, disclose, and safeguard your data when you use our YouTube comment analysis platform.</p>
                </section>

                <section className="mb-8">
                    <h2 className="text-2xl font-semibold mb-4">2. Information We Collect</h2>
                    <p>We collect information you provide directly to us, such as when you create an account, use our services, or communicate with us. This may include your name, email address, and YouTube channel information. We also collect data about your use of our platform, including analytics and log data.</p>
                </section>

                <section className="mb-8">
                    <h2 className="text-2xl font-semibold mb-4">3. How We Use Your Information</h2>
                    <p>We use the information we collect to provide, maintain, and improve our services, to communicate with you, and to comply with legal obligations. This includes analyzing YouTube comments, generating insights, and personalizing your experience on our platform.</p>
                </section>

                <section className="mb-8">
                    <h2 className="text-2xl font-semibold mb-4">4. Data Sharing and Disclosure</h2>
                    <p>We do not sell your personal information. We may share your data with service providers who help us operate our platform, or as required by law. We may also share aggregated or de-identified information that cannot reasonably be used to identify you.</p>
                </section>

                <section className="mb-8">
                    <h2 className="text-2xl font-semibold mb-4">5. Data Security</h2>
                    <p>We implement appropriate technical and organizational measures to protect your personal information against unauthorized or unlawful processing, accidental loss, destruction, or damage.</p>
                </section>

                <section className="mb-8">
                    <h2 className="text-2xl font-semibold mb-4">6. Your Rights and Choices</h2>
                    <p>You have the right to access, correct, or delete your personal data. You may also have the right to restrict or object to certain processing of your data. To exercise these rights, please contact us using the information provided at the end of this policy.</p>
                </section>

                <section className="mb-8">
                    <h2 className="text-2xl font-semibold mb-4">7. Changes to This Policy</h2>
                    <p>We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last Updated" date.</p>
                </section>

                <section className="mb-8">
                    <h2 className="text-2xl font-semibold mb-4">8. Contact Us</h2>
                    <p>If you have any questions about this Privacy Policy or our data practices, please contact us at: privacy@tubevoice.com</p>
                </section>

                <p className="mb-4">Last Updated: {new Date().toLocaleDateString()}</p>

                <Link to="/" className="text-primary hover:underline">Back to Home</Link>
            </main>
            <Footer />
        </div>
    );
}