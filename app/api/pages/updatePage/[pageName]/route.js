
import { NextResponse } from "next/server";
import { updatePage } from "@/controllers/pageController";

export async function PUT(request, { params }) {
  try {
    const { pageName } = await params;

    console.log("pageName received:", pageName);

    if (!pageName) {
      return NextResponse.json(
        { success: false, message: "Page name is missing" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const updated = await updatePage(pageName, body);

    if (!updated) {
      return NextResponse.json(
        { success: false, message: "Page not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, page: updated });
  } catch (error) {
    console.error("Update error:", error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 400 }
    );
  }
}
