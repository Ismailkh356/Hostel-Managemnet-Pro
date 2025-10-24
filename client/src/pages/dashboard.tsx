import { StatCard } from "@/components/stat-card";
import { BookingCard } from "@/components/booking-card";
import { Users, Bed, Calendar, DollarSign } from "lucide-react";

export default function Dashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold mb-2">Dashboard</h1>
        <p className="text-muted-foreground">Welcome back! Here's what's happening today.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Guests"
          value="42"
          icon={Users}
          trend={{ value: "12%", isPositive: true }}
          description="vs last month"
        />
        <StatCard
          title="Occupied Rooms"
          value="18/24"
          icon={Bed}
          description="75% occupancy"
        />
        <StatCard
          title="Check-ins Today"
          value="5"
          icon={Calendar}
        />
        <StatCard
          title="Revenue (MTD)"
          value="₨12,450"
          icon={DollarSign}
          trend={{ value: "8%", isPositive: true }}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <h2 className="text-xl font-semibold mb-4">Today's Check-ins</h2>
          <div className="space-y-4">
            <BookingCard
              id="BK001"
              guestName="Sarah Johnson"
              roomNumber="101"
              checkIn="Dec 24"
              checkOut="Dec 27"
              status="confirmed"
              onViewDetails={() => console.log("View details")}
              onEdit={() => console.log("Edit")}
              onCancel={() => console.log("Cancel")}
            />
            <BookingCard
              id="BK002"
              guestName="Michael Chen"
              roomNumber="205"
              checkIn="Dec 24"
              checkOut="Dec 25"
              status="pending"
              onViewDetails={() => console.log("View details")}
              onEdit={() => console.log("Edit")}
              onCancel={() => console.log("Cancel")}
            />
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-4">Today's Check-outs</h2>
          <div className="space-y-4">
            <BookingCard
              id="BK003"
              guestName="Emma Wilson"
              roomNumber="112"
              checkIn="Dec 21"
              checkOut="Dec 24"
              status="checked-in"
              onViewDetails={() => console.log("View details")}
              onEdit={() => console.log("Edit")}
              onCancel={() => console.log("Cancel")}
            />
            <BookingCard
              id="BK004"
              guestName="David Martinez"
              roomNumber="308"
              checkIn="Dec 22"
              checkOut="Dec 24"
              status="checked-in"
              onViewDetails={() => console.log("View details")}
              onEdit={() => console.log("Edit")}
              onCancel={() => console.log("Cancel")}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
