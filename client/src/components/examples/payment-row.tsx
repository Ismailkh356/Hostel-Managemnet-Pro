import { PaymentRow } from "../payment-row";

export default function PaymentRowExample() {
  return (
    <div className="p-6 bg-background">
      <div className="border rounded-md overflow-hidden">
        <PaymentRow
          id="PAY001"
          guestName="Emma Wilson"
          bookingId="BK001"
          amount={267.00}
          date="Dec 20, 2024"
          status="paid"
          onViewInvoice={() => console.log("View invoice")}
          onDownload={() => console.log("Download invoice")}
        />
      </div>
    </div>
  );
}
