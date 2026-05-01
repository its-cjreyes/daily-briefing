import sgMail from '@sendgrid/mail';
import type { Briefing } from './types';

const SANS = `'DM Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif`;
const SERIF = `'Lora', Georgia, 'Times New Roman', serif`;

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
): string {
  const diveUrl = `${appUrl}/briefing/${date}?section=${section.slug}`;

  return `
    <!-- Spacer between cards -->
    <tr><td style="height: 10px; line-height: 10px; font-size: 10px;">&#8203;</td></tr>

    <!-- Section card -->
    <tr>
      <td class="em-card" style="background-color: #ffffff; border-radius: 14px; padding: 24px 26px 28px; border: 1px solid rgba(0,0,0,0.08);">

        <!-- Section label pill — orange, unchanged in both modes -->
        <p style="margin: 0 0 14px 0;"><span style="display: inline-block; background-color: #C94F3A; color: #ffffff; border-radius: 999px; padding: 4px 12px; font-size: 11px; letter-spacing: 0.1em; text-transform: uppercase; font-weight: 500; font-family: ${SANS};">${section.label}</span></p>

        <!-- Headline -->
        <h2 class="em-headline" style="margin: 0 0 14px 0; font-size: 21px; font-weight: 700; letter-spacing: -0.02em; line-height: 1.2; color: #1a1818; font-family: ${SANS};">${section.headline}</h2>

        <!-- Digest — Lora serif, justified -->
        <p class="em-body" style="margin: 0 0 22px 0; font-size: 15px; line-height: 1.8; color: #4a4642; font-family: ${SERIF}; font-weight: 400; text-align: justify;">${section.digest}</p>

        <!-- Pill CTA — light mode: orange bg, white text -->
        <table cellpadding="0" cellspacing="0" border="0" role="presentation">
          <tr>
            <td class="em-cta-cell" style="background-color: #C94F3A; border-radius: 999px; line-height: 100%;">
              <a class="em-cta-link" href="${diveUrl}" style="display: inline-block; padding: 8px 20px; font-size: 10px; font-weight: 600; letter-spacing: 0.13em; text-transform: uppercase; color: #ffffff; text-decoration: none; font-family: ${SANS}; white-space: nowrap;">Dive deeper →</a>
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
  <meta name="color-scheme" content="light dark" />
  <meta name="supported-color-schemes" content="light dark" />
  <title>Your Morning Briefing</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Lora:wght@400;500&display=swap');

    :root { color-scheme: light dark; }

    @media (prefers-color-scheme: dark) {
      body, .em-bg { background-color: #0f0f0f !important; }
      .em-card { background-color: #1a1a1a !important; border: 1px solid rgba(255,255,255,0.08) !important; }
      .em-wordmark { color: #f0ede6 !important; }
      .em-date { color: rgba(255,255,255,0.45) !important; }
      .em-masthead-row { border-bottom: 1px solid rgba(255,255,255,0.15) !important; }
      .em-headline { color: #ffffff !important; }
      .em-body { color: #f0ede6 !important; }
      .em-cta-cell { background-color: #ffffff !important; }
      .em-cta-link { color: #C94F3A !important; }
      .em-footer-row { border-top: 1px solid rgba(255,255,255,0.15) !important; }
      .em-footer-link { color: rgba(255,255,255,0.45) !important; }
    }
  </style>
</head>
<body class="em-bg" style="margin: 0; padding: 0; background-color: #f4f3ef; -webkit-text-size-adjust: 100%; mso-line-height-rule: exactly;">
  <table class="em-bg" width="100%" cellpadding="0" cellspacing="0" border="0" role="presentation" style="background-color: #f4f3ef;">
    <tr>
      <td align="center" style="padding: 52px 20px 48px;">
        <table width="100%" cellpadding="0" cellspacing="0" border="0" role="presentation" style="max-width: 560px;">

          <!-- Masthead -->
          <tr>
            <td class="em-masthead-row" style="padding-bottom: 28px; border-bottom: 1px solid rgba(0,0,0,0.1);">
              <table width="100%" cellpadding="0" cellspacing="0" border="0" role="presentation">
                <tr>
                  <td valign="middle">
                    <span class="em-wordmark" style="font-size: 22px; font-weight: 700; letter-spacing: -0.03em; color: #1a1818; font-family: ${SANS};">Briefing</span>
                  </td>
                  <td align="right" valign="middle">
                    <span class="em-date" style="font-size: 10px; font-weight: 600; letter-spacing: 0.14em; text-transform: uppercase; color: #8a857e; font-family: ${SANS};">${formatEmailDate(briefing.date)}</span>
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
            <td class="em-footer-row" style="border-top: 1px solid rgba(0,0,0,0.08); padding-top: 28px;">
              <p style="margin: 0; font-size: 11px; text-align: center; font-family: ${SANS};">
                <a class="em-footer-link" href="${appUrl}/briefing/${briefing.date}" style="color: #8a857e; text-decoration: none;">View full briefing online</a>
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
