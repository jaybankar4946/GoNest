export const tenDigits = (p: string) => p.replace(/\D/g, '').slice(-10);
export const telHref = (p: string) => `tel:+91${tenDigits(p)}`;
export const waHref = (p: string, text: string) => `https://wa.me/91${tenDigits(p)}?text=${encodeURIComponent(text)}`;
