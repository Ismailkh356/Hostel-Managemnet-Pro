import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Shield, CheckCircle2 } from "lucide-react";

const activationSchema = z.object({
  license_key: z.string().min(1, "License key is required"),
  customer_name: z.string().optional(),
});

type ActivationFormData = z.infer<typeof activationSchema>;

interface ActivationPageProps {
  onActivationSuccess: () => void;
}

export default function ActivationPage({ onActivationSuccess }: ActivationPageProps) {
  const { toast } = useToast();
  const [machineId, setMachineId] = useState<string>("");

  const { data: machineIdData } = useQuery<{ machine_id: string }>({
    queryKey: ["/api/machine-id"],
  });

  useEffect(() => {
    if (machineIdData) {
      setMachineId(machineIdData.machine_id);
    }
  }, [machineIdData]);

  const form = useForm<ActivationFormData>({
    resolver: zodResolver(activationSchema),
    defaultValues: {
      license_key: "",
      customer_name: "",
    },
  });

  const validateMutation = useMutation({
    mutationFn: async (data: { license_key: string; machine_id: string }) => {
      const response = await apiRequest("POST", "/api/license/validate", data);
      return await response.json();
    },
    onSuccess: (data: any) => {
      if (data.valid) {
        toast({
          title: "License Activated",
          description: data.message,
        });
        
        setTimeout(() => {
          onActivationSuccess();
        }, 1000);
      } else {
        toast({
          title: "Activation Failed",
          description: data.message,
          variant: "destructive",
        });
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to activate license",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: ActivationFormData) => {
    if (!machineId) {
      toast({
        title: "Error",
        description: "Machine ID not available. Please try again.",
        variant: "destructive",
      });
      return;
    }

    validateMutation.mutate({
      license_key: data.license_key.trim(),
      machine_id: machineId,
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Shield className="h-12 w-12 text-primary" />
          </div>
          <CardTitle className="text-2xl">Activate HostelPro Local</CardTitle>
          <CardDescription>
            Enter your license key to activate this software
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="license_key"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>License Key</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="HOSTELPRO-XXXX-XXXX-XXXX-XXXX"
                        data-testid="input-license-key"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="customer_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Your Name (Optional)</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter your name"
                        data-testid="input-customer-name"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {machineId && (
                <div className="text-xs text-muted-foreground space-y-1">
                  <p className="font-medium">Machine ID:</p>
                  <p className="font-mono bg-muted p-2 rounded break-all">
                    {machineId}
                  </p>
                  <p className="text-muted-foreground">
                    This license will be bound to this machine
                  </p>
                </div>
              )}

              <Button
                type="submit"
                className="w-full"
                disabled={validateMutation.isPending || !machineId}
                data-testid="button-activate"
              >
                {validateMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Activating...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    Activate License
                  </>
                )}
              </Button>
            </form>
          </Form>

          <div className="mt-6 text-center text-sm text-muted-foreground">
            <p>Need a license key?</p>
            <p>Contact support to purchase HostelPro Local</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
