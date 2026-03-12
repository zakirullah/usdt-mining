import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { PrismaClient } from '@prisma/client';

// One-time setup endpoint to initialize database and create admin
// DELETE THIS FILE AFTER SETUP

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, secret } = body;
    
    // Simple secret to prevent unauthorized access
    if (secret !== 'setup-admin-2025-secure') {
      return NextResponse.json({ error: 'Invalid secret' }, { status: 403 });
    }
    
    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }
    
    const results: string[] = [];
    
    // Step 1: Try to create admin settings (this will fail if table exists)
    try {
      await db.adminSettings.create({
        data: {
          siteName: 'USDT Mining Lab',
          depositWallet: '0x0000000000000000000000000000000000000000',
          minDeposit: 10,
          minWithdraw: 10
        }
      });
      results.push('Admin settings created');
    } catch (e: any) {
      results.push(`Admin settings: ${e.message || 'Already exists'}`);
    }
    
    // Step 2: Try to create mining plan
    try {
      await db.miningPlan.create({
        data: {
          name: 'Starter Mining Plan',
          dailyProfit: 4,
          duration: 30,
          minInvest: 10,
          maxInvest: 100000
        }
      });
      results.push('Mining plan created');
    } catch (e: any) {
      results.push(`Mining plan: ${e.message || 'Already exists'}`);
    }
    
    // Step 3: Find or create admin user
    let user;
    const existingUser = await db.user.findUnique({
      where: { email }
    });
    
    if (existingUser) {
      user = await db.user.update({
        where: { email },
        data: { role: 'admin' }
      });
      results.push('User updated to admin');
    } else {
      // Generate unique values
      const timestamp = Date.now();
      const randomHex = Math.random().toString(16).substring(2, 10);
      const walletAddress = `0x${randomHex.padEnd(40, '0').slice(0, 40)}`;
      const referralCode = `ADM${timestamp.toString(36).toUpperCase()}${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
      
      user = await db.user.create({
        data: {
          email: email,
          password: 'temp_' + timestamp,
          walletAddress: walletAddress,
          securityPin: '123456',
          referralCode: referralCode,
          role: 'admin'
        }
      });
      results.push('Admin user created');
    }
    
    return NextResponse.json({ 
      success: true, 
      results,
      user: { 
        id: user.id,
        email: user.email, 
        walletAddress: user.walletAddress,
        role: user.role,
        referralCode: user.referralCode
      },
      note: 'Your temporary PIN is 123456. Login with your wallet address and PIN to access admin panel.'
    });
  } catch (error: any) {
    console.error('Setup error:', error);
    return NextResponse.json({ 
      error: 'Setup failed', 
      details: error.message,
      code: error.code
    }, { status: 500 });
  }
}
