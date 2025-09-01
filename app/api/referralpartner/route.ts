import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/utils/config/connectDB";
import ReferralPartner from "@/utils/models/ReferralPartnerSchema";

interface MongoError extends Error {
  code?: number;
}

interface ValidationError extends Error {
  name: string;
  errors: Record<string, { message: string }>; 
}
 
export async function GET(request: NextRequest) {
  try {
    await connectDB(); 

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search") || "";
    const all = searchParams.get("all") === "true";

    let query = {};
    if (search) {
      query = {
        $or: [
          { name: { $regex: search, $options: "i" } },
          { email: { $regex: search, $options: "i" } },
          { phone: { $regex: search, $options: "i" } },
          { city: { $regex: search, $options: "i" } },
        ],
      };
    }

    let partners, total;
    if (all) {
      partners = await ReferralPartner.find(query).sort({ createdAt: -1 });
      return NextResponse.json({
        success: true,
        data: partners,
      });
    } else {
      const skip = (page - 1) * limit;
      partners = await ReferralPartner.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);
      total = await ReferralPartner.countDocuments(query);
      return NextResponse.json({
        success: true,
        data: partners,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      });
    }
  } catch (error) {
    console.error("Error fetching referral partners:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch referral partners" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();

    // Check if partner with same email or phone exists
    if (body.email || body.phone) {
      const existingPartner = await ReferralPartner.findOne({
        $or: [
          { email: body.email?.toLowerCase() },
          { phone: body.phone }
        ]
      });

      if (existingPartner) {
        const field = existingPartner.email === body.email?.toLowerCase() ? 'email' : 'phone';
        return NextResponse.json(
          { success: false, error: `A partner with this ${field} already exists` },
          { status: 400 }
        );
      }

      // Convert email to lowercase
      if (body.email) {
        body.email = body.email.toLowerCase();
      }
    }

    const partner = new ReferralPartner(body);
    await partner.save();

    return NextResponse.json(
      {
        success: true,
        data: partner,
        message: "Referral partner created successfully",
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    console.error("Error creating referral partner:", error);

    // Handle MongoDB duplicate key error
    if (
      error instanceof Error &&
      "code" in error &&
      (error as MongoError).code === 11000
    ) {
      return NextResponse.json(
        { success: false, error: "Partner already exists" },
        { status: 400 }
      );
    }

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
      { success: false, error: "Failed to create referral partner" },
      { status: 500 }
    );
  }
}
