import { useState, useEffect } from "react";
import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider, useQuery } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { ThemeProvider } from "@/components/theme-provider";
import { ThemeToggle } from "@/components/theme-toggle";
import Dashboard from "@/pages/dashboard";
import Rooms from "@/pages/rooms";
import Guests from "@/pages/guests";
import Payments from "@/pages/payments";
import Settings from "@/pages/settings";
import NotFound from "@/pages/not-found";
import ActivationPage from "@/pages/activation";
import AdminSetup from "@/pages/admin-setup";
import AdminLogin from "@/pages/admin-login";
import { useLicense } from "@/hooks/use-license";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/rooms" component={Rooms} />
      <Route path="/guests" component={Guests} />
      <Route path="/payments" component={Payments} />
      <Route path="/settings" component={Settings} />
      <Route component={NotFound} />
    </Switch>
  );
}

interface AuthStatus {
  hasAdminAccount: boolean;
  isAuthenticated: boolean;
  username: string | null;
}

function AppContent() {
  const { hasLicense, isLoading: licenseLoading, refetch: refetchLicense } = useLicense();
  const [isActivated, setIsActivated] = useState(false);

  const { data: authStatus, isLoading: authLoading, refetch: refetchAuth } = useQuery<AuthStatus>({
    queryKey: ["/api/auth/status"],
    enabled: hasLicense || isActivated
  });

  const handleActivationSuccess = () => {
    setIsActivated(true);
    refetchLicense();
  };

  const handleSetupComplete = () => {
    refetchAuth();
  };

  const handleLoginSuccess = () => {
    refetchAuth();
  };

  if (licenseLoading || (authLoading && (hasLicense || isActivated))) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!hasLicense && !isActivated) {
    return <ActivationPage onActivationSuccess={handleActivationSuccess} />;
  }

  if (authStatus && !authStatus.hasAdminAccount) {
    return <AdminSetup onSetupComplete={handleSetupComplete} />;
  }

  if (authStatus && !authStatus.isAuthenticated) {
    return <AdminLogin onLoginSuccess={handleLoginSuccess} />;
  }

  const style = {
    "--sidebar-width": "16rem",
    "--sidebar-width-icon": "3rem",
  };

  return (
    <SidebarProvider style={style as React.CSSProperties}>
      <div className="flex h-screen w-full">
        <AppSidebar />
        <div className="flex flex-col flex-1 overflow-hidden">
          <header className="flex items-center justify-between p-4 border-b">
            <SidebarTrigger data-testid="button-sidebar-toggle" />
            <ThemeToggle />
          </header>
          <main className="flex-1 overflow-auto p-6">
            <Router />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <AppContent />
          <Toaster />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
