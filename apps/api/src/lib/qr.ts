import QRCode from 'qrcode';

export async function qrPng(payload: string): Promise<Buffer> {
  return QRCode.toBuffer(payload, {
    type: 'png',
    errorCorrectionLevel: 'M',
    margin: 1,
    width: 512,
  });
}

export async function qrSvg(payload: string): Promise<string> {
  return QRCode.toString(payload, { type: 'svg', margin: 1, width: 512 });
}
