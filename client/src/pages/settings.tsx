import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Settings } from "@shared/schema";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Save, Shield, CheckCircle2, Calendar, Lock, LogOut } from "lucide-react";
import { useLicense, type LicenseInfo } from "@/hooks/use-license";
import { Badge } from "@/components/ui/badge";

export default function Settings() {
  const { toast } = useToast();
  const [hostelName, setHostelName] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const { license } = useLicense();

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

  const changePasswordMutation = useMutation({
    mutationFn: async (data: { currentPassword: string; newPassword: string; confirmPassword: string }) => {
      const response = await apiRequest("POST", "/api/auth/change-password", data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Password changed successfully",
      });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to change password",
        variant: "destructive",
      });
    },
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/auth/logout", {});
      return response.json();
    },
    onSuccess: () => {
      window.location.reload();
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to logout",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettingsMutation.mutate({ hostel_name: hostelName });
  };

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast({
        title: "Error",
        description: "Passwords do not match",
        variant: "destructive",
      });
      return;
    }
    changePasswordMutation.mutate({ currentPassword, newPassword, confirmPassword });
  };

  const handleLogout = () => {
    logoutMutation.mutate();
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
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            License Information
          </CardTitle>
          <CardDescription>
            Your software license details and activation status
          </CardDescription>
        </CardHeader>
        <CardContent>
          {license ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-muted-foreground">License Key</Label>
                  <div className="font-mono text-sm bg-muted p-3 rounded break-all" data-testid="text-license-key">
                    {license.license_key}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium text-muted-foreground">Customer Name</Label>
                  <div className="text-sm p-3" data-testid="text-customer-name">
                    {license.customer_name}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium text-muted-foreground">Hostel Name</Label>
                  <div className="text-sm p-3" data-testid="text-hostel-name">
                    {license.hostel_name}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium text-muted-foreground">Status</Label>
                  <div className="p-3">
                    <Badge
                      variant={license.status === "active" ? "default" : "secondary"}
                      data-testid="badge-license-status"
                    >
                      <CheckCircle2 className="h-3 w-3 mr-1" />
                      {license.status.charAt(0).toUpperCase() + license.status.slice(1)}
                    </Badge>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium text-muted-foreground">Issue Date</Label>
                  <div className="text-sm p-3" data-testid="text-issue-date">
                    <Calendar className="h-4 w-4 inline mr-2" />
                    {new Date(license.issue_date).toLocaleDateString()}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium text-muted-foreground">Expiry Date</Label>
                  <div className="text-sm p-3" data-testid="text-expiry-date">
                    <Calendar className="h-4 w-4 inline mr-2" />
                    {license.expiry_date
                      ? new Date(license.expiry_date).toLocaleDateString()
                      : "Lifetime"}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium text-muted-foreground">Activated On</Label>
                  <div className="text-sm p-3" data-testid="text-activated-at">
                    <Calendar className="h-4 w-4 inline mr-2" />
                    {license.activated_at
                      ? new Date(license.activated_at).toLocaleDateString()
                      : "Not activated"}
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t">
                <p className="text-sm text-muted-foreground mb-4">
                  This license is bound to this machine. If you need to transfer the license to another machine, please contact support.
                </p>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <Shield className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">No license information available</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5" />
            Change Password
          </CardTitle>
          <CardDescription>
            Update your admin account password
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handlePasswordChange} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="current_password">Current Password *</Label>
              <Input
                id="current_password"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Enter current password"
                required
                data-testid="input-current-password"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="new_password">New Password *</Label>
              <Input
                id="new_password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password (min 6 characters)"
                required
                minLength={6}
                data-testid="input-new-password"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirm_password">Confirm New Password *</Label>
              <Input
                id="confirm_password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
                required
                minLength={6}
                data-testid="input-confirm-new-password"
              />
            </div>

            <div className="flex justify-end">
              <Button
                type="submit"
                disabled={changePasswordMutation.isPending}
                data-testid="button-change-password"
              >
                <Lock className="mr-2 h-4 w-4" />
                {changePasswordMutation.isPending ? "Changing..." : "Change Password"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <LogOut className="h-5 w-5" />
            Session Management
          </CardTitle>
          <CardDescription>
            End your current session and return to the login screen
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">
                Logout from your admin account. You will need to log in again to access the dashboard.
              </p>
            </div>
            <Button
              variant="destructive"
              onClick={handleLogout}
              disabled={logoutMutation.isPending}
              data-testid="button-logout"
            >
              <LogOut className="mr-2 h-4 w-4" />
              {logoutMutation.isPending ? "Logging out..." : "Logout"}
            </Button>
          </div>
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
