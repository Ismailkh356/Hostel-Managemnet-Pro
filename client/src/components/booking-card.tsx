import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Calendar, Bed, MoreVertical } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface BookingCardProps {
  id: string;
  guestName: string;
  guestAvatar?: string;
  roomNumber: string;
  checkIn: string;
  checkOut: string;
  status: "confirmed" | "checked-in" | "checked-out" | "pending" | "cancelled";
  onViewDetails?: () => void;
  onEdit?: () => void;
  onCancel?: () => void;
}

const statusConfig = {
  confirmed: { label: "Confirmed", className: "bg-chart-1 text-white" },
  "checked-in": { label: "Checked In", className: "bg-chart-2 text-white" },
  "checked-out": { label: "Checked Out", className: "bg-muted text-muted-foreground" },
  pending: { label: "Pending", className: "bg-chart-3 text-white" },
  cancelled: { label: "Cancelled", className: "bg-destructive text-destructive-foreground" },
};

export function BookingCard({
  id,
  guestName,
  guestAvatar,
  roomNumber,
  checkIn,
  checkOut,
  status,
  onViewDetails,
  onEdit,
  onCancel,
}: BookingCardProps) {
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <Card className="p-4">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <Avatar>
            <AvatarImage src={guestAvatar} />
            <AvatarFallback>{getInitials(guestName)}</AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium" data-testid={`text-guest-name-${id}`}>{guestName}</p>
            <p className="text-sm text-muted-foreground">Booking #{id}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge className={statusConfig[status].className}>
            {statusConfig[status].label}
          </Badge>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" data-testid={`button-booking-menu-${id}`}>
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={onViewDetails} data-testid="button-view-details">
                View Details
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onEdit} data-testid="button-edit">
                Edit Booking
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onCancel} className="text-destructive" data-testid="button-cancel">
                Cancel Booking
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-3 text-sm">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Bed className="h-4 w-4" />
          <span>Room {roomNumber}</span>
        </div>
        <div className="flex items-center gap-2 text-muted-foreground">
          <Calendar className="h-4 w-4" />
          <span>{checkIn}</span>
        </div>
      </div>
      
      <div className="mt-3 pt-3 border-t">
        <p className="text-sm text-muted-foreground">
          Check-out: <span className="text-foreground font-medium">{checkOut}</span>
        </p>
      </div>
    </Card>
  );
}
