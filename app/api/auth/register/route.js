// app/api/auth/register/route.js
import { NextResponse } from "next/server";
// import { connectDB } from "@/lib/db"; 
import User from "@/models/User";
import { signToken, cookieOptions } from "@/lib/auth";
import connectDB from "../../../../lib/db";

export async function POST(req) {
  try {
    await connectDB();

    const body = await req.json();
    const { email, password } = body;

    // Validation
    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: "Name, email and password are required" },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, message: "Invalid email format" },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { success: false, message: "Password must be at least 6 characters" },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return NextResponse.json(
        { success: false, message: "User already exists" },
        { status: 409 }
      );
    }

    // Create new user
    const newUser = await User.create({ email, password });

    // Sign JWT
    const token = signToken({
      _id: newUser._id,
      email: newUser.email,
    });

    // Build response
    const response = NextResponse.json(
      {
        success: true,
        message: "Registration successful",
        user: {
          _id: newUser._id,
          email: newUser.email,
        },
      },
      { status: 201 }
    );

    // Set HTTP-only cookie
    response.cookies.set("token", token, cookieOptions);

    return response;

  } catch (error) {
    console.error("Registration error:", error); 

    // Handle mongoose duplicate key error
    if (error.code === 11000) {
      return NextResponse.json(
        { success: false, message: "Email already in use" },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
