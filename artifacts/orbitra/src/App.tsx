import { Switch, Route, Router as WouterRouter, useLocation } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SignedIn, SignedOut, RedirectToSignIn } from "@/lib/clerk-auth";
import NotFound from "@/pages/not-found";

import LandingPage from "@/pages/LandingPage";
import SignInPage from "@/pages/SignInPage";
import SignUpPage from "@/pages/SignUpPage";
import DashboardPage from "@/pages/DashboardPage";
import ProfilePage from "@/pages/ProfilePage";
import OpportunitiesPage from "@/pages/OpportunitiesPage";
import OpportunityDetailPage from "@/pages/OpportunityDetailPage";
import SkillGapPage from "@/pages/SkillGapPage";
import ApplicationsPage from "@/pages/ApplicationsPage";
import InterviewListPage from "@/pages/InterviewListPage";
import InterviewSessionPage from "@/pages/InterviewSessionPage";
import AppShell from "@/components/AppShell";

const queryClient = new QueryClient();

const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");

function ProtectedRoute({ component: Component }: { component: any }) {
  return (
    <>
      <SignedIn>
        <AppShell>
          <Component />
        </AppShell>
      </SignedIn>
      <SignedOut>
        <RedirectToSignIn redirectUrl={`${basePath}/dashboard`} />
      </SignedOut>
    </>
  );
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={LandingPage} />
      <Route path="/sign-in/*?">
        <SignInPage />
      </Route>
      <Route path="/sign-up/*?">
        <SignUpPage />
      </Route>
      
      {/* Protected Routes */}
      <Route path="/dashboard"><ProtectedRoute component={DashboardPage} /></Route>
      <Route path="/profile"><ProtectedRoute component={ProfilePage} /></Route>
      <Route path="/opportunities"><ProtectedRoute component={OpportunitiesPage} /></Route>
      <Route path="/opportunities/:id"><ProtectedRoute component={OpportunityDetailPage} /></Route>
      <Route path="/skill-gap"><ProtectedRoute component={SkillGapPage} /></Route>
      <Route path="/applications"><ProtectedRoute component={ApplicationsPage} /></Route>
      <Route path="/interview"><ProtectedRoute component={InterviewListPage} /></Route>
      <Route path="/interview/:id"><ProtectedRoute component={InterviewSessionPage} /></Route>

      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={basePath}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
