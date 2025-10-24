import { useState } from "react";
import { GuestListItem } from "@/components/guest-list-item";
import { AddCustomerDialog } from "@/components/add-customer-dialog";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";
import type { Tenant } from "@shared/schema";

export default function Guests() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const { data: tenants = [], isLoading } = useQuery<Tenant[]>({
    queryKey: ["/api/tenants"],
  });

  const filteredTenants = tenants.filter((tenant) => {
    const matchesSearch = tenant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         tenant.mobile_number.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || tenant.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold mb-2">Customers (Tenants)</h1>
          <p className="text-muted-foreground">View and manage customer information</p>
        </div>
        <AddCustomerDialog />
      </div>

      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name or mobile number..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
            data-testid="input-search-guests"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]" data-testid="select-guest-status-filter">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Customers</SelectItem>
            <SelectItem value="Active">Active</SelectItem>
            <SelectItem value="Left">Left</SelectItem>
            <SelectItem value="Pending">Pending</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Loading customers...</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredTenants.map((tenant) => (
            <GuestListItem
              key={tenant.id}
              id={tenant.id.toString()}
              name={tenant.name}
              email={tenant.cnic}
              phone={tenant.mobile_number}
              totalBookings={0}
              currentStatus={tenant.status === "Active" ? "checked-in" : "checked-out"}
              onViewProfile={() => console.log("View profile:", tenant.id)}
            />
          ))}
        </div>
      )}

      {!isLoading && filteredTenants.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No customers found matching your criteria.</p>
        </div>
      )}
    </div>
  );
}
