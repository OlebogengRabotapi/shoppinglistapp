export const formatDate = (iso: string): string =>
  new Date(iso).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short', year: 'numeric' });

export const generateShareId = (): string => {
  const bytes = new Uint8Array(9);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(36).padStart(2, '0')).join('').slice(0, 12);
};

export const buildShareUrl = (shareId: string): string =>
  `${window.location.origin}/shared/${shareId}`;

export const getErrorMessage = (error: unknown, fallback = 'Something went wrong.'): string =>
  error instanceof Error ? error.message : fallback;
