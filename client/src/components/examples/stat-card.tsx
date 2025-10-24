import { StatCard } from "../stat-card";
import { Users } from "lucide-react";

export default function StatCardExample() {
  return (
    <div className="p-6 bg-background">
      <StatCard
        title="Total Guests"
        value="42"
        icon={Users}
        trend={{ value: "12%", isPositive: true }}
        description="vs last month"
      />
    </div>
  );
}
