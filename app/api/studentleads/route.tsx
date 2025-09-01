import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/utils/config/connectDB";
import StudentLeads from "@/utils/models/StudentLeadsSchema";



interface ValidationError extends Error {
  name: string;
  errors: Record<string, { message: string }>;
}

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const all = searchParams.get("all") === "true";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = all ? 0 : parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search") || "";
    const referralPartnerId = searchParams.get("referralPartnerId");

    const skip = all ? 0 : (page - 1) * limit;


    const query: Record<string, unknown> = {};

    // Filter by referral partner if provided
    if (referralPartnerId) {
      query.referralPartner = referralPartnerId;
    }

    // Search functionality
    if (search) {
      const searchPattern = new RegExp(search, 'i');
      query.$or = [
        { name: searchPattern },
        { email: searchPattern },
        { phone: searchPattern },
        { 'courseAppliedName': searchPattern },
        { 'countryPreferenceName': searchPattern }
      ];
    }

    let baseQuery = StudentLeads.find(query)
      .populate({
        path: 'courseApplied',
        select: 'name'
      })
      .populate({
        path: 'countryPreference',
        select: 'name'
      })
      .populate({
        path: 'referralPartner',
        select: 'name'
      })
      .sort({ createdAt: -1 });

    if (!all) {
      baseQuery = baseQuery.skip(skip).limit(limit);
    }

    const studentLeads = await baseQuery;


    // Transform the populated data
    const transformedLeads = studentLeads.map(lead => {
      const transformedLead = lead.toObject();
      
      // Transform course
      if (transformedLead.courseApplied) {
        transformedLead.courseAppliedName = transformedLead.courseApplied.name;
        transformedLead.courseApplied = transformedLead.courseApplied._id;
      }

      // Transform country
      if (transformedLead.countryPreference) {
        transformedLead.countryPreferenceName = transformedLead.countryPreference.name;
        transformedLead.countryPreference = transformedLead.countryPreference._id;
      }

      // Transform referral partner
      if (transformedLead.referralPartner) {
        transformedLead.referralPartnerName = transformedLead.referralPartner.name;
        transformedLead.referralPartner = transformedLead.referralPartner._id;
      }

      return transformedLead;
    });

    const total = await StudentLeads.countDocuments(query);

    return NextResponse.json({
      success: true,
      data: transformedLeads,
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
    
    // Check if student with same email or phone already exists
    const existingStudent = await StudentLeads.findOne({
      $or: [
        { email: body.email },
        { phone: body.phone }
      ]
    });
    if (existingStudent) {
      const field = existingStudent.email === body.email ? 'email' : 'phone';
      return NextResponse.json(
        { success: false, error: `A student with this ${field} already exists` },
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
