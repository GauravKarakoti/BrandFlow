import { useEffect, useRef } from "react";
import { ClerkProvider, SignIn, SignUp, Show, useClerk } from '@clerk/react';
import { publishableKeyFromHost } from '@clerk/react/internal';
import { shadcn } from '@clerk/themes';
import { Switch, Route, useLocation, Router as WouterRouter, Redirect } from 'wouter';
import { QueryClient, QueryClientProvider, useQueryClient } from "@tanstack/react-query";

import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";

// Pages
import LandingPage from "@/pages/landing";
import DashboardOverview from "@/pages/dashboard/overview";
import DashboardGenerate from "@/pages/dashboard/generate";
import DashboardCalendar from "@/pages/dashboard/calendar";
import DashboardAnalytics from "@/pages/dashboard/analytics";
import DashboardComments from "@/pages/dashboard/comments";
import DashboardInbox from "@/pages/dashboard/inbox";
import DashboardBrand from "@/pages/dashboard/brand";
import DashboardKnowledge from "@/pages/dashboard/knowledge";
import DashboardTeam from "@/pages/dashboard/team";
import DashboardBilling from "@/pages/dashboard/billing";
import DashboardProfile from "@/pages/dashboard/profile";
import DashboardAiChat from "@/pages/dashboard/ai-chat";
import NotFound from "@/pages/not-found";

const queryClient = new QueryClient();

const clerkPubKey = publishableKeyFromHost(
  window.location.hostname,
  import.meta.env.VITE_CLERK_PUBLISHABLE_KEY,
);

const clerkProxyUrl = import.meta.env.VITE_CLERK_PROXY_URL;

const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");

function stripBase(path: string): string {
  return basePath && path.startsWith(basePath)
    ? path.slice(basePath.length) || "/"
    : path;
}

if (!clerkPubKey) {
  throw new Error('Missing VITE_CLERK_PUBLISHABLE_KEY in .env file');
}

const clerkAppearance = {
  theme: shadcn,
  cssLayerName: "clerk",
  options: {
    logoPlacement: "inside" as const,
    logoLinkUrl: basePath || "/",
    logoImageUrl: `${window.location.origin}${basePath}/logo.svg`,
  },
  variables: {
    colorPrimary: "hsl(262, 83%, 58%)",
    colorForeground: "hsl(0, 0%, 98%)",
    colorMutedForeground: "hsl(240, 5%, 65%)",
    colorDanger: "hsl(0, 62%, 30%)",
    colorBackground: "hsl(240, 20%, 8%)",
    colorInput: "hsl(240, 10%, 15%)",
    colorInputForeground: "hsl(0, 0%, 98%)",
    colorNeutral: "hsl(240, 10%, 15%)",
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    borderRadius: "0.75rem",
  },
  elements: {
    rootBox: "w-full flex justify-center",
    cardBox: "bg-[#0A0A0F] border border-[#1A1A24] rounded-2xl w-[440px] max-w-full overflow-hidden shadow-2xl shadow-black/50",
    card: "!shadow-none !border-0 !bg-transparent !rounded-none",
    footer: "!shadow-none !border-0 !bg-transparent !rounded-none",
    headerTitle: "text-white text-2xl font-bold tracking-tight",
    headerSubtitle: "text-zinc-400 text-sm",
    socialButtonsBlockButtonText: "text-zinc-200 font-medium",
    formFieldLabel: "text-zinc-300 font-medium text-sm",
    footerActionLink: "text-violet-500 font-medium hover:text-violet-400",
    footerActionText: "text-zinc-400",
    dividerText: "text-zinc-500 text-xs font-medium uppercase tracking-wider",
    identityPreviewEditButton: "text-violet-500 hover:text-violet-400",
    formFieldSuccessText: "text-emerald-500 text-sm",
    alertText: "text-red-400 text-sm",
    logoBox: "flex justify-center mb-6",
    logoImage: "w-12 h-12 rounded-xl",
    socialButtonsBlockButton: "border border-zinc-800 bg-zinc-900/50 hover:bg-zinc-800 text-white rounded-lg",
    formButtonPrimary: "bg-violet-600 hover:bg-violet-700 text-white rounded-lg font-medium shadow-[0_0_20px_rgba(124,58,237,0.3)] transition-all",
    formFieldInput: "bg-zinc-900 border-zinc-800 text-white placeholder:text-zinc-500 rounded-lg focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-all",
    footerAction: "flex items-center gap-2 justify-center",
    dividerLine: "bg-zinc-800",
    alert: "bg-red-500/10 border border-red-500/20 rounded-lg p-3",
    otpCodeFieldInput: "bg-zinc-900 border-zinc-800 text-white rounded-lg",
    formFieldRow: "space-y-4",
    main: "space-y-6",
  },
};

