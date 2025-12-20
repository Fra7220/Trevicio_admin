import { connectToDB } from "@/lib/mongoDB";
import { auth } from "@clerk/nextjs";
import { NextRequest, NextResponse } from "next/server";

import Collection from "@/lib/models/Collection";

// Allow CORS for your store frontend
const ALLOWED_ORIGIN = "https://trevicio-store.vercel.app";

function setCorsHeaders(res: NextResponse) {
  res.headers.set("Access-Control-Allow-Origin", ALLOWED_ORIGIN);
  res.headers.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.headers.set("Access-Control-Allow-Credentials", "true");
  return res;
}

// Handle preflight requests
export async function OPTIONS() {
  const res = new NextResponse(null, { status: 204 });
  return setCorsHeaders(res);
}

export const POST = async (req: NextRequest) => {
  try {
    const { userId } = auth();

    if (!userId) {
      const res = new NextResponse("Unauthorized", { status: 403 });
      return setCorsHeaders(res);
    }

    await connectToDB();

    const { title, description, image } = await req.json();

    if (!title || !image) {
      const res = new NextResponse("Title and image are required", { status: 400 });
      return setCorsHeaders(res);
    }

    const existingCollection = await Collection.findOne({ title });

    if (existingCollection) {
      const res = new NextResponse("Collection already exists", { status: 400 });
      return setCorsHeaders(res);
    }

    const newCollection = await Collection.create({
      title,
      description,
      image,
    });

    await newCollection.save();

    const res = NextResponse.json(newCollection, { status: 200 });
    return setCorsHeaders(res);
  } catch (err) {
    console.log("[collections_POST]", err);
    const res = new NextResponse("Internal Server Error", { status: 500 });
    return setCorsHeaders(res);
  }
};

export const GET = async (req: NextRequest) => {
  try {
    await connectToDB();

    const collections = await Collection.find().sort({ createdAt: -1 }); // same as "desc"

    const res = NextResponse.json(collections, { status: 200 });
    return setCorsHeaders(res);
  } catch (err) {
    console.log("[collections_GET]", err);
    const res = new NextResponse("Internal Server Error", { status: 500 });
    return setCorsHeaders(res);
  }
};

export const dynamic = "force-dynamic";
