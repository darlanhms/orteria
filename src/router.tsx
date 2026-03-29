import { createRouter as createTanStackRouter } from "@tanstack/react-router"
import { routeTree } from "./routeTree.gen"
import { ConvexQueryClient } from "@convex-dev/react-query"
import { QueryClient } from "@tanstack/react-query"
import { setupRouterSsrQueryIntegration } from '@tanstack/react-router-ssr-query'


export function getRouter() {
  const convexUrl = (import.meta as any).env.VITE_CONVEX_URL!
  if (!convexUrl) {
    throw new Error('VITE_CONVEX_URL is not set')
  }

  const convexQueryClient = new ConvexQueryClient(convexUrl)

  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        queryKeyHashFn: convexQueryClient.hashFn(),
        queryFn: convexQueryClient.queryFn(),
      },
    },
  })

  const router = createTanStackRouter({
    routeTree,
    context: { queryClient, convexQueryClient },
    scrollRestoration: true,
    defaultPreload: "intent",
    defaultPreloadStaleTime: 0,
  })

  setupRouterSsrQueryIntegration({
    router,
    queryClient,
  })

  return router
}

declare module "@tanstack/react-router" {
  interface Register {
    router: ReturnType<typeof getRouter>
  }
}
