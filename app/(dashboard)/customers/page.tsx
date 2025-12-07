import { DataTable } from '@/components/custom ui/DataTable';
import { columns } from '@/components/customers/CustomerColumns';
import { Separator } from '@/components/ui/separator';
import Customer from '@/lib/models/Customer';
import { connectToDB } from '@/lib/mongoDB';

type CustomerType = {
  _id: string;
  clerkId: string;
  name: string;
  email: string;
  address?: string;
};

const Customers = async () => {
  await connectToDB();

  // Fetch customers and cast through unknown to satisfy TypeScript
  const customers = (await Customer.find().sort({ createdAt: -1 }).lean()) as unknown as CustomerType[];

  // Convert _id to string explicitly
  const cleanCustomers = customers.map(c => ({
    ...c,
    _id: String(c._id)
  }));

  return (
    <div className='px-10 py-5'>
      <p className='text-heading2-bold'>Customers</p>
      <Separator className='bg-grey-1 my-5' />
      <DataTable columns={columns} data={cleanCustomers} searchKey='name' />
    </div>
  );
};

export const dynamic = "force-dynamic";

export default Customers;
