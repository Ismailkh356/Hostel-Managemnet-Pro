import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Download, Eye } from "lucide-react";

interface PaymentRowProps {
  id: string;
  guestName: string;
  bookingId: string;
  amount: number;
  date: string;
  status: "paid" | "pending" | "refunded";
  onViewInvoice?: () => void;
  onDownload?: () => void;
}

const statusConfig = {
  paid: { label: "Paid", className: "bg-chart-2 text-white" },
  pending: { label: "Pending", className: "bg-chart-3 text-white" },
  refunded: { label: "Refunded", className: "bg-muted text-muted-foreground" },
};

export function PaymentRow({
  id,
  guestName,
  bookingId,
  amount,
  date,
  status,
  onViewInvoice,
  onDownload,
}: PaymentRowProps) {
  return (
    <div className="flex items-center justify-between p-4 border-b last:border-b-0 hover-elevate" data-testid={`payment-${id}`}>
      <div className="flex items-center gap-4 flex-1">
        <div className="min-w-0">
          <p className="font-medium" data-testid={`text-payment-guest-${id}`}>{guestName}</p>
          <p className="text-sm text-muted-foreground">Booking #{bookingId}</p>
        </div>
      </div>
      
      <div className="flex items-center gap-6">
        <div className="text-right">
          <p className="font-semibold">${amount.toFixed(2)}</p>
          <p className="text-sm text-muted-foreground">{date}</p>
        </div>
        
        <Badge className={statusConfig[status].className}>
          {statusConfig[status].label}
        </Badge>
        
        <div className="flex gap-2">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onViewInvoice}
            data-testid={`button-view-invoice-${id}`}
          >
            <Eye className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onDownload}
            data-testid={`button-download-invoice-${id}`}
          >
            <Download className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
