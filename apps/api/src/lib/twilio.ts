import Twilio from 'twilio';
import { logger } from '../config/logger';

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const fromPhone = process.env.TWILIO_FROM_PHONE;
const fromWhatsApp = process.env.TWILIO_FROM_WHATSAPP;

const client = accountSid && authToken ? Twilio(accountSid, authToken) : null;

export async function sendSms(to: string, body: string): Promise<boolean> {
  if (!client || !fromPhone) {
    logger.warn({ to }, 'Twilio not configured — SMS skipped');
    return false;
  }
  try {
    await client.messages.create({ body, from: fromPhone, to });
    logger.info({ to }, 'SMS sent');
    return true;
  } catch (err) {
    logger.error({ err, to }, 'SMS failed');
    return false;
  }
}

export async function sendWhatsApp(to: string, body: string): Promise<boolean> {
  if (!client || !fromWhatsApp) {
    logger.warn({ to }, 'Twilio WhatsApp not configured — skipped');
    return false;
  }
  try {
    await client.messages.create({
      body,
      from: `whatsapp:${fromWhatsApp}`,
      to: `whatsapp:${to}`,
    });
    logger.info({ to }, 'WhatsApp sent');
    return true;
  } catch (err) {
    logger.error({ err, to }, 'WhatsApp failed');
    return false;
  }
}

export const twilioConfigured = !!client;
