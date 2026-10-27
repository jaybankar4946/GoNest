// The legacy /builders route must not expose a multi-developer catalog.
// Reuse the approved Hiranandani-only New Projects experience.
export { default, metadata } from '../projects/page';
export const revalidate = 3600;
