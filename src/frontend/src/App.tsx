import { Toaster } from "@/components/ui/sonner";
import {
  Outlet,
  RouterProvider,
  createRootRoute,
  createRoute,
  createRouter,
} from "@tanstack/react-router";
import { Ghost } from "lucide-react";
import { useEffect } from "react";
import DashboardLayout from "./components/DashboardLayout";
import GhostAdvisorChat from "./components/GhostAdvisorChat";
import { AdvisorProvider } from "./context/AdvisorContext";
import { useActor } from "./hooks/useActor";
import { useInternetIdentity } from "./hooks/useInternetIdentity";
import AnalysisPage from "./pages/AnalysisPage";
import DashboardHome from "./pages/DashboardHome";
import HistoryPage from "./pages/HistoryPage";
import LandingPage from "./pages/LandingPage";
import ProfilePage from "./pages/ProfilePage";

// ── Root guard ──────────────────────────────────────────────
function RootComponent() {
  const { identity, isInitializing } = useInternetIdentity();
  const { actor, isFetching } = useActor();

  // Register user on first login
  useEffect(() => {
    if (identity && actor && !isFetching) {
      actor.registerUser().catch(console.error);
    }
  }, [identity, actor, isFetching]);

  if (isInitializing) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <Ghost className="h-10 w-10 text-primary animate-ghost-float" />
          </div>
          <div className="space-y-1 text-center">
            <p className="font-display text-sm font-semibold text-foreground">
              GhostIQ
            </p>
            <p className="text-xs text-muted-foreground">
              Initializing session…
            </p>
          </div>
          <div className="flex gap-1.5">
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                className="h-1.5 w-1.5 rounded-full bg-primary/60"
                style={{
                  animation: `ghost-pulse 1s ease-in-out ${i * 0.2}s infinite`,
                }}
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Not authenticated — show landing for all routes
  if (!identity) {
    return <LandingPage />;
  }

  // Authenticated — render routed layout
  return (
    <AdvisorProvider>
      <DashboardLayout>
        <Outlet />
      </DashboardLayout>
      <GhostAdvisorChat />
      <Toaster />
    </AdvisorProvider>
  );
}

// ── Routes ────────────────────────────────────────────────────
const rootRoute = createRootRoute({ component: RootComponent });

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: DashboardHome,
});

const analysisRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/analysis",
  component: AnalysisPage,
});

const historyRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/history",
  component: HistoryPage,
});

const profileRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/profile",
  component: ProfilePage,
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  analysisRoute,
  historyRoute,
  profileRoute,
]);

const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

// ── App ───────────────────────────────────────────────────────
export default function App() {
  return <RouterProvider router={router} />;
}
