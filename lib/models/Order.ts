import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
  customerClerkId: String, // store Clerk user ID directly
  products: [
    {
      product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
      },
      title: String, // store product title
      price: Number, // store product price
      color: String,
      size: String,
      quantity: Number,
    },
  ],
  address: String,          // simple string for delivery
  paymentMethod: String,
  totalAmount: Number,
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Order = mongoose.models.Order || mongoose.model("Order", orderSchema);

export default Order;
