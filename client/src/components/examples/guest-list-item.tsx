import { GuestListItem } from "../guest-list-item";

export default function GuestListItemExample() {
  return (
    <div className="p-6 bg-background">
      <GuestListItem
        id="G001"
        name="Michael Chen"
        email="michael.chen@email.com"
        phone="+1 234-567-8900"
        totalBookings={5}
        currentStatus="checked-in"
        onViewProfile={() => console.log("View profile")}
      />
    </div>
  );
}
