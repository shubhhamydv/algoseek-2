import { useState, lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";

const Library = lazy(() => import("./pages/Library"));
const NotFound = lazy(() => import("./pages/NotFound"));
const IntroVideo = lazy(() => import("./components/IntroVideo").then(m => ({ default: m.IntroVideo })));

function Router() {
  return (
    <Suspense fallback={null}>
      <Switch>
        <Route path={"/"} component={Home} />
        <Route path={"/library"} component={Library} />
        <Route path={"/404"} component={NotFound} />
        <Route component={NotFound} />
      </Switch>
    </Suspense>
  );
}

// NOTE: About Theme
// - First choose a default theme according to your design style (dark or light bg), than change color palette in index.css
//   to keep consistent foreground/background color across components
// - If you want to make theme switchable, pass `switchable` ThemeProvider and use `useTheme` hook

function App() {
  // Intro video plays once on initial website visit / page load (skipped when directly viewing library)
  const isLibraryRoute = typeof window !== "undefined" && window.location.pathname.startsWith("/library");
  const [showIntro, setShowIntro] = useState(!isLibraryRoute);

  return (
    <ErrorBoundary>
      <ThemeProvider
        defaultTheme="light"
        // switchable
      >
        <TooltipProvider>
          {showIntro && (
            <Suspense fallback={null}>
              <IntroVideo
                src="/intro.mp4"
                onComplete={() => setShowIntro(false)}
              />
            </Suspense>
          )}
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
