import { useMemo, useState, type ReactNode } from 'react';
import { Link, useNavigate, useParams } from 'react-router';
import {
  Activity,
  AlertTriangle,
  AppWindow,
  Binary,
  Boxes,
  Check,
  ChevronRight,
  CircleHelp,
  Code2,
  Copy,
  FileCode2,
  FileText,
  Fingerprint,
  Info,
  KeyRound,
  ListChecks,
  Plus,
  Printer,
  Radio,
  Server,
  ShieldAlert,
  ShieldCheck,
  Smartphone,
} from 'lucide-react';
import { FamilyProbabilityChart, ProbabilityDonut } from '../components/charts/AnalysisCharts';
import { PermissionTable } from '../components/report/PermissionTable';
import { useScans } from '../features/scans/ScanContext';
import type { PermissionDetail } from '../types';

function duration(ms: number) {
  if (!ms) return '—';
  if (ms < 1000) return `${ms} ms`;
  const seconds = Math.round(ms / 1000);
  return seconds < 60 ? `${seconds} 秒` : `${Math.floor(seconds / 60)} 分 ${seconds % 60} 秒`;
}

function ReportSection({ id, title, description, icon, children }: {
  id: string;
  title: string;
  description: string;
  icon: ReactNode;
  children: ReactNode;
}) {
  return (
    <section id={id} className="report-section scroll-mt-24 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-start gap-3 border-b border-slate-200 px-5 py-4 sm:px-6">
        <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-700">{icon}</div>
        <div>
          <h2 className="text-sm font-semibold text-slate-950">{title}</h2>
          <p className="mt-1 text-xs leading-5 text-slate-500">{description}</p>
        </div>
      </div>
      <div className="p-5 sm:p-6">{children}</div>
    </section>
  );
}

function MetricCard({ label, value, caption, tone = 'slate' }: {
  label: string;
  value: string | number;
  caption: string;
  tone?: 'slate' | 'rose' | 'amber' | 'blue' | 'emerald';
}) {
  const tones = {
    slate: 'border-slate-200 bg-white text-slate-950',
    rose: 'border-rose-200 bg-rose-50/60 text-rose-700',
    amber: 'border-amber-200 bg-amber-50/60 text-amber-700',
    blue: 'border-blue-200 bg-blue-50/60 text-blue-700',
    emerald: 'border-emerald-200 bg-emerald-50/60 text-emerald-700',
  };
  return (
    <div className={`rounded-xl border p-4 shadow-sm ${tones[tone]}`}>
      <p className="text-[11px] font-semibold uppercase tracking-wide opacity-70">{label}</p>
      <p className="mt-2 font-mono text-2xl font-semibold">{value}</p>
      <p className="mt-1 text-[11px] opacity-70">{caption}</p>
    </div>
  );
}

function InfoRow({ label, value, mono = false }: { label: string; value: ReactNode; mono?: boolean }) {
  return (
    <div className="grid gap-1 border-b border-slate-100 py-3 last:border-0 sm:grid-cols-[150px_minmax(0,1fr)] sm:gap-4">
      <dt className="text-xs font-medium text-slate-500">{label}</dt>
      <dd className={`break-all text-xs text-slate-800 ${mono ? 'font-mono' : ''}`}>{value || '—'}</dd>
    </div>
  );
}

function ComponentList({ title, icon, items, count }: { title: string; icon: ReactNode; items?: string[]; count: number }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50/60 p-4">
      <div className="flex items-center justify-between">
        <p className="flex items-center gap-2 text-xs font-semibold text-slate-700">{icon}{title}</p>
        <span className="font-mono text-lg font-semibold text-slate-950">{count}</span>
      </div>
      {items && items.length > 0 ? (
        <div className="mt-3 max-h-36 space-y-1.5 overflow-auto border-t border-slate-200 pt-3">
          {items.slice(0, 20).map((item) => (
            <p key={item} className="truncate font-mono text-[10px] text-slate-500" title={item}>{item}</p>
          ))}
          {items.length > 20 && <p className="text-[10px] text-slate-400">另有 {items.length - 20} 项未展开</p>}
        </div>
      ) : (
        <p className="mt-3 border-t border-slate-200 pt-3 text-[11px] text-slate-400">旧报告只保存了计数，没有组件名称。</p>
      )}
    </div>
  );
}

