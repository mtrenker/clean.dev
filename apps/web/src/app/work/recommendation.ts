import { SOCIAL_PROFILES } from '@/lib/social-profiles';

const linkedInProfile = SOCIAL_PROFILES.find((profile) => profile.key === 'linkedin');
if (!linkedInProfile) throw new Error('LinkedIn profile is missing');

/**
 * The one received recommendation on CV page one (#127). The excerpt keeps the
 * author's original English wording in every locale; "[…]" marks the omitted
 * sentence between the two quoted ones. The role is the one shown when the
 * recommendation was written.
 */
export const cvRecommendation = {
  author: 'Christoph Meier',
  role: 'Product Owner, Douglas',
  date: '2026-08-07',
  lang: 'en',
  sourceUrl: `${linkedInProfile.href}details/recommendations/`,
  excerpt: 'Martin helped us establish a modern, reliable way of working that significantly improved both the quality of our development and our day-to-day collaboration. […] Many of the practices and collaborative sessions he introduced have become an integral part of how the team continues to work today.',
} as const;
