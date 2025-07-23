import React, { useState, useEffect } from 'react';
import { apiService } from '../services/api';
import { DashboardStats } from '../types';
import { 
  TrendingUp, 
  Package, 
  ShoppingCart, 
  AlertTriangle,
  Star,
  DollarSign
} from 'lucide-react';

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await apiService.getDashboardStats();
        setStats(data);
      } catch (error) {
        console.error('Failed to fetch dashboard stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Failed to load dashboard data</p>
      </div>
    );
  }

  const statCards = [
    {
      name: 'Today\'s Revenue',
      value: `฿${stats.todayRevenue.toLocaleString()}`,
      icon: DollarSign,
      color: 'bg-green-500',
      change: '+12.5%',
      changeType: 'positive'
    },
    {
      name: 'Today\'s Sales',
      value: stats.todaySalesCount.toString(),
      icon: ShoppingCart,
      color: 'bg-blue-500',
      change: '+8.2%',
      changeType: 'positive'
    },
    {
      name: 'Total Products',
      value: stats.totalProducts.toString(),
      icon: Package,
      color: 'bg-purple-500',
      change: '+2.1%',
      changeType: 'positive'
    },
    {
      name: 'Out of Stock',
      value: stats.outOfStockCount.toString(),
      icon: AlertTriangle,
      color: 'bg-red-500',
      change: '-1.4%',
      changeType: 'negative'
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <div className="text-sm text-gray-500">
          {new Date().toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat) => (
          <div key={stat.name} className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
              <div className={`${stat.color} rounded-full p-3`}>
                <stat.icon className="h-6 w-6 text-white" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <span className={`${
                stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
              } font-medium`}>
                {stat.change}
              </span>
              <span className="text-gray-500 ml-1">from last week</span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Best Selling Products */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Best Selling Products</h3>
            <Star className="h-5 w-5 text-yellow-500" />
          </div>
          <div className="space-y-4">
            {stats.bestSelling.map((product, index) => (
              <div key={product.id} className="flex items-center space-x-3">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium text-blue-600">
                      {index + 1}
                    </span>
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {product.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {product.totalSold} sold
                  </p>
                </div>
                <div className="text-sm font-medium text-gray-900">
                  ฿{product.price.toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Out of Stock Products */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Out of Stock</h3>
            <AlertTriangle className="h-5 w-5 text-red-500" />
          </div>
          {stats.outOfStockProducts.length > 0 ? (
            <div className="space-y-4">
              {stats.outOfStockProducts.map((product) => (
                <div key={product.id} className="flex items-center space-x-3">
                  <div className="flex-shrink-0">
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      className="w-10 h-10 rounded-lg object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {product.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {product.category}
                    </p>
                  </div>
                  <div className="text-sm font-medium text-red-600">
                    Out of Stock
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">All products are in stock!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;