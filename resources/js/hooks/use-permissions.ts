import { usePage } from '@inertiajs/react';

/** UI-only gate. The server enforces every permission via `permission:` middleware. */
export function usePermissions() {
    const { auth } = usePage().props as { auth: { role: string | null; permissions: string[] } };

    return {
        role: auth.role,
        can: (capability: string) => auth.permissions.includes(capability),
    };
}
