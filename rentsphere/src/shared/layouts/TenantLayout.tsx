import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import BottomNavigation from '../../features/tenant/pages/home/components/BottomNavigation';

const HIDE_NAV_ROUTES = ['/tenant/parcel'];

const TenantLayout: React.FC = () => {
  const location = useLocation();
  const hideNav = HIDE_NAV_ROUTES.some(route => location.pathname.startsWith(route));

  return (
    <div className={`min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 ${hideNav ? '' : 'pb-24'} flex flex-col max-w-md mx-auto relative shadow-2xl overflow-hidden border-x border-gray-100`}>
      <main className="flex-1">
        <Outlet />
      </main>
      {!hideNav && <BottomNavigation />}
    </div>
  );
};

export default TenantLayout;

