import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/utils/config/connectDB';
import StudentLeads from '@/utils/models/StudentLeadsSchema';
import ReferralPartner from '@/utils/models/ReferralPartnerSchema';

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
    const studentLead = await StudentLeads.findById(id);
    
    if (!studentLead) {
      return NextResponse.json(
        { success: false, error: 'Student lead not found' },
        { status: 404 }
      );
    }

    // Populate referral partner details
    if (studentLead.referralPartner) {
      const partner = await ReferralPartner.findById(studentLead.referralPartner);
      if (partner) {
        studentLead.referralPartner = {
          id: partner._id,
          name: partner.name
        };
      }
    }
    
    return NextResponse.json({
      success: true,
      data: studentLead
    });
  } catch (error) {
    console.error('Error fetching student lead:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch student lead' },
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
    
    // Check if another student with the same email exists (excluding the current student)
    const existingStudent = await StudentLeads.findOne({
      email: body.email,
      _id: { $ne: id } // Exclude current student from check
    });
    
    if (existingStudent) {
      return NextResponse.json(
        { success: false, error: "A student with this email already exists" },
        { status: 400 }
      );
    }
    
    const studentLead = await StudentLeads.findByIdAndUpdate(
      id,
      body,
      { new: true, runValidators: true }
    );
    
    if (!studentLead) {
      return NextResponse.json(
        { success: false, error: 'Student lead not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      data: studentLead,
      message: 'Student lead updated successfully'
    });
  } catch (error: unknown) {
    console.error('Error updating student lead:', error);
    
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
      { success: false, error: 'Failed to update student lead' },
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
    const studentLead = await StudentLeads.findByIdAndDelete(id);
    
    if (!studentLead) {
      return NextResponse.json(
        { success: false, error: 'Student lead not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      message: 'Student lead deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting student lead:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete student lead' },
      { status: 500 }
    );
  }
}