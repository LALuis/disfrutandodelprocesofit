/** Builds a `wa.me` link from a phone in any common format. Returns `''` when there is no number. */
export function whatsappUrl(phone: string, message = ''): string {
  const digits = phone.replace(/\D/g, '');
  if (!digits) {
    return '';
  }
  const text = message.trim() ? `?text=${encodeURIComponent(message.trim())}` : '';
  return `https://wa.me/${digits}${text}`;
}

export function telUrl(phone: string): string {
  const cleaned = phone.replace(/[^\d+]/g, '');
  return cleaned ? `tel:${cleaned}` : '';
}

export function mailtoUrl(email: string): string {
  return email.trim() ? `mailto:${email.trim()}` : '';
}
