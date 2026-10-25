import { Link } from 'react-router';
import { Clock3, FileSearch, ShieldAlert, ShieldCheck, Trash2 } from 'lucide-react';
import { useScans } from '../features/scans/ScanContext';

function formatDate(value: string) {
  return new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value));
}

export function HistoryPage() {
  const { history, deleteScan } = useScans();

  return (
    <div className="mx-auto max-w-[1440px] px-4 py-7 sm:px-6 lg:px-8 lg:py-9">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight text-slate-950">最近扫描</h1>
        <p className="mt-2 text-sm text-slate-600">
          报告元数据保存在当前浏览器中；原始 APK 不会存入浏览器历史。
        </p>
      </div>

      <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        {history.length === 0 ? (
          <div className="px-6 py-20 text-center">
            <FileSearch className="mx-auto h-10 w-10 text-slate-300" />
            <h2 className="mt-4 text-base font-semibold text-slate-800">还没有扫描报告</h2>
            <p className="mt-1 text-sm text-slate-500">完成一次 APK 分析后，报告会出现在这里。</p>
            <Link to="/" className="mt-5 inline-flex rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-500">
              开始第一次扫描
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-left">
              <thead className="border-b border-slate-200 bg-slate-50">
                <tr className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                  <th className="px-5 py-3">应用</th>
                  <th className="px-5 py-3">检测结果</th>
                  <th className="px-5 py-3">恶意概率</th>
                  <th className="px-5 py-3">动态家族</th>
                  <th className="px-5 py-3">扫描时间</th>
                  <th className="px-5 py-3 text-right">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {history.map((scan) => (
                  <tr key={scan.id} className="align-middle hover:bg-slate-50/70">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${
                          scan.result.is_malware ? 'bg-rose-50 text-rose-600' : 'bg-emerald-50 text-emerald-600'
                        }`}>
                          {scan.result.is_malware ? <ShieldAlert className="h-5 w-5" /> : <ShieldCheck className="h-5 w-5" />}
                        </div>
                        <div className="min-w-0">
                          <Link to={`/scans/${scan.id}/report`} className="block max-w-72 truncate text-sm font-semibold text-slate-900 hover:text-blue-700">
                            {scan.result.apk_info.app_name || scan.fileName}
                          </Link>
                          <p className="mt-1 max-w-72 truncate font-mono text-[10px] text-slate-500">{scan.result.apk_info.package_name}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase ${
                        scan.status === 'running'
                          ? 'border-blue-200 bg-blue-50 text-blue-700'
                          : scan.result.is_malware
                            ? 'border-rose-200 bg-rose-50 text-rose-700'
                            : 'border-emerald-200 bg-emerald-50 text-emerald-700'
                      }`}>
                        {scan.status === 'running' ? '分析中' : scan.result.is_malware ? '恶意' : '良性'}
                      </span>
                    </td>
                    <td className="px-5 py-4 font-mono text-sm font-semibold text-slate-700">
                      {(scan.result.malware_prob * 100).toFixed(1)}%
                    </td>
                    <td className="px-5 py-4 text-sm text-slate-600">{scan.result.family || '—'}</td>
                    <td className="px-5 py-4">
                      <span className="flex items-center gap-1.5 text-xs text-slate-500">
                        <Clock3 className="h-3.5 w-3.5" /> {formatDate(scan.createdAt)}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          to={`/scans/${scan.id}/report`}
                          className="rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:border-blue-300 hover:text-blue-700"
                        >
                          查看报告
                        </Link>
                        <button
                          type="button"
                          aria-label={`删除 ${scan.fileName} 的本地报告`}
                          onClick={() => {
                            if (window.confirm('只删除浏览器中的本地报告记录，是否继续？')) deleteScan(scan.id);
                          }}
                          className="rounded-md border border-slate-200 p-1.5 text-slate-400 hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
