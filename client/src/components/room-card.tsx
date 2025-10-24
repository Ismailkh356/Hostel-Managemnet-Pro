import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Bed, Users, DollarSign } from "lucide-react";

interface RoomCardProps {
  id: string;
  roomNumber: string;
  type: string;
  capacity: number;
  pricePerNight: number;
  status: "available" | "occupied" | "maintenance" | "cleaning";
  onViewDetails?: () => void;
  onBook?: () => void;
}

const statusConfig = {
  available: { label: "Available", className: "bg-chart-2 text-white" },
  occupied: { label: "Occupied", className: "bg-chart-1 text-white" },
  maintenance: { label: "Maintenance", className: "bg-destructive text-destructive-foreground" },
  cleaning: { label: "Cleaning", className: "bg-chart-3 text-white" },
};

export function RoomCard({
  id,
  roomNumber,
  type,
  capacity,
  pricePerNight,
  status,
  onViewDetails,
  onBook,
}: RoomCardProps) {
  return (
    <Card className="overflow-hidden hover-elevate">
      <div className="h-32 bg-accent flex items-center justify-center">
        <Bed className="h-12 w-12 text-accent-foreground" />
      </div>
      
      <div className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h3 className="font-semibold text-lg" data-testid={`text-room-${id}`}>
              Room {roomNumber}
            </h3>
            <p className="text-sm text-muted-foreground">{type}</p>
          </div>
          <Badge className={statusConfig[status].className}>
            {statusConfig[status].label}
          </Badge>
        </div>
        
        <div className="space-y-2 mb-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Users className="h-4 w-4" />
            <span>{capacity} guests</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <DollarSign className="h-4 w-4 text-muted-foreground" />
            <span className="font-semibold">${pricePerNight}</span>
            <span className="text-muted-foreground">/ night</span>
          </div>
        </div>
        
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            className="flex-1" 
            onClick={onViewDetails}
            data-testid={`button-view-room-${id}`}
          >
            Details
          </Button>
          {status === "available" && (
            <Button 
              className="flex-1" 
              onClick={onBook}
              data-testid={`button-book-room-${id}`}
            >
              Book
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}
