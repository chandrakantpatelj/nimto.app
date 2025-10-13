import { sendEmail } from '@/services/send-email';
import validator from 'validator';

const RECAPTCHA_SECRET = process.env.NEXT_PUBLIC_V3_RECAPTCHA_SECRET_KEY; // Set this in your .env
const CONTACT_FORM_TO_EMAIL = process.env.CONTACT_FORM_TO_EMAIL; // <-- Add this

async function verifyRecaptcha(token) {
    const res = await fetch(
        `https://www.google.com/recaptcha/api/siteverify`,
        {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: `secret=${RECAPTCHA_SECRET}&response=${token}`,
        }
    );
    const data = await res.json();
    return data.success && data.score > 0.5;
}

function sanitizeInput(input) {
    // Remove any HTML tags and trim
    return validator.escape(validator.stripLow(input, true)).trim();
}

export async function POST(req) {
    try {
        const body = await req.json();
        const { name, email, subject, message, inquiryType, recaptchaToken } = body;

        // Basic validation
        if (
            !name ||
            !email ||
            !subject ||
            !message ||
            !inquiryType ||
            !recaptchaToken
        ) {
            return new Response(
                JSON.stringify({ error: 'All fields are required.' }),
                { status: 400 }
            );
        }

        // Validate and sanitize
        const safeName = sanitizeInput(name);
        const safeEmail = validator.normalizeEmail(email);
        const safeSubject = sanitizeInput(subject);
        const safeMessage = sanitizeInput(message);
        const safeInquiryType = sanitizeInput(inquiryType);

        if (!validator.isEmail(safeEmail)) {
            return new Response(
                JSON.stringify({ error: 'Invalid email address.' }),
                { status: 400 }
            );
        }

        // Validate reCAPTCHA
        const recaptchaValid = await verifyRecaptcha(recaptchaToken);
        if (!recaptchaValid) {
            return new Response(
                JSON.stringify({ error: 'reCAPTCHA validation failed.' }),
                { status: 403 }
            );
        }

        // Compose email content
        const content = {
            title: 'New Contact Form Submission',
            subtitle: `Type: ${safeInquiryType}`,
            description: `
                <strong>Name:</strong> ${safeName}<br/>
                <strong>Email:</strong> ${safeEmail}<br/>
                <strong>Subject:</strong> ${safeSubject}<br/>
                <strong>Message:</strong><br/>${safeMessage.replace(/\n/g, '<br/>')}
            `,
        };

        await sendEmail({
            to: CONTACT_FORM_TO_EMAIL, // <-- Use env variable here
            subject: `[Contact] ${safeSubject}`,
            text: `Name: ${safeName}\nEmail: ${safeEmail}\nType: ${safeInquiryType}\nSubject: ${safeSubject}\nMessage:\n${safeMessage}`,
            content,
        });

        return new Response(JSON.stringify({ success: true }), { status: 200 });
    } catch (err) {
        console.error('API error:', err);
        return new Response(
            JSON.stringify({ error: err.message || 'Failed to send message.' }),
            { status: 500 }
        );
    }
}