export function ReportPage() {
  const { scanId = '' } = useParams();
  const navigate = useNavigate();
  const { getScan, prepareNewScan } = useScans();
  const scan = getScan(scanId);
  const [copied, setCopied] = useState(false);

  const permissions = useMemo<PermissionDetail[]>(() => {
    if (!scan) return [];
    if (scan.result.permissions?.length) return scan.result.permissions;
    return (scan.result.dangerous_permissions || []).map((name) => ({
      name,
      protection_level: 'unclassified',
      label: '',
      description: '该记录由旧版接口生成，未返回 Android 权限保护级别。',
      risk: 'info',
    }));
  }, [scan]);

  if (!scan) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-24 text-center">
        <FileText className="mx-auto h-12 w-12 text-slate-300" />
        <h1 className="mt-5 text-xl font-semibold text-slate-900">找不到这份扫描报告</h1>
        <p className="mt-2 text-sm text-slate-500">报告可能已被删除，或者属于另一个浏览器会话。</p>
        <Link to="/scans" className="mt-6 inline-flex rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white">返回最近扫描</Link>
      </div>
    );
  }

  const result = scan.result;
  const indicators = result.indicators;
  const app = result.apk_info;
  const isMalware = result.is_malware;
  const isRunning = scan.status === 'running';
  const familyLabel = result.is_novel ? '未知/低置信度家族' : result.family || '未执行家族分类';
  const dangerousCount = result.permissions
    ? result.permissions.filter((permission) => permission.protection_level.toLowerCase().includes('dangerous')).length
    : indicators.n_dangerous_perms;

  const copyHash = async () => {
    if (!app.sha256) return;
    await navigator.clipboard.writeText(app.sha256);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  };

  const newScan = () => {
    prepareNewScan();
    navigate('/');
  };

  const reportLinks = [
    ['overview', '检测概览', ShieldCheck],
    ['app-info', '应用信息', Smartphone],
    ['permissions', '权限分析', KeyRound],
    ['components', '组件与代码', Boxes],
    ['dynamic', '动态分析', Activity],
    ['model', '模型说明', Binary],
  ] as const;

  return (
    <div className="mx-auto max-w-[1440px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      <div className="report-header mb-6 overflow-hidden rounded-xl bg-slate-950 text-white shadow-sm">
        <div className="border-b border-white/10 px-5 py-5 sm:px-6">
          <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-center">
            <div className="flex min-w-0 items-center gap-4">
              <div className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-xl border ${
                isMalware ? 'border-rose-400/30 bg-rose-500/10 text-rose-400' : 'border-emerald-400/30 bg-emerald-500/10 text-emerald-400'
              }`}>
                {isMalware ? <ShieldAlert className="h-7 w-7" /> : <ShieldCheck className="h-7 w-7" />}
              </div>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="truncate text-xl font-semibold sm:text-2xl">{app.app_name || scan.fileName}</h1>
                  <span className={`rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase ${
                    isRunning
                      ? 'border-blue-400/30 bg-blue-400/10 text-blue-300'
                      : isMalware
                        ? 'border-rose-400/30 bg-rose-400/10 text-rose-300'
                        : 'border-emerald-400/30 bg-emerald-400/10 text-emerald-300'
                  }`}>
                    {isRunning ? 'Dynamic running' : isMalware ? 'Malware' : 'Benign'}
                  </span>
                </div>
                <p className="mt-1 truncate font-mono text-xs text-slate-400">{app.package_name}</p>
                <p className="mt-2 text-xs text-slate-500">{scan.fileName} · {app.apk_size_mb.toFixed(2)} MB · SDK {app.min_sdk} → {app.target_sdk}</p>
              </div>
            </div>
            <div className="report-actions flex flex-wrap items-center gap-2">
              <button type="button" onClick={() => window.print()} className="flex items-center gap-2 rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-xs font-semibold text-slate-200 hover:bg-white/10">
                <Printer className="h-4 w-4" /> 打印报告
              </button>
              <button type="button" onClick={newScan} className="flex items-center gap-2 rounded-lg bg-blue-600 px-3 py-2 text-xs font-semibold text-white hover:bg-blue-500">
                <Plus className="h-4 w-4" /> 新建分析
              </button>
            </div>
          </div>
        </div>
        <div className="grid divide-y divide-white/10 sm:grid-cols-3 sm:divide-x sm:divide-y-0">
          <div className="px-5 py-3.5">
            <p className="text-[10px] uppercase tracking-wide text-slate-500">Scan ID</p>
            <p className="mt-1 truncate font-mono text-xs text-slate-300">{scan.id}</p>
          </div>
          <div className="px-5 py-3.5">
            <p className="text-[10px] uppercase tracking-wide text-slate-500">Analysis time</p>
            <p className="mt-1 font-mono text-xs text-slate-300">{duration(result.analysis_time_ms)}</p>
          </div>
          <div className="px-5 py-3.5">
            <p className="text-[10px] uppercase tracking-wide text-slate-500">Family result</p>
            <p className="mt-1 truncate font-mono text-xs text-slate-300">{familyLabel}</p>
          </div>
        </div>
      </div>

      <div className="grid items-start gap-6 lg:grid-cols-[220px_minmax(0,1fr)]">
        <aside className="report-nav sticky top-20 hidden rounded-xl border border-slate-200 bg-white p-3 shadow-sm lg:block">
          <p className="px-3 pb-2 pt-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">报告目录</p>
          <nav className="space-y-1" aria-label="报告章节">
            {reportLinks.map(([id, label, Icon]) => (
              <a key={id} href={`#${id}`} className="group flex items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium text-slate-600 hover:bg-blue-50 hover:text-blue-700">
                <Icon className="h-4 w-4 text-slate-400 group-hover:text-blue-600" />
                {label}
                <ChevronRight className="ml-auto h-3.5 w-3.5 text-slate-300" />
              </a>
            ))}
          </nav>
          <div className="mt-3 border-t border-slate-100 px-3 pt-3 text-[10px] leading-4 text-slate-400">
            报告结论只适用于当前模型与已采集特征，不替代人工安全审计。
          </div>
        </aside>

        <div className="min-w-0 space-y-6">
          {isRunning && scan.dynamicJob && (
            <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 shadow-sm">
              <div className="flex items-start gap-3">
                <Radio className="mt-0.5 h-5 w-5 animate-pulse text-blue-600" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-sm font-semibold text-blue-900">动态沙箱正在分析</p>
                      <p className="mt-1 text-xs text-blue-700">{scan.dynamicJob.stage || '正在采集运行时行为'}</p>
                    </div>
                    <span className="font-mono text-sm font-semibold text-blue-800">{Math.round(scan.dynamicJob.progress || 0)}%</span>
                  </div>
                  <div className="mt-3 h-2 overflow-hidden rounded-full bg-blue-100">
                    <div className="h-full rounded-full bg-blue-600 transition-[width] duration-500" style={{ width: `${scan.dynamicJob.progress || 5}%` }} />
                  </div>
                </div>
              </div>
            </div>
          )}

          {scan.status === 'error' && (
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
              <div className="flex items-start gap-3">
                <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
                <div><strong>动态分析未完成。</strong> {scan.dynamicJob?.message || result.dynamic_error || '当前报告保留静态模型结论。'}</div>
              </div>
            </div>
          )}

          <section id="overview" className="report-section scroll-mt-24 space-y-5">
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <MetricCard label="恶意概率" value={`${(result.malware_prob * 100).toFixed(1)}%`} caption="静态二分类模型输出" tone={isMalware ? 'rose' : 'emerald'} />
              <MetricCard label="危险权限" value={dangerousCount} caption={`共声明 ${indicators.n_permissions} 项权限`} tone={dangerousCount > 0 ? 'amber' : 'emerald'} />
              <MetricCard label="Android 组件" value={(indicators.n_activities || 0) + (indicators.n_services || 0) + (indicators.n_receivers || 0) + (indicators.n_providers || 0)} caption="Activity / Service / Receiver / Provider" tone="blue" />
              <MetricCard label="动态家族" value={result.dynamic_available ? (result.family || 'Unknown') : '未完成'} caption={result.dynamic_available ? `${((result.family_conf || 0) * 100).toFixed(1)}% 最高类别置信度` : '仅显示静态分析结果'} />
            </div>

            <div className="grid gap-6 xl:grid-cols-[360px_minmax(0,1fr)]">
              <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-sm font-semibold text-slate-950">静态模型概率</h2>
                    <p className="mt-1 text-xs text-slate-500">概率不等同于人工审计结论</p>
                  </div>
                  <Binary className="h-5 w-5 text-blue-600" />
                </div>
                <ProbabilityDonut malware={result.malware_prob} benign={result.benign_prob} />
                <div className="grid grid-cols-2 gap-2 border-t border-slate-100 pt-4 text-center">
                  <div><p className="font-mono text-sm font-semibold text-rose-600">{(result.malware_prob * 100).toFixed(1)}%</p><p className="mt-1 text-[10px] text-slate-500">Malware</p></div>
                  <div><p className="font-mono text-sm font-semibold text-emerald-600">{(result.benign_prob * 100).toFixed(1)}%</p><p className="mt-1 text-[10px] text-slate-500">Benign</p></div>
                </div>
              </div>

              <div className={`rounded-xl border p-6 shadow-sm ${
                isMalware ? 'border-rose-200 bg-rose-50/40' : 'border-emerald-200 bg-emerald-50/40'
              }`}>
                <div className="flex h-full flex-col justify-between gap-6">
                  <div>
                    <div className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[11px] font-semibold uppercase ${
                      isMalware ? 'border-rose-200 bg-white text-rose-700' : 'border-emerald-200 bg-white text-emerald-700'
                    }`}>
                      {isMalware ? <ShieldAlert className="h-3.5 w-3.5" /> : <ShieldCheck className="h-3.5 w-3.5" />}
                      Final verdict
                    </div>
                    <h2 className={`mt-4 text-2xl font-semibold ${isMalware ? 'text-rose-800' : 'text-emerald-800'}`}>
                      {isMalware ? '检测到恶意风险' : '当前模型判定为良性'}
                    </h2>
                    <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
                      {isMalware
                        ? '静态模型概率达到当前判定阈值。请结合权限、组件和动态行为证据复核，不要只依据单一概率处置样本。'
                        : '当前采集的静态特征未达到恶意判定阈值。该结果不代表应用经过完整源代码审计。'}
                    </p>
                  </div>
                  <div className="grid gap-3 border-t border-slate-200/80 pt-4 sm:grid-cols-2">
                    <div><p className="text-[10px] uppercase tracking-wide text-slate-500">Binary result</p><p className="mt-1 font-mono text-xs font-semibold text-slate-800">{result.verdict}</p></div>
                    <div><p className="text-[10px] uppercase tracking-wide text-slate-500">Family result</p><p className="mt-1 font-mono text-xs font-semibold text-slate-800">{familyLabel}</p></div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <ReportSection id="app-info" title="应用与文件信息" description="APK Manifest 和上传文件中提取的基础元数据。" icon={<Smartphone className="h-4 w-4" />}>
            <div className="grid gap-6 lg:grid-cols-2">
              <dl>
                <InfoRow label="应用名称" value={app.app_name} />
                <InfoRow label="包名" value={app.package_name} mono />
                <InfoRow label="版本" value={app.version_name ? `${app.version_name} (${app.version_code || '—'})` : '—'} />
                <InfoRow label="主 Activity" value={app.main_activity} mono />
              </dl>
              <dl>
                <InfoRow label="文件名" value={scan.fileName} mono />
                <InfoRow label="文件大小" value={`${app.apk_size_mb.toFixed(2)} MB`} mono />
                <InfoRow label="SDK 范围" value={`${app.min_sdk} → ${app.target_sdk}`} mono />
                <InfoRow label="SHA-256" value={app.sha256 ? (
                  <button type="button" onClick={copyHash} className="flex max-w-full items-center gap-2 text-left text-blue-700 hover:text-blue-500">
                    <span className="truncate">{app.sha256}</span>{copied ? <Check className="h-3.5 w-3.5 shrink-0" /> : <Copy className="h-3.5 w-3.5 shrink-0" />}
                  </button>
                ) : '旧报告未采集'} mono />
              </dl>
            </div>
          </ReportSection>

          <ReportSection id="permissions" title="应用权限" description="保护级别来自 Androguard 内置 Android 权限参考库；危险权限不等同于恶意行为。" icon={<KeyRound className="h-4 w-4" />}>
            <div className="mb-5 grid gap-3 sm:grid-cols-3">
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-3"><p className="text-[10px] uppercase text-slate-500">全部权限</p><p className="mt-1 font-mono text-xl font-semibold text-slate-900">{permissions.length || indicators.n_permissions}</p></div>
              <div className="rounded-lg border border-rose-200 bg-rose-50 p-3"><p className="text-[10px] uppercase text-rose-600">Dangerous</p><p className="mt-1 font-mono text-xl font-semibold text-rose-700">{dangerousCount}</p></div>
              <div className="rounded-lg border border-blue-200 bg-blue-50 p-3"><p className="text-[10px] uppercase text-blue-600">其他级别</p><p className="mt-1 font-mono text-xl font-semibold text-blue-700">{Math.max(0, (permissions.length || indicators.n_permissions) - dangerousCount)}</p></div>
            </div>
            <PermissionTable permissions={permissions} />
          </ReportSection>

          <ReportSection id="components" title="组件与代码结构" description="统计 Manifest 组件、DEX 和本地原生库；数量本身不是恶意证据。" icon={<Boxes className="h-4 w-4" />}>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <ComponentList title="Activities" icon={<AppWindow className="h-4 w-4 text-blue-600" />} items={result.components?.activities} count={indicators.n_activities || result.components?.activities?.length || 0} />
              <ComponentList title="Services" icon={<Server className="h-4 w-4 text-violet-600" />} items={result.components?.services} count={indicators.n_services || result.components?.services?.length || 0} />
              <ComponentList title="Receivers" icon={<Radio className="h-4 w-4 text-amber-600" />} items={result.components?.receivers} count={indicators.n_receivers || result.components?.receivers?.length || 0} />
              <ComponentList title="Providers" icon={<FileCode2 className="h-4 w-4 text-emerald-600" />} items={result.components?.providers} count={indicators.n_providers || result.components?.providers?.length || 0} />
            </div>
            <div className="mt-4 grid gap-4 sm:grid-cols-3">
              <div className="rounded-lg border border-slate-200 p-4"><p className="flex items-center gap-2 text-xs font-semibold text-slate-700"><Code2 className="h-4 w-4 text-blue-600" />DEX 文件</p><p className="mt-3 font-mono text-xl font-semibold text-slate-950">{indicators.n_dex_files ?? '未采集'}</p><p className="mt-1 text-[11px] text-slate-500">多 DEX 仅作为结构信号</p></div>
              <div className="rounded-lg border border-slate-200 p-4"><p className="flex items-center gap-2 text-xs font-semibold text-slate-700"><Binary className="h-4 w-4 text-blue-600" />Native Library</p><p className="mt-3 font-mono text-xl font-semibold text-slate-950">{indicators.has_native_code ? '存在' : '未发现'}</p><p className="mt-1 text-[11px] text-slate-500">检测 APK 内的 .so 文件</p></div>
              <div className="rounded-lg border border-slate-200 p-4"><p className="flex items-center gap-2 text-xs font-semibold text-slate-700"><ListChecks className="h-4 w-4 text-blue-600" />可疑 API</p><p className="mt-3 font-mono text-xl font-semibold text-slate-950">尚未启用</p><p className="mt-1 text-[11px] text-slate-500">当前提取器未实现 API 代码扫描</p></div>
            </div>
          </ReportSection>

          <ReportSection id="dynamic" title="动态沙箱分析" description="高风险样本在 Android 模拟器中运行，并由 Frida 采集运行时信号。" icon={<Activity className="h-4 w-4" />}>
            {result.dynamic_available ? (
              <div className="grid gap-6 xl:grid-cols-[300px_minmax(0,1fr)]">
                <div className="rounded-lg border border-blue-200 bg-blue-50 p-5">
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-blue-600">Highest probability family</p>
                  <p className="mt-3 text-xl font-semibold text-blue-950">{familyLabel}</p>
                  <p className="mt-2 font-mono text-sm text-blue-700">{((result.family_conf || 0) * 100).toFixed(1)}% confidence</p>
                  {result.is_novel && <p className="mt-4 text-xs leading-5 text-blue-800">最高类别置信度低于阈值，因此只标记为未知/低置信度家族，不将其直接宣称为零日样本。</p>}
                </div>
                <div>
                  {result.family_probs && Object.keys(result.family_probs).length > 0 ? (
                    <FamilyProbabilityChart probabilities={result.family_probs} />
                  ) : (
                    <div className="flex h-full min-h-56 items-center justify-center rounded-lg border border-dashed border-slate-300 bg-slate-50 text-center text-sm text-slate-500">旧版接口没有保存完整家族概率。</div>
                  )}
                </div>
              </div>
            ) : isRunning ? (
              <div className="rounded-lg border border-blue-200 bg-blue-50 p-6 text-center"><Activity className="mx-auto h-8 w-8 animate-pulse text-blue-600" /><p className="mt-3 text-sm font-semibold text-blue-900">动态分析仍在进行</p><p className="mt-1 text-xs text-blue-700">页面会在后台轮询任务状态并自动更新最终结果。</p></div>
            ) : isMalware ? (
              <div className="rounded-lg border border-amber-200 bg-amber-50 p-5 text-sm text-amber-800"><AlertTriangle className="mr-2 inline h-4 w-4" />动态沙箱未返回可用结果，当前结论来自静态模型。</div>
            ) : (
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-6 text-center"><ShieldCheck className="mx-auto h-8 w-8 text-emerald-600" /><p className="mt-3 text-sm font-semibold text-slate-800">未触发动态沙箱</p><p className="mt-1 text-xs text-slate-500">当前流程只对静态阶段判定为高风险的 APK 启动动态分析。</p></div>
            )}
          </ReportSection>

          <ReportSection id="model" title="模型与结果边界" description="向评审明确说明模型输出、当前特征覆盖和不能推出的结论。" icon={<CircleHelp className="h-4 w-4" />}>
            <div className="grid gap-4 lg:grid-cols-3">
              <div className="rounded-lg border border-slate-200 p-4"><Fingerprint className="h-5 w-5 text-blue-600" /><h3 className="mt-3 text-sm font-semibold text-slate-900">静态二分类</h3><p className="mt-2 text-xs leading-5 text-slate-600">特征映射后交给 SelectKBest 与软投票集成模型，输出良性/恶意概率。页面不额外拼接未经验证的“综合安全分”。</p></div>
              <div className="rounded-lg border border-slate-200 p-4"><Activity className="h-5 w-5 text-blue-600" /><h3 className="mt-3 text-sm font-semibold text-slate-900">动态家族分类</h3><p className="mt-2 text-xs leading-5 text-slate-600">只在高风险样本上运行。最高类别概率低于阈值时显示“未知家族”，它不是零日攻击的直接证明。</p></div>
              <div className="rounded-lg border border-slate-200 p-4"><Info className="h-5 w-5 text-blue-600" /><h3 className="mt-3 text-sm font-semibold text-slate-900">当前限制</h3><p className="mt-2 text-xs leading-5 text-slate-600">可疑 API、证书链、网络流量和源代码定位尚未实现。报告会明确显示“未采集”，不会使用虚构数据。</p></div>
            </div>
          </ReportSection>
        </div>
      </div>
    </div>
  );
}
