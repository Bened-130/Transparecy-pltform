import React from 'react';

interface StatsProps {
  totalUploads: number;
  verifiedUploads: number;
  pendingUploads: number;
  totalVotes: number;
}

export const DashboardStats: React.FC<StatsProps> = ({
  totalUploads,
  verifiedUploads,
  pendingUploads,
  totalVotes,
}) => {
  const stats = [
    {
      label: 'Total Uploads',
      value: totalUploads,
      bgColor: 'bg-blue-100',
      textColor: 'text-blue-600',
      icon: '📤',
    },
    {
      label: 'Verified',
      value: verifiedUploads,
      bgColor: 'bg-green-100',
      textColor: 'text-green-600',
      icon: '✓',
    },
    {
      label: 'Pending',
      value: pendingUploads,
      bgColor: 'bg-yellow-100',
      textColor: 'text-yellow-600',
      icon: '⏳',
    },
    {
      label: 'Total Votes',
      value: totalVotes,
      bgColor: 'bg-purple-100',
      textColor: 'text-purple-600',
      icon: '🗳️',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {stats.map((stat, index) => (
        <div key={index} className={`${stat.bgColor} rounded-lg p-6 shadow-md`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm mb-1">{stat.label}</p>
              <p className={`${stat.textColor} text-3xl font-bold`}>{stat.value.toLocaleString()}</p>
            </div>
            <div className="text-4xl">{stat.icon}</div>
          </div>
        </div>
      ))}
    </div>
  );
};
