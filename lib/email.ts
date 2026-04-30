import sgMail from '@sendgrid/mail';
import type { Briefing } from './types';

function formatEmailDate(dateStr: string): string {
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });
}

function buildSectionHtml(
  section: Briefing['sections'][number],
  appUrl: string,
  date: string,
  isFirst: boolean,
): string {
  const divider = isFirst
    ? ''
    : `<tr><td style="padding: 0 0 36px 0;"><hr style="border: none; border-top: 1px solid rgba(201,169,110,0.15); margin: 0;" /></td></tr>`;

  return `
    ${divider}
    <tr>
      <td style="padding: 0 0 36px 0;">
        <p style="margin: 0 0 10px 0; font-size: 11px; letter-spacing: 0.12em; text-transform: uppercase; color: #c9a96e; font-family: Arial, Helvetica, sans-serif;">${section.label}</p>
        <h2 style="margin: 0 0 12px 0; font-size: 22px; font-weight: normal; letter-spacing: -0.01em; line-height: 1.35; color: #f0ede6; font-family: Georgia, 'Times New Roman', serif;">${section.headline}</h2>
        <p style="margin: 0 0 18px 0; font-size: 15px; line-height: 1.7; color: #a0a09a; font-family: Arial, Helvetica, sans-serif;">${section.digest}</p>
        <a href="${appUrl}/briefing/${date}?section=${section.slug}" style="font-size: 13px; color: #c9a96e; font-family: Arial, Helvetica, sans-serif; text-decoration: none; letter-spacing: 0.04em;">Dive deeper →</a>
      </td>
    </tr>`;
}

function buildEmailHtml(briefing: Briefing, appUrl: string): string {
  const sectionsHtml = briefing.sections
    .map((s, i) => buildSectionHtml(s, appUrl, briefing.date, i === 0))
    .join('');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Your Morning Briefing</title>
</head>
<body style="margin: 0; padding: 0; background-color: #0a0a0a; -webkit-text-size-adjust: 100%; mso-line-height-rule: exactly;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0" role="presentation" style="background-color: #0a0a0a;">
    <tr>
      <td align="center" style="padding: 48px 20px 40px;">
        <table width="100%" cellpadding="0" cellspacing="0" border="0" role="presentation" style="max-width: 560px;">

          <!-- Masthead -->
          <tr>
            <td style="padding-bottom: 24px; border-bottom: 1px solid rgba(201,169,110,0.25);">
              <table width="100%" cellpadding="0" cellspacing="0" border="0" role="presentation">
                <tr>
                  <td>
                    <span style="font-size: 36px; font-weight: normal; font-style: italic; letter-spacing: -0.02em; color: #f0ede6; font-family: Georgia, 'Times New Roman', serif;">Briefing</span>
                  </td>
                  <td align="right" valign="bottom">
                    <span style="font-size: 13px; color: #5a5754; font-family: Arial, Helvetica, sans-serif;">${formatEmailDate(briefing.date)}</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <tr><td style="height: 36px;"></td></tr>

          <!-- Sections -->
          ${sectionsHtml}

          <!-- Footer -->
          <tr>
            <td style="border-top: 1px solid rgba(201,169,110,0.1); padding-top: 28px;">
              <p style="margin: 0; font-size: 12px; color: #3a3734; text-align: center; font-family: Arial, Helvetica, sans-serif;">
                <a href="${appUrl}/briefing/${briefing.date}" style="color: #7a7470; text-decoration: none;">View full briefing online</a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export async function sendBriefingEmail(briefing: Briefing): Promise<void> {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY!);

  const appUrl = (process.env.APP_URL ?? '').replace(/\/$/, '');
  const formattedDate = formatEmailDate(briefing.date);

  await sgMail.send({
    to: process.env.RECIPIENT_EMAIL!,
    from: {
      email: process.env.SENDGRID_FROM_EMAIL!,
      name: 'Briefing',
    },
    subject: `Your Morning Briefing — ${formattedDate}`,
    html: buildEmailHtml(briefing, appUrl),
  });
}
