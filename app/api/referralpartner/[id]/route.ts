import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/utils/config/connectDB';
import ReferralPartner from '@/utils/models/ReferralPartnerSchema';

interface MongoError extends Error {
  code?: number;
}

interface ValidationError extends Error {
  name: string;
  errors: Record<string, { message: string }>;
} 
 
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    
    const { id } = await params;
    const partner = await ReferralPartner.findById(id);
    
    if (!partner) {
      return NextResponse.json(
        { success: false, error: 'Referral partner not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      data: partner
    });
  } catch (error) {
    console.error('Error fetching referral partner:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch referral partner' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    
    const { id } = await params;
    const body = await request.json();

    // Check if another partner with the same email or phone exists (excluding current partner)
    if (body.email || body.phone) {
      const existingPartner = await ReferralPartner.findOne({
        $or: [
          { email: body.email?.toLowerCase() },
          { phone: body.phone }
        ],
        _id: { $ne: id } // Exclude current partner from check
      });

      if (existingPartner) {
        const field = existingPartner.email === body.email?.toLowerCase() ? 'email' : 'phone';
        return NextResponse.json(
          { success: false, error: `A partner with this ${field} already exists` },
          { status: 400 }
        );
      }
    }

    // Convert email to lowercase before update
    if (body.email) {
      body.email = body.email.toLowerCase();
    }

    const partner = await ReferralPartner.findByIdAndUpdate(
      id,
      body,
      { new: true, runValidators: true }
    );
    
    if (!partner) {
      return NextResponse.json(
        { success: false, error: 'Referral partner not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      data: partner,
      message: 'Referral partner updated successfully'
    });
  } catch (error: unknown) {
    console.error('Error updating referral partner:', error);
    
    // Handle MongoDB duplicate key error
    if (error instanceof Error && 'code' in error && (error as MongoError).code === 11000) {
      return NextResponse.json(
        { success: false, error: 'Partner already exists' },
        { status: 400 }
      );
    }
    
    // Handle Mongoose validation errors
    if (error instanceof Error && error.name === 'ValidationError') {
      const validationError = error as ValidationError;
      const errors = Object.values(validationError.errors).map((err) => err.message);
      return NextResponse.json(
        { success: false, error: errors.join(', ') },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { success: false, error: 'Failed to update referral partner' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    
    const { id } = await params;
    const partner = await ReferralPartner.findByIdAndDelete(id);
    
    if (!partner) {
      return NextResponse.json(
        { success: false, error: 'Referral partner not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      message: 'Referral partner deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting referral partner:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete referral partner' },
      { status: 500 }
    );
  }
}