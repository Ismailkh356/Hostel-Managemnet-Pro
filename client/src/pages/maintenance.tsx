import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Maintenance, Room } from "@shared/schema";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Plus, Pencil, Trash2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

type MaintenanceFormData = {
  room_id: string;
  issue: string;
  date_reported: string;
  status: string;
  remarks: string;
};

export default function MaintenancePage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingMaintenance, setEditingMaintenance] = useState<Maintenance | null>(null);
  const [deletingMaintenance, setDeletingMaintenance] = useState<Maintenance | null>(null);
  const { toast } = useToast();

  const { data: maintenanceRecords = [], isLoading } = useQuery<Maintenance[]>({
    queryKey: ["/api/maintenance"],
  });

  const { data: rooms = [] } = useQuery<Room[]>({
    queryKey: ["/api/rooms"],
  });

  const [formData, setFormData] = useState<MaintenanceFormData>({
    room_id: "",
    issue: "",
    date_reported: "",
    status: "pending",
    remarks: "",
  });

  const resetForm = () => {
    setFormData({
      room_id: "",
      issue: "",
      date_reported: "",
      status: "pending",
      remarks: "",
    });
  };

  const createMaintenanceMutation = useMutation({
    mutationFn: async (data: MaintenanceFormData) => {
      const response = await apiRequest("POST", "/api/maintenance", {
        room_id: parseInt(data.room_id),
        issue: data.issue,
        date_reported: data.date_reported,
        status: data.status,
        remarks: data.remarks || null,
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/maintenance"] });
      toast({
        title: "Success",
        description: "Maintenance record added successfully",
      });
      setIsAddDialogOpen(false);
      resetForm();
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to add maintenance record",
        variant: "destructive",
      });
    },
  });

  const updateMaintenanceMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: MaintenanceFormData }) => {
      const response = await apiRequest("PUT", `/api/maintenance/${id}`, {
        room_id: parseInt(data.room_id),
        issue: data.issue,
        date_reported: data.date_reported,
        status: data.status,
        remarks: data.remarks || null,
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/maintenance"] });
      toast({
        title: "Success",
        description: "Maintenance record updated successfully",
      });
      setEditingMaintenance(null);
      resetForm();
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update maintenance record",
        variant: "destructive",
      });
    },
  });

  const deleteMaintenanceMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest("DELETE", `/api/maintenance/${id}`, undefined);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/maintenance"] });
      toast({
        title: "Success",
        description: "Maintenance record deleted successfully",
      });
      setDeletingMaintenance(null);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete maintenance record",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingMaintenance) {
      updateMaintenanceMutation.mutate({ id: editingMaintenance.id, data: formData });
    } else {
      createMaintenanceMutation.mutate(formData);
    }
  };

  const handleEdit = (record: Maintenance) => {
    setEditingMaintenance(record);
    setFormData({
      room_id: record.room_id.toString(),
      issue: record.issue,
      date_reported: record.date_reported,
      status: record.status,
      remarks: record.remarks || "",
    });
  };

  const getRoomName = (roomId: number) => {
    const room = rooms.find((r) => r.id === roomId);
    return room ? room.room_name : `Room #${roomId}`;
  };

  const filteredRecords = maintenanceRecords.filter((record) => {
    const matchesSearch = record.issue.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         getRoomName(record.room_id).toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || record.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400";
      case "in-progress":
        return "bg-blue-500/10 text-blue-700 dark:text-blue-400";
      case "completed":
        return "bg-green-500/10 text-green-700 dark:text-green-400";
      default:
        return "bg-gray-500/10 text-gray-700 dark:text-gray-400";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold mb-2">Maintenance Records</h1>
          <p className="text-muted-foreground">Track and manage room maintenance issues</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm} data-testid="button-add-maintenance">
              <Plus className="mr-2 h-4 w-4" />
              Add Maintenance Record
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Maintenance Record</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="room_id">Room *</Label>
                <Select
                  value={formData.room_id}
                  onValueChange={(value) => setFormData({ ...formData, room_id: value })}
                  required
                >
                  <SelectTrigger data-testid="select-maintenance-room">
                    <SelectValue placeholder="Select room" />
                  </SelectTrigger>
                  <SelectContent>
                    {rooms.map((room) => (
                      <SelectItem key={room.id} value={room.id.toString()}>
                        {room.room_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="issue">Issue Description *</Label>
                <Textarea
                  id="issue"
                  value={formData.issue}
                  onChange={(e) => setFormData({ ...formData, issue: e.target.value })}
                  placeholder="Describe the maintenance issue..."
                  required
                  data-testid="input-maintenance-issue"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="date_reported">Date Reported *</Label>
                <Input
                  id="date_reported"
                  type="date"
                  value={formData.date_reported}
                  onChange={(e) => setFormData({ ...formData, date_reported: e.target.value })}
                  required
                  data-testid="input-maintenance-date"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Status *</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => setFormData({ ...formData, status: value })}
                >
                  <SelectTrigger data-testid="select-maintenance-status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="in-progress">In Progress</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="remarks">Remarks (Optional)</Label>
                <Textarea
                  id="remarks"
                  value={formData.remarks}
                  onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                  placeholder="Additional notes..."
                  data-testid="input-maintenance-remarks"
                />
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsAddDialogOpen(false);
                    resetForm();
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={createMaintenanceMutation.isPending} data-testid="button-submit-maintenance">
                  {createMaintenanceMutation.isPending ? "Adding..." : "Add Record"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by issue or room..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
            data-testid="input-search-maintenance"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]" data-testid="select-maintenance-status-filter">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="in-progress">In Progress</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Loading maintenance records...</p>
        </div>
      ) : filteredRecords.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            {searchQuery || statusFilter !== "all"
              ? "No maintenance records found matching your criteria."
              : "No maintenance records added yet."}
          </p>
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Room</TableHead>
              <TableHead>Issue</TableHead>
              <TableHead>Date Reported</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Remarks</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredRecords.map((record) => (
              <TableRow key={record.id} data-testid={`row-maintenance-${record.id}`}>
                <TableCell className="font-medium">{getRoomName(record.room_id)}</TableCell>
                <TableCell className="max-w-xs truncate">{record.issue}</TableCell>
                <TableCell>
                  {new Date(record.date_reported).toLocaleDateString("en-PK", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </TableCell>
                <TableCell>
                  <Badge className={getStatusColor(record.status)} data-testid={`badge-status-${record.id}`}>
                    {record.status.replace("-", " ")}
                  </Badge>
                </TableCell>
                <TableCell className="max-w-xs truncate text-muted-foreground">
                  {record.remarks || "-"}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex gap-2 justify-end">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEdit(record)}
                      data-testid={`button-edit-maintenance-${record.id}`}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => setDeletingMaintenance(record)}
                      data-testid={`button-delete-maintenance-${record.id}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      {/* Edit Dialog */}
      <Dialog open={!!editingMaintenance} onOpenChange={(open) => !open && setEditingMaintenance(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Maintenance Record</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit_room_id">Room *</Label>
              <Select
                value={formData.room_id}
                onValueChange={(value) => setFormData({ ...formData, room_id: value })}
                required
              >
                <SelectTrigger data-testid="select-edit-maintenance-room">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {rooms.map((room) => (
                    <SelectItem key={room.id} value={room.id.toString()}>
                      {room.room_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit_issue">Issue Description *</Label>
              <Textarea
                id="edit_issue"
                value={formData.issue}
                onChange={(e) => setFormData({ ...formData, issue: e.target.value })}
                required
                data-testid="input-edit-maintenance-issue"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit_date_reported">Date Reported *</Label>
              <Input
                id="edit_date_reported"
                type="date"
                value={formData.date_reported}
                onChange={(e) => setFormData({ ...formData, date_reported: e.target.value })}
                required
                data-testid="input-edit-maintenance-date"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit_status">Status *</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => setFormData({ ...formData, status: value })}
              >
                <SelectTrigger data-testid="select-edit-maintenance-status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit_remarks">Remarks (Optional)</Label>
              <Textarea
                id="edit_remarks"
                value={formData.remarks}
                onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                data-testid="input-edit-maintenance-remarks"
              />
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setEditingMaintenance(null);
                  resetForm();
                }}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={updateMaintenanceMutation.isPending} data-testid="button-submit-edit-maintenance">
                {updateMaintenanceMutation.isPending ? "Updating..." : "Update Record"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deletingMaintenance} onOpenChange={(open) => !open && setDeletingMaintenance(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this maintenance record for{" "}
              {deletingMaintenance && getRoomName(deletingMaintenance.room_id)}.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deletingMaintenance && deleteMaintenanceMutation.mutate(deletingMaintenance.id)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              data-testid="button-confirm-delete-maintenance"
            >
              {deleteMaintenanceMutation.isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
