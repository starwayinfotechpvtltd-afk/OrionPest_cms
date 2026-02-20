import { NextResponse } from "next/server";
import { getPageContent } from "@/controllers/pageController";

export async function GET(request, context) {
  try {
    const { slug } = await context.params;

    const page = await getPageContent(slug);

    if (!page) {
      return NextResponse.json(
        { success: false, message: "Page not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, page });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
