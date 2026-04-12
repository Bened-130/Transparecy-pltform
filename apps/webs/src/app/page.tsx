import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { Navigation } from '@/components/Navigation';
import { DashboardStats } from '@/components/DashboardStats';
import { LiveTally } from '@/components/LiveTally';
import { RecentUploads } from '@/components/RecentUploads';
import { SearchWidget } from '@/components/SearchWidget';

interface DashboardData {
  totalUploads: number;
  verifiedUploads: number;
  pendingUploads: number;
  totalVotes: number;
  candidates: Array<{
    id: string;
    name: string;
    party: string;
    color: string;
    votes: number;
  }>;
  recentUploads: Array<any>;
  lastUpdated: string;
}

export default function Home() {
  const [data, setData] = useState<DashboardData>({
    totalUploads: 0,
    verifiedUploads: 0,
    pendingUploads: 0,
    totalVotes: 0,
    candidates: [],
    recentUploads: [],
    lastUpdated: new Date().toISOString(),
  });
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        // Replace with actual API endpoint
        const response = await fetch('/api/dashboard');
        const dashboardData = await response.json();

        setData({
          totalUploads: dashboardData.totalUploads || 0,
          verifiedUploads: dashboardData.verifiedUploads || 0,
          pendingUploads: dashboardData.pendingUploads || 0,
          totalVotes: dashboardData.totalVotes || 0,
          candidates: dashboardData.candidates || [],
          recentUploads: dashboardData.recentUploads || [],
          lastUpdated: new Date().toISOString(),
        });
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
        // Use mock data for demo
        setData({
          totalUploads: 1234,
          verifiedUploads: 987,
          pendingUploads: 145,
          totalVotes: 5432100,
          candidates: [
            {
              id: '1',
              name: 'Candidate A',
              party: 'Party A',
              color: '#FF6B6B',
              votes: 1234567,
            },
            {
              id: '2',
              name: 'Candidate B',
              party: 'Party B',
              color: '#4ECDC4',
              votes: 1098765,
            },
            {
              id: '3',
              name: 'Candidate C',
              party: 'Party C',
              color: '#45B7D1',
              votes: 987654,
            },
            {
              id: '4',
              name: 'Candidate D',
              party: 'Party D',
              color: '#FFA07A',
              votes: 654321,
            },
          ],
          recentUploads: [
            {
              id: '001',
              pollingStationId: 'PS-001',
              status: 'verified',
              imageCount: 5,
              createdAt: new Date().toISOString(),
              uploaderPhone: '+254712345678',
            },
            {
              id: '002',
              pollingStationId: 'PS-002',
              status: 'processing',
              imageCount: 3,
              createdAt: new Date(Date.now() - 600000).toISOString(),
              uploaderPhone: '+254723456789',
            },
            {
              id: '003',
              pollingStationId: 'PS-003',
              status: 'pending',
              imageCount: 4,
              createdAt: new Date(Date.now() - 1200000).toISOString(),
              uploaderPhone: '+254734567890',
            },
          ],
          lastUpdated: new Date().toISOString(),
        });
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();

    // Refresh data every 30 seconds
    const interval = setInterval(fetchDashboardData, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    // Implement search logic
    console.log('Searching for:', query);
  };

  return (
    <>
      <Head>
        <title>Election Transparency Platform - IEBC</title>
        <meta name="description" content="Real-time election transparency platform" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Navigation />

      <main className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Election Dashboard</h1>
            <p className="text-gray-600">Real-time vote tally and upload monitoring</p>
          </div>

          {/* Search Widget */}
          <SearchWidget onSearch={handleSearch} />

          {/* Dashboard Stats */}
          <DashboardStats
            totalUploads={data.totalUploads}
            verifiedUploads={data.verifiedUploads}
            pendingUploads={data.pendingUploads}
            totalVotes={data.totalVotes}
          />

          {/* Live Tally Chart */}
          <LiveTally
            candidates={data.candidates}
            totalVotes={data.totalVotes}
            lastUpdated={data.lastUpdated}
          />

          {/* Recent Uploads */}
          <RecentUploads uploads={data.recentUploads} loading={loading} />

          {/* Footer */}
          <div className="mt-12 pt-8 border-t border-gray-200">
            <p className="text-center text-gray-600 text-sm">
              Election Transparency Platform © {new Date().getFullYear()} — IEBC
            </p>
            <p className="text-center text-gray-500 text-xs mt-2">
              Last updated: {new Date(data.lastUpdated).toLocaleTimeString()}
            </p>
          </div>
        </div>
      </main>
    </>
  );
}
