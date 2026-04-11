import { useState, useEffect } from "react";
import { X, Download } from "lucide-react";
import { Button } from "@/components/ui/button";

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export default function InstallBanner() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia("(display-mode: standalone)").matches) {
      setIsInstalled(true);
      return;
    }

    // Check if dismissed permanently (only after install)
    if (localStorage.getItem("app-installed") === "true") {
      setIsInstalled(true);
      return;
    }

    // Detect iOS
    const ua = navigator.userAgent;
    const isiOS = /iPad|iPhone|iPod/.test(ua) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
    setIsIOS(isiOS);

    // Listen for the install prompt (Chrome, Edge, Samsung, etc.)
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };
    window.addEventListener("beforeinstallprompt", handler);

    // Detect when app is installed
    window.addEventListener("appinstalled", () => {
      setIsInstalled(true);
      localStorage.setItem("app-installed", "true");
    });

    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (deferredPrompt) {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") {
        setIsInstalled(true);
        localStorage.setItem("app-installed", "true");
      }
    } else if (isIOS) {
      setShowIOSGuide(!showIOSGuide);
    }
  };

  // Don't show if installed or in standalone mode
  if (isInstalled) return null;

  // Don't show in iframe (Lovable preview)
  try {
    if (window.self !== window.top) return null;
  } catch { return null; }

  return (
    <div className="fixed top-0 left-0 right-0 z-[100] bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-lg">
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <img src="/favicon.png" alt="Welfare" className="h-8 w-8 rounded-lg" />
          <div className="min-w-0">
            <p className="text-sm font-semibold truncate">Install Welfare Manager</p>
            <p className="text-xs text-white/80 truncate">Get the app for quick access</p>
          </div>
        </div>
        <Button
          onClick={handleInstall}
          size="sm"
          className="bg-white text-green-700 hover:bg-white/90 font-semibold shrink-0"
        >
          <Download className="h-4 w-4 mr-1" />
          Install
        </Button>
      </div>

      {/* iOS install guide */}
      {showIOSGuide && isIOS && (
        <div className="px-4 pb-3 text-sm space-y-1 border-t border-white/20 pt-2">
          <p className="font-semibold">To install on iPhone/iPad:</p>
          <ol className="list-decimal list-inside space-y-0.5 text-white/90 text-xs">
            <li>Tap the <strong>Share</strong> button (square with arrow) in Safari</li>
            <li>Scroll down and tap <strong>"Add to Home Screen"</strong></li>
            <li>Tap <strong>"Add"</strong> in the top right</li>
          </ol>
          <button onClick={() => setShowIOSGuide(false)} className="text-xs underline text-white/70 mt-1">
            Got it
          </button>
        </div>
      )}
    </div>
  );
}
