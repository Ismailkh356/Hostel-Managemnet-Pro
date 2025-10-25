import { useQuery } from "@tanstack/react-query";

export interface LicenseInfo {
  license_key: string;
  customer_name: string;
  hostel_name: string;
  status: string;
  issue_date: string;
  expiry_date: string | null;
  activated_at: string;
}

export function useLicense() {
  const { data, isLoading, error, refetch } = useQuery<LicenseInfo>({
    queryKey: ["/api/license"],
    retry: false,
  });

  return {
    license: data,
    isLoading,
    hasLicense: !!data && data.status === "active",
    error,
    refetch,
  };
}
