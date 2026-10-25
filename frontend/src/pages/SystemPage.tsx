import { useQuery } from '@tanstack/react-query';
import { Activity, AlertTriangle, CheckCircle2, Cpu, Database, Server, Smartphone } from 'lucide-react';
import { getHealth } from '../api/client';

export function SystemPage() {
  const health = useQuery({ queryKey: ['health'], queryFn: getHealth, retry: 1 });
  const online = health.isSuccess && health.data.models_loaded;

  return (
    <div className="mx-auto max-w-[1200px] px-4 py-7 sm:px-6 lg:px-8 lg:py-9">
      <div className="mb-7">
        <h1 className="text-2xl font-semibold tracking-tight text-slate-950">系统状态</h1>
        <p className="mt-2 text-sm text-slate-600">检查前端、FastAPI 推理服务、模型加载状态和动态沙箱说明。</p>
      </div>

      <section className={`mb-6 rounded-xl border p-5 shadow-sm ${online ? 'border-emerald-200 bg-emerald-50' : 'border-rose-200 bg-rose-50'}`}>
        <div className="flex items-start gap-4">
          <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-white ${online ? 'text-emerald-600' : 'text-rose-600'}`}>
            {online ? <CheckCircle2 className="h-6 w-6" /> : <AlertTriangle className="h-6 w-6" />}
          </div>
          <div>
            <h2 className={`text-base font-semibold ${online ? 'text-emerald-900' : 'text-rose-900'}`}>
              {online ? '分析引擎已就绪' : '无法连接分析引擎'}
            </h2>
            <p className={`mt-1 text-sm ${online ? 'text-emerald-700' : 'text-rose-700'}`}>
              {online
                ? `FastAPI v${health.data.version} 已响应，静态模型加载完成。`
                : '请确认后端已在 http://localhost:8000 启动，并检查 VITE_API_URL。'}
            </p>
          </div>
        </div>
      </section>

      <div className="grid gap-5 lg:grid-cols-3">
        {[
          {
            icon: Server,
            title: 'FastAPI 服务',
            status: health.isSuccess ? '在线' : '离线',
            description: '负责 APK 校验、静态特征提取、模型推理和后台动态任务。',
            ok: health.isSuccess,
          },
          {
            icon: Cpu,
            title: '静态模型',
            status: health.data?.models_loaded ? '已加载' : '不可用',
            description: '启动时加载二分类流水线；动态家族模型在需要时按需加载。',
            ok: Boolean(health.data?.models_loaded),
          },
          {
            icon: Smartphone,
            title: 'Android 沙箱',
            status: '按需启动',
            description: '高风险样本触发 malware_sandbox AVD 和 Frida 运行时采集。',
            ok: null,
          },
        ].map(({ icon: Icon, title, status, description, ok }) => (
          <article key={title} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-700"><Icon className="h-5 w-5" /></div>
              <span className={`rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase ${
                ok === true ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : ok === false ? 'border-rose-200 bg-rose-50 text-rose-700' : 'border-blue-200 bg-blue-50 text-blue-700'
              }`}>{status}</span>
            </div>
            <h2 className="mt-4 text-sm font-semibold text-slate-900">{title}</h2>
            <p className="mt-2 text-xs leading-5 text-slate-600">{description}</p>
          </article>
        ))}
      </div>

      <section className="mt-6 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-5 py-4">
          <h2 className="flex items-center gap-2 text-sm font-semibold text-slate-900"><Activity className="h-4 w-4 text-blue-600" />当前部署架构</h2>
        </div>
        <div className="grid gap-0 divide-y divide-slate-100 md:grid-cols-3 md:divide-x md:divide-y-0">
          <div className="p-5"><p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">01 · Browser</p><h3 className="mt-2 text-sm font-semibold text-slate-900">React 分析控制台</h3><p className="mt-2 text-xs leading-5 text-slate-500">路由、报告、可筛选权限表和浏览器本地历史。</p></div>
          <div className="p-5"><p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">02 · API</p><h3 className="mt-2 text-sm font-semibold text-slate-900">FastAPI 推理服务</h3><p className="mt-2 text-xs leading-5 text-slate-500">负责解析、特征映射、任务进度和模型结果。</p></div>
          <div className="p-5"><p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">03 · Sandbox</p><h3 className="mt-2 text-sm font-semibold text-slate-900">Android + Frida</h3><p className="mt-2 text-xs leading-5 text-slate-500">只处理静态阶段判定为恶意的样本。</p></div>
        </div>
      </section>

      <section className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-5">
        <div className="flex items-start gap-3">
          <Database className="mt-0.5 h-5 w-5 shrink-0 text-amber-700" />
          <div>
            <h2 className="text-sm font-semibold text-amber-900">历史记录说明</h2>
            <p className="mt-1 text-xs leading-5 text-amber-800">当前版本把报告 JSON 保存到浏览器 localStorage，适合单机比赛演示。正式多用户部署应改为 SQLite/PostgreSQL 持久化，并在服务端实现访问控制。</p>
          </div>
        </div>
      </section>
    </div>
  );
}
