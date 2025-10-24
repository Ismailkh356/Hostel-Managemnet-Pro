import { useState } from "react";
import { BookingCard } from "@/components/booking-card";
import { NewBookingDialog } from "@/components/new-booking-dialog";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const mockBookings = [
  { id: "BK001", guestName: "Sarah Johnson", roomNumber: "101", checkIn: "Dec 24", checkOut: "Dec 27", status: "confirmed" as const },
  { id: "BK002", guestName: "Michael Chen", roomNumber: "205", checkIn: "Dec 24", checkOut: "Dec 25", status: "pending" as const },
  { id: "BK003", guestName: "Emma Wilson", roomNumber: "112", checkIn: "Dec 21", checkOut: "Dec 24", status: "checked-in" as const },
  { id: "BK004", guestName: "David Martinez", roomNumber: "308", checkIn: "Dec 22", checkOut: "Dec 24", status: "checked-in" as const },
  { id: "BK005", guestName: "Lisa Anderson", roomNumber: "203", checkIn: "Dec 18", checkOut: "Dec 23", status: "checked-out" as const },
  { id: "BK006", guestName: "James Taylor", roomNumber: "401", checkIn: "Dec 25", checkOut: "Dec 28", status: "confirmed" as const },
];

export default function Bookings() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const filteredBookings = mockBookings.filter(booking => {
    const matchesSearch = booking.guestName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         booking.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || booking.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold mb-2">Bookings</h1>
          <p className="text-muted-foreground">Manage all reservations and bookings</p>
        </div>
        <NewBookingDialog />
      </div>

      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by guest name or booking ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
            data-testid="input-search-bookings"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]" data-testid="select-status-filter">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="confirmed">Confirmed</SelectItem>
            <SelectItem value="checked-in">Checked In</SelectItem>
            <SelectItem value="checked-out">Checked Out</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {filteredBookings.map((booking) => (
          <BookingCard
            key={booking.id}
            {...booking}
            onViewDetails={() => console.log("View details:", booking.id)}
            onEdit={() => console.log("Edit:", booking.id)}
            onCancel={() => console.log("Cancel:", booking.id)}
          />
        ))}
      </div>

      {filteredBookings.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No bookings found matching your criteria.</p>
        </div>
      )}
    </div>
  );
}
