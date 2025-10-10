import path from 'path';
import nodemailer from 'nodemailer';

export async function sendEmail({ to, subject, text, html, content = {} }) {
  const { title, subtitle, description, buttonLabel, buttonUrl, eventDetails } =
    content;

  // Build the email HTML template with inline conditions for each section.
  const emailHtml =
    html ??
    `
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <meta http-equiv="X-UA-Compatible" content="IE=edge" />
          <title>${subject}</title>
          <style>
            /* Dark mode support for email clients */
            @media (prefers-color-scheme: dark) {
              .email-container {
                background-color: #1a1a1a !important;
                color: #ffffff !important;
              }
              .email-content {
                background-color: #2a2a2a !important;
                color: #ffffff !important;
                border-color: #404040 !important;
              }
              .email-text {
                color: #ffffff !important;
              }
              .email-subtitle {
                color: #cccccc !important;
              }
              .email-link {
                color: #dc2626 !important;
              }
            }
            /* Outlook specific fixes */
            .outlook-group-fix { width: 100%; }
          </style>
        </head>
        <body style="margin: 0; padding: 0; background-color: #ffffff; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
          <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" class="email-container" style="background-color: #f8f9fa;">
            <tr>
              <td align="center" style="padding: 50px 20px;">
                <!-- Main Container -->
                <table role="presentation" width="600" border="0" cellspacing="0" cellpadding="0" class="email-content" style="background-color: #ffffff; max-width: 600px; border: 1px solid #e8e8e8;">
                  
                  <!-- Branded Header with Logo -->
                  <tr>
                    <td style="padding: 40px 50px 30px 50px; text-align: center; border-bottom: 3px solid #e8e8e8; background-color: #ffffff;">
                      <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://nimto.app'}" style="display: inline-block; text-decoration: none;">
                        <img
                          src="cid:nimto-logo"
                          alt="Nimto Logo"
                          style="display: block;"
                        />
                      </a>
                    </td>
                  </tr>

                  <!-- Content Section -->
                  <tr>
                    <td style="padding: 50px 50px 40px 50px;">
                      ${title ? `<h2 class="email-text" style="margin: 0 0 16px 0; font-size: 24px; font-weight: 600; color: #1a1a1a; line-height: 1.4;">${title}</h2>` : ''}
                      ${subtitle ? `<p class="email-subtitle" style="margin: 0 0 30px 0; font-size: 16px; color: #4a4a4a; line-height: 1.6; font-weight: 400;">${subtitle}</p>` : ''}
                      
                      ${
                        eventDetails &&
                        (eventDetails.date ||
                          eventDetails.time ||
                          eventDetails.location ||
                          eventDetails.eventDescription)
                          ? `
                        <!-- Event Details Box -->
                        <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="margin: 32px 0; border: 1px solid #e0e0e0; background-color: #fafafa;">
                          <tr>
                            <td style="padding: 30px;">
                              ${
                                eventDetails.date
                                  ? `
                              <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-bottom: 16px;">
                                <tr>
                                  <td style="padding: 0;">
                                    <p style="margin: 0 0 4px 0; font-size: 11px; color: #888888; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600;">Date</p>
                                    <p style="margin: 0; font-size: 16px; color: #1a1a1a; font-weight: 500;">${eventDetails.date}</p>
                                  </td>
                                </tr>
                              </table>`
                                  : ''
                              }
                              ${
                                eventDetails.time
                                  ? `
                              <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-bottom: 16px;">
                                <tr>
                                  <td style="padding: 0;">
                                    <p style="margin: 0 0 4px 0; font-size: 11px; color: #888888; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600;">Time</p>
                                    <p style="margin: 0; font-size: 16px; color: #1a1a1a; font-weight: 500;">${eventDetails.time}</p>
                                  </td>
                                </tr>
                              </table>`
                                  : ''
                              }
                              ${
                                eventDetails.location
                                  ? `
                              <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-bottom: 16px;">
                                <tr>
                                  <td style="padding: 0;">
                                    <p style="margin: 0 0 4px 0; font-size: 11px; color: #888888; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600;">Location</p>
                                    <p style="margin: 0; font-size: 16px; color: #1a1a1a; font-weight: 500;">${eventDetails.location}</p>
                                  </td>
                                </tr>
                              </table>`
                                  : ''
                              }
                              ${
                                eventDetails.eventDescription
                                  ? `
                              <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #e0e0e0;">
                                <tr>
                                  <td style="padding: 0;">
                                    <p style="margin: 0 0 8px 0; font-size: 11px; color: #888888; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600;">About This Event</p>
                                    <p style="margin: 0; font-size: 15px; color: #4a4a4a; line-height: 1.7;">${eventDetails.eventDescription}</p>
                                  </td>
                                </tr>
                              </table>`
                                  : ''
                              }
                            </td>
                          </tr>
                        </table>`
                          : ''
                      }
                      
                      ${
                        description
                          ? `<p class="email-text" style="margin: 28px 0; font-size: 15px; color: #4a4a4a; line-height: 1.7;">${description}</p>`
                          : ''
                      }
                      
                      ${
                        buttonLabel && buttonUrl
                          ? `
                        <!-- CTA Button with Branded Background -->
                        <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="margin: 36px 0 28px 0;">
                          <tr>
                            <td align="center" style="padding: 0;">
                              <!--[if mso]>
                              <v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word" href="${buttonUrl}" style="height:48px;v-text-anchor:middle;width:280px;" arcsize="8%" stroke="f" fillcolor="#dc2626">
                                <w:anchorlock/>
                                <center style="color:#ffffff;font-family:Arial,sans-serif;font-size:15px;font-weight:600;letter-spacing:0.5px;text-transform:uppercase;">${buttonLabel}</center>
                              </v:roundrect>
                              <![endif]-->
                              <!--[if !mso]><!-->
                              <a href="${buttonUrl}" style="display: inline-block; background-color: #dc2626 !important; background: #dc2626 !important; color: #ffffff !important; padding: 16px 48px; text-decoration: none; font-size: 15px; font-weight: 600; letter-spacing: 0.5px; text-transform: uppercase; border-radius: 8px; box-shadow: 0 4px 15px rgba(220, 38, 38, 0.4); mso-padding-alt: 0; border: 2px solid #dc2626;">
                              <!--<![endif]-->
                                ${buttonLabel}
                              </a>
                            </td>
                          </tr>
                        </table>
                        <p style="margin: 24px 0 0 0; font-size: 13px; color: #888888; text-align: center; line-height: 1.6;">
                          Or copy this link:<br/>
                          <a href="${buttonUrl}" class="email-link" style="color: #dc2626; text-decoration: underline; word-break: break-all;">${buttonUrl}</a>
                        </p>`
                          : ''
                      }
                    </td>
                  </tr>

                  <!-- Signature -->
                  <tr>
                    <td style="padding: 0 50px 40px 50px;">
                      <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="border-top: 1px solid #e8e8e8; padding-top: 30px;">
                        <tr>
                          <td>
                            <p style="margin: 0 0 6px 0; font-size: 15px; color: #1a1a1a; line-height: 1.5;">
                              Best regards,
                            </p>
                            <p style="margin: 0; font-size: 15px; color: #1a1a1a; font-weight: 600;">
                              The Nimto Team
                            </p>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>

                  <!-- Footer -->
                  <tr>
                    <td style="padding: 30px 50px; background-color: #fafafa; border-top: 1px solid #e8e8e8;">
                      <p style="margin: 0; font-size: 12px; color: #888888; line-height: 1.6; text-align: center;">
                        © ${new Date().getFullYear()} <span style="color: #dc2626; font-weight: 600;">Nimto</span>. All rights reserved.
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
      </html>`;

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: 587,
    secure: false, // true for port 465, false for other ports
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  const mailOptions = {
    from: `${process.env.SMTP_SENDER} <${process.env.SMTP_FROM}>`,
    to,
    subject,
    text,
    html: emailHtml,
    attachments: [
      {
        filename: 'nimto_main_logo_png.png',
        path: path.join(
          process.cwd(),
          'public',
          'media',
          'app',
          'nimto_main_logo_png.png',
        ),
        cid: 'nimto-logo', // referenced in the HTML img src above
      },
    ],
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Email sent to ${to}`);
  } catch (error) {
    console.error(`Error sending email to ${to}:`, error);

    // Provide more specific error messages
    if (error.code === 'EAUTH') {
      throw new Error(
        'Email authentication failed. Please check SMTP credentials.',
      );
    } else if (error.code === 'ECONNECTION') {
      throw new Error(
        'Failed to connect to email server. Please check SMTP settings.',
      );
    } else if (error.code === 'ETIMEDOUT') {
      throw new Error('Email server connection timed out.');
    } else {
      throw new Error(`Email sending failed: ${error.message}`);
    }
  }
}
