import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Payment, Tenant } from "@shared/schema";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, RefreshCw } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import { useToast } from "@/hooks/use-toast";

export default function Payments() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showResetDialog, setShowResetDialog] = useState(false);
  const { toast } = useToast();

  const { data: payments = [], isLoading: paymentsLoading } = useQuery<Payment[]>({
    queryKey: ["/api/payments"],
  });

  const { data: tenants = [] } = useQuery<Tenant[]>({
    queryKey: ["/api/tenants"],
  });

  const markAsPaidMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest("PUT", `/api/payments/${id}/mark-paid`, undefined);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/payments"] });
      toast({
        title: "Success",
        description: "Payment marked as paid",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to mark payment as paid",
        variant: "destructive",
      });
    },
  });

  const resetAllMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/payments/reset-all", undefined);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/payments"] });
      toast({
        title: "Success",
        description: "All payments reset to pending",
      });
      setShowResetDialog(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to reset payments",
        variant: "destructive",
      });
    },
  });

  const getTenantName = (tenantId: number) => {
    const tenant = tenants.find((t) => t.id === tenantId);
    return tenant?.name || "Unknown";
  };

  const filteredPayments = payments.filter((payment) => {
    const tenantName = getTenantName(payment.tenant_id);
    const matchesSearch =
      tenantName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      payment.month.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || payment.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalPaid = payments
    .filter((p) => p.status === "Paid")
    .reduce((sum, p) => sum + p.amount, 0);

  const totalPending = payments
    .filter((p) => p.status === "Pending")
    .reduce((sum, p) => sum + p.amount, 0);

  const getStatusColor = (status: string) => {
    return status === "Paid"
      ? "bg-green-500/10 text-green-700 dark:text-green-400"
      : "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400";
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold mb-2">Payments</h1>
          <p className="text-muted-foreground">Track tenant payments and rent collection</p>
        </div>
        <Button
          variant="outline"
          onClick={() => setShowResetDialog(true)}
          data-testid="button-reset-payments"
        >
          <RefreshCw className="mr-2 h-4 w-4" />
          Reset All Payments
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-6">
          <p className="text-sm font-medium text-muted-foreground mb-1">Total Revenue</p>
          <p className="text-2xl font-semibold" data-testid="text-total-revenue">
            ₨{(totalPaid + totalPending).toFixed(2)}
          </p>
        </Card>
        <Card className="p-6">
          <p className="text-sm font-medium text-muted-foreground mb-1">Paid</p>
          <p className="text-2xl font-semibold text-green-600 dark:text-green-400" data-testid="text-total-paid">
            ₨{totalPaid.toFixed(2)}
          </p>
        </Card>
        <Card className="p-6">
          <p className="text-sm font-medium text-muted-foreground mb-1">Pending</p>
          <p className="text-2xl font-semibold text-yellow-600 dark:text-yellow-400" data-testid="text-total-pending">
            ₨{totalPending.toFixed(2)}
          </p>
        </Card>
      </div>

      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by tenant name or month..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
            data-testid="input-search-payments"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]" data-testid="select-payment-status-filter">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="Paid">Paid</SelectItem>
            <SelectItem value="Pending">Pending</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {paymentsLoading ? (
        <Card>
          <div className="p-8 text-center">
            <p className="text-muted-foreground">Loading payments...</p>
          </div>
        </Card>
      ) : filteredPayments.length === 0 ? (
        <Card>
          <div className="p-8 text-center">
            <p className="text-muted-foreground">No payments found. Add payment records to track rent collection.</p>
          </div>
        </Card>
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tenant</TableHead>
                <TableHead>Month</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Method</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPayments.map((payment) => (
                <TableRow key={payment.id} data-testid={`row-payment-${payment.id}`}>
                  <TableCell className="font-medium">{getTenantName(payment.tenant_id)}</TableCell>
                  <TableCell>{payment.month}</TableCell>
                  <TableCell data-testid={`text-amount-${payment.id}`}>₨{payment.amount.toFixed(2)}</TableCell>
                  <TableCell>{payment.method}</TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(payment.status)} data-testid={`badge-status-${payment.id}`}>
                      {payment.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {payment.created_at
                      ? new Date(payment.created_at).toLocaleDateString("en-PK", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })
                      : "-"}
                  </TableCell>
                  <TableCell className="text-right">
                    {payment.status === "Pending" && (
                      <Button
                        size="sm"
                        onClick={() => markAsPaidMutation.mutate(payment.id)}
                        disabled={markAsPaidMutation.isPending}
                        data-testid={`button-mark-paid-${payment.id}`}
                      >
                        Mark as Paid
                      </Button>
                    )}
                    {payment.status === "Paid" && (
                      <span className="text-sm text-muted-foreground">Paid</span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}

      <AlertDialog open={showResetDialog} onOpenChange={setShowResetDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reset All Payments?</AlertDialogTitle>
            <AlertDialogDescription>
              This will reset all payment statuses to "Pending". This is typically done at the beginning of each new month.
              Are you sure you want to continue?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => resetAllMutation.mutate()}
              data-testid="button-confirm-reset-payments"
            >
              {resetAllMutation.isPending ? "Resetting..." : "Reset All"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
