import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import ErrorBoundary from "@/components/ErrorBoundary";
import ConsentBanner from "@/components/ConsentBanner";
import { AppProvider } from "@/contexts/AppContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import AppLayout from "@/components/AppLayout";
import HomeScreen from "@/components/HomeScreen";
import TrainingScreen from "@/components/TrainingScreen";
import RunningScreen from "@/components/RunningScreen";
import NutritionScreen from "@/components/NutritionScreen";
import ProgressScreen from "@/components/ProgressScreen";
import PremiumScreen from "@/components/PremiumScreen";
import ProfileScreen from "@/components/ProfileScreen";
import AIChatScreen from "@/components/AIChatScreen";
import NotFound from "./pages/NotFound";
import CheckoutReturn from "./pages/CheckoutReturn";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfUse from "./pages/TermsOfUse";
import ResetPassword from "./pages/ResetPassword";
import LanguageSettings from "./pages/LanguageSettings";
import RunResult from "./pages/RunResult";

const queryClient = new QueryClient();

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AppProvider>
            <ThemeProvider>
              <Routes>
                {/* Public */}
                <Route path="/privacidade" element={<PrivacyPolicy />} />
                <Route path="/termos" element={<TermsOfUse />} />
                <Route path="/checkout/return" element={<CheckoutReturn />} />
                <Route path="/reset-password" element={<ResetPassword />} />

                {/* App (auth gated inside AppLayout) */}
                <Route element={<AppLayout />}>
                  <Route path="/" element={<Navigate to="/home" replace />} />
                  <Route path="/home" element={<HomeScreen />} />
                  <Route path="/treinos" element={<TrainingScreen />} />
                  <Route path="/corrida" element={<RunningScreen />} />
                  <Route path="/nutricao" element={<NutritionScreen />} />
                  <Route path="/evolucao" element={<ProgressScreen />} />
                  <Route path="/premium" element={<PremiumScreen />} />
                  <Route path="/perfil" element={<ProfileScreen />} />
                  <Route path="/ai" element={<AIChatScreen />} />
                  <Route path="/assinatura" element={<Navigate to="/premium" replace />} />
                  <Route path="/configuracoes/idioma" element={<LanguageSettings />} />
                  <Route path="/corrida/resultado/:id" element={<RunResult />} />
                </Route>

                <Route path="*" element={<NotFound />} />
              </Routes>
              <ConsentBanner />
            </ThemeProvider>
          </AppProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
