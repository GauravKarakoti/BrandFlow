import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import NotFound from '@/pages/not-found';
import { Route, Switch, Router as WouterRouter } from 'wouter';
import { Layout } from '@/components/layout';

// Import our newly created page
import KnowledgeBase from '@/pages/knowledge-base';

const queryClient = new QueryClient();

// A generic placeholder component for pages we haven't built yet
const ModulePlaceholder = ({ title, description }: { title: string, description: string }) => (
  <div className="flex h-full min-h-[60vh] flex-col items-center justify-center rounded-2xl border border-dashed border-border/60 bg-background/50">
    <div className="flex flex-col items-center text-center max-w-md space-y-2">
      <h2 className="text-2xl font-semibold tracking-tight">{title}</h2>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  </div>
);

function Router() {
  return (
    <Layout>
      <Switch>
        <Route path="/" component={() => <ModulePlaceholder title="Dashboard" description="System overview and daily metrics." />} />
        <Route path="/chat" component={() => <ModulePlaceholder title="AI Chat" description="Interact with your Brand AI directly." />} />
        <Route path="/generate" component={() => <ModulePlaceholder title="Content Studio" description="Generate posts, threads, and captions." />} />
        <Route path="/calendar" component={() => <ModulePlaceholder title="Scheduler" description="Drag-and-drop calendar for content planning." />} />
        <Route path="/analytics" component={() => <ModulePlaceholder title="Analytics" description="Track reach, engagement, and audience growth." />} />
        <Route path="/inbox" component={() => <ModulePlaceholder title="Inbox" description="Manage comments, DMs, and auto-replies." />} />
        
        {/* Wire up the actual Knowledge Base route */}
        <Route path="/knowledge" component={KnowledgeBase} />
        
        <Route path="/settings" component={() => <ModulePlaceholder title="Brand Settings" description="Configure workspaces, integrations, and billing." />} />
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;