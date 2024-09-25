import { useEffect, useState } from "react";
import { GoogleIcon } from "./icons/GoogleIcon";
import { SupabaseClient } from "@supabase/supabase-js";
import { CrossIcon } from "./icons/CrossIcon";
import { useRevalidator } from "@remix-run/react";
import { TwitterIcon } from "./icons/TwitterIcon";
import { TwitchIcon } from "./icons/TwitchIcon";

interface LoginModalProps {
    dialogRef: React.RefObject<HTMLDialogElement>;
    supabase: SupabaseClient;
}

export default function LoginModal({ dialogRef, supabase }: LoginModalProps) {
    const [email, setEmail] = useState("")
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState<string | null>(null)
    // const revalidator = useRevalidator();

    useEffect(() => {
        dialogRef.current?.addEventListener("close", () => {
            setEmail("")
            setError(null)
            setSuccess(null)
        })
    }, [dialogRef])

    async function signIn() {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { data, error } = await supabase.auth.signInWithOtp({
            email: email,
            options: {
                // set this to false if you do not want the user to be automatically signed up
                shouldCreateUser: true
            },
        })
        setEmail("");
        if (error) {
            setError(error.message)
        } else {
            setSuccess("Check your email for the login link!")
        }
    }


    async function signInWithGoogle() {
        const { data, error } = await supabase.auth.signInWithOAuth({
            provider: "google",
            options: {
                redirectTo: `${window.location.origin}/auth/callback`,
            },
        });

        if (error) {
            setError(error.message);
        } else if (data.url) {
            window.location.href = data.url;
        }
    }

    async function signInWithTwitter() {
        const { data, error } = await supabase.auth.signInWithOAuth({
            provider: "twitter",
            options: {
                redirectTo: `${window.location.origin}/auth/callback`,
            },
        });

        if (error) {
            setError(error.message);
        } else if (data.url) {
            window.location.href = data.url;
        }
    }

    async function signInWithTwitch() {
        const { data, error } = await supabase.auth.signInWithOAuth({
            provider: "twitch",
            options: {
                redirectTo: `${window.location.origin}/auth/callback`,
            },
        });

        if (error) {
            setError(error.message);
        } else if (data.url) {
            window.location.href = data.url;
        }
    }

    const typing = (e: React.ChangeEvent<HTMLInputElement>) => {
        setEmail(e.target.value)
        setError(null)

    }
    return (
        <dialog ref={dialogRef} id="sign_in" className="modal">
            <div className="modal-box max-w-xs">
                {success && <div role="alert" className="alert alert-success">{success}</div>}
                {!success && <div className="space-y-6">
                    <button className="btn btn-block flex items-center justify-center" onClick={signInWithGoogle}>
                        <GoogleIcon />
                        <span className="ml-2">Continue with Google</span>
                    </button>
                    <button className="btn btn-block flex items-center justify-center" onClick={signInWithTwitter}>
                        <TwitterIcon />
                        <span className="ml-2">Continue with Twitter</span>
                    </button>
                    <button className="btn btn-block flex items-center justify-center" onClick={signInWithTwitch}>
                        <TwitchIcon />
                        <span className="ml-2">Continue with Twitch</span>
                    </button>
                    {/* <label className="input input-bordered flex items-center gap-2">
                        Email
                        <input type="email" className="grow" required={true} value={email} onChange={typing}
                            onKeyUp={(e) => e.key === "Enter" && signIn()} />
                    </label>
                    <button type="button" className="btn btn-primary btn-block" onClick={signIn}>Sign In With Email</button> */}
                    {error && <div role="alert" className="alert">
                        <CrossIcon />
                        <span>{error}</span>
                    </div>}
                </div>}
            </div>
            <form method="dialog" className="modal-backdrop">
                <button>close</button>
            </form>
        </dialog>
    )
}