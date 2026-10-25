import { createBrowserRouter } from 'react-router';
import { AppShell } from '../layouts/AppShell';
import { DashboardPage } from '../pages/DashboardPage';
import { HistoryPage } from '../pages/HistoryPage';
import { SystemPage } from '../pages/SystemPage';
import { NotFoundPage } from '../pages/NotFoundPage';

export const router = createBrowserRouter([
  {
    Component: AppShell,
    children: [
      { index: true, Component: DashboardPage },
      { path: 'scans', Component: HistoryPage },
      {
        path: 'scans/:scanId/report',
        lazy: async () => {
          const module = await import('../pages/ReportPage');
          return { Component: module.ReportPage };
        },
      },
      { path: 'system', Component: SystemPage },
      { path: '*', Component: NotFoundPage },
    ],
  },
]);

