import { useEffect, useState } from "react";
import { GoogleIcon } from "./icons/GoogleIcon";
import { SupabaseClient } from "@supabase/supabase-js";
import { CrossIcon } from "./icons/CrossIcon";
import { useRevalidator } from "@remix-run/react";
import { TwitterIcon } from "./icons/TwitterIcon";
import { TwitchIcon } from "./icons/TwitchIcon";
import { Button } from './Button';

interface LoginModalProps {
    dialogRef: React.RefObject<HTMLDialogElement>;
    supabase: SupabaseClient;
}

export default function LoginModal({ dialogRef, supabase }: LoginModalProps) {
    const [email, setEmail] = useState("")
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState<string | null>(null)
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const handleClose = () => {
            if (!isLoading) {
                setEmail("")
                setError(null)
                setSuccess(null)
            }
        };

        const dialog = dialogRef.current;
        dialog?.addEventListener("close", handleClose);

        return () => {
            dialog?.removeEventListener("close", handleClose);
        };
    }, [dialogRef, isLoading]);

    const handleLogin = async (provider: string) => {
        setIsLoading(true);
        setError(null);
        try {
            const { data, error } = await supabase.auth.signInWithOAuth({
                provider,
                options: {
                    redirectTo: `${window.location.origin}/auth/callback`,
                },
            });

            if (error) {
                setError(error.message);
            } else if (data.url) {
                window.location.href = data.url;
                return; // Don't set isLoading to false, as we're redirecting
            }
        } catch (error) {
            console.error('Login error:', error);
            setError('An unexpected error occurred. Please try again.');
        }
        setIsLoading(false);
    };

    const closeModal = () => {
        if (!isLoading) {
            dialogRef.current?.close();
        }
    };

    return (
        <dialog ref={dialogRef} id="sign_in" className="modal">
            <div className="modal-box max-w-xs">
                {success && <div role="alert" className="alert alert-success">{success}</div>}
                {!success && <div className="space-y-6">
                    <button
                        className="btn btn-block flex items-center justify-center"
                        onClick={() => handleLogin('google')}
                        disabled={isLoading}
                    >
                        <GoogleIcon />
                        <span className="ml-2">{isLoading ? 'Loading...' : 'Continue with Google'}</span>
                    </button>
                    <button
                        className="btn btn-block flex items-center justify-center"
                        onClick={() => handleLogin('twitter')}
                        disabled={isLoading}
                    >
                        <TwitterIcon />
                        <span className="ml-2">{isLoading ? 'Loading...' : 'Continue with Twitter'}</span>
                    </button>
                    <button
                        className="btn btn-block flex items-center justify-center"
                        onClick={() => handleLogin('twitch')}
                        disabled={isLoading}
                    >
                        <TwitchIcon />
                        <span className="ml-2">{isLoading ? 'Loading...' : 'Continue with Twitch'}</span>
                    </button>
                    {error && <div role="alert" className="alert alert-error">
                        <CrossIcon />
                        <span>{error}</span>
                    </div>}
                </div>}
            </div>
            <form method="dialog" className="modal-backdrop">
                <button onClick={closeModal} disabled={isLoading}>close</button>
            </form>
        </dialog>
    )
}