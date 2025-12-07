import { NextRequest, NextResponse } from "next/server";
import { connectToDB } from "@/lib/mongoDB";
import Order from "@/lib/models/Order";
import Customer from "@/lib/models/Customer";

export const GET = async (
  req: NextRequest,
  { params }: { params: { customerId: string } }
) => {
  try {
    await connectToDB();

    // Find the customer by clerkId
    const customer = await Customer.findOne({ clerkId: params.customerId });

    if (!customer) {
      return NextResponse.json([], { status: 200 });
    }

    // Find orders by customer ObjectId and populate products
    const orders = await Order.find({ customer: customer._id })
      .populate({ path: "products.product" }) // populate product details
      .lean();

    // Format orders with full product details
    const formattedOrders = orders.map((order) => ({
      _id: String(order._id),
      customerClerkId: customer.clerkId,
      products: (order.products as any[]).map((p) => ({
  _id: String(p._id),
  productId: p.product?._id ? String(p.product._id) : null,
  title: p.product?.title || p.title || "Unknown",
  price: p.product?.price ? Number(p.product.price) : p.price ? Number(p.price) : 0,
  description: p.product?.description || "",
  color: p.color || "N/A",
  size: p.size || "N/A",
  quantity: p.quantity ?? 0,
  media: p.product?.media || [], // <- include media array
}))
,

      totalAmount: order.totalAmount ? Number(order.totalAmount) : 0,

      createdAt: order.createdAt,
    }));

    return NextResponse.json(formattedOrders, { status: 200 });
  } catch (err) {
    console.log("[customer_orders_GET]", err);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
};

export const dynamic = "force-dynamic";
