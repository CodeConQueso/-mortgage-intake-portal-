import { Resend } from 'resend';

/**
 * PRODUCTION API HANDLER
 * This endpoint is designed for Vercel/Netlify deployment.
 */
export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { to, subject, html, pdf, fnm, lastName, businessName } = req.body;

  try {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      throw new Error('Internal Server Error: Missing Gateway Credentials');
    }

    const resend = new Resend(apiKey);

    const { data, error } = await resend.emails.send({
      from: `${businessName || 'Loan Portal'} <onboarding@resend.dev>`, 
      to: [to],
      subject: subject,
      html: html,
      attachments: [
        {
          filename: `${lastName}_Mortgage_Package.pdf`,
          content: pdf,
        },
        {
          filename: `${lastName}_Data_Export.fnm`,
          content: Buffer.from(fnm).toString('base64'),
        }
      ],
    });

    if (error) {
      console.error('[API_ERROR]', error);
      return res.status(500).json({ success: false, message: error.message });
    }

    return res.status(200).json({ success: true, id: data?.id });

  } catch (error: any) {
    console.error('[API_FATAL]', error.message);
    return res.status(500).json({ success: false, message: error.message });
  }
}
