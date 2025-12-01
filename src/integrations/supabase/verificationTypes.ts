// Extending the base Database types with verification fields
// This file adds support for the verification system

export interface VerificationRequest {
    id: string;
    user_id: string;
    reason: string;
    category: string;
    status: 'pending' | 'approved' | 'rejected';
    created_at: string;
    reviewed_at: string | null;
    reviewer_notes: string | null;
}

export interface ProfileWithVerification {
    id: string;
    username: string;
    full_name: string;
    avatar_url: string | null;
    bio: string | null;
    location: string | null;
    github_url: string | null;
    linkedin_url: string | null;
    portfolio_url: string | null;
    tech_skills: string[] | null;
    banner_url: string | null;
    is_verified?: boolean | null;
    verification_category?: string | null;
}
