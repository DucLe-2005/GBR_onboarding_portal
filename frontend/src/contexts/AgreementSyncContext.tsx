"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

import { useUserStep } from "@/contexts/UserStepContext";
import { refreshCurrentSession } from "@/lib/auth";
import { getCurrentUserStep } from "@/service/users.service";

type AgreementSyncContextValue = {
  isAgreementSyncing: boolean;
  pollingAttempts: number;
  agreementSyncError: string;
  shouldShowCompletionNotice: boolean;
  startAgreementSync: () => void;
  stopAgreementSync: () => void;
  clearAgreementSyncError: () => void;
  markCompletionNoticeShown: () => void;
};

const AgreementSyncContext = createContext<AgreementSyncContextValue | null>(
  null,
);

type AgreementSyncProviderProps = {
  children: ReactNode;
};

const INITIAL_DELAY_MS = 4000;
const POLLING_INTERVAL_MS = 2000;
const MAX_POLLING_ATTEMPTS = 30;
const STORAGE_KEY = "gbr_agreement_sync_state";

type PersistedAgreementSyncState = {
  isAgreementSyncing: boolean;
  pollingAttempts: number;
  baselineStep: number;
  shouldShowCompletionNotice: boolean;
};

function readPersistedState(): PersistedAgreementSyncState | null {
  if (typeof window === "undefined") return null;

  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw) as Partial<PersistedAgreementSyncState>;

    return {
      isAgreementSyncing: parsed.isAgreementSyncing === true,
      pollingAttempts:
        typeof parsed.pollingAttempts === "number" &&
        Number.isFinite(parsed.pollingAttempts)
          ? parsed.pollingAttempts
          : 0,
      baselineStep:
        typeof parsed.baselineStep === "number" &&
        Number.isFinite(parsed.baselineStep)
          ? parsed.baselineStep
          : 0,
      shouldShowCompletionNotice:
        parsed.shouldShowCompletionNotice === true,
    };
  } catch {
    return null;
  }
}

