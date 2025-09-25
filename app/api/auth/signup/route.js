// pages/api/auth/signup.ts
import { NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import prisma from '@/lib/prisma';
import { verifyRecaptchaToken } from '@/lib/recaptcha';
import { sendEmail } from '@/services/send-email';
import { getSignupSchema } from '@/app/(auth)/forms/signup-schema';
import { UserStatus } from '@/app/models/user';

// Helper function to generate a verification token and send the email.
async function sendVerificationEmail(user, callbackUrl = '/templates') {
  try {
    // Create a new verification token.
    const token = await prisma.verificationToken.create({
      data: {
        identifier: user.id,
        token: bcrypt.hashSync(user.id, 10),
        expires: new Date(Date.now() + 1 * 60 * 60 * 1000), // 1 hour from now
      },
    });
    console.log("token", token);

    // Construct the verification URL with callbackUrl parameter.
    const verificationUrl = `${process.env.NEXTAUTH_URL}/verify-email?token=${token.token}&callbackUrl=${encodeURIComponent(callbackUrl)}`;

    // Send the verification email.
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
    
    // If it's a constraint violation, try to fix the database first
    if (error.code === 'P2011') {
      console.log('Attempting to fix verification token table...');
      // You could call the fix script here or handle it differently
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

    // Parse the request body as JSON.
    const body = await req.json();

    // Extract callbackUrl from body if present
    const { callbackUrl, ...signupData } = body;

    // Validate the data using safeParse.
    const result = getSignupSchema().safeParse(signupData);
    if (!result.success) {
      return NextResponse.json(
        {
          message: 'Invalid input. Please check your data and try again.',
        },
        { status: 400 },
      );
    }

    const { email, password, name, isHost } = result.data;

    // Check if a user with the given email already exists.
    const existingUser = await prisma.user.findUnique({
      where: { email },
      include: { role: true },
    });

    if (existingUser) {
      if (existingUser.status === UserStatus.INACTIVE) {
        // Resend verification email for inactive user.
        try {
          // Try to delete existing tokens, but don't fail if it doesn't work
          await prisma.verificationToken.deleteMany({
            where: { identifier: existingUser.id },
          });
        } catch (error) {
          console.log('Could not delete existing verification tokens:', error.message);
          // Continue with creating new token
        }
        await sendVerificationEmail(existingUser);
        return NextResponse.json(
          { message: 'Verification email resent. Please check your email.' },
          { status: 200 },
        );
      } else {
        // User exists and is active.
        return NextResponse.json(
          { message: 'Email is already registered.' },
          { status: 409 },
        );
      }
    }

    // Determine the role based on isHost value
    let roleToAssign;
    if (isHost) {
      // Find the host role
      roleToAssign = await prisma.userRole.findFirst({
        where: { slug: 'host' },
      });
    } else {
      // Find the default role (isDefault: true)
      roleToAssign = await prisma.userRole.findFirst({
        where: { isDefault: true },
      });
    }

    // Fallback to default role if host role not found
    if (!roleToAssign) {
      roleToAssign = await prisma.userRole.findFirst({
        where: { isDefault: true },
      });
    }
  
    if (!roleToAssign) {
      throw new Error('No suitable role found. Unable to create a new user.');
    }

    // Hash the password.
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new user with INACTIVE status.
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        status: UserStatus.INACTIVE,
        roleId: roleToAssign.id,
      },
      include: { role: true },
    });
    console.log("user", user)
    // Send the verification email with callbackUrl.
    await sendVerificationEmail(user, callbackUrl || '/templates');

    return NextResponse.json(
      {
        message:
          'Registration successful. Check your email to verify your account.',
      },
      { status: 200 },
    );
  } catch(e) {
    console.log("e",e)
    return NextResponse.json(
      { message: 'Registration failed. Please try again later.' },
      { status: 500 },
    );
  }
}
