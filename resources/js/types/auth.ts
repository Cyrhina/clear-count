export type User = {
    id: number;
    first_name: string;
    last_name: string;
    name: string;
    email: string;
    avatar?: string;
    email_verified_at: string | null;
    created_at: string;
    updated_at: string;
    [key: string]: unknown;
};

export type Auth = {
    user: User;
    role: string | null;
    permissions: string[];
    company: { id: number; name: string; plan_tier: string } | null;
};