function persistState(state: PersistedAgreementSyncState) {
  if (typeof window === "undefined") return;

  window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function clearPersistedState() {
  if (typeof window === "undefined") return;

  window.sessionStorage.removeItem(STORAGE_KEY);
}

export function AgreementSyncProvider({
  children,
}: AgreementSyncProviderProps) {
  const { currentStep, refreshCurrentStep } = useUserStep();

  const [isAgreementSyncing, setIsAgreementSyncing] = useState(false);
  const [pollingAttempts, setPollingAttempts] = useState(0);
  const [agreementSyncError, setAgreementSyncError] = useState("");
  const [shouldShowCompletionNotice, setShouldShowCompletionNotice] =
    useState(false);

  const timeoutRef = useRef<number | null>(null);
  const intervalRef = useRef<number | null>(null);
  const inFlightRef = useRef(false);
  const baselineStepRef = useRef(0);
  const hasHydratedRef = useRef(false);

  const clearTimers = useCallback(() => {
    if (timeoutRef.current !== null) {
      window.clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    if (intervalRef.current !== null) {
      window.clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const persistCurrentSnapshot = useCallback(
    (overrides?: Partial<PersistedAgreementSyncState>) => {
      persistState({
        isAgreementSyncing:
          overrides?.isAgreementSyncing ?? isAgreementSyncing,
        pollingAttempts: overrides?.pollingAttempts ?? pollingAttempts,
        baselineStep: overrides?.baselineStep ?? baselineStepRef.current,
        shouldShowCompletionNotice:
          overrides?.shouldShowCompletionNotice ?? shouldShowCompletionNotice,
      });
    },
    [isAgreementSyncing, pollingAttempts, shouldShowCompletionNotice],
  );

  const stopAgreementSync = useCallback(() => {
    clearTimers();
    inFlightRef.current = false;
    baselineStepRef.current = 0;
    setIsAgreementSyncing(false);
    setPollingAttempts(0);
    setAgreementSyncError("");
    clearPersistedState();
  }, [clearTimers]);

  const clearAgreementSyncError = useCallback(() => {
    setAgreementSyncError("");
  }, []);

  const markCompletionNoticeShown = useCallback(() => {
    setShouldShowCompletionNotice(false);
    persistCurrentSnapshot({ shouldShowCompletionNotice: false });
  }, [persistCurrentSnapshot]);

  const runPoll = useCallback(async () => {
    if (inFlightRef.current) return;

    inFlightRef.current = true;

    try {
      const response = await getCurrentUserStep();
      const latestBackendStep = response.current_step;

      if (latestBackendStep > baselineStepRef.current) {
        clearTimers();
        await refreshCurrentSession();
        await refreshCurrentStep();

        baselineStepRef.current = 0;
        setIsAgreementSyncing(false);
        setPollingAttempts(0);
        setAgreementSyncError("");
        setShouldShowCompletionNotice(true);

        persistState({
          isAgreementSyncing: false,
          pollingAttempts: 0,
          baselineStep: 0,
          shouldShowCompletionNotice: true,
        });

        return;
      }

      setPollingAttempts((previous) => {
        const next = previous + 1;

        if (next >= MAX_POLLING_ATTEMPTS) {
          clearTimers();
          setIsAgreementSyncing(false);
          setAgreementSyncError(
            "We’re still finalizing your signed agreement. Please wait a moment and refresh the page if needed.",
          );

          persistState({
            isAgreementSyncing: false,
            pollingAttempts: next,
            baselineStep: baselineStepRef.current,
            shouldShowCompletionNotice,
          });
        } else {
          persistState({
            isAgreementSyncing: true,
            pollingAttempts: next,
            baselineStep: baselineStepRef.current,
            shouldShowCompletionNotice,
          });
        }

        return next;
      });
    } catch (error) {
      clearTimers();
      setIsAgreementSyncing(false);
      setAgreementSyncError(
        error instanceof Error
          ? error.message
          : "Failed to check your current onboarding step.",
      );

      persistState({
        isAgreementSyncing: false,
        pollingAttempts,
        baselineStep: baselineStepRef.current,
        shouldShowCompletionNotice,
      });
    } finally {
      inFlightRef.current = false;
    }
  }, [
    clearTimers,
    pollingAttempts,
    refreshCurrentStep,
    shouldShowCompletionNotice,
  ]);

  const startAgreementSync = useCallback(() => {
    clearTimers();
    inFlightRef.current = false;
    baselineStepRef.current = currentStep;
    setIsAgreementSyncing(true);
    setPollingAttempts(0);
    setAgreementSyncError("");
    setShouldShowCompletionNotice(false);

    persistState({
      isAgreementSyncing: true,
      pollingAttempts: 0,
      baselineStep: currentStep,
      shouldShowCompletionNotice: false,
    });
  }, [clearTimers, currentStep]);

  useEffect(() => {
    const persisted = readPersistedState();

    if (persisted) {
      baselineStepRef.current = persisted.baselineStep;
      setIsAgreementSyncing(persisted.isAgreementSyncing);
      setPollingAttempts(persisted.pollingAttempts);
      setShouldShowCompletionNotice(persisted.shouldShowCompletionNotice);
    }

    setAgreementSyncError("");
    hasHydratedRef.current = true;
  }, []);

  useEffect(() => {
    if (!hasHydratedRef.current) return;

    if (!isAgreementSyncing) {
      clearTimers();
      return;
    }

    timeoutRef.current = window.setTimeout(() => {
      void runPoll();

      intervalRef.current = window.setInterval(() => {
        void runPoll();
      }, POLLING_INTERVAL_MS);
    }, INITIAL_DELAY_MS);

    return () => {
      clearTimers();
    };
  }, [clearTimers, isAgreementSyncing, runPoll]);

  const value = useMemo<AgreementSyncContextValue>(
    () => ({
      isAgreementSyncing,
      pollingAttempts,
      agreementSyncError,
      shouldShowCompletionNotice,
      startAgreementSync,
      stopAgreementSync,
      clearAgreementSyncError,
      markCompletionNoticeShown,
    }),
    [
      isAgreementSyncing,
      pollingAttempts,
      agreementSyncError,
      shouldShowCompletionNotice,
      startAgreementSync,
      stopAgreementSync,
      clearAgreementSyncError,
      markCompletionNoticeShown,
    ],
  );

  return (
    <AgreementSyncContext.Provider value={value}>
      {children}
    </AgreementSyncContext.Provider>
  );
}

export function useAgreementSync() {
  const context = useContext(AgreementSyncContext);

  if (!context) {
    throw new Error(
      "useAgreementSync must be used within AgreementSyncProvider",
    );
  }

  return context;
}