import { lazy, Suspense } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Loader2 } from "lucide-react";
import ErrorBoundary from "@/components/ErrorBoundary";
import ConsentBanner from "@/components/ConsentBanner";
import { AppProvider } from "@/contexts/AppContext";
import { ThemeProvider } from "@/contexts/ThemeContext";

// Layout and Core components (keep synchronous as they are shared)
import AppLayout from "@/components/AppLayout";
const HomeScreen = lazy(() => import("@/components/HomeScreen"));

// Lazy load screens
const TrainingScreen = lazy(() => import("@/components/TrainingScreen"));
const RunningScreen = lazy(() => import("@/components/RunningScreen"));
const NutritionScreen = lazy(() => import("@/components/NutritionScreen"));
const ProgressScreen = lazy(() => import("@/components/ProgressScreen"));
const PremiumScreen = lazy(() => import("@/components/PremiumScreen"));
const ProfileScreen = lazy(() => import("@/components/ProfileScreen"));
const SearchScreen = lazy(() => import("@/components/SearchScreen"));
const AIChatScreen = lazy(() => import("@/components/AIChatScreen"));
const ComunidadeScreen = lazy(() => import("@/components/ComunidadeScreen"));
const ClubesScreen = lazy(() => import("@/components/ClubesScreen"));

// Lazy load pages
const PrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy"));
const TermsOfUse = lazy(() => import("./pages/TermsOfUse"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const LanguageSettings = lazy(() => import("./pages/LanguageSettings"));
const RunResult = lazy(() => import("./pages/RunResult"));
const Cadastro = lazy(() => import("./pages/Cadastro"));
const EsqueciSenha = lazy(() => import("./pages/EsqueciSenha"));
const Historico = lazy(() => import("./pages/Historico"));
const Configuracoes = lazy(() => import("./pages/Configuracoes"));
const TreinoDetalhe = lazy(() => import("./pages/TreinoDetalhe"));
const CorridaAtiva = lazy(() => import("./pages/CorridaAtiva"));
const PixCheckout = lazy(() => import("./pages/PixCheckout"));
const Workouts = lazy(() => import("./pages/Workouts"));
const WorkoutDetail = lazy(() => import("./pages/WorkoutDetail"));
const WorkoutSession = lazy(() => import("./pages/WorkoutSession"));
const WorkoutSummary = lazy(() => import("./pages/WorkoutSummary"));
const WorkoutBuilderPage = lazy(() => import("./pages/WorkoutBuilder"));
const UserProfile = lazy(() => import("./pages/UserProfile"));
const Messages = lazy(() => import("./pages/Messages"));
const Chat = lazy(() => import("./pages/Chat"));
const Clips = lazy(() => import("./pages/Clips"));
const NotFound = lazy(() => import("./pages/NotFound"));
const CheckoutReturn = lazy(() => import("./pages/CheckoutReturn"));

const PageLoader = () => (
  <div className="flex items-center justify-center min-h-[60vh]">
    <Loader2 className="w-8 h-8 animate-spin text-primary" />
  </div>
);

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
              <Suspense fallback={<PageLoader />}>
                <Routes>
                  {/* Public */}
                  <Route path="/privacidade" element={<PrivacyPolicy />} />
                  <Route path="/termos" element={<TermsOfUse />} />
                  <Route path="/checkout/return" element={<CheckoutReturn />} />
                  <Route path="/reset-password" element={<ResetPassword />} />
                  <Route path="/cadastro" element={<Cadastro />} />
                  <Route path="/esqueci-senha" element={<EsqueciSenha />} />

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
                    <Route path="/buscar" element={<SearchScreen />} />
                    <Route path="/ai" element={<AIChatScreen />} />
                    <Route path="/comunidade" element={<ComunidadeScreen />} />
                    <Route path="/clubes" element={<ClubesScreen />} />
                    <Route path="/assinatura" element={<Navigate to="/premium" replace />} />
                    <Route path="/configuracoes" element={<Configuracoes />} />
                    <Route path="/configuracoes/idioma" element={<LanguageSettings />} />
                    <Route path="/historico" element={<Historico />} />
                    <Route path="/treino/:id" element={<TreinoDetalhe />} />
                    <Route path="/corrida/ativa" element={<CorridaAtiva />} />
                    <Route path="/corrida/resultado/:id" element={<RunResult />} />
                    <Route path="/pix" element={<PixCheckout />} />
                    <Route path="/workouts" element={<Workouts />} />
                    <Route path="/workout/:id" element={<WorkoutDetail />} />
                    <Route path="/workout-session/:id" element={<WorkoutSession />} />
                    <Route path="/workout-summary/:id" element={<WorkoutSummary />} />
                    <Route path="/workout-builder" element={<WorkoutBuilderPage />} />
                    <Route path="/u/:userId" element={<UserProfile />} />
                    <Route path="/mensagens" element={<Messages />} />
                    <Route path="/chat/:userId" element={<Chat />} />
                    <Route path="/clipes" element={<Clips />} />
                  </Route>

                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Suspense>
              <ConsentBanner />
            </ThemeProvider>
          </AppProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
