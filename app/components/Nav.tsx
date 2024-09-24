import { Link, useRevalidator, useLocation } from "@remix-run/react";
import { createBrowserClient } from "@supabase/ssr";
import { useRef } from "react";
import LoginModal from "./LoginModal";

// Update the NavProps type
type NavProps = {
    env: {
        SUPABASE_URL: string;
        SUPABASE_ANON_KEY: string;
    },
    user: {
        id: string;
        email?: string;
        // Add other user properties as needed
    } | null,
    profile: {
        credits: number;
        // Add other profile properties as needed
    } | null,
    avatarUrl: string | null
}

export default function Nav({ env, user, profile, avatarUrl }: NavProps) {
    const dialogRef = useRef<HTMLDialogElement | null>(null);
    const supabase = createBrowserClient(env.SUPABASE_URL!, env.SUPABASE_ANON_KEY!);

    const revalidator = useRevalidator();
    const location = useLocation();

    async function signOut() {
        const { error } = await supabase.auth.signOut();
        if (error) {
            console.error("Sign Out Error:", error.message);
        } else {
            revalidator.revalidate();
            console.log("Sign Out Successful");
        }
    }

    function openModal() {
        dialogRef.current?.showModal();
    }

    return <div className="navbar bg-base-100 px-4">
        <div className="flex-1">
            {user ? (
                <Link to="/dashboard" className="btn btn-outline btn-primary btn-sm">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
                    </svg>
                </Link>
            ) : (
                <Link to="/" className="flex items-center">
                    <img src="/tubevoice_logo.png" alt="TubeVoice Logo" className="h-8 w-auto mr-2" />
                    <span className="text-xl font-bold text-white">TubeVoice</span>
                </Link>
            )}
        </div>
        <div className="flex-none">
            {user && profile ? (
                <div className="flex items-center">
                    {avatarUrl ? (
                        <div className="avatar">
                            <div className="w-10 rounded-full">
                                <img src={avatarUrl} alt="User avatar" />
                            </div>
                        </div>
                    ) : (
                        <div className="avatar placeholder">
                            <div className="bg-neutral-focus text-neutral-content rounded-full w-10">
                                <span className="text-xl">{user.email ? user.email.charAt(0).toUpperCase() : 'U'}</span>
                            </div>
                        </div>
                    )}
                    <p className="ml-2 mr-4">Credits: {profile.credits || 0}</p>
                    {location.pathname !== "/buy-credits" && (
                        <Link to="/buy-credits" className="btn btn-sm btn-outline btn-primary mr-2">
                            Buy Credits
                        </Link>
                    )}
                    <button className="btn btn-sm" onClick={signOut}>Sign Out</button>
                </div>
            ) : (
                <button className="btn btn-sm" onClick={openModal}>
                    Sign In
                </button>
            )}
            <LoginModal dialogRef={dialogRef} supabase={supabase} />
        </div>
    </div>
}