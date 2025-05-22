import React, { useEffect, useState } from 'react';
import { Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
} from 'chart.js';

// Register ChartJS components
ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale);

interface PortfolioSummary {
  user_id: string;
  name: string;
  risk_tolerance: string;
  investment_goal: string;
  investment_horizon: string;
  total_allocation: number;
  asset_allocation: Record<string, number>;
  last_updated: string;
}

const Dashboard: React.FC = () => {
  const [portfolio, setPortfolio] = useState<PortfolioSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPortfolio = async () => {
      try {
        const response = await fetch('/api/v1/portfolio/summary');
        if (!response.ok) {
          throw new Error('Failed to fetch portfolio data');
        }
        const data = await response.json();
        setPortfolio(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchPortfolio();
  }, []);

  const chartData = portfolio ? {
    labels: Object.keys(portfolio.asset_allocation),
    datasets: [
      {
        data: Object.values(portfolio.asset_allocation),
        backgroundColor: [
          '#FF6384',
          '#36A2EB',
          '#FFCE56',
          '#4BC0C0',
          '#9966FF',
        ],
        borderWidth: 1,
      },
    ],
  } : null;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
        <strong className="font-bold">Error!</strong>
        <span className="block sm:inline"> {error}</span>
      </div>
    );
  }

  if (!portfolio) {
    return (
      <div className="text-center py-8">
        <h2 className="text-xl font-semibold text-gray-700">No portfolio data available</h2>
        <p className="text-gray-500 mt-2">Please set up your investment preferences to view your portfolio.</p>
      </div>
    );
  }

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* User Profile Section */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-800">Profile Overview</h2>
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-lg font-semibold">{portfolio.name}</p>
            <div className="mt-2 space-y-2">
              <p><span className="font-medium">Risk Tolerance:</span> {portfolio.risk_tolerance}</p>
              <p><span className="font-medium">Investment Goal:</span> {portfolio.investment_goal}</p>
              <p><span className="font-medium">Investment Horizon:</span> {portfolio.investment_horizon}</p>
              <p><span className="font-medium">Last Updated:</span> {new Date(portfolio.last_updated).toLocaleString()}</p>
            </div>
          </div>
        </div>

        {/* Portfolio Allocation Section */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-800">Portfolio Allocation</h2>
          <div className="bg-gray-50 p-4 rounded-lg">
            {chartData && (
              <div className="h-64">
                <Pie data={chartData} options={{ maintainAspectRatio: false }} />
              </div>
            )}
            <div className="mt-4">
              <p className="font-medium">Total Allocation: {portfolio.total_allocation}%</p>
              <div className="mt-2 space-y-1">
                {Object.entries(portfolio.asset_allocation).map(([asset, allocation]) => (
                  <div key={asset} className="flex justify-between">
                    <span className="capitalize">{asset}</span>
                    <span>{allocation}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 