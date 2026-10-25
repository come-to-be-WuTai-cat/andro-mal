import { useEffect, useRef } from 'react';
import { BarChart, PieChart } from 'echarts/charts';
import { AriaComponent, GridComponent, TooltipComponent } from 'echarts/components';
import { init, use as registerECharts, type EChartsCoreOption } from 'echarts/core';
import { CanvasRenderer } from 'echarts/renderers';

registerECharts([BarChart, PieChart, AriaComponent, GridComponent, TooltipComponent, CanvasRenderer]);

interface EChartProps {
  option: EChartsCoreOption;
  className?: string;
  ariaLabel: string;
}

export function EChart({ option, className = 'h-64', ariaLabel }: EChartProps) {
  const chartRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!chartRef.current) return;
    const chart = init(chartRef.current, undefined, { renderer: 'canvas' });
    chart.setOption(option);
    const observer = new ResizeObserver(() => chart.resize());
    observer.observe(chartRef.current);

    return () => {
      observer.disconnect();
      chart.dispose();
    };
  }, [option]);

  return <div ref={chartRef} className={className} role="img" aria-label={ariaLabel} />;
}

