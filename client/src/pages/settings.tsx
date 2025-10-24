import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Settings } from "@shared/schema";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Save } from "lucide-react";

export default function Settings() {
  const { toast } = useToast();
  const [hostelName, setHostelName] = useState("");

  const { data: settings, isLoading } = useQuery<Settings>({
    queryKey: ["/api/settings"],
  });

  useEffect(() => {
    if (settings) {
      setHostelName(settings.hostel_name);
    }
  }, [settings]);

  const updateSettingsMutation = useMutation({
    mutationFn: async (data: { hostel_name: string }) => {
      const response = await apiRequest("PUT", "/api/settings", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/settings"] });
      toast({
        title: "Success",
        description: "Settings updated successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update settings",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettingsMutation.mutate({ hostel_name: hostelName });
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-semibold mb-2">Settings</h1>
          <p className="text-muted-foreground">Customize your hostel management system</p>
        </div>
        <Card className="animate-pulse">
          <CardHeader>
            <div className="h-6 bg-muted rounded w-1/3"></div>
            <div className="h-4 bg-muted rounded w-1/2 mt-2"></div>
          </CardHeader>
          <CardContent>
            <div className="h-10 bg-muted rounded"></div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold mb-2">Settings</h1>
        <p className="text-muted-foreground">Customize your hostel management system</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Hostel Information</CardTitle>
          <CardDescription>
            Update your hostel name and branding. This will appear in the sidebar and throughout the application.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="hostel_name">Hostel Name *</Label>
              <Input
                id="hostel_name"
                value={hostelName}
                onChange={(e) => setHostelName(e.target.value)}
                placeholder="Enter your hostel name (e.g., Bilawal Hostel)"
                required
                data-testid="input-hostel-name"
              />
              <p className="text-sm text-muted-foreground">
                This name will be displayed in the sidebar and header of the application.
              </p>
            </div>

            <div className="flex justify-end">
              <Button
                type="submit"
                disabled={updateSettingsMutation.isPending}
                data-testid="button-save-settings"
              >
                <Save className="mr-2 h-4 w-4" />
                {updateSettingsMutation.isPending ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Logo Upload</CardTitle>
          <CardDescription>
            Upload a custom logo for your hostel (Coming Soon)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="border-2 border-dashed border-muted rounded-lg p-8 text-center">
            <p className="text-muted-foreground">Logo upload feature will be available in a future update</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
