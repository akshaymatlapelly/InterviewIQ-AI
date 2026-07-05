import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ShieldAlert, AlertTriangle } from 'lucide-react';
import { Button } from './ui/Button';

export function StrictModeGuard({ children, onViolationEnd, onWarningChange }) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [warningCount, setWarningCount] = useState(0);
  const [showWarning, setShowWarning] = useState(false);
  const [warningMsg, setWarningMsg] = useState('');

  const warningCountRef = useRef(0);
  const violationLockRef = useRef(false);
  const isFullscreenRef = useRef(false);

  // Attempt to enter fullscreen
  const requestFullscreen = useCallback(async () => {
    try {
      const element = document.documentElement;
      if (element.requestFullscreen) {
        await element.requestFullscreen();
      } else if (element.webkitRequestFullscreen) {
        await element.webkitRequestFullscreen();
      } else if (element.msRequestFullscreen) {
        await element.msRequestFullscreen();
      }
      setIsFullscreen(true);
      isFullscreenRef.current = true;
    } catch (err) {
      console.warn("Fullscreen request rejected:", err);
    }
  }, []);

  // Trigger violation
  const triggerViolation = useCallback((message) => {
    if (violationLockRef.current) return;
    violationLockRef.current = true;
    setTimeout(() => {
      violationLockRef.current = false;
    }, 800);

    const nextCount = warningCountRef.current + 1;
    setWarningCount(nextCount);
    warningCountRef.current = nextCount;

    onWarningChange?.(nextCount);

    if (nextCount >= 4) {
      setWarningMsg("Maximum warnings exceeded. Strict mode guard triggered termination of the interview.");
      setShowWarning(true);
      setTimeout(() => {
        // Exit fullscreen before ending
        if (document.exitFullscreen) {
          document.exitFullscreen().catch(() => {});
        }
        onViolationEnd?.();
      }, 2500);
    } else {
      setWarningMsg(`${message}. Warning ${nextCount}/3. Returning focus or tab switching is prohibited.`);
      setShowWarning(false);
      setTimeout(() => {
        setShowWarning(true);
      }, 50);
    }
  }, [onViolationEnd, onWarningChange]);

  // Fullscreen change handler
  useEffect(() => {
    const handleFullscreenChange = () => {
      const isFs = !!(
        document.fullscreenElement ||
        document.webkitFullscreenElement ||
        document.mozFullScreenElement ||
        document.msFullscreenElement
      );
      
      setIsFullscreen(isFs);
      isFullscreenRef.current = isFs;

      // If user exited fullscreen voluntarily, flag it
      if (!isFs && warningCountRef.current < 4) {
        triggerViolation("You exited fullscreen mode");
      }
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    document.addEventListener("webkitfullscreenchange", handleFullscreenChange);
    document.addEventListener("mozfullscreenchange", handleFullscreenChange);
    document.addEventListener("MSFullscreenChange", handleFullscreenChange);

    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      document.removeEventListener("webkitfullscreenchange", handleFullscreenChange);
      document.removeEventListener("mozfullscreenchange", handleFullscreenChange);
      document.removeEventListener("MSFullscreenChange", handleFullscreenChange);
    };
  }, [triggerViolation]);

  // Visibility and Mouse focus checks
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        triggerViolation("Tab or window switch detected");
      }
    };

    const handleMouseLeave = (e) => {
      // RelatedTarget being null usually means the mouse left the viewport window
      if (!e.relatedTarget && e.clientY < 10) {
        triggerViolation("Mouse cursor left the browser window boundaries");
      }
    };

    window.addEventListener("visibilitychange", handleVisibilityChange);
    document.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      window.removeEventListener("visibilitychange", handleVisibilityChange);
      document.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [triggerViolation]);

  // Lock initial fullscreen entry
  useEffect(() => {
    requestFullscreen();
    return () => {
      // Exit fullscreen on unmount
      if (document.fullscreenElement && document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      }
    };
  }, [requestFullscreen]);

  return (
    <div className="relative min-h-screen w-full bg-[#0b0c16]">
      {/* If not in fullscreen, force screen blocker */}
      {!isFullscreen && warningCount < 4 && (
        <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-black/95 p-6 text-center backdrop-blur-md">
          <ShieldAlert className="w-16 h-16 text-rose-500 animate-bounce mb-4" />
          <h2 className="text-2xl font-display font-bold text-white mb-2">Strict Mode Violation</h2>
          <p className="text-slate-400 max-w-md mb-6">
            The interview session must run in full-screen mode to prevent cheating. Please restore fullscreen to continue.
          </p>
          <Button onClick={requestFullscreen}>
            Restore Fullscreen
          </Button>
        </div>
      )}

      {/* Warning Dialog Modal */}
      {showWarning && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="glass-strong border-rose-500/20 max-w-md w-full p-6 rounded-xl flex flex-col items-center text-center shadow-2xl">
            <AlertTriangle className="w-12 h-12 text-rose-500 mb-3 animate-pulse" />
            <h3 className="text-lg font-bold text-white mb-2">Proctoring Alert</h3>
            <p className="text-sm text-slate-300 mb-6">{warningMsg}</p>
            {warningCount < 4 && (
              <Button onClick={() => setShowWarning(false)}>
                I Understand
              </Button>
            )}
          </div>
        </div>
      )}

      {children}
    </div>
  );
}
