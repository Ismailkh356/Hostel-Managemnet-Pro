import { useState } from "react";
import { PaymentRow } from "@/components/payment-row";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const mockPayments = [
  { id: "PAY001", guestName: "Emma Wilson", bookingId: "BK003", amount: 267.00, date: "Dec 20, 2024", status: "paid" as const },
  { id: "PAY002", guestName: "Sarah Johnson", bookingId: "BK001", amount: 267.00, date: "Dec 24, 2024", status: "pending" as const },
  { id: "PAY003", guestName: "Michael Chen", bookingId: "BK002", amount: 89.00, date: "Dec 24, 2024", status: "pending" as const },
  { id: "PAY004", guestName: "David Martinez", bookingId: "BK004", amount: 178.00, date: "Dec 22, 2024", status: "paid" as const },
  { id: "PAY005", guestName: "Lisa Anderson", bookingId: "BK005", amount: 295.00, date: "Dec 18, 2024", status: "paid" as const },
  { id: "PAY006", guestName: "James Taylor", bookingId: "BK006", amount: 267.00, date: "Dec 25, 2024", status: "refunded" as const },
];

export default function Payments() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const filteredPayments = mockPayments.filter(payment => {
    const matchesSearch = payment.guestName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         payment.bookingId.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || payment.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalPaid = mockPayments
    .filter(p => p.status === "paid")
    .reduce((sum, p) => sum + p.amount, 0);

  const totalPending = mockPayments
    .filter(p => p.status === "pending")
    .reduce((sum, p) => sum + p.amount, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold mb-2">Payments</h1>
        <p className="text-muted-foreground">Track payments and invoices</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-6">
          <p className="text-sm font-medium text-muted-foreground mb-1">Total Revenue</p>
          <p className="text-2xl font-semibold">${(totalPaid + totalPending).toFixed(2)}</p>
        </Card>
        <Card className="p-6">
          <p className="text-sm font-medium text-muted-foreground mb-1">Paid</p>
          <p className="text-2xl font-semibold text-chart-2">${totalPaid.toFixed(2)}</p>
        </Card>
        <Card className="p-6">
          <p className="text-sm font-medium text-muted-foreground mb-1">Pending</p>
          <p className="text-2xl font-semibold text-chart-3">${totalPending.toFixed(2)}</p>
        </Card>
      </div>

      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by guest name or booking ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
            data-testid="input-search-payments"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]" data-testid="select-payment-status-filter">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="paid">Paid</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="refunded">Refunded</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card>
        {filteredPayments.map((payment) => (
          <PaymentRow
            key={payment.id}
            {...payment}
            onViewInvoice={() => console.log("View invoice:", payment.id)}
            onDownload={() => console.log("Download invoice:", payment.id)}
          />
        ))}
      </Card>

      {filteredPayments.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No payments found matching your criteria.</p>
        </div>
      )}
    </div>
  );
}
