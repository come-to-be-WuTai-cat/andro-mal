/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { pollJobResult, uploadApk } from '../../api/client';
import type { ApkAnalysisResult, DynamicJobInfo, StoredScan } from '../../types';
import { loadScans, saveScans } from './storage';

interface ScanContextValue {
  activeScan: StoredScan | null;
  history: StoredScan[];
  dynamicJob: DynamicJobInfo | null;
  uploadProgress: number;
  isUploading: boolean;
  error: string | null;
  startScan: (file: File) => Promise<string>;
  getScan: (id: string) => StoredScan | undefined;
  deleteScan: (id: string) => void;
  prepareNewScan: () => void;
  clearError: () => void;
}

const ScanContext = createContext<ScanContextValue | null>(null);

function errorMessage(error: unknown): string {
  if (error && typeof error === 'object' && 'response' in error) {
    const response = (error as { response?: { data?: { message?: string; detail?: string } } }).response;
    return response?.data?.message || response?.data?.detail || '分析服务返回了错误';
  }
  if (error instanceof Error) return error.message;
  return '上传或分析失败';
}

export function ScanProvider({ children }: { children: ReactNode }) {
  const [history, setHistory] = useState<StoredScan[]>(() => loadScans());
  const [activeScan, setActiveScan] = useState<StoredScan | null>(null);
  const [dynamicJob, setDynamicJob] = useState<DynamicJobInfo | null>(null);
  const [backendJobId, setBackendJobId] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const persistScan = useCallback((scan: StoredScan) => {
    setHistory((current) => {
      const next = [scan, ...current.filter((item) => item.id !== scan.id)]
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
      saveScans(next);
      return next;
    });
  }, []);

  const uploadMutation = useMutation({
    mutationFn: (file: File) => uploadApk(file, setUploadProgress),
  });

  const jobQuery = useQuery({
    queryKey: ['dynamic-job', backendJobId],
    queryFn: () => pollJobResult(backendJobId!),
    enabled: Boolean(backendJobId),
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      return status === 'complete' || status === 'error' ? false : 1500;
    },
    retry: 2,
  });

  useEffect(() => {
    const job = jobQuery.data;
    if (!job || !activeScan || !backendJobId) return;

    setDynamicJob(job);

    if (job.status === 'complete' && job.result) {
      const completed: StoredScan = {
        ...activeScan,
        status: 'complete',
        completedAt: new Date().toISOString(),
        result: job.result,
        dynamicJob: job,
      };
      setActiveScan(completed);
      persistScan(completed);
      setBackendJobId(null);
      return;
    }

    if (job.status === 'error') {
      const failedResult = job.result || activeScan.result;
      const failed: StoredScan = {
        ...activeScan,
        status: 'error',
        completedAt: new Date().toISOString(),
        result: failedResult,
        dynamicJob: job,
      };
      setActiveScan(failed);
      persistScan(failed);
      setError(job.message || '动态沙箱分析失败，已保留静态分析结果');
      setBackendJobId(null);
      return;
    }

  }, [activeScan, backendJobId, jobQuery.data, persistScan]);

  useEffect(() => {
    if (jobQuery.error) setError(errorMessage(jobQuery.error));
  }, [jobQuery.error]);

  const startScan = useCallback(async (file: File) => {
    setError(null);
    setUploadProgress(0);
    setDynamicJob(null);
    setBackendJobId(null);

    try {
      const data = await uploadMutation.mutateAsync(file);
      const id = crypto.randomUUID();
      const result = (data.job_id ? data.static_result : data) as ApkAnalysisResult;

      if (!result?.apk_info) throw new Error('分析结果缺少应用信息');

      const isDynamic = Boolean(data.job_id);
      const initialJob: DynamicJobInfo | null = isDynamic
        ? {
            status: 'running',
            stage: '正在初始化动态沙箱',
            stage_index: 1,
            total_stages: 4,
            progress: 5,
            elapsed_seconds: 0,
            estimated_seconds: 90,
          }
        : null;

      const scan: StoredScan = {
        id,
        backendJobId: data.job_id,
        fileName: result.apk_info.file_name || file.name,
        createdAt: new Date().toISOString(),
        completedAt: isDynamic ? undefined : new Date().toISOString(),
        status: isDynamic ? 'running' : 'complete',
        result,
        dynamicJob: initialJob,
      };

      setActiveScan(scan);
      setDynamicJob(initialJob);
      persistScan(scan);
      if (data.job_id) setBackendJobId(data.job_id);
      return id;
    } catch (uploadError) {
      const message = errorMessage(uploadError);
      setError(message);
      throw new Error(message);
    }
  }, [persistScan, uploadMutation]);

  const deleteScan = useCallback((id: string) => {
    setHistory((current) => {
      const next = current.filter((scan) => scan.id !== id);
      saveScans(next);
      return next;
    });
    if (activeScan?.id === id) setActiveScan(null);
  }, [activeScan?.id]);

  const prepareNewScan = useCallback(() => {
    setActiveScan(null);
    setDynamicJob(null);
    setBackendJobId(null);
    setUploadProgress(0);
    setError(null);
    uploadMutation.reset();
  }, [uploadMutation]);

  const getScan = useCallback((id: string) => {
    if (activeScan?.id === id) return activeScan;
    return history.find((scan) => scan.id === id);
  }, [activeScan, history]);

  const value = useMemo<ScanContextValue>(() => ({
    activeScan,
    history,
    dynamicJob,
    uploadProgress,
    isUploading: uploadMutation.isPending,
    error,
    startScan,
    getScan,
    deleteScan,
    prepareNewScan,
    clearError: () => setError(null),
  }), [
    activeScan,
    deleteScan,
    dynamicJob,
    error,
    getScan,
    history,
    prepareNewScan,
    startScan,
    uploadMutation.isPending,
    uploadProgress,
  ]);

  return <ScanContext.Provider value={value}>{children}</ScanContext.Provider>;
}

export function useScans(): ScanContextValue {
  const context = useContext(ScanContext);
  if (!context) throw new Error('useScans must be used inside ScanProvider');
  return context;
}
