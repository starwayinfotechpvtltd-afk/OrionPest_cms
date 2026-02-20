import { NextResponse } from "next/server";
import { updateSingleBlock } from "@/controllers/pageController";

export async function PATCH(request, { params }) {
  try {
    const body = await request.json();

    const updated = await updateSingleBlock(
      params.pageName,
      params.blockName,
      body.content
    );

    if (!updated) {
      return NextResponse.json(
        { success: false, message: "Page or block not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, page: updated });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 400 }
    );
  }
}