import { Link, useNavigate } from 'react-router';
import {
  Activity,
  ArrowRight,
  Binary,
  CheckCircle2,
  Clock3,
  FileSearch,
  ShieldAlert,
  ShieldCheck,
} from 'lucide-react';
import { UploadCard } from '../components/UploadCard';
import { useScans } from '../features/scans/ScanContext';

function formatDate(value: string) {
  return new Intl.DateTimeFormat('zh-CN', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value));
}

export function DashboardPage() {
  const navigate = useNavigate();
  const { history, startScan, isUploading, uploadProgress, error } = useScans();
  const recent = history.slice(0, 4);
  const malwareCount = history.filter((scan) => scan.result.is_malware).length;
  const dynamicCount = history.filter((scan) => scan.result.dynamic_available).length;

  const handleUpload = async (file: File) => {
    try {
      const id = await startScan(file);
      navigate(`/scans/${id}/report`);
    } catch {
      // The provider exposes a user-facing error message in the upload card.
    }
  };

  return (
    <div className="mx-auto max-w-[1440px] px-4 py-7 sm:px-6 lg:px-8 lg:py-9">
      <div className="mb-7 flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
        <div>
          <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-blue-700">
            <ShieldCheck className="h-4 w-4" /> Hybrid analysis workspace
          </div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl">
            Android 恶意软件分析控制台
          </h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
            上传 APK 后先执行静态特征检测；高风险样本会进入 Android 隔离沙箱，继续完成运行时行为采集与恶意家族分类。
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-medium text-emerald-700">
          <CheckCircle2 className="h-4 w-4" /> 本地分析 · 文件不会上传到第三方
        </div>
      </div>

      <div className="mb-7 grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-slate-500">本地扫描记录</p>
            <Clock3 className="h-4 w-4 text-slate-400" />
          </div>
          <p className="mt-3 font-mono text-2xl font-semibold text-slate-950">{history.length}</p>
          <p className="mt-1 text-xs text-slate-500">仅在当前浏览器保存报告</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-slate-500">恶意判定</p>
            <ShieldAlert className="h-4 w-4 text-rose-500" />
          </div>
          <p className="mt-3 font-mono text-2xl font-semibold text-slate-950">{malwareCount}</p>
          <p className="mt-1 text-xs text-slate-500">依据当前静态模型阈值</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-slate-500">动态报告</p>
            <Activity className="h-4 w-4 text-blue-600" />
          </div>
          <p className="mt-3 font-mono text-2xl font-semibold text-slate-950">{dynamicCount}</p>
          <p className="mt-1 text-xs text-slate-500">已完成沙箱行为采集</p>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.5fr)_minmax(340px,0.7fr)]">
        <UploadCard
          onUploadStart={handleUpload}
          isUploading={isUploading}
          uploadProgress={uploadProgress}
          errorStr={error || undefined}
        />

        <div className="space-y-6">
          <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
              <div>
                <h2 className="text-sm font-semibold text-slate-900">最近扫描</h2>
                <p className="mt-1 text-xs text-slate-500">快速返回已生成的分析报告</p>
              </div>
              <Link to="/scans" className="text-xs font-semibold text-blue-700 hover:text-blue-500">查看全部</Link>
            </div>
            <div className="divide-y divide-slate-100">
              {recent.length === 0 ? (
                <div className="px-5 py-10 text-center">
                  <FileSearch className="mx-auto h-8 w-8 text-slate-300" />
                  <p className="mt-3 text-sm font-medium text-slate-600">暂无扫描记录</p>
                  <p className="mt-1 text-xs text-slate-400">上传第一个 APK 后会显示在这里</p>
                </div>
              ) : recent.map((scan) => (
                <Link
                  key={scan.id}
                  to={`/scans/${scan.id}/report`}
                  className="group flex items-center gap-3 px-5 py-3.5 transition hover:bg-slate-50"
                >
                  <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                    scan.result.is_malware ? 'bg-rose-50 text-rose-600' : 'bg-emerald-50 text-emerald-600'
                  }`}>
                    {scan.result.is_malware ? <ShieldAlert className="h-4 w-4" /> : <ShieldCheck className="h-4 w-4" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-slate-800">{scan.result.apk_info.app_name || scan.fileName}</p>
                    <p className="mt-0.5 truncate font-mono text-[10px] text-slate-500">{scan.result.apk_info.package_name}</p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className={`text-[10px] font-semibold uppercase ${scan.result.is_malware ? 'text-rose-600' : 'text-emerald-600'}`}>
                      {scan.status === 'running' ? 'Analyzing' : scan.result.verdict}
                    </p>
                    <p className="mt-1 text-[10px] text-slate-400">{formatDate(scan.createdAt)}</p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-blue-500" />
                </Link>
              ))}
            </div>
          </section>

          <section className="rounded-xl border border-slate-200 bg-slate-950 p-5 text-white shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-blue-400">Analysis pipeline</p>
            <div className="mt-5 space-y-5">
              {[
                ['01', '静态特征解析', 'Manifest、权限、组件和二进制结构', FileSearch],
                ['02', '隔离沙箱运行', 'Frida 采集运行时行为，只对高风险样本启动', Activity],
                ['03', '集成模型判定', '二分类结论与 13 类恶意家族概率', Binary],
              ].map(([number, title, description, Icon]) => (
                <div key={String(number)} className="flex gap-3">
                  <span className="font-mono text-xs font-semibold text-blue-400">{String(number)}</span>
                  <div>
                    <p className="flex items-center gap-2 text-sm font-semibold text-slate-100">
                      <Icon className="h-3.5 w-3.5 text-slate-400" /> {String(title)}
                    </p>
                    <p className="mt-1 text-xs leading-5 text-slate-400">{String(description)}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
