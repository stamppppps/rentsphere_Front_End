import React, { useEffect, useState } from 'react';
import Header from '../components/Header';
import ResidentCard from '../components/ResidentCard';
import FeatureGrid from '../components/FeatureGrid';
import LatestActivitySection from '../components/LatestActivitySection';
import { getResidentData, getLatestActivities } from '@/features/tenant/pages/home/services/home.service';
import type { Resident, Activity } from '@/features/tenant/pages/home/types/home.types';

const TenantHomePage: React.FC = () => {
  const [resident, setResident] = useState<Resident | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [resData, actData] = await Promise.all([
          getResidentData(),
          getLatestActivities()
        ]);
        setResident(resData);
        setActivities(actData);
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading || !resident) {
    return (
      <div className="flex items-center justify-center min-h-[80vh]">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
      <Header />
      <ResidentCard resident={resident} />
      <FeatureGrid />
      <LatestActivitySection activities={activities} />
      
      {/* Decorative background element */}
      <div className="fixed top-0 right-0 -z-10 w-64 h-64 bg-blue-100/40 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
      <div className="fixed bottom-0 left-0 -z-10 w-80 h-80 bg-purple-100/40 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>
    </div>
  );
};

export default TenantHomePage;
