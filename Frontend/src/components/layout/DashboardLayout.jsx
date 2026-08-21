import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar.jsx';
import Sidebar from './Sidebar.jsx';
import Breadcrumbs from './Breadcrumbs.jsx';

function DashboardLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  const sidebarWidth = collapsed ? 'lg:w-16' : 'lg:w-64';
  const mainPadding  = collapsed ? 'lg:pl-16' : 'lg:pl-64';

  return (
    <div className="flex h-screen overflow-hidden bg-[#f8fafc] text-[#334155]">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-white focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-[#2563EB] focus:shadow-md"
      >
        Skip to main content
      </a>

      {/* Desktop sidebar */}
      <div className={`hidden lg:fixed lg:inset-y-0 lg:left-0 lg:flex ${sidebarWidth} transition-all duration-200`}>
        <Sidebar collapsed={collapsed} />
      </div>

      {/* Mobile sidebar overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden" role="dialog" aria-modal="true" aria-label="Navigation menu">
          <button
            type="button"
            aria-label="Close menu"
            className="absolute inset-0 bg-[#0f172a]/50 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          <div className="relative h-full w-64">
            <Sidebar onNavigate={() => setMobileOpen(false)} />
          </div>
        </div>
      )}

      {/* Main */}
      <div className={`flex flex-1 flex-col ${mainPadding} transition-all duration-200 min-w-0`}>
        <Navbar
          onMobileMenuClick={() => setMobileOpen(true)}
          onCollapseClick={() => setCollapsed((v) => !v)}
          collapsed={collapsed}
        />
        <main id="main-content" className="flex-1 overflow-y-auto px-4 py-5 sm:px-6">
          <Breadcrumbs />
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default DashboardLayout;
