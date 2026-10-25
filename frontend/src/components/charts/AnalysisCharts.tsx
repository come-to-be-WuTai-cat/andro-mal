import { useMemo } from 'react';
import type { EChartsCoreOption } from 'echarts/core';
import { EChart } from './EChart';

export function ProbabilityDonut({ malware, benign }: { malware: number; benign: number }) {
  const option = useMemo<EChartsCoreOption>(() => ({
    aria: { enabled: true, description: `恶意概率 ${Math.round(malware * 100)}%，良性概率 ${Math.round(benign * 100)}%` },
    tooltip: { trigger: 'item', valueFormatter: (value: unknown) => `${Number(value).toFixed(1)}%` },
    series: [{
      type: 'pie',
      radius: ['66%', '88%'],
      center: ['50%', '50%'],
      silent: false,
      label: { show: false },
      emphasis: { scale: true, scaleSize: 5 },
      itemStyle: { borderColor: '#ffffff', borderWidth: 3 },
      data: [
        { value: malware * 100, name: '恶意', itemStyle: { color: '#dc2626' } },
        { value: benign * 100, name: '良性', itemStyle: { color: '#059669' } },
      ],
    }],
    graphic: [{
      type: 'text',
      left: 'center',
      top: '39%',
      style: {
        text: `${Math.round(malware * 100)}%\n恶意概率`,
        textAlign: 'center',
        fill: '#0f172a',
        font: '600 18px IBM Plex Sans',
        lineHeight: 25,
      },
    }],
  }), [benign, malware]);

  return <EChart option={option} className="h-52 w-full" ariaLabel="静态模型恶意与良性概率环形图" />;
}

export function FamilyProbabilityChart({ probabilities }: { probabilities: Record<string, number> }) {
  const entries = useMemo(
    () => Object.entries(probabilities).sort((a, b) => b[1] - a[1]).slice(0, 5).reverse(),
    [probabilities],
  );
  const option = useMemo<EChartsCoreOption>(() => ({
    aria: { enabled: true },
    grid: { top: 8, right: 28, bottom: 24, left: 86 },
    tooltip: { trigger: 'axis', valueFormatter: (value: unknown) => `${Number(value).toFixed(1)}%` },
    xAxis: {
      type: 'value',
      min: 0,
      max: 100,
      axisLabel: { color: '#64748b', formatter: '{value}%' },
      splitLine: { lineStyle: { color: '#e2e8f0' } },
    },
    yAxis: {
      type: 'category',
      data: entries.map(([name]) => name),
      axisLabel: { color: '#334155', fontFamily: 'IBM Plex Mono', fontSize: 11 },
      axisTick: { show: false },
      axisLine: { show: false },
    },
    series: [{
      type: 'bar',
      data: entries.map(([, probability]) => Number((probability * 100).toFixed(2))),
      barWidth: 14,
      itemStyle: { color: '#2563eb', borderRadius: [0, 4, 4, 0] },
      label: { show: true, position: 'right', formatter: '{c}%', color: '#475569', fontSize: 11 },
    }],
  }), [entries]);

  if (entries.length === 0) return null;
  return <EChart option={option} className="h-64 w-full" ariaLabel="恶意软件家族分类概率前五名柱状图" />;
}
