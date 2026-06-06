import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { SignedIn, SignedOut, RedirectToSignIn } from "@clerk/clerk-react";
import { FirebaseAuthProvider } from "@/contexts/FirebaseAuthContext";
import NuminLanding from "@/components/NuminLanding";
import { useUser } from "@clerk/clerk-react";
import NuminDashboard from "@/components/dashboard/NuminDashboard";
import AdminPortal from "@/components/admin/AdminPortal";
import OnboardingWizard from "@/components/onboarding/OnboardingWizard";
import IntakeForm from "@/components/onboarding/IntakeForm";
import NuminAuthPage from "@/components/auth/NuminAuthPage";
import GmailCallback from "@/pages/GmailCallback";
import { useEffect } from "react";

const queryClient = new QueryClient();

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => (
  <>
    <SignedIn>{children}</SignedIn>
    <SignedOut><RedirectToSignIn /></SignedOut>
  </>
);

// When APP_MODE=dashboard (hardware install / downloaded app),
// skip the landing page entirely — go straight to auth or dashboard.
const APP_MODE = import.meta.env.VITE_APP_MODE as string | undefined;

function RootRoute() {
  const { isSignedIn, isLoaded } = useUser();
  if (!isLoaded) return null;
  // Always show landing page at root — auth happens after user clicks Sign In or Get Started
  return <NuminLanding />;
}

const App = () => {
  useEffect(() => {
    document.title = "Numin — AI Business Operating System";
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <FirebaseAuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter
          future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
        >
          <Routes>
            {/* Root — landing or direct-to-app depending on VITE_APP_MODE */}
            <Route path="/" element={<RootRoute />} />
            <Route path="/landing" element={<NuminLanding />} />
            <Route path="/get-started" element={<IntakeForm />} />
            <Route path="/auth" element={<NuminAuthPage />} />
            <Route path="/auth/gmail/callback" element={<GmailCallback />} />

            {/* Protected — Client */}
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <NuminDashboard />
              </ProtectedRoute>
            } />
            <Route path="/onboard" element={
              <ProtectedRoute>
                <OnboardingWizard />
              </ProtectedRoute>
            } />

            {/* Protected — Admin */}
            <Route path="/admin" element={
              <ProtectedRoute>
                <AdminPortal />
              </ProtectedRoute>
            } />

            {/* Catch-all */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
      </FirebaseAuthProvider>
    </QueryClientProvider>
  );
};

export default App;
