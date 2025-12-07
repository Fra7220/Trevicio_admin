import Customer from "@/lib/models/Customer";
import Order from "@/lib/models/Order";
import Product from "@/lib/models/Product";
import { connectToDB } from "@/lib/mongoDB";
import { NextRequest, NextResponse } from "next/server";

export const GET = async (
  req: NextRequest,
  { params }: { params: { orderId: string } }
) => {
  try {
    await connectToDB();

    // Fetch order and populate product details
    const orderDoc = await Order.findById(params.orderId).populate({
      path: "products.product",
      model: Product,
    });

    if (!orderDoc) {
      return NextResponse.json({ message: "Order Not Found" }, { status: 404 });
    }

    const orderDetails = orderDoc.toObject();

    // Map products and ensure each has a product object
    const products = orderDetails.products.map((p: any) => ({
      _id: p._id.toString(),
      product: p.product
        ? {
            _id: p.product._id.toString(),
            title: p.product.title,
            price: p.product.price ?? 0,
          }
        : {
            _id: null,
            title: "Product not available",
            price: 0,
          },
      color: p.color || "N/A",
      size: p.size || "N/A",
      quantity: p.quantity ?? 0,
    }));

    // Fetch customer by clerkId
    const customerDoc = await Customer.findOne({ clerkId: orderDetails.customerClerkId });

    const customer = customerDoc
      ? {
          _id: customerDoc._id.toString(),
          clerkId: customerDoc.clerkId,
          name: customerDoc.name,
          email: customerDoc.email,
          address: customerDoc.address || "-",
        }
      : {
          _id: null,
          clerkId: null,
          name: "Unknown",
          email: "-",
          address: "-",
        };

    // Prepare clean order response
    const cleanOrder = {
      _id: orderDetails._id.toString(),
      customerClerkId: orderDetails.customerClerkId,
      products,
      totalAmount: orderDetails.totalAmount ?? 0,
      paymentMethod: orderDetails.paymentMethod || "-",
      address: orderDetails.address || "-",
      createdAt: orderDetails.createdAt?.toISOString() || null,
    };

    return NextResponse.json({ orderDetails: cleanOrder, customer }, { status: 200 });
  } catch (err) {
    console.log("[orderId_GET]", err);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
};

export const dynamic = "force-dynamic";
