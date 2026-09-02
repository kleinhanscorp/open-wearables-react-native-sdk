export type OpenWearablesModuleEvents = {
  onLog: (params: LogEventPayload) => void;
  onAuthError: (params: AuthErrorEventPayload) => void;
  /** Gutsy fork: a broken session was repaired natively (renewal / double-check / host update). */
  onAuthRecovered: (params: AuthRecoveredEventPayload) => void;
  /** Gutsy fork: the persisted auth verdict changed. */
  onAuthStateChanged: (params: AuthStateChangedEventPayload) => void;
};

export type LogEventPayload = {
  message: string;
};

export type AuthErrorEventPayload = {
  statusCode: number;
  message: string;
};

export type AuthRecoveredEventPayload = {
  /** "renewal" | "double-check" | "external" — which rung of the ladder repaired the session. */
  via: string;
};

export type AuthStateChangedEventPayload = {
  state: OWAuthState;
};

/**
 * The SDK's persisted auth verdict (Gutsy fork).
 *  - `ok`               the token pair is believed good (or was just repaired)
 *  - `recovering`       the refresh token was rejected; native renewal is in flight or backing off
 *  - `reauth_required`  refresh AND renewal are exhausted; only the host can re-vend
 */
export type OWAuthState = "ok" | "recovering" | "reauth_required";

/** Snapshot returned by `getAuthState()` — no network, safe to call at launch. */
export type AuthStateSnapshot = {
  state: OWAuthState;
  lastAuthErrorAt: string | null;
  lastRecoveredAt: string | null;
  hasRenewalCredential: boolean;
  renewalFailures: number;
  /** `exp` of the stored access token, decoded locally. */
  accessTokenExpiresAt: string | null;
  hasSession: boolean;
};

/** Outcome of `ensureFreshSession()` — the host-safe session probe. */
export type EnsureSessionResult =
  | "ok"
  | "refreshed"
  | "recovered"
  | "reauth_required"
  | "network_error"
  | "no_session"
  | "api_key";

export enum OWLogLevel {
  None = 0,
  Always = 1,
  Debug = 2,
}

export enum HealthDataType {
  Steps = "steps",
  DistanceWalkingRunning = "distanceWalkingRunning",
  DistanceCycling = "distanceCycling",
  FlightsClimbed = "flightsClimbed",
  WalkingSpeed = "walkingSpeed",
  WalkingStepLength = "walkingStepLength",
  WalkingAsymmetryPercentage = "walkingAsymmetryPercentage",
  WalkingDoubleSupportPercentage = "walkingDoubleSupportPercentage",
  SixMinuteWalkTestDistance = "sixMinuteWalkTestDistance",
  ActiveEnergy = "activeEnergy",
  BasalEnergy = "basalEnergy",
  HeartRate = "heartRate",
  RestingHeartRate = "restingHeartRate",
  HeartRateVariabilitySDNN = "heartRateVariabilitySDNN",
  Vo2Max = "vo2Max",
  OxygenSaturation = "oxygenSaturation",
  RespiratoryRate = "respiratoryRate",
  BodyMass = "bodyMass",
  Height = "height",
  Bmi = "bmi",
  BodyFatPercentage = "bodyFatPercentage",
  LeanBodyMass = "leanBodyMass",
  WaistCircumference = "waistCircumference",
  BodyTemperature = "bodyTemperature",
  BloodGlucose = "bloodGlucose",
  InsulinDelivery = "insulinDelivery",
  BloodPressureSystolic = "bloodPressureSystolic",
  BloodPressureDiastolic = "bloodPressureDiastolic",
  BloodPressure = "bloodPressure",
  Sleep = "sleep",
  MindfulSession = "mindfulSession",
  MenstrualFlow = "menstrualFlow",
  CervicalMucusQuality = "cervicalMucusQuality",
  OvulationTestResult = "ovulationTestResult",
  SexualActivity = "sexualActivity",
  DietaryEnergyConsumed = "dietaryEnergyConsumed",
  DietaryCarbohydrates = "dietaryCarbohydrates",
  DietaryProtein = "dietaryProtein",
  DietaryFatTotal = "dietaryFatTotal",
  DietaryWater = "dietaryWater",
  Workout = "workout",
  RestingEnergy = "restingEnergy",
  BloodOxygen = "bloodOxygen",
}

export type HealthDataProvider = {
  id: string;
  displayName: string;
  isAvailable: boolean;
};

export type StoredCredentials = {
  userId: string | null;
  accessToken: string | null;
  refreshToken: string | null;
  apiKey: string | null;
  host: string | null;
  customSyncUrl: string | null;
  isSyncActive: boolean;
  provider: string | null;
  /** Gutsy fork. */
  authState?: OWAuthState;
  /** Gutsy fork. */
  hasRenewalCredential?: boolean;
};

export type SyncStatus = {
  hasResumableSession: boolean;
  sentCount: number;
  completedTypes: number;
  isFullExport: boolean;
  initialExportDone: boolean;
  isSyncing: boolean;
  createdAt: string | null;
};
