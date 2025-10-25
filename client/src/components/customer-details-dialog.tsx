import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Trash2 } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Tenant } from "@shared/schema";

interface CustomerDetailsDialogProps {
  customer: Tenant | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CustomerDetailsDialog({ customer, open, onOpenChange }: CustomerDetailsDialogProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const { toast } = useToast();

  const deleteTenantMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest("DELETE", `/api/tenants/${id}`, undefined);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tenants"] });
      toast({
        title: "Success",
        description: "Customer deleted successfully",
      });
      setShowDeleteDialog(false);
      onOpenChange(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete customer",
        variant: "destructive",
      });
    },
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Active":
        return "bg-green-500/10 text-green-700 dark:text-green-400";
      case "Left":
        return "bg-red-500/10 text-red-700 dark:text-red-400";
      case "Pending":
        return "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400";
      default:
        return "bg-gray-500/10 text-gray-700 dark:text-gray-400";
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]" data-testid="dialog-customer-details">
        {customer ? (
          <>
            <DialogHeader>
              <DialogTitle>Customer Details</DialogTitle>
              <DialogDescription>
                Complete information for {customer.name}
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-semibold" data-testid="text-customer-name">
                    {customer.name}
                  </h3>
                  <p className="text-sm text-muted-foreground">Customer ID: {customer.id}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Mobile Number</p>
                  <p className="text-base" data-testid="text-customer-mobile">
                    {customer.mobile_number}
                  </p>
                </div>
                
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">CNIC</p>
                  <p className="text-base" data-testid="text-customer-cnic">
                    {customer.cnic}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Father's Name</p>
                  <p className="text-base" data-testid="text-customer-father-name">
                    {customer.father_name}
                  </p>
                </div>
                
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Father's CNIC</p>
                  <p className="text-base" data-testid="text-customer-father-cnic">
                    {customer.father_cnic}
                  </p>
                </div>
              </div>

              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Occupation</p>
                <p className="text-base" data-testid="text-customer-occupation">
                  {customer.occupation}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Room Number</p>
                  <p className="text-base font-semibold" data-testid="text-customer-room">
                    {customer.room_number}
                  </p>
                </div>
                
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Monthly Rent</p>
                  <p className="text-base font-semibold" data-testid="text-customer-rent">
                    ₨{customer.rent.toFixed(2)}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Payment Status</p>
                  <Badge className={
                    customer.payment_status === "Paid"
                      ? "bg-green-500/10 text-green-700 dark:text-green-400"
                      : "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400"
                  } data-testid="badge-customer-payment-status">
                    {customer.payment_status}
                  </Badge>
                </div>
                
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Tenant Status</p>
                  <Badge className={getStatusColor(customer.status)} data-testid="badge-customer-tenant-status">
                    {customer.status}
                  </Badge>
                </div>
              </div>

              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Join Date</p>
                <p className="text-base" data-testid="text-customer-join-date">
                  {new Date(customer.join_date).toLocaleDateString("en-PK", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>

              {customer.created_at && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Record Created</p>
                  <p className="text-base text-muted-foreground">
                    {new Date(customer.created_at).toLocaleDateString("en-PK", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              )}
            </div>
            
            <DialogFooter className="flex justify-between gap-2">
              <Button
                variant="destructive"
                onClick={() => setShowDeleteDialog(true)}
                data-testid="button-delete-customer"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Customer
              </Button>
              <Button 
                variant="outline" 
                onClick={() => onOpenChange(false)}
                data-testid="button-close-details"
              >
                Close
              </Button>
            </DialogFooter>
          </>
        ) : (
          <DialogHeader>
            <DialogTitle>Customer Details</DialogTitle>
            <DialogDescription>
              Loading customer information...
            </DialogDescription>
          </DialogHeader>
        )}
      </DialogContent>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete {customer?.name}'s record from the system. 
              This action cannot be undone and will remove all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => customer && deleteTenantMutation.mutate(customer.id)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              data-testid="button-confirm-delete-customer"
            >
              {deleteTenantMutation.isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Dialog>
  );
}
