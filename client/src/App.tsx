import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { DynamicContextProvider } from "@dynamic-labs/sdk-react-core";
import { EthereumWalletConnectors } from "@dynamic-labs/ethereum";
import Header from "@/components/header";
import Home from "@/pages/home";
import CreatorProfile from "@/pages/creator-profile";
import MyBookings from "@/pages/my-bookings";
import BecomeCreator from "@/pages/become-creator";
import NotFound from "@/pages/not-found";

const dynamicEnvironmentId = import.meta.env.VITE_DYNAMIC_ENVIRONMENT_ID || "live_default";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/creator/:id" component={CreatorProfile} />
      <Route path="/my-bookings" component={MyBookings} />
      <Route path="/become-creator" component={BecomeCreator} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <DynamicContextProvider
      settings={{
        environmentId: dynamicEnvironmentId,
        walletConnectors: [EthereumWalletConnectors],
      }}
    >
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <div className="min-h-screen bg-gray-50">
            <Header />
            <Router />
          </div>
          <Toaster />
        </TooltipProvider>
      </QueryClientProvider>
    </DynamicContextProvider>
  );
}

export default App;
