import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/utils/config/connectDB";
import StudentCategory from "@/utils/models/Studentcategory";

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
    const type = searchParams.get("type"); // 'course' or 'country'

    const baseQuery = { isActive: true };
    const query = type ? { ...baseQuery, type } : baseQuery;

    const categories = await StudentCategory.find(query).sort({ name: 1 });

    return NextResponse.json({
      success: true,
      data: categories,
    });
  } catch (error) {
    console.error("Error fetching student categories:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch categories" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();
    const { name, type } = body;

    if (!name || !type) {
      return NextResponse.json(
        { success: false, error: "Name and type are required" },
        { status: 400 }
      );
    }

    if (!["course", "country"].includes(type)) {
      return NextResponse.json(
        { success: false, error: "Type must be 'course' or 'country'" },
        { status: 400 }
      );
    }

    // Check if category with same name and type already exists
    const existingCategory = await StudentCategory.findOne({ 
      name: { $regex: new RegExp(`^${name}$`, 'i') }, // Case insensitive match
      type 
    });

    if (existingCategory) {
      return NextResponse.json(
        { 
          success: false, 
          error: `This ${type} already exists` 
        },
        { status: 400 }
      );
    }

    const category = new StudentCategory({ name, type });
    await category.save();

    return NextResponse.json(
      {
        success: true,
        data: category,
        message: `${type.charAt(0).toUpperCase() + type.slice(1)} created successfully`,
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    console.error("Error creating student category:", error);

    // Handle MongoDB duplicate key error
    if (
      error instanceof Error &&
      "code" in error &&
      (error as MongoError).code === 11000
    ) {
      return NextResponse.json(
        { success: false, error: "Category already exists" },
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
      { success: false, error: "Failed to create category" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();
    const { id, name, type } = body;

    if (!id || !name) {
      return NextResponse.json(
        { success: false, error: "ID and name are required" },
        { status: 400 }
      );
    }

    // Check if another category with the same name exists (excluding current category)
    const existingCategory = await StudentCategory.findOne({
      name: { $regex: new RegExp(`^${name}$`, 'i') }, // Case insensitive match
      type: type,
      _id: { $ne: id } // Exclude current category
    });

    if (existingCategory) {
      return NextResponse.json(
        { 
          success: false, 
          error: `This ${type} already exists` 
        },
        { status: 400 }
      );
    }

    const category = await StudentCategory.findByIdAndUpdate(
      id,
      { name, ...(type && { type }) },
      { new: true, runValidators: true }
    );

    if (!category) {
      return NextResponse.json(
        { success: false, error: "Category not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: category,
      message: "Category updated successfully",
    });
  } catch (error: unknown) {
    console.error("Error updating student category:", error);

    // Handle MongoDB duplicate key error
    if (
      error instanceof Error &&
      "code" in error &&
      (error as MongoError).code === 11000
    ) {
      return NextResponse.json(
        { success: false, error: "Category already exists" },
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
      { success: false, error: "Failed to update category" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Category ID is required" },
        { status: 400 }
      );
    }

    const category = await StudentCategory.findByIdAndDelete(id);

    if (!category) {
      return NextResponse.json(
        { success: false, error: "Category not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Category deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting student category:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete category" },
      { status: 500 }
    );
  }
}
