import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { randomBytes } from 'crypto';

// Check admin access
async function checkAdmin(request: NextRequest) {
  const token = request.cookies.get('auth_token')?.value;

  if (!token) {
    return null;
  }

  const session = await db.session.findUnique({
    where: { token },
    include: { user: true }
  });

  if (!session || session.expiresAt < new Date() || session.user.role !== 'admin') {
    return null;
  }

  return session;
}

export async function POST(request: NextRequest) {
  try {
    const session = await checkAdmin(request);
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized. Admin access required.' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { title, message, type = 'info' } = body;

    if (!title || !message) {
      return NextResponse.json(
        { error: 'Title and message are required' },
        { status: 400 }
      );
    }

    // Create notifications for all users
    const users = await db.user.findMany({
      where: { isActive: true },
      select: { id: true }
    });

    // Create notification for each user
    const notifications = await Promise.all(
      users.map(user => 
        db.notification.create({
          data: {
            userId: user.id,
            type: 'broadcast',
            message: `${title}: ${message}`
          }
        })
      )
    );

    return NextResponse.json({
      success: true,
      message: `Broadcast sent to ${notifications.length} users`,
      recipients: notifications.length
    });
  } catch (error) {
    console.error('Broadcast error:', error);
    return NextResponse.json(
      { error: 'Failed to send broadcast' },
      { status: 500 }
    );
  }
}
