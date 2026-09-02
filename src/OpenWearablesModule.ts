import { NativeModule, requireNativeModule } from "expo-modules-core";
import {
  AuthStateSnapshot,
  EnsureSessionResult,
  HealthDataType,
  OpenWearablesModuleEvents,
  HealthDataProvider,
  OWLogLevel,
  StoredCredentials,
  SyncStatus,
} from "./OpenWearables.types";

declare class OpenWearablesModule extends NativeModule<OpenWearablesModuleEvents> {
  // MARK: - Configure
  configure(host: string, customSyncURL?: string): void;

  // MARK: - Auth
  signIn(
    userId: string,
    accessToken: string | null,
    refreshToken: string | null,
    apiKey: string | null
  ): Promise<void>;
  signOut(): Promise<void>;
  updateTokens(accessToken: string, refreshToken: string | null): void;
  restoreSession(): string | null;
  isSessionValid(): boolean;

  // MARK: - Auth self-healing (Gutsy fork — see the native SDKs' AuthRecovery)
  /**
   * Install the long-lived renewal credential the native SDK exchanges for a fresh token pair
   * when its refresh token is rejected. Replaces any previous credential and lifts a
   * `reauth_required` verdict. Persisted natively; survives relaunch and background wakes.
   */
  setRenewalCredential(url: string, token: string): void;
  clearRenewalCredential(): void;
  /** Persisted verdict + timestamps. No network — safe on the boot path. */
  getAuthState(): AuthStateSnapshot;
  /**
   * Prove or repair the session on the host's schedule (app foreground). Refreshes proactively
   * when the access token expires within 5 minutes and walks the native recovery ladder on
   * rejection. The ONLY sanctioned way for a host to "check" a single-use refresh token.
   */
  ensureFreshSession(): Promise<EnsureSessionResult>;

  // MARK: - HealthKit / Health Connect Authorization
  requestAuthorization(types: HealthDataType[]): Promise<boolean>;

  // MARK: - Sync
  setSyncInterval(minutes: number): void;
  /**
   * Registers observers / WorkManager and triggers a sync round now: a full export until the
   * initial export has completed, an incremental round after. Also the "sync now" verb —
   * upstream 0.2.0 removed `syncNow()` from both native SDKs.
   */
  startBackgroundSync(syncDaysBack: number | null): Promise<boolean>;
  stopBackgroundSync(): Promise<void>;
  isSyncActive(): boolean;
  getSyncStatus(): SyncStatus;
  resumeSync(): Promise<boolean>;
  resetAnchors(): void;
  getStoredCredentials(): StoredCredentials;

  // MARK: - Providers
  getAvailableProviders(): HealthDataProvider[];
  setProvider(providerId: string): boolean;

  // MARK: - Logs
  setLogLevel(logLevel: OWLogLevel): void;
  getLogLevel(): OWLogLevel;
}

// This call loads the native module object from the JSI.
export default requireNativeModule<OpenWearablesModule>(
  "OpenWearablesHealthSDK"
);
