import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Tenant } from "@shared/schema";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
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
import { useToast } from "@/hooks/use-toast";

export default function Payments() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const { toast } = useToast();

  const { data: tenants = [], isLoading: tenantsLoading } = useQuery<Tenant[]>({
    queryKey: ["/api/tenants"],
  });

  const markAsPaidMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest("PUT", `/api/tenants/${id}/mark-paid`, undefined);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tenants"] });
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

  const markAsPendingMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest("PUT", `/api/tenants/${id}/mark-pending`, undefined);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tenants"] });
      toast({
        title: "Success",
        description: "Payment marked as pending",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to mark payment as pending",
        variant: "destructive",
      });
    },
  });

  const filteredTenants = tenants.filter((tenant) => {
    const matchesSearch =
      tenant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tenant.room_number.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || tenant.payment_status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalPaid = tenants
    .filter((t) => t.payment_status === "Paid")
    .reduce((sum, t) => sum + t.rent, 0);

  const totalPending = tenants
    .filter((t) => t.payment_status === "Pending")
    .reduce((sum, t) => sum + t.rent, 0);

  const getStatusColor = (status: string) => {
    return status === "Paid"
      ? "bg-green-500/10 text-green-700 dark:text-green-400"
      : "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400";
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold mb-2">Payments</h1>
        <p className="text-muted-foreground">Track tenant monthly rent payments</p>
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
            placeholder="Search by tenant name or room..."
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

      {tenantsLoading ? (
        <Card>
          <div className="p-8 text-center">
            <p className="text-muted-foreground">Loading tenants...</p>
          </div>
        </Card>
      ) : filteredTenants.length === 0 ? (
        <Card>
          <div className="p-8 text-center">
            <p className="text-muted-foreground">No tenants found matching your search.</p>
          </div>
        </Card>
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tenant Name</TableHead>
                <TableHead>Room</TableHead>
                <TableHead>Monthly Rent</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Payment Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTenants.map((tenant) => (
                <TableRow key={tenant.id} data-testid={`row-payment-${tenant.id}`}>
                  <TableCell className="font-medium">{tenant.name}</TableCell>
                  <TableCell>{tenant.room_number}</TableCell>
                  <TableCell data-testid={`text-amount-${tenant.id}`}>₨{tenant.rent.toFixed(2)}</TableCell>
                  <TableCell>
                    <Badge className={
                      tenant.status === "Active"
                        ? "bg-green-500/10 text-green-700 dark:text-green-400"
                        : "bg-red-500/10 text-red-700 dark:text-red-400"
                    }>
                      {tenant.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(tenant.payment_status)} data-testid={`badge-status-${tenant.id}`}>
                      {tenant.payment_status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex gap-2 justify-end">
                      {tenant.payment_status === "Pending" && (
                        <Button
                          size="sm"
                          onClick={() => markAsPaidMutation.mutate(tenant.id)}
                          disabled={markAsPaidMutation.isPending}
                          data-testid={`button-mark-paid-${tenant.id}`}
                        >
                          Mark as Paid
                        </Button>
                      )}
                      {tenant.payment_status === "Paid" && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => markAsPendingMutation.mutate(tenant.id)}
                          disabled={markAsPendingMutation.isPending}
                          data-testid={`button-mark-pending-${tenant.id}`}
                        >
                          Mark as Pending
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}
    </div>
  );
}
