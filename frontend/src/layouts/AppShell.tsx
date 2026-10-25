import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router';
import {
  Activity,
  BookOpenText,
  Clock3,
  History,
  LayoutDashboard,
  Menu,
  Plus,
  ServerCog,
  ShieldCheck,
  X,
} from 'lucide-react';
import { getHealth } from '../api/client';
import { useScans } from '../features/scans/ScanContext';

const navigation = [
  { to: '/', label: '分析控制台', icon: LayoutDashboard, end: true },
  { to: '/scans', label: '最近扫描', icon: History },
  { to: '/system', label: '系统状态', icon: ServerCog },
];

function Sidebar({ close }: { close?: () => void }) {
  const navigate = useNavigate();
  const { history, prepareNewScan } = useScans();

  const newScan = () => {
    prepareNewScan();
    navigate('/');
    close?.();
  };

  return (
    <div className="flex h-full flex-col bg-slate-950 text-slate-200">
      <div className="flex h-16 items-center gap-3 border-b border-white/10 px-5">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-500 text-white shadow-lg shadow-blue-950/40">
          <ShieldCheck className="h-5 w-5" aria-hidden="true" />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold tracking-wide text-white">AndroMal</p>
          <p className="text-[10px] uppercase tracking-[0.18em] text-slate-500">Security console</p>
        </div>
      </div>

      <div className="px-4 py-5">
        <button
          type="button"
          onClick={newScan}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-500 focus-visible:outline-white"
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          新建 APK 分析
        </button>
      </div>

      <nav className="flex-1 px-3" aria-label="主导航">
        <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-600">
          Workspace
        </p>
        <div className="space-y-1">
          {navigation.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                onClick={close}
                className={({ isActive }) =>
                  `group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition ${
                    isActive
                      ? 'bg-white/10 font-medium text-white'
                      : 'text-slate-400 hover:bg-white/5 hover:text-slate-100'
                  }`
                }
              >
                <Icon className="h-4 w-4" aria-hidden="true" />
                <span>{item.label}</span>
                {item.to === '/scans' && history.length > 0 && (
                  <span className="ml-auto rounded-full bg-white/10 px-2 py-0.5 font-mono text-[10px] text-slate-400">
                    {history.length}
                  </span>
                )}
              </NavLink>
            );
          })}
        </div>
      </nav>

      <div className="border-t border-white/10 p-4">
        <div className="rounded-lg border border-white/10 bg-white/[0.03] p-3">
          <div className="flex items-center gap-2 text-xs font-medium text-slate-300">
            <BookOpenText className="h-4 w-4 text-blue-400" aria-hidden="true" />
            混合检测流程
          </div>
          <p className="mt-2 text-[11px] leading-5 text-slate-500">
            静态特征负责初筛；高风险样本进入隔离沙箱完成家族分类。
          </p>
        </div>
        <p className="mt-4 text-center font-mono text-[10px] text-slate-700">LOCAL RESEARCH BUILD</p>
      </div>
    </div>
  );
}

function pageTitle(pathname: string): string {
  if (pathname.startsWith('/scans/') && pathname.endsWith('/report')) return '分析报告';
  if (pathname.startsWith('/scans')) return '最近扫描';
  if (pathname.startsWith('/system')) return '系统状态';
  return '分析控制台';
}

export function AppShell() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const { activeScan } = useScans();
  const health = useQuery({
    queryKey: ['health'],
    queryFn: getHealth,
    refetchInterval: 15_000,
    retry: 1,
  });

  return (
    <div className="min-h-screen bg-bg text-text">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 lg:block">
        <Sidebar />
      </aside>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label="关闭导航"
            className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="relative h-full w-72 shadow-2xl">
            <button
              type="button"
              aria-label="关闭导航"
              className="absolute right-3 top-4 z-10 rounded-md p-2 text-slate-400 hover:bg-white/10 hover:text-white"
              onClick={() => setMobileOpen(false)}
            >
              <X className="h-4 w-4" />
            </button>
            <Sidebar close={() => setMobileOpen(false)} />
          </aside>
        </div>
      )}

      <div className="lg:pl-64">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-white/95 px-4 backdrop-blur sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <button
              type="button"
              aria-label="打开导航"
              className="rounded-lg border border-border p-2 text-slate-600 lg:hidden"
              onClick={() => setMobileOpen(true)}
            >
              <Menu className="h-4 w-4" />
            </button>
            <div>
              <p className="text-sm font-semibold text-slate-900">{pageTitle(location.pathname)}</p>
              <p className="hidden text-xs text-muted sm:block">Android malware analysis workspace</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {activeScan?.status === 'running' && (
              <NavLink
                to={`/scans/${activeScan.id}/report`}
                className="hidden items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-xs font-medium text-blue-700 sm:flex"
              >
                <Activity className="h-3.5 w-3.5 animate-pulse" />
                动态分析进行中
              </NavLink>
            )}
            <div
              className="flex items-center gap-2 rounded-full border border-border bg-slate-50 px-3 py-1.5"
              title={health.isSuccess ? `API v${health.data.version}` : '无法连接分析服务'}
            >
              <span
                className={`h-2 w-2 rounded-full ${
                  health.isSuccess && health.data.models_loaded ? 'bg-emerald-500' : 'bg-rose-500'
                }`}
              />
              <span className="text-xs font-medium text-slate-600">
                {health.isSuccess && health.data.models_loaded ? '引擎在线' : '引擎离线'}
              </span>
            </div>
          </div>
        </header>

        <main className="min-h-[calc(100vh-4rem)]">
          <Outlet />
        </main>

        <footer className="border-t border-border bg-white px-6 py-4 text-xs text-muted lg:px-8">
          <div className="mx-auto flex max-w-[1440px] flex-col justify-between gap-2 sm:flex-row sm:items-center">
            <span>AndroMal · 仅分析你有权测试的 APK 文件</span>
            <span className="flex items-center gap-1.5 font-mono text-[11px]">
              <Clock3 className="h-3.5 w-3.5" /> Local report history
            </span>
          </div>
        </footer>
      </div>
    </div>
  );
}
