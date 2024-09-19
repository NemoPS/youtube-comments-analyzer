import { useNavigation } from "@remix-run/react";
import { useEffect, useState } from "react";

export function TransitionWrapper({ children }: { children: React.ReactNode }) {
    const navigation = useNavigation();
    const [showChildren, setShowChildren] = useState(false);

    useEffect(() => {
        if (navigation.state === "idle") {
            setShowChildren(true);
        } else {
            setShowChildren(false);
        }
    }, [navigation.state]);

    return (
        <div className={`transition-opacity duration-300 ${showChildren ? "opacity-100" : "opacity-0"}`}>
            {children}
        </div>
    );
}