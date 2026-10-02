import { useEffect } from 'react';

/**
 * The ops pages run in a separate Inertia app (own root view + CSS). When a starter-kit
 * page (e.g. login) redirects into one, Inertia receives the `ops` component here: do a
 * full page load so the ops root view takes over.
 */
export default function OpsRedirect() {
    useEffect(() => {
        window.location.reload();
    }, []);

    return null;
}
