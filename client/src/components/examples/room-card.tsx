import { RoomCard } from "../room-card";

export default function RoomCardExample() {
  return (
    <div className="p-6 bg-background">
      <div className="max-w-sm">
        <RoomCard
          id="R101"
          roomNumber="101"
          type="Deluxe Double"
          capacity={2}
          pricePerNight={89}
          status="available"
          onViewDetails={() => console.log("View details")}
          onBook={() => console.log("Book room")}
        />
      </div>
    </div>
  );
}
