import { Link } from 'react-router';
import { FileQuestion } from 'lucide-react';

export function NotFoundPage() {
  return (
    <div className="mx-auto max-w-xl px-6 py-24 text-center">
      <FileQuestion className="mx-auto h-12 w-12 text-slate-300" />
      <h1 className="mt-5 text-xl font-semibold text-slate-900">页面不存在</h1>
      <p className="mt-2 text-sm text-slate-500">请从分析控制台重新进入，或者检查报告链接是否完整。</p>
      <Link to="/" className="mt-6 inline-flex rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-500">返回控制台</Link>
    </div>
  );
}
