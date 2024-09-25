import { Link } from "@remix-run/react";

export default function Footer() {
    return (
        <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t border-base-300">
            <p className="text-xs text-base-content/70">&copy; {new Date().getFullYear()} TubeVoice. All rights reserved.</p>
            <nav className="sm:ml-auto flex gap-4 sm:gap-6">
                <Link to="/terms" className="text-xs hover:underline underline-offset-4">
                    Terms of Service
                </Link>
                <Link to="/privacy" className="text-xs hover:underline underline-offset-4">
                    Privacy Policy
                </Link>
            </nav>
        </footer>
    );
}