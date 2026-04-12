export default function DashboardStats() {
  const stats = [
    {
      label: 'Total Uploads',
      value: 1247,
      bgColor: 'bg-blue-100',
      textColor: 'text-blue-600',
      icon: '📤',
    },
    {
      label: 'Verified',
      value: 892,
      bgColor: 'bg-green-100',
      textColor: 'text-green-600',
      icon: '✓',
    },
    {
      label: 'Pending',
      value: 355,
      bgColor: 'bg-yellow-100',
      textColor: 'text-yellow-600',
      icon: '⏳',
    },
    {
      label: 'Total Votes',
      value: 245680,
      bgColor: 'bg-purple-100',
      textColor: 'text-purple-600',
      icon: '🗳️',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8" data-testid="stats-container">
      {stats.map((stat, index) => (
        <div key={index} className={`${stat.bgColor} rounded-lg p-6 shadow-md`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">{stat.label}</p>
              <p className={`text-2xl font-bold ${stat.textColor}`}>
                {stat.value.toLocaleString()}
              </p>
            </div>
            <div className="text-3xl">{stat.icon}</div>
          </div>
        </div>
      ))}
    </div>
  );
}
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
