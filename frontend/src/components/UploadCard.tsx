import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import {
  AlertCircle,
  CheckCircle2,
  FileArchive,
  Loader2,
  LockKeyhole,
  ScanSearch,
  UploadCloud,
  X,
} from 'lucide-react';

interface UploadCardProps {
  onUploadStart: (file: File) => void;
  isUploading: boolean;
  uploadProgress: number;
  errorStr?: string;
}

export function UploadCard({
  onUploadStart,
  isUploading,
  uploadProgress,
  errorStr,
}: UploadCardProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles[0]) setSelectedFile(acceptedFiles[0]);
  }, []);

  const { getRootProps, getInputProps, isDragActive, open, fileRejections } = useDropzone({
    onDrop,
    noClick: Boolean(selectedFile) || isUploading,
    accept: {
      'application/vnd.android.package-archive': ['.apk'],
      'application/octet-stream': ['.apk'],
      'application/x-zip-compressed': ['.apk'],
    },
    maxFiles: 1,
    maxSize: 100 * 1024 * 1024,
    multiple: false,
    disabled: isUploading,
  });

  const localError = fileRejections.length > 0
    ? '请选择不超过 100 MB 的有效 APK 文件。'
    : undefined;

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4 sm:px-6">
        <div>
          <h2 className="flex items-center gap-2 text-sm font-semibold text-slate-900">
            <ScanSearch className="h-4 w-4 text-blue-600" aria-hidden="true" />
            上传并分析 Android 应用
          </h2>
          <p className="mt-1 text-xs text-slate-500">支持标准 APK，文件上限 100 MB</p>
        </div>
        <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-emerald-700">
          Isolated
        </span>
      </div>

      <div className="p-5 sm:p-6">
        {(errorStr || localError) && (
          <div className="mb-4 flex items-start gap-3 rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700" role="alert">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <div>
              <p className="font-semibold">无法开始分析</p>
              <p className="mt-0.5 text-xs text-rose-600">{errorStr || localError}</p>
            </div>
          </div>
        )}

        {!selectedFile ? (
          <div
            {...getRootProps()}
            className={`group flex min-h-72 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed px-6 py-10 text-center transition ${
              isDragActive
                ? 'border-blue-500 bg-blue-50'
                : 'border-slate-300 bg-slate-50/70 hover:border-blue-400 hover:bg-blue-50/40'
            }`}
          >
            <input {...getInputProps()} aria-label="选择 APK 文件" />
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl border border-blue-100 bg-blue-50 text-blue-600 transition group-hover:scale-105">
              <UploadCloud className="h-7 w-7" aria-hidden="true" />
            </div>
            <p className="text-base font-semibold text-slate-900">
              {isDragActive ? '松开鼠标以上传 APK' : '拖拽 APK 到此处'}
            </p>
            <p className="mt-1.5 text-sm text-slate-500">或者从本机选择一个待分析文件</p>
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                open();
              }}
              className="mt-5 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-700"
            >
              选择 APK 文件
            </button>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-4 text-xs text-slate-500">
              <span className="flex items-center gap-1.5"><CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />格式验证</span>
              <span className="flex items-center gap-1.5"><LockKeyhole className="h-3.5 w-3.5 text-emerald-500" />沙箱隔离</span>
              <span className="flex items-center gap-1.5"><FileArchive className="h-3.5 w-3.5 text-emerald-500" />分析后不保留 APK</span>
            </div>
          </div>
        ) : (
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-5">
            <div className="flex items-start justify-between gap-4">
              <div className="flex min-w-0 items-center gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white text-blue-600">
                  <FileArchive className="h-6 w-6" />
                </div>
                <div className="min-w-0">
                  <p className="truncate font-mono text-sm font-semibold text-slate-900">{selectedFile.name}</p>
                  <p className="mt-1 font-mono text-xs text-slate-500">
                    {(selectedFile.size / 1024 / 1024).toFixed(2)} MB · Android package
                  </p>
                </div>
              </div>
              {!isUploading && (
                <button
                  type="button"
                  aria-label="移除文件"
                  className="rounded-md p-2 text-slate-400 hover:bg-slate-200 hover:text-slate-700"
                  onClick={() => setSelectedFile(null)}
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            {isUploading && (
              <div className="mt-5" aria-live="polite">
                <div className="mb-2 flex items-center justify-between text-xs">
                  <span className="flex items-center gap-2 font-medium text-slate-600">
                    <Loader2 className="h-3.5 w-3.5 animate-spin text-blue-600" />
                    正在上传并启动静态分析
                  </span>
                  <span className="font-mono font-semibold text-blue-700">{uploadProgress}%</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-slate-200">
                  <div
                    className="h-full rounded-full bg-blue-600 transition-[width] duration-300"
                    style={{ width: `${Math.min(100, uploadProgress)}%` }}
                  />
                </div>
              </div>
            )}

            <button
              type="button"
              disabled={isUploading}
              onClick={() => onUploadStart(selectedFile)}
              className="mt-5 flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:bg-blue-300"
            >
              {isUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ScanSearch className="h-4 w-4" />}
              {isUploading ? `正在上传 ${uploadProgress}%` : '开始安全分析'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
