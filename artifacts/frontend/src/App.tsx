import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Route, Switch, Router as WouterRouter, useLocation } from 'wouter';
import { Layout } from '@/components/layout';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { Loader2 } from 'lucide-react';

// Pages
import NotFound from '@/pages/not-found';
import KnowledgeBase from '@/pages/knowledge-base';
import ContentGenerator from '@/pages/content-generator';
import Calendar from '@/pages/calendar';
import Login from '@/pages/login';
import Dashboard from './pages/dashboard';
import AgentConfiguration from './pages/agent-configuration';

const queryClient = new QueryClient();

// Protected Route Wrapper
const ProtectedRoute = ({ component: Component }: { component: React.ElementType }) => {
  const { user, isLoading } = useAuth();
  const [, setLocation] = useLocation();

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  if (!user) {
    setLocation("/login");
    return null;
  }

  // Wrap authenticated components in the Sidebar Layout
  return (
    <Layout>
      <Component />
    </Layout>
  );
};

function Router() {
  return (
    <Switch>
      {/* Public Auth Routes */}
      <Route path="/login" component={Login} />

      {/* Protected App Routes */}
      <Route path="/" component={() => <ProtectedRoute component={Dashboard} />} />
      <Route path="/generate" component={() => <ProtectedRoute component={ContentGenerator} />} />
      <Route path="/calendar" component={() => <ProtectedRoute component={Calendar} />} />
      <Route path="/agent" component={() => <ProtectedRoute component={AgentConfiguration} />} />
      <Route path="/knowledge" component={() => <ProtectedRoute component={KnowledgeBase} />} />

      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
          <AuthProvider>
            <Router />
          </AuthProvider>
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;