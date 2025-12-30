import { NextRequest, NextResponse } from "next/server";
import { connectToDB } from "@/lib/mongoDB";
import Order from "@/lib/models/Order";
import Customer from "@/lib/models/Customer";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

export async function POST(req: NextRequest) {
  try {
    const { cartItems, customer, paymentMethod, address } = await req.json();

    if (!cartItems || !customer || !address) {
      return new NextResponse("Not enough data to checkout", { status: 400 });
    }

    await connectToDB();

    // ✅ Ensure customer exists
    let dbCustomer = await Customer.findOne({ clerkId: customer.clerkId });
    if (!dbCustomer) {
      dbCustomer = await Customer.create({
        clerkId: customer.clerkId,
        name: customer.name,
        email: customer.email,
        address,
      });
    } else {
      // Always update the customer's address
      dbCustomer.address = address;
      await dbCustomer.save();
    }

    // ✅ Calculate total amount
    const totalAmount = cartItems.reduce(
      (acc: number, item: any) => acc + item.item.price * item.quantity,
      0
    );

    // ✅ Create order with clerkId
    const newOrder = await Order.create({
      customerClerkId: customer.clerkId, // store clerkId directly
      address,                            // simple address string
      paymentMethod,
      products: cartItems.map((item: any) => ({
        product: item.item._id,
        title: item.item.title,
        price: item.item.price,
        color: item.color || "N/A",
        size: item.size || "N/A",
        quantity: item.quantity,
      })),
      totalAmount,
    });

    // ✅ Prepare WhatsApp message
    const productLines = cartItems
      .map(
        (item: any, i: number) =>
          `${i + 1}. ${item.item.title} x${item.quantity} — MWK ${
            item.item.price * item.quantity
          }`
      )
      .join("\n");

    const message = encodeURIComponent(
      `📦 *New Order Request* 📦

*Customer Details:*
Name: ${dbCustomer.name}
Email: ${dbCustomer.email}
Address: ${address}
Payment Method: ${paymentMethod}

*Order Summary:*
${productLines}

*Total Amount:* MWK ${totalAmount}

Please confirm the order.`
    );

    const whatsappLink = `https://wa.me/265998152880?text=${message}`;

    return NextResponse.json(
      {
        successUrl: "/payment_success",
        whatsappLink,
      },
      { headers: corsHeaders }
    );
  } catch (err) {
    console.log("[checkout_POST]", err);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
