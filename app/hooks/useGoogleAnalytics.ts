import { useEffect } from 'react';

export function useGoogleAnalytics(page: string) {
    useEffect(() => {
        if (typeof window !== 'undefined') {
            import('react-ga4').then((ReactGA) => {
                ReactGA.default.initialize('G-2B20TF0SQC');
                ReactGA.default.send({ hitType: "pageview", page });
            });
        }
    }, [page]);
}