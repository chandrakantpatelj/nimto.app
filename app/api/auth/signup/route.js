import { NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import prisma from '@/lib/prisma';
import { verifyRecaptchaToken } from '@/lib/recaptcha';
import { sendEmail } from '@/services/send-email';
import { getSignupSchema } from '@/app/(auth)/forms/signup-schema';
import { UserStatus } from '@/app/models/user';

async function sendVerificationEmail(user, callbackUrl = '/templates') {
    try {
        const token = await prisma.verificationToken.create({
            data: {
                identifier: user.id,
                token: bcrypt.hashSync(user.id, 10),
                expires: new Date(Date.now() + 1 * 60 * 60 * 1000),
            },
        });

        const verificationUrl = `${process.env.NEXTAUTH_URL}/verify-email?token=${token.token}&callbackUrl=${encodeURIComponent(callbackUrl)}`;

        await sendEmail({
            to: user.email,
            subject: 'Account Activation',
            content: {
                title: `Hello, ${user.name}`,
                subtitle:
                    'Click the below link to verify your email address and activate your account.',
                buttonLabel: 'Activate account',
                buttonUrl: verificationUrl,
                description:
                    'This link is valid for 1 hour. If you did not request this email you can safely ignore it.',
            },
        });
    } catch (error) {
        console.error('Error creating verification token:', error);
        if (error.code === 'P2011') {
            throw new Error('Database schema issue detected. Please run the fix script.');
        }
        throw error;
    }
}

export async function POST(req) {
    try {
        const recaptchaToken = req.headers.get('x-recaptcha-token');
        if (!recaptchaToken) {
            return NextResponse.json(
                { message: 'reCAPTCHA verification required' },
                { status: 400 },
            );
        }

        const isValidToken = await verifyRecaptchaToken(recaptchaToken);
        if (!isValidToken) {
            return NextResponse.json(
                { message: 'reCAPTCHA verification failed' },
                { status: 400 },
            );
        }

        const body = await req.json();
        const { callbackUrl, timezone, ...signupData } = body;

        // Validate the data using safeParse.
        const result = getSignupSchema().safeParse(signupData);
        if (!result.success) {
            return NextResponse.json(
                { message: 'Invalid input. Please check your data and try again.' },
                { status: 400 },
            );
        }

        const { email, password, name, isHost } = result.data;

        const existingUser = await prisma.user.findUnique({
            where: { email },
            include: { role: true },
        });

        if (existingUser) {
            if (existingUser.status === UserStatus.INACTIVE) {
                try {
                    await prisma.verificationToken.deleteMany({
                        where: { identifier: existingUser.id },
                    });
                } catch (error) {
                    // Continue with creating new token
                }
                await sendVerificationEmail(existingUser);
                return NextResponse.json(
                    { message: 'Verification email resent. Please check your email.' },
                    { status: 200 },
                );
            } else {
                return NextResponse.json(
                    { message: 'Email is already registered.' },
                    { status: 409 },
                );
            }
        }

        let roleToAssign;
        if (isHost) {
            roleToAssign = await prisma.userRole.findFirst({
                where: { slug: 'host' },
            });
        } else {
            roleToAssign = await prisma.userRole.findFirst({
                where: { isDefault: true },
            });
        }
        if (!roleToAssign) {
            roleToAssign = await prisma.userRole.findFirst({
                where: { isDefault: true },
            });
        }
        if (!roleToAssign) {
            throw new Error('No suitable role found. Unable to create a new user.');
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                name,
                status: UserStatus.INACTIVE,
                roleId: roleToAssign.id,
                timezone, // <-- Added timezone here
            },
            include: { role: true },
        });

        await sendVerificationEmail(user, callbackUrl || '/templates');

        return NextResponse.json(
            {
                message:
                    'Registration successful. Check your email to verify your account.',
            },
            { status: 200 },
        );
    } catch (e) {
        return NextResponse.json(
            { message: 'Registration failed. Please try again later.' },
            { status: 500 },
        );
    }
}