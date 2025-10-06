import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import authOptions from '@/app/api/auth/[...nextauth]/auth-options';

export async function PATCH(req, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      console.log('No session found');
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { features } = await req.json();
    const { id } = await params;
    
    console.log('Updating features for event:', id, 'Features:', features);

    const event = await prisma.event.findUnique({
      where: { id },
      select: { createdByUserId: true },
    });

    if (!event) {
      console.log('Event not found:', id);
      return new NextResponse('Event not found', { status: 404 });
    }

    if (event.createdByUserId !== session.user.id) {
      console.log('User not authorized. Event creator:', event.createdByUserId, 'Session user:', session.user.id);
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // Update individual feature fields instead of a features object
    const updatedEvent = await prisma.event.update({
      where: { id },
      data: {
        privateGuestList: features.privateGuestList,
        allowPlusOnes: features.allowPlusOnes,
        allowMaybeRSVP: features.allowMaybeRSVP,
        allowFamilyHeadcount: features.allowFamilyHeadcount,
        limitEventCapacity: features.limitEventCapacity,
        maxEventCapacity: features.maxEventCapacity,
        maxPlusOnes: features.maxPlusOnes,
      },
    });

    console.log('Successfully updated event features');
    return NextResponse.json({ success: true, data: updatedEvent });
  } catch (error) {
    console.error('Error updating event features:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
