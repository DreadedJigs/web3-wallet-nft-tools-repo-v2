export type RiskLevel = 'critical' | 'high' | 'medium' | 'info';
export type GuardDecision = 'allow' | 'hold' | 'block';

export interface TrustedSource {
  domain?: string;
  recipient: string;
  chains?: string[];
  caps?: Record<string, number>;
}

export interface GuardOptions {
  trustedSources?: Record<string, TrustedSource>;
  trustedMarkets?: Record<string, TrustedSource>;
  blockedAddresses?: string[] | Set<string> | Record<string, string>;
  highRiskMethods?: string[] | Set<string> | Record<string, string>;
  signatureMethods?: string[] | Set<string> | Record<string, string>;
  suspiciousOriginPattern?: RegExp;
  holdThreshold?: number;
}

export interface GuardIntent {
  source?: string;
  market?: string;
  chainId?: string;
  symbol?: string;
  amountValue?: number;
  recipient?: string;
  spender?: string;
  method?: string;
  providerMethod?: string;
  approval?: 'exact' | 'none' | 'unlimited' | string;
  origin?: string;
  readOnly?: boolean;
  [key: string]: unknown;
}

export interface GuardContext {
  walletAddress?: string;
}

export interface GuardFinding {
  level: RiskLevel;
  label: string;
  code?: string;
}

export interface GuardResult {
  decision: GuardDecision;
  score: number;
  findings: GuardFinding[];
  checkedAt: string;
  version: string;
}

export interface GuardAction extends GuardIntent {
  id: string;
  transport: string;
  status: string;
  security: GuardResult;
}

export interface BuildActionOptions {
  id?: string;
  transport?: string;
}

export interface DreadedGuardInstance {
  audit(intent: GuardIntent, context?: GuardContext): GuardResult;
  buildAction(intent: GuardIntent, actionOptions?: BuildActionOptions, context?: GuardContext): GuardAction;
  statusFor(security: GuardResult): string;
  protocols: GuardProtocol[];
}

export interface GuardProtocol {
  name: string;
  status: string;
  detail: string;
}

export interface ProviderRequest {
  method: string;
  params?: unknown[];
}

export interface ProviderLike {
  request(request: ProviderRequest): Promise<unknown>;
}

export interface BackgroundMonitorEvent {
  type: string;
  intent: GuardIntent;
  request: ProviderRequest | null;
  security: GuardResult;
  checkedAt: string;
}

export interface IntentDefaults {
  appName?: string;
  source?: string;
  market?: string;
  chainId?: string;
  network?: string;
  symbol?: string;
  origin?: string;
  recipient?: string;
  amountValue?: number;
}

export interface BackgroundMonitorOptions extends GuardOptions {
  guard?: DreadedGuardInstance;
  provider?: ProviderLike;
  protectedMethods?: string[] | Set<string> | Record<string, string>;
  blockDecisions?: GuardDecision[] | Set<GuardDecision> | Record<string, GuardDecision>;
  context?: GuardContext;
  intentDefaults?: IntentDefaults;
  getContext?: () => GuardContext;
  getIntentDefaults?: () => IntentDefaults;
  onAudit?: (event: BackgroundMonitorEvent) => void;
  onWarning?: (event: BackgroundMonitorEvent) => void;
}

export interface BackgroundMonitor {
  install(provider?: ProviderLike): BackgroundMonitor;
  stop(): BackgroundMonitor;
  audit(intent: GuardIntent, meta?: { type?: string; request?: ProviderRequest; context?: GuardContext }): BackgroundMonitorEvent;
  inspectRequest(request: ProviderRequest): BackgroundMonitorEvent;
  intentFromProviderRequest(request: ProviderRequest, defaults?: IntentDefaults): GuardIntent;
  isRunning(): boolean;
}

export function createGuard(options?: GuardOptions): DreadedGuardInstance;
export function createBackgroundMonitor(options?: BackgroundMonitorOptions): BackgroundMonitor;
export function intentFromProviderRequest(request: ProviderRequest, defaults?: IntentDefaults): GuardIntent;
export function statusFor(security: GuardResult): string;
export function renderResult(target: string | Element, security: GuardResult): void;

export const protocols: GuardProtocol[];
export const defaultBlockedAddresses: string[];
export const defaultHighRiskMethods: string[];
export const defaultProtectedMethods: string[];
export const version: string;
