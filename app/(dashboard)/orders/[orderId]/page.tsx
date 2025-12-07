import { DataTable } from "@/components/custom ui/DataTable";
import { columns } from "@/components/orderItems/OrderItemsColums";

const OrderDetails = async ({ params }: { params: { orderId: string } }) => {
  const apiUrl = process.env.ADMIN_DASHBOARD_URL;
  if (!apiUrl) throw new Error("ADMIN_DASHBOARD_URL is not defined");

  let orderData: { orderDetails: any; customer: any } | null = null;

  try {
    const res = await fetch(`${apiUrl}/api/orders/${params.orderId}`, { cache: "no-store" });
    if (!res.ok) {
      console.error("Failed to fetch order:", res.statusText);
    } else {
      orderData = await res.json();
    }
  } catch (err) {
    console.error("Fetch error:", err);
  }

  if (!orderData) {
    return <p>Order not found or failed to load.</p>;
  }

  const { orderDetails, customer } = orderData;

  // Fallbacks for missing data
  const safeOrder = {
    _id: orderDetails?._id ?? "N/A",
    totalAmount: orderDetails?.totalAmount ?? 0,
    paymentMethod: orderDetails?.paymentMethod ?? "-",
    createdAt: orderDetails?.createdAt ?? null,
    products: orderDetails?.products ?? [],
    address: orderDetails?.address ?? "-",
  };

  const safeCustomer = {
    name: customer?.name ?? "Unknown",
    email: customer?.email ?? "-",
    address: customer?.address ?? "-",
  };

  return (
    <div className="flex flex-col p-10 gap-5">
      <p className="text-base-bold">
        Order ID: <span className="text-base-medium">{safeOrder._id}</span>
      </p>

      <p className="text-base-bold">
        Customer name: <span className="text-base-medium">{safeCustomer.name}</span>
      </p>

      <p className="text-base-bold">
        Email: <span className="text-base-medium">{safeCustomer.email}</span>
      </p>

      <p className="text-base-bold">
        Delivery Address: <span className="text-base-medium">{safeCustomer.address}</span>
      </p>

      <p className="text-base-bold">
        Payment Method: <span className="text-base-medium">{safeOrder.paymentMethod}</span>
      </p>

      <p className="text-base-bold">
        Total Paid: <span className="text-base-medium">MWK {safeOrder.totalAmount}</span>
      </p>

      <p className="text-base-bold">
        Order Date:{" "}
        <span className="text-base-medium">
          {safeOrder.createdAt ? new Date(safeOrder.createdAt).toLocaleString() : "-"}
        </span>
      </p>

      <DataTable
        columns={columns}
        data={safeOrder.products}
        searchKey="title"
      />
    </div>
  );
};

export default OrderDetails;
