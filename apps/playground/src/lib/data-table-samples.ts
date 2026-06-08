import { createColumnHelper } from "@tanstack/react-table";

export type Payment = {
  id: string;
  amount: number;
  status: "pending" | "processing" | "success" | "failed";
  email: string;
};

export const paymentData: Payment[] = [
  {
    id: "728ed52f",
    amount: 100,
    status: "pending",
    email: "alice@example.com",
  },
  {
    id: "489e1d42",
    amount: 125,
    status: "processing",
    email: "bob@example.com",
  },
  {
    id: "a1b2c3d4",
    amount: 250,
    status: "success",
    email: "charlie@example.com",
  },
  { id: "e5f6g7h8", amount: 75, status: "failed", email: "diana@example.com" },
  { id: "i9j0k1l2", amount: 300, status: "success", email: "eve@example.com" },
  {
    id: "m3n4o5p6",
    amount: 150,
    status: "processing",
    email: "frank@example.com",
  },
  {
    id: "q7r8s9t0",
    amount: 200,
    status: "pending",
    email: "grace@example.com",
  },
  { id: "u1v2w3x4", amount: 50, status: "failed", email: "hank@example.com" },
  { id: "y5z6a7b8", amount: 400, status: "success", email: "ivy@example.com" },
  { id: "c9d0e1f2", amount: 175, status: "pending", email: "jack@example.com" },
  {
    id: "g3h4i5j6",
    amount: 225,
    status: "processing",
    email: "kate@example.com",
  },
  { id: "k7l8m9n0", amount: 90, status: "success", email: "leo@example.com" },
];

const fmt = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

const columnHelper = createColumnHelper<Payment>();

export const paymentColumns = [
  columnHelper.accessor("status", { header: "Status" }),
  columnHelper.accessor("email", { header: "Email" }),
  columnHelper.accessor("amount", {
    header: "Amount",
    cell: (info) => fmt.format(info.getValue()),
  }),
];
