import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// One-time setup endpoint to create admin user
// DELETE THIS FILE AFTER SETTING UP ADMIN

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, secret } = body;
    
    // Simple secret to prevent unauthorized access
    if (secret !== 'setup-admin-2025-secure') {
      return NextResponse.json({ error: 'Invalid secret' }, { status: 403 });
    }
    
    // Find user by email
    const existingUser = await db.user.findUnique({
      where: { email }
    });
    
    if (existingUser) {
      // Update to admin
      const updated = await db.user.update({
        where: { email },
        data: { role: 'admin' }
      });
      return NextResponse.json({ 
        success: true, 
        message: 'User updated to admin', 
        user: { email: updated.email, role: updated.role } 
      });
    } else {
      // Create admin user
      const newUser = await db.user.create({
        data: {
          email: email,
          password: 'temp_password_' + Date.now(),
          walletAddress: '0xAdmin' + Date.now().toString(16),
          securityPin: '123456',
          referralCode: 'ADMIN' + Math.random().toString(36).substring(2, 8).toUpperCase(),
          role: 'admin'
        }
      });
      return NextResponse.json({ 
        success: true, 
        message: 'Admin user created. Please update wallet address and PIN.', 
        user: { email: newUser.email, role: newUser.role } 
      });
    }
  } catch (error) {
    console.error('Admin setup error:', error);
    return NextResponse.json({ error: 'Failed to setup admin' }, { status: 500 });
  }
}
