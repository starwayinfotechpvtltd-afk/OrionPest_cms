import { NextResponse } from "next/server";
import { allPageContent, uploadPageContent } from "@/controllers/pageController";

export async function GET() {
  try {
    const pages = await allPageContent();
    return NextResponse.json({ success: true, pages });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const page = await uploadPageContent(body);

    return NextResponse.json(
      { success: true, page },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 400 }
    );
  }
}