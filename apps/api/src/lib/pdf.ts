/**
 * Tiny PDF stub. Real impl would use pdfkit / puppeteer.
 * Returns an opaque "signed URL" we'd hand to S3 / Supabase Storage.
 */
import { randomUUID } from 'crypto';

export function fakeSignedUrl(prefix = 'reports'): string {
  return `https://storage.edualerta.cl/${prefix}/${randomUUID()}.pdf?sig=demo`;
}
