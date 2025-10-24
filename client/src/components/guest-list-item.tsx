import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Mail, Phone, Eye } from "lucide-react";

interface GuestListItemProps {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar?: string;
  totalBookings: number;
  currentStatus?: "checked-in" | "checked-out" | "upcoming";
  onViewProfile?: () => void;
}

export function GuestListItem({
  id,
  name,
  email,
  phone,
  avatar,
  totalBookings,
  currentStatus,
  onViewProfile,
}: GuestListItemProps) {
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="flex items-center justify-between p-4 border rounded-md hover-elevate" data-testid={`guest-${id}`}>
      <div className="flex items-center gap-4">
        <Avatar className="h-12 w-12">
          <AvatarImage src={avatar} />
          <AvatarFallback>{getInitials(name)}</AvatarFallback>
        </Avatar>
        
        <div className="space-y-1">
          <p className="font-medium" data-testid={`text-guest-name-${id}`}>{name}</p>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Mail className="h-3 w-3" />
              <span>{email}</span>
            </div>
            <div className="flex items-center gap-1">
              <Phone className="h-3 w-3" />
              <span>{phone}</span>
            </div>
          </div>
        </div>
      </div>
      
      <div className="flex items-center gap-4">
        <div className="text-right">
          <p className="text-sm font-medium">{totalBookings} bookings</p>
          {currentStatus && (
            <p className="text-sm text-muted-foreground capitalize">{currentStatus.replace('-', ' ')}</p>
          )}
        </div>
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={onViewProfile}
          data-testid={`button-view-guest-${id}`}
        >
          <Eye className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
