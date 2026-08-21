import { useEffect, useState } from 'react';
import AlertCard from '../../../components/common/AlertCard.jsx';
import DashboardCard from '../../../components/common/DashboardCard.jsx';
import LoadingSkeleton from '../../../components/common/LoadingSkeleton.jsx';
import MiniChart from '../../../components/common/MiniChart.jsx';
import QuickActionCard from '../../../components/common/QuickActionCard.jsx';
import RecentActivityList from '../../../components/common/RecentActivityList.jsx';
import StatCard from '../../../components/common/StatCard.jsx';
import Table from '../../../components/common/Table.jsx';
import { getDashboardData } from '../../../services/dashboardService.js';

const emptyData = {
  stats: {},
  activities: [],
  alerts: [],
  chart: [],
  table: [],
  sections: {}
};

function readValue(data, key, fallback = 0) {
  if (data.stats && !Array.isArray(data.stats) && data.stats[key] !== undefined) {
    return data.stats[key];
  }

  if (data[key] !== undefined) {
    return data[key];
  }

  return fallback;
}

function readCollection(data, key) {
  const collection = data[key] || data.sections?.[key];
  return Array.isArray(collection) ? collection : [];
}

function normalizeActivities(items) {
  return items.map((item, index) => ({
    id: item.id || index,
    title: item.title || item.action || item.event || item.name || 'Activity',
    description: item.description || item.details || item.message || '',
    time: item.time || item.dateTime || item.createdAt || item.generatedDate || '',
    status: item.status || item.type || '',
    variant: item.variant || (String(item.status || '').toUpperCase().includes('FAILED') ? 'critical' : 'info')
  }));
}

function RoleDashboard({ config }) {
  const [dashboardData, setDashboardData] = useState(emptyData);
  const [status, setStatus] = useState('loading');

  useEffect(() => {
    let isMounted = true;

    setStatus('loading');
    getDashboardData(config.role)
      .then((data) => {
        if (!isMounted) return;
        setDashboardData({ ...emptyData, ...data });
        setStatus('ready');
      })
      .catch(() => {
        if (!isMounted) return;
        setStatus('error');
      });

    return () => {
      isMounted = false;
    };
  }, [config.role]);

  const chartData = readCollection(dashboardData, config.chartKey || 'chart');
  const tableData = readCollection(dashboardData, config.tableKey || 'table');
  const activityData = normalizeActivities(readCollection(dashboardData, config.activityKey || 'activities'));
  const alertData = readCollection(dashboardData, config.alertKey || 'alerts');

  if (status === 'loading') {
    return (
      <div className="space-y-6">
        <DashboardHeader config={config} />
        <LoadingSkeleton rows={6} />
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="space-y-6">
        <DashboardHeader config={config} />
        <DashboardCard title="Dashboard unavailable" subtitle="The dashboard service could not be reached. Please try again later.">
          <p className="text-sm text-[#DC2626]">Unable to load dashboard overview.</p>
        </DashboardCard>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <DashboardHeader config={config} />

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {config.stats.map((stat) => (
          <StatCard
            key={stat.key}
            title={stat.title}
            value={readValue(dashboardData, stat.key, stat.fallback || 0)}
            description={stat.description}
            icon={stat.icon}
            color={stat.color}
          />
        ))}
      </section>

      <section className="grid gap-4 xl:grid-cols-[1fr_1.1fr]">
        <DashboardCard title={config.chartTitle} subtitle={config.chartSubtitle}>
          <MiniChart data={chartData} title={config.chartTitle} valueSuffix={config.chartSuffix || ''} />
        </DashboardCard>

        <DashboardCard title={config.tableTitle} subtitle={config.tableSubtitle}>
          <Table columns={config.tableColumns} data={tableData} emptyMessage="No data available for this section." />
        </DashboardCard>
      </section>

      <section className="grid gap-4 xl:grid-cols-[1fr_1fr]">
        <DashboardCard title={config.activityTitle} subtitle={config.activitySubtitle}>
          <RecentActivityList items={activityData} emptyTitle="No recent activity" />
        </DashboardCard>

        <DashboardCard title={config.alertTitle} subtitle={config.alertSubtitle}>
          {alertData.length > 0 ? (
            <div className="grid gap-3">
              {alertData.map((alert, index) => (
                <AlertCard
                  key={alert.id || index}
                  title={alert.title || alert.type || 'Alert'}
                  message={alert.message || alert.description}
                  level={alert.level || alert.status || 'INFO'}
                  time={alert.time || alert.dateTime || alert.createdAt}
                />
              ))}
            </div>
          ) : (
            <div className="rounded-lg border border-[#334155]/15 bg-[#FFFFFF] px-4 py-6 text-center">
              <h3 className="text-sm font-semibold text-[#334155]">No alerts</h3>
              <p className="mt-1 text-sm text-[#334155]/75">No data available for this section.</p>
            </div>
          )}
        </DashboardCard>
      </section>

      <section>
        <h2 className="mb-3 text-base font-semibold text-[#334155]">Quick Actions</h2>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {config.actions.map((action) => (
            <QuickActionCard key={action.title} {...action} />
          ))}
        </div>
      </section>
    </div>
  );
}

function DashboardHeader({ config }) {
  return (
    <div>
      <h1 className="text-2xl font-bold text-[#334155]">{config.title}</h1>
      <p className="mt-1.5 max-w-3xl text-[#334155]/70">{config.description}</p>
    </div>
  );
}

export default RoleDashboard;
