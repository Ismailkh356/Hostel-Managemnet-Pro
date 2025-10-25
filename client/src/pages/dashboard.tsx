import { StatCard } from "@/components/stat-card";
import { Users, Bed, DollarSign, CheckCircle, Bell } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import type { Tenant, Room } from "@shared/schema";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function Dashboard() {
  const { data: tenants = [], isLoading: tenantsLoading } = useQuery<Tenant[]>({
    queryKey: ["/api/tenants"],
  });

  const { data: rooms = [], isLoading: roomsLoading } = useQuery<Room[]>({
    queryKey: ["/api/rooms"],
  });

  const totalTenants = tenants.length;
  const activeTenants = tenants.filter(t => t.status === "Active").length;
  const totalRooms = rooms.length;
  const occupiedRooms = rooms.filter(r => r.status === "Occupied").length;
  const occupancyRate = totalRooms > 0 ? Math.round((occupiedRooms / totalRooms) * 100) : 0;
  
  const totalRevenue = tenants
    .filter(t => t.status === "Active")
    .reduce((sum, t) => sum + t.rent, 0);
  
  const paidTenants = tenants.filter(t => t.payment_status === "Paid").length;
  const pendingTenants = tenants.filter(t => t.payment_status === "Pending").length;
  const pendingRentTenants = tenants.filter(t => t.payment_status === "Pending" && t.status === "Active");

  const isLoading = tenantsLoading || roomsLoading;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold mb-2">Dashboard</h1>
        <p className="text-muted-foreground">Welcome back! Here's what's happening today.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Tenants"
          value={isLoading ? "..." : totalTenants.toString()}
          icon={Users}
          description={`${activeTenants} active`}
          data-testid="stat-total-tenants"
        />
        <StatCard
          title="Occupied Rooms"
          value={isLoading ? "..." : `${occupiedRooms}/${totalRooms}`}
          icon={Bed}
          description={`${occupancyRate}% occupancy`}
          data-testid="stat-occupied-rooms"
        />
        <StatCard
          title="Monthly Revenue"
          value={isLoading ? "..." : `₨${totalRevenue.toFixed(0)}`}
          icon={DollarSign}
          description="From active tenants"
          data-testid="stat-monthly-revenue"
        />
        <StatCard
          title="Payment Status"
          value={isLoading ? "..." : `${paidTenants}/${totalTenants}`}
          icon={CheckCircle}
          description={`${pendingTenants} pending`}
          data-testid="stat-payment-status"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <h2 className="text-xl font-semibold mb-4">Payment Status Overview</h2>
          <Card className="p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Paid This Month</p>
                  <p className="text-2xl font-semibold text-green-600 dark:text-green-400" data-testid="text-paid-count">
                    {paidTenants}
                  </p>
                </div>
                <Badge className="bg-green-500/10 text-green-700 dark:text-green-400">
                  Paid
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Pending Payment</p>
                  <p className="text-2xl font-semibold text-yellow-600 dark:text-yellow-400" data-testid="text-pending-count">
                    {pendingTenants}
                  </p>
                </div>
                <Badge className="bg-yellow-500/10 text-yellow-700 dark:text-yellow-400">
                  Pending
                </Badge>
              </div>
            </div>
          </Card>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-4">Room Status Overview</h2>
          <Card className="p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Occupied Rooms</p>
                  <p className="text-2xl font-semibold text-blue-600 dark:text-blue-400" data-testid="text-occupied-count">
                    {occupiedRooms}
                  </p>
                </div>
                <Badge className="bg-blue-500/10 text-blue-700 dark:text-blue-400">
                  Occupied
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Available Rooms</p>
                  <p className="text-2xl font-semibold text-green-600 dark:text-green-400" data-testid="text-available-count">
                    {totalRooms - occupiedRooms}
                  </p>
                </div>
                <Badge className="bg-green-500/10 text-green-700 dark:text-green-400">
                  Available
                </Badge>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Rent Reminders Section */}
      {pendingRentTenants.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Bell className="h-5 w-5 text-yellow-600" />
            Rent Payment Reminders
          </h2>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">
                {pendingRentTenants.length} {pendingRentTenants.length === 1 ? 'Tenant' : 'Tenants'} with Pending Rent
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {pendingRentTenants.slice(0, 5).map((tenant) => (
                  <div
                    key={tenant.id}
                    className="flex items-center justify-between p-3 rounded-md bg-muted/50 hover-elevate"
                    data-testid={`reminder-tenant-${tenant.id}`}
                  >
                    <div>
                      <p className="font-medium" data-testid={`reminder-name-${tenant.id}`}>
                        {tenant.name}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Room {tenant.room_number} • ₨{tenant.rent.toFixed(2)}/month
                      </p>
                    </div>
                    <Badge className="bg-yellow-500/10 text-yellow-700 dark:text-yellow-400">
                      Pending
                    </Badge>
                  </div>
                ))}
                {pendingRentTenants.length > 5 && (
                  <div className="text-center pt-2">
                    <Link href="/payments">
                      <Button variant="outline" size="sm" data-testid="button-view-all-reminders">
                        View All {pendingRentTenants.length} Pending Payments
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
