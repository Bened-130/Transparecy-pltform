import React from 'react';
import Link from 'next/link';

interface Upload {
  id: string;
  pollingStationId: string;
  status: 'pending' | 'processing' | 'verified' | 'failed' | 'rejected';
  imageCount: number;
  createdAt: string;
  uploaderPhone: string;
}

interface RecentUploadsProps {
  uploads: Upload[];
  loading?: boolean;
}

export const RecentUploads: React.FC<RecentUploadsProps> = ({ uploads, loading = false }) => {
  const getStatusBadge = (status: string) => {
    const statuses: Record<string, { bg: string; text: string; icon: string }> = {
      verified: { bg: 'bg-green-100', text: 'text-green-800', icon: '✓' },
      pending: { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: '⏳' },
      processing: { bg: 'bg-blue-100', text: 'text-blue-800', icon: '⟳' },
      failed: { bg: 'bg-red-100', text: 'text-red-800', icon: '✗' },
      rejected: { bg: 'bg-red-100', text: 'text-red-800', icon: '✗' },
    };

    const s = statuses[status] || statuses.pending;

    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${s.bg} ${s.text}`}>
        {s.icon} {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Recent Uploads</h2>
        <Link href="/uploads" className="text-blue-600 hover:text-blue-800 text-sm font-medium">
          View All →
        </Link>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : uploads.length === 0 ? (
        <p className="text-gray-500 text-center py-12">No uploads yet</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-100 border-b">
              <tr>
                <th className="px-4 py-3 font-semibold text-gray-700">Station ID</th>
                <th className="px-4 py-3 font-semibold text-gray-700">Status</th>
                <th className="px-4 py-3 font-semibold text-gray-700">Images</th>
                <th className="px-4 py-3 font-semibold text-gray-700">Uploaded By</th>
                <th className="px-4 py-3 font-semibold text-gray-700">Date</th>
                <th className="px-4 py-3 font-semibold text-gray-700">Action</th>
              </tr>
            </thead>
            <tbody>
              {uploads.map((upload) => (
                <tr key={upload.id} className="border-b hover:bg-gray-50 transition">
                  <td className="px-4 py-3 font-mono text-sm">{upload.pollingStationId}</td>
                  <td className="px-4 py-3">{getStatusBadge(upload.status)}</td>
                  <td className="px-4 py-3">{upload.imageCount} photos</td>
                  <td className="px-4 py-3 text-sm">{upload.uploaderPhone}</td>
                  <td className="px-4 py-3 text-sm text-gray-500">
                    {new Date(upload.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/uploads/${upload.id}`}
                      className="text-blue-600 hover:text-blue-800 font-medium text-sm"
                    >
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
