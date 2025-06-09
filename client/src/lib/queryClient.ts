import { QueryClient, QueryFunction } from "@tanstack/react-query";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  const res = await fetch(url, {
    method,
    headers: data ? { "Content-Type": "application/json" } : {},
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include",
  });

  await throwIfResNotOk(res);
  return res;
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const res = await fetch(queryKey[0] as string, {
      credentials: "include",
      // Add cache control headers to improve performance
      headers: {
        'Cache-Control': 'max-age=300', // 5 minutes
      }
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: true, // Enable refetch on window focus for better data freshness
      staleTime: 5 * 60 * 1000, // 5 minutes - data becomes stale after 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes - data is removed from cache after 10 minutes
      retry: 1, // Retry failed requests once
    },
    mutations: {
      retry: 1, // Retry failed mutations once
    },
  },
});

/**
 * Prefetch profile data for a user to improve performance when visiting profiles
 * @param userId The ID of the user whose profile data to prefetch
 */
export async function prefetchProfileData(userId: string | number) {
  if (!userId) return;
  
  // Prefetch basic user data
  await queryClient.prefetchQuery({
    queryKey: [`/api/users/${userId}`],
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
  
  // Prefetch user stats
  await queryClient.prefetchQuery({
    queryKey: [`/api/users/${userId}/stats`],
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
  
  // Prefetch user badges
  await queryClient.prefetchQuery({
    queryKey: [`/api/users/${userId}/badges`],
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
  
  // Prefetch user completed challenges
  await queryClient.prefetchQuery({
    queryKey: [`/api/users/${userId}/completed-challenges`],
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
