// Development email service that logs emails instead of sending them
// This is useful when SMTP is not configured

export async function sendEmailDev({ to, subject, text, html, content = {} }) {
  const { title, subtitle, description, buttonLabel, buttonUrl } = content;

  // Log the email details instead of sending
  console.log('\n📧 EMAIL WOULD BE SENT (Development Mode):');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`📬 To: ${to}`);
  console.log(`📋 Subject: ${subject}`);
  console.log(`📝 Title: ${title || 'N/A'}`);
  console.log(`📄 Subtitle: ${subtitle || 'N/A'}`);
  console.log(`🔗 Button URL: ${buttonUrl || 'N/A'}`);
  console.log(`📖 Description: ${description || 'N/A'}`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  if (buttonUrl) {
    console.log(`🔗 Verification Link: ${buttonUrl}`);
    console.log('💡 Copy this link to verify your account manually');
  }
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  // Return success to simulate email sent
  return { success: true };
} 