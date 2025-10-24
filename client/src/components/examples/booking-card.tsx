import { BookingCard } from "../booking-card";

export default function BookingCardExample() {
  return (
    <div className="p-6 bg-background">
      <div className="max-w-md">
        <BookingCard
          id="BK001"
          guestName="Sarah Johnson"
          roomNumber="101"
          checkIn="Dec 24"
          checkOut="Dec 27"
          status="confirmed"
          onViewDetails={() => console.log("View details")}
          onEdit={() => console.log("Edit booking")}
          onCancel={() => console.log("Cancel booking")}
        />
      </div>
    </div>
  );
}
