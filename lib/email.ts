import sgMail from '@sendgrid/mail';
import type { Briefing } from './types';

const FONT_STACK = `'DM Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif`;

function formatEmailDate(dateStr: string): string {
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });
}

const CARD_BG = '#7d8a86';

function buildSectionHtml(
  section: Briefing['sections'][number],
  appUrl: string,
  date: string,
): string {
  const diveUrl = `${appUrl}/briefing/${date}?section=${section.slug}`;

  return `
    <!-- Spacer between cards -->
    <tr><td style="height: 10px; line-height: 10px; font-size: 10px;">&#8203;</td></tr>

    <!-- Section card -->
    <tr>
      <td style="background-color: ${CARD_BG}; border-radius: 14px; padding: 24px 26px 28px; border: 1px solid rgba(255,255,255,0.2);">

        <!-- Section label pill -->
        <p style="margin: 0 0 14px 0;"><span style="display: inline-block; background-color: #C94F3A; color: #ffffff; border-radius: 999px; padding: 4px 12px; font-size: 11px; letter-spacing: 0.1em; text-transform: uppercase; font-weight: 500; font-family: ${FONT_STACK};">${section.label}</span></p>

        <!-- Headline -->
        <h2 style="margin: 0 0 14px 0; font-size: 21px; font-weight: 700; letter-spacing: -0.02em; line-height: 1.2; color: #f0ede6; font-family: ${FONT_STACK};">${section.headline}</h2>

        <!-- Digest -->
        <p style="margin: 0 0 22px 0; font-size: 14px; line-height: 1.75; color: #c4ceca; font-family: ${FONT_STACK}; font-weight: 400;">${section.digest}</p>

        <!-- Pill CTA — solid white pill -->
        <table cellpadding="0" cellspacing="0" border="0" role="presentation">
          <tr>
            <td style="background-color: #ffffff; border-radius: 999px; line-height: 100%;">
              <a href="${diveUrl}" style="display: inline-block; padding: 8px 20px; font-size: 10px; font-weight: 600; letter-spacing: 0.13em; text-transform: uppercase; color: #C94F3A; text-decoration: none; font-family: ${FONT_STACK}; white-space: nowrap;">Dive deeper →</a>
            </td>
          </tr>
        </table>

      </td>
    </tr>`;
}

function buildEmailHtml(briefing: Briefing, appUrl: string): string {
  const sectionsHtml = briefing.sections
    .map(s => buildSectionHtml(s, appUrl, briefing.date))
    .join('');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Your Morning Briefing</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap');
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: #7d8a86; -webkit-text-size-adjust: 100%; mso-line-height-rule: exactly;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0" role="presentation" style="background-color: #7d8a86;">
    <tr>
      <td align="center" style="padding: 52px 20px 48px;">
        <table width="100%" cellpadding="0" cellspacing="0" border="0" role="presentation" style="max-width: 560px;">

          <!-- Masthead -->
          <tr>
            <td style="padding-bottom: 28px; border-bottom: 1px solid rgba(255,255,255,0.2);">
              <table width="100%" cellpadding="0" cellspacing="0" border="0" role="presentation">
                <tr>
                  <td valign="middle">
                    <span style="font-size: 22px; font-weight: 700; letter-spacing: -0.03em; color: #f0ede6; font-family: ${FONT_STACK};">Briefing</span>
                  </td>
                  <td align="right" valign="middle">
                    <span style="font-size: 10px; font-weight: 600; letter-spacing: 0.14em; text-transform: uppercase; color: rgba(255,255,255,0.45); font-family: ${FONT_STACK};">${formatEmailDate(briefing.date)}</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <tr><td style="height: 44px;"></td></tr>

          <!-- Sections -->
          ${sectionsHtml}

          <!-- Footer -->
          <tr>
            <td style="border-top: 1px solid rgba(255,255,255,0.2); padding-top: 28px;">
              <p style="margin: 0; font-size: 11px; color: rgba(255,255,255,0.4); text-align: center; font-family: ${FONT_STACK};">
                <a href="${appUrl}/briefing/${briefing.date}" style="color: rgba(255,255,255,0.45); text-decoration: none;">View full briefing online</a>
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

export async function sendFailureEmail(
  date: string,
  errorType: string,
  errorDetail: string,
  isBillingRelated: boolean,
): Promise<void> {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY!);

  const formattedDate = formatEmailDate(date);
  const appUrl = (process.env.APP_URL ?? '').replace(/\/$/, '');

  const lines = [
    `Your morning briefing for ${formattedDate} could not be generated.`,
    '',
    `Error: ${errorType}`,
    `Detail: ${errorDetail}`,
  ];

  if (isBillingRelated) {
    lines.push(
      '',
      'This looks like an Anthropic credit or billing issue.',
      'Check your balance and add credits here:',
      'https://platform.anthropic.com/settings/billing',
    );
  }

  if (appUrl) {
    lines.push(
      '',
      'Once the issue is resolved, you can manually retry:',
      `${appUrl}/api/generate?secret=${process.env.CRON_SECRET}`,
    );
  }

  await sgMail.send({
    to: process.env.RECIPIENT_EMAIL!,
    from: {
      email: process.env.SENDGRID_FROM_EMAIL!,
      name: 'Briefing',
    },
    subject: `⚠️ Morning Briefing Failed — ${formattedDate}`,
    text: lines.join('\n'),
  });
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
