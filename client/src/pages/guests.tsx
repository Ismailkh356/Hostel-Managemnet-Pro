import { useState } from "react";
import { GuestListItem } from "@/components/guest-list-item";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const mockGuests = [
  { id: "G001", name: "Sarah Johnson", email: "sarah.j@email.com", phone: "+1 234-567-8900", totalBookings: 3, currentStatus: "checked-in" as const },
  { id: "G002", name: "Michael Chen", email: "m.chen@email.com", phone: "+1 234-567-8901", totalBookings: 5, currentStatus: "upcoming" as const },
  { id: "G003", name: "Emma Wilson", email: "emma.w@email.com", phone: "+1 234-567-8902", totalBookings: 2, currentStatus: "checked-in" as const },
  { id: "G004", name: "David Martinez", email: "d.martinez@email.com", phone: "+1 234-567-8903", totalBookings: 7, currentStatus: "checked-in" as const },
  { id: "G005", name: "Lisa Anderson", email: "lisa.a@email.com", phone: "+1 234-567-8904", totalBookings: 4, currentStatus: "checked-out" as const },
  { id: "G006", name: "James Taylor", email: "j.taylor@email.com", phone: "+1 234-567-8905", totalBookings: 1, currentStatus: "upcoming" as const },
];

export default function Guests() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const filteredGuests = mockGuests.filter(guest => {
    const matchesSearch = guest.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         guest.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || guest.currentStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold mb-2">Guests</h1>
        <p className="text-muted-foreground">View and manage guest information</p>
      </div>

      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
            data-testid="input-search-guests"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]" data-testid="select-guest-status-filter">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Guests</SelectItem>
            <SelectItem value="checked-in">Checked In</SelectItem>
            <SelectItem value="checked-out">Past Guests</SelectItem>
            <SelectItem value="upcoming">Upcoming</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-3">
        {filteredGuests.map((guest) => (
          <GuestListItem
            key={guest.id}
            {...guest}
            onViewProfile={() => console.log("View profile:", guest.id)}
          />
        ))}
      </div>

      {filteredGuests.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No guests found matching your criteria.</p>
        </div>
      )}
    </div>
  );
}
