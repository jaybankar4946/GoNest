// Team-only demo mode: lets admins preview the site populated with clearly-labelled sample listings.
// It only changes what the current browser shows. Normal visitors never see sample data.
export const DEMO_COOKIE = 'gonest_demo';
export const demoOnClient = (): boolean =>
  typeof document !== 'undefined' && document.cookie.split('; ').some((c) => c === `${DEMO_COOKIE}=1`);
export const setDemoCookie = (on: boolean) => {
  document.cookie = on ? `${DEMO_COOKIE}=1; path=/; max-age=86400; samesite=lax` : `${DEMO_COOKIE}=; path=/; max-age=0; samesite=lax`;
};
