import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/utils/config/connectDB";
import StudentLeads from "@/utils/models/StudentLeadsSchema";
import ReferralPartner from "@/utils/models/ReferralPartnerSchema";



interface ValidationError extends Error {
  name: string;
  errors: Record<string, { message: string }>;
}

interface QueryFilter {  
  referralPartner?: string;
  $or?: Array<{
    name?: { $regex: string; $options: string };
    email?: { $regex: string; $options: string };
    phone?: { $regex: string; $options: string };
    courseApplied?: { $regex: string; $options: string };
    countryPreference?: { $regex: string; $options: string };
  }>;
}

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search") || "";
    const referralPartnerId = searchParams.get("referralPartnerId");

    const skip = (page - 1) * limit;


    const query: QueryFilter = {};

    // Filter by referral partner if provided
    if (referralPartnerId) {
      query.referralPartner = referralPartnerId;  // Changed to match the actual field in database
    }

    // Search functionality
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { phone: { $regex: search, $options: "i" } },
        { courseApplied: { $regex: search, $options: "i" } },
        { countryPreference: { $regex: search, $options: "i" } }
      ];
    }

    const studentLeads = await StudentLeads.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    // Populate referral partner names
    for (const lead of studentLeads) {
      if (lead.referralPartner) {
        const partner = await ReferralPartner.findById(lead.referralPartner);
        if (partner) {
          lead.referralPartner = {
            id: partner._id,
            name: partner.name
          };
        }
      }
    }

    const total = await StudentLeads.countDocuments(query);

    return NextResponse.json({
      success: true,
      data: studentLeads,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching student leads:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch student leads" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();
    
    // Check if student with same email already exists
    const existingStudent = await StudentLeads.findOne({ email: body.email });
    if (existingStudent) {
      return NextResponse.json(
        { success: false, error: "A student with this email already exists" },
        { status: 400 }
      );
    }
    
    const studentLead = new StudentLeads(body);
    await studentLead.save();

    return NextResponse.json(
      {
        success: true,
        data: studentLead,
        message: "Student lead created successfully",
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    console.error("Error creating student lead:", error);

    // Handle Mongoose validation errors
    if (error instanceof Error && error.name === "ValidationError") {
      const validationError = error as ValidationError;
      const errors = Object.values(validationError.errors).map(
        (err) => err.message
      );
      return NextResponse.json(
        { success: false, error: errors.join(", ") },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: "Failed to create student lead" },
      { status: 500 }
    );
  }
}
