import { useState } from "react";
import { RoomCard } from "@/components/room-card";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const mockRooms = [
  { id: "R101", roomNumber: "101", type: "Deluxe Double", capacity: 2, pricePerNight: 89, status: "available" as const },
  { id: "R102", roomNumber: "102", type: "Standard Single", capacity: 1, pricePerNight: 59, status: "occupied" as const },
  { id: "R103", roomNumber: "103", type: "Deluxe Double", capacity: 2, pricePerNight: 89, status: "available" as const },
  { id: "R201", roomNumber: "201", type: "Suite", capacity: 4, pricePerNight: 159, status: "available" as const },
  { id: "R202", roomNumber: "202", type: "Deluxe Double", capacity: 2, pricePerNight: 89, status: "cleaning" as const },
  { id: "R203", roomNumber: "203", type: "Standard Single", capacity: 1, pricePerNight: 59, status: "occupied" as const },
  { id: "R301", roomNumber: "301", type: "Premium Suite", capacity: 4, pricePerNight: 189, status: "maintenance" as const },
  { id: "R302", roomNumber: "302", type: "Deluxe Double", capacity: 2, pricePerNight: 89, status: "available" as const },
];

export default function Rooms() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const filteredRooms = mockRooms.filter(room => {
    const matchesSearch = room.roomNumber.includes(searchQuery) || 
                         room.type.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || room.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold mb-2">Rooms</h1>
        <p className="text-muted-foreground">Manage room inventory and availability</p>
      </div>

      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by room number or type..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
            data-testid="input-search-rooms"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]" data-testid="select-room-status-filter">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="available">Available</SelectItem>
            <SelectItem value="occupied">Occupied</SelectItem>
            <SelectItem value="maintenance">Maintenance</SelectItem>
            <SelectItem value="cleaning">Cleaning</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredRooms.map((room) => (
          <RoomCard
            key={room.id}
            {...room}
            onViewDetails={() => console.log("View details:", room.id)}
            onBook={() => console.log("Book room:", room.id)}
          />
        ))}
      </div>

      {filteredRooms.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No rooms found matching your criteria.</p>
        </div>
      )}
    </div>
  );
}
