import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Landing from "@/pages/landing";
import Home from "@/pages/home";
import Profile from "@/pages/profile";
import Members from "@/pages/members";
import Events from "@/pages/events";
import HelpDesk from "@/pages/help-desk";
import Matrimony from "@/pages/matrimony";
import Jobs from "@/pages/jobs";
import BusinessHub from "@/pages/business-hub";
import VersionSelector from "@/pages/version-selector";
import Announcements from "@/pages/announcements";
import Messages from "@/pages/messages";
import { useAuth } from "@/hooks/useAuth";
import { useEffect, useState } from "react";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();
  const [currentVersion, setCurrentVersion] = useState<string>('v1');

  useEffect(() => {
    const version = localStorage.getItem('digital-house-version') || 'v1';
    setCurrentVersion(version);
  }, []);

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <Switch>
      <Route path="/version-selector" component={VersionSelector} />
      {!isAuthenticated ? (
        <Route path="/" component={Landing} />
      ) : (
        <>
          <Route path="/" component={Home} />
          <Route path="/profile" component={Profile} />
          <Route path="/members" component={Members} />
          <Route path="/events" component={Events} />
          <Route path="/help-desk" component={HelpDesk} />
          <Route path="/announcements" component={Announcements} />
          <Route path="/messages" component={Messages} />
          
          {/* Version 2.0 Features - Always available but show different content based on version */}
          <Route path="/matrimony" component={Matrimony} />
          <Route path="/jobs" component={Jobs} />
          <Route path="/business" component={BusinessHub} />
        </>
      )}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
