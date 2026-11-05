// Sample inventory is never enabled by a browser-controlled flag.
// Admin preview access must be granted by a server-verified role, not a cookie.
export const DEMO_COOKIE = 'gonest_demo';
export const demoOnClient = (): boolean => false;
export const setDemoCookie = (_on: boolean) => {
  if (typeof document !== 'undefined') {
    document.cookie = 'gonest_demo=; path=/; max-age=0; samesite=lax';
  }
};
