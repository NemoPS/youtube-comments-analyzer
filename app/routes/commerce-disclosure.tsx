import type { MetaFunction } from "@remix-run/node";
import { Link } from "@remix-run/react";
import Footer from "~/components/Footer";
import { useGoogleAnalytics } from '~/hooks/useGoogleAnalytics';

export const meta: MetaFunction = () => {
    return [
        { title: "Commerce Disclosure - TubeVoice" },
        { name: "description", content: "Commerce Disclosure for TubeVoice - YouTube Comment Analysis Platform" },
    ];
};

export default function CommerceDisclosure() {
    useGoogleAnalytics('/commerce-disclosure');

    return (
        <div className="flex flex-col min-h-screen">
            <main className="flex-1 container mx-auto px-4 py-8 max-w-4xl">
                <h1 className="text-3xl font-bold mb-6">Specified Commercial Transaction Act</h1>

                <section className="mb-8">
                    <h2 className="text-2xl font-semibold mb-4">1. Introduction</h2>
                    <p>TubeVoice is committed to transparency in our business practices. This Commerce Disclosure outlines important information about our company, the products and services we offer, and how we process payments.</p>
                </section>

                <section className="mb-8">
                    <h2 className="text-2xl font-semibold mb-4">2. Company Information</h2>
                    <p>Available On Request</p>
                </section>

                <section className="mb-8">
                    <h2 className="text-2xl font-semibold mb-4">3. Products and Services</h2>
                    <p>TubeVoice offers AI-powered YouTube comment analysis services. Our platform allows users to gain insights into audience sentiment, identify pain points, and discover trending topics within YouTube video comments.</p>
                </section>

                <section className="mb-8">
                    <h2 className="text-2xl font-semibold mb-4">4. Pricing and Payment</h2>
                    <p>Our services are offered on a credit-based system. Users can purchase credits which can be used to analyze YouTube videos. Prices for credit packages are 5 USD for 10 credits, 10 USD for 25 credits, 15 USD for 50 credits. All prices are in USD and include applicable taxes, and may be subject to change.</p>
                </section>

                <section className="mb-8">
                    <h2 className="text-2xl font-semibold mb-4">5. Payment Processing</h2>
                    <p>We use Stripe, a trusted third-party payment processor, to handle all financial transactions. When you make a purchase, you will be redirected to Stripe's secure payment page. Credits are given immediately after purchasing. We do not store your full credit card information on our servers.</p>
                </section>

                <section className="mb-8">
                    <h2 className="text-2xl font-semibold mb-4">6. Refund Policy</h2>
                    <p>Due to the nature of our digital services, all sales are final. However, if you placed your order by mistake, we can refund the full amount within a shiort period of time. Also notice any purchased credit will be removed.</p>
                </section>

                <section className="mb-8">
                    <h2 className="text-2xl font-semibold mb-4">7. Customer Support</h2>
                    <p>If you have any questions about our services, pricing, or this disclosure, please contact our customer support team at support@tubevoice.com. We aim to respond to all inquiries within 24 hours during business days.</p>
                </section>

                <section className="mb-8">
                    <h2 className="text-2xl font-semibold mb-4">8. Updates to This Disclosure</h2>
                    <p>We may update this Commerce Disclosure from time to time to reflect changes in our business practices or legal requirements. We will notify users of any significant changes by posting a notice on our website.</p>
                </section>

                <p>Chief operations officer: Fabio Porta</p>
                <p>Additional Fees: None</p>
                <p>Accepted payment methods: credit card</p>


                <p className="mb-4">Last Updated: {new Date().toLocaleDateString()}</p>

                <Link to="/" className="text-primary hover:underline">Back to Home</Link>
            </main>
            <Footer />
        </div>
    );
}