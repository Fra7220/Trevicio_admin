import { auth } from "@clerk/nextjs";
import { NextRequest, NextResponse } from "next/server";

import { connectToDB } from "@/lib/mongoDB";
import Product from "@/lib/models/Product";
import Collection from "@/lib/models/Collection";

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
      const res = new NextResponse("Unauthorized", { status: 401 });
      return setCorsHeaders(res);
    }

    await connectToDB();

    const {
      title,
      description,
      media,
      category,
      collections,
      tags,
      sizes,
      colors,
      price,
      expense,
    } = await req.json();

    if (!title || !description || !media || !category || !price || !expense) {
      const res = new NextResponse("Not enough data to create a product", {
        status: 400,
      });
      return setCorsHeaders(res);
    }

    const newProduct = await Product.create({
      title,
      description,
      media,
      category,
      collections,
      tags,
      sizes,
      colors,
      price,
      expense,
    });

    await newProduct.save();

    if (collections) {
      for (const collectionId of collections) {
        const collection = await Collection.findById(collectionId);
        if (collection) {
          collection.products.push(newProduct._id);
          await collection.save();
        }
      }
    }

    const res = NextResponse.json(newProduct, { status: 200 });
    return setCorsHeaders(res);
  } catch (err) {
    console.log("[products_POST]", err);
    const res = new NextResponse("Internal Error", { status: 500 });
    return setCorsHeaders(res);
  }
};

export const GET = async (req: NextRequest) => {
  try {
    await connectToDB();

    const products = await Product.find()
      .sort({ createdAt: -1 }) // same as "desc"
      .populate({ path: "collections", model: Collection });

    const res = NextResponse.json(products, { status: 200 });
    return setCorsHeaders(res);
  } catch (err) {
    console.log("[products_GET]", err);
    const res = new NextResponse("Internal Error", { status: 500 });
    return setCorsHeaders(res);
  }
};

export const dynamic = "force-dynamic";