function SignInPage() {
  return (
    <div className="flex min-h-[100dvh] items-center justify-center bg-[#050508] relative overflow-hidden px-4">
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none mix-blend-overlay"></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-violet-600/20 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="relative z-10 w-full max-w-[440px]">
        <SignIn routing="path" path={`${basePath}/sign-in`} signUpUrl={`${basePath}/sign-up`} />
      </div>
    </div>
  );
}

function SignUpPage() {
  return (
    <div className="flex min-h-[100dvh] items-center justify-center bg-[#050508] relative overflow-hidden px-4">
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none mix-blend-overlay"></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-violet-600/20 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="relative z-10 w-full max-w-[440px]">
        <SignUp routing="path" path={`${basePath}/sign-up`} signInUrl={`${basePath}/sign-in`} />
      </div>
    </div>
  );
}

function ClerkQueryClientCacheInvalidator() {
  const { addListener } = useClerk();
  const queryClient = useQueryClient();
  const prevUserIdRef = useRef<string | null | undefined>(undefined);

  useEffect(() => {
    const unsubscribe = addListener(({ user }) => {
      const userId = user?.id ?? null;
      if (
        prevUserIdRef.current !== undefined &&
        prevUserIdRef.current !== userId
      ) {
        queryClient.clear();
      }
      prevUserIdRef.current = userId;
    });
    return unsubscribe;
  }, [addListener, queryClient]);

  return null;
}

function HomeRedirect() {
  return (
    <>
      <Show when="signed-in">
        <Redirect to="/dashboard" />
      </Show>
      <Show when="signed-out">
        <LandingPage />
      </Show>
    </>
  );
}

function ProtectedRoute({ component: Component }: { component: React.ComponentType }) {
  return (
    <>
      <Show when="signed-in">
        <Component />
      </Show>
      <Show when="signed-out">
        <Redirect to="/" />
      </Show>
    </>
  );
}

function ClerkProviderWithRoutes() {
  const [, setLocation] = useLocation();

  return (
    <ClerkProvider
      publishableKey={clerkPubKey}
      proxyUrl={clerkProxyUrl}
      appearance={clerkAppearance}
      signInUrl={`${basePath}/sign-in`}
      signUpUrl={`${basePath}/sign-up`}
      localization={{
        signIn: {
          start: {
            title: "Welcome back",
            subtitle: "Sign in to access your cockpit",
          },
        },
        signUp: {
          start: {
            title: "Create your account",
            subtitle: "Join the top 1% of marketers",
          },
        },
      }}
      routerPush={(to) => setLocation(stripBase(to))}
      routerReplace={(to) => setLocation(stripBase(to), { replace: true })}
    >
      <QueryClientProvider client={queryClient}>
        <ClerkQueryClientCacheInvalidator />
        <TooltipProvider>
          <Switch>
            <Route path="/" component={HomeRedirect} />
            <Route path="/sign-in/*?" component={SignInPage} />
            <Route path="/sign-up/*?" component={SignUpPage} />
            
            <Route path="/dashboard" component={() => <ProtectedRoute component={DashboardOverview} />} />
            <Route path="/dashboard/generate" component={() => <ProtectedRoute component={DashboardGenerate} />} />
            <Route path="/dashboard/calendar" component={() => <ProtectedRoute component={DashboardCalendar} />} />
            <Route path="/dashboard/analytics" component={() => <ProtectedRoute component={DashboardAnalytics} />} />
            <Route path="/dashboard/comments" component={() => <ProtectedRoute component={DashboardComments} />} />
            <Route path="/dashboard/inbox" component={() => <ProtectedRoute component={DashboardInbox} />} />
            <Route path="/dashboard/brand" component={() => <ProtectedRoute component={DashboardBrand} />} />
            <Route path="/dashboard/knowledge" component={() => <ProtectedRoute component={DashboardKnowledge} />} />
            <Route path="/dashboard/team" component={() => <ProtectedRoute component={DashboardTeam} />} />
            <Route path="/dashboard/billing" component={() => <ProtectedRoute component={DashboardBilling} />} />
            <Route path="/dashboard/profile" component={() => <ProtectedRoute component={DashboardProfile} />} />
            <Route path="/dashboard/ai-chat" component={() => <ProtectedRoute component={DashboardAiChat} />} />

            <Route component={NotFound} />
          </Switch>
          <Toaster />
        </TooltipProvider>
      </QueryClientProvider>
    </ClerkProvider>
  );
}

function App() {
  return (
    <WouterRouter base={basePath}>
      <ClerkProviderWithRoutes />
    </WouterRouter>
  );
}

export default App;
