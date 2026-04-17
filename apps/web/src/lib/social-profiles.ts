import type { IntlShape } from 'react-intl';

export type SocialProfileKey = 'xing' | 'linkedin' | 'github';

export interface SocialProfileMeta {
  key: SocialProfileKey;
  href: string;
  labelMessageId: `social.${SocialProfileKey}.label`;
  ariaMessageId: `social.${SocialProfileKey}.aria`;
}

export interface SocialProfileDisplay {
  key: SocialProfileKey;
  href: string;
  label: string;
  ariaLabel: string;
}

export const SOCIAL_PROFILES: readonly SocialProfileMeta[] = [
  {
    key: 'xing',
    href: 'https://www.xing.com/profile/Martin_Trenker2',
    labelMessageId: 'social.xing.label',
    ariaMessageId: 'social.xing.aria',
  },
  {
    key: 'linkedin',
    href: 'https://www.linkedin.com/in/martin-trenker-193449291/',
    labelMessageId: 'social.linkedin.label',
    ariaMessageId: 'social.linkedin.aria',
  },
  {
    key: 'github',
    href: 'https://github.com/mtrenker',
    labelMessageId: 'social.github.label',
    ariaMessageId: 'social.github.aria',
  },
] as const;

export const getSocialProfiles = (intl: Pick<IntlShape, 'formatMessage'>): SocialProfileDisplay[] => {
  return SOCIAL_PROFILES.map((profile) => ({
    key: profile.key,
    href: profile.href,
    label: intl.formatMessage({ id: profile.labelMessageId }),
    ariaLabel: intl.formatMessage({ id: profile.ariaMessageId }),
  }));
};

export const getPersonStructuredData = () => ({
  '@context': 'https://schema.org',
  '@type': 'Person',
  name: 'Martin Trenker',
  jobTitle: 'Software Consultant',
  url: 'https://clean.dev',
  sameAs: SOCIAL_PROFILES.map((profile) => profile.href),
});
