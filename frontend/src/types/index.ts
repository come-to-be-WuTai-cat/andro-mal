export interface PermissionDetail {
  name: string;
  protection_level: string;
  label: string;
  description: string;
  risk: 'high' | 'warning' | 'info';
}

export interface ApkComponents {
  activities: string[];
  services: string[];
  receivers: string[];
  providers: string[];
}

export interface ApkAnalysisResult {
  status: string;
  verdict: 'Malware' | 'Benign';
  malware_prob: number;
  benign_prob: number;
  is_malware: boolean;
  family: string | null;
  family_conf: number | null;
  family_probs?: Record<string, number>;
  is_novel: boolean;
  dynamic_available: boolean;
  dynamic_error?: string;
  indicators: {
    n_permissions: number;
    n_dangerous_perms: number;
    n_suspicious_apis: number;
    has_native_code: number;
    has_dynamic_code: number;
    n_dex_files?: number;
    has_debug_flag?: number;
    n_activities?: number;
    n_services?: number;
    n_receivers?: number;
    n_providers?: number;
  };
  permissions?: PermissionDetail[];
  dangerous_permissions: string[];
  components?: ApkComponents;
  apk_info: {
    package_name: string;
    app_name?: string;
    file_name?: string;
    apk_size_mb: number;
    min_sdk: number;
    target_sdk: number;
    version_name?: string;
    version_code?: string;
    main_activity?: string;
    sha256?: string;
  };
  analysis_time_ms: number;
}

export interface DynamicJobInfo {
  status: 'pending' | 'running' | 'complete' | 'error';
  stage?: string;
  stage_index?: number;
  total_stages?: number;
  progress?: number;
  elapsed_seconds?: number;
  estimated_seconds?: number;
  message?: string;
  result?: ApkAnalysisResult;
}

export interface HealthStatus {
  status: string;
  models_loaded: boolean;
  version: string;
}

export type StoredScanStatus = 'complete' | 'running' | 'error';

export interface StoredScan {
  id: string;
  backendJobId?: string;
  fileName: string;
  createdAt: string;
  completedAt?: string;
  status: StoredScanStatus;
  result: ApkAnalysisResult;
  dynamicJob?: DynamicJobInfo | null;
}
