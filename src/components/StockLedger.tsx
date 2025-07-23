import React, { useState, useEffect } from 'react';
import { apiService } from '../services/api';
import { 
  Package, 
  TrendingUp, 
  TrendingDown, 
  RefreshCw, 
  Calendar,
  Search,
  Filter,
  Download,
  Eye
} from 'lucide-react';

interface StockLedgerEntry {
  id: string;
  productId: string;
  productName: string;
  type: 'sale' | 'purchase' | 'adjustment' | 'return' | 'damage';
  quantity: number;
  balance: number;
  reference: string;
  notes?: string;
  createdAt: Date;
  createdBy: string;
}

interface StockLedgerProps {
  productId?: string;
  showProductFilter?: boolean;
}

const StockLedger: React.FC<StockLedgerProps> = ({ 
  productId, 
  showProductFilter = true 
}) => {
  const [entries, setEntries] = useState<StockLedgerEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    productId: productId || '',
    type: '',
    dateFrom: '',
    dateTo: '',
    search: ''
  });

  // Mock data for demonstration
  const mockEntries: StockLedgerEntry[] = [
    {
      id: '1',
      productId: '1',
      productName: 'MacBook Pro 16"',
      type: 'sale',
      quantity: -1,
      balance: 5,
      reference: 'SALE-001',
      createdAt: new Date('2024-01-20T10:30:00'),
      createdBy: 'Mike Cashier'
    },
    {
      id: '2',
      productId: '1',
      productName: 'MacBook Pro 16"',
      type: 'purchase',
      quantity: 10,
      balance: 6,
      reference: 'PO-001',
      notes: 'Restocked from Apple Store',
      createdAt: new Date('2024-01-19T14:15:00'),
      createdBy: 'Jane Admin'
    },
    {
      id: '3',
      productId: '2',
      productName: 'iPhone 15 Pro',
      type: 'sale',
      quantity: -2,
      balance: 12,
      reference: 'SALE-002',
      createdAt: new Date('2024-01-19T16:45:00'),
      createdBy: 'Mike Cashier'
    },
    {
      id: '4',
      productId: '3',
      productName: 'Wireless Headphones',
      type: 'adjustment',
      quantity: -2,
      balance: 0,
      reference: 'ADJ-001',
      notes: 'Damaged during transport',
      createdAt: new Date('2024-01-18T09:20:00'),
      createdBy: 'Jane Admin'
    },
    {
      id: '5',
      productId: '4',
      productName: 'Gaming Mouse',
      type: 'return',
      quantity: 1,
      balance: 8,
      reference: 'RET-001',
      notes: 'Customer return - defective',
      createdAt: new Date('2024-01-17T11:30:00'),
      createdBy: 'Mike Cashier'
    }
  ];

  useEffect(() => {
    fetchStockLedger();
  }, [filters]);

  const fetchStockLedger = async () => {
    setLoading(true);
    try {
      // In a real app, this would be an API call
      // const data = await apiService.getStockLedger(filters);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      let filteredEntries = [...mockEntries];
      
      if (filters.productId) {
        filteredEntries = filteredEntries.filter(entry => entry.productId === filters.productId);
      }
      
      if (filters.type) {
        filteredEntries = filteredEntries.filter(entry => entry.type === filters.type);
      }
      
      if (filters.search) {
        const searchTerm = filters.search.toLowerCase();
        filteredEntries = filteredEntries.filter(entry =>
          entry.productName.toLowerCase().includes(searchTerm) ||
          entry.reference.toLowerCase().includes(searchTerm) ||
          entry.notes?.toLowerCase().includes(searchTerm)
        );
      }
      
      if (filters.dateFrom) {
        filteredEntries = filteredEntries.filter(entry =>
          new Date(entry.createdAt) >= new Date(filters.dateFrom)
        );
      }
      
      if (filters.dateTo) {
        filteredEntries = filteredEntries.filter(entry =>
          new Date(entry.createdAt) <= new Date(filters.dateTo)
        );
      }
      
      setEntries(filteredEntries.sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      ));
    } catch (error) {
      console.error('Failed to fetch stock ledger:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'sale':
        return <TrendingDown className="h-4 w-4 text-red-500" />;
      case 'purchase':
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'adjustment':
        return <RefreshCw className="h-4 w-4 text-blue-500" />;
      case 'return':
        return <Package className="h-4 w-4 text-orange-500" />;
      case 'damage':
        return <Package className="h-4 w-4 text-red-500" />;
      default:
        return <Package className="h-4 w-4 text-gray-500" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'sale':
        return 'bg-red-100 text-red-800';
      case 'purchase':
        return 'bg-green-100 text-green-800';
      case 'adjustment':
        return 'bg-blue-100 text-blue-800';
      case 'return':
        return 'bg-orange-100 text-orange-800';
      case 'damage':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const exportLedger = () => {
    // In a real app, this would generate and download a CSV/Excel file
    const csvContent = [
      ['Date', 'Product', 'Type', 'Quantity', 'Balance', 'Reference', 'Notes', 'Created By'],
      ...entries.map(entry => [
        new Date(entry.createdAt).toLocaleString(),
        entry.productName,
        entry.type,
        entry.quantity,
        entry.balance,
        entry.reference,
        entry.notes || '',
        entry.createdBy
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `stock-ledger-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-gray-900">Stock Ledger</h2>
        <button
          onClick={exportLedger}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center space-x-2"
        >
          <Download className="h-4 w-4" />
          <span>Export</span>
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Search
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search products, references..."
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Type
            </label>
            <select
              value={filters.type}
              onChange={(e) => setFilters({ ...filters, type: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Types</option>
              <option value="sale">Sale</option>
              <option value="purchase">Purchase</option>
              <option value="adjustment">Adjustment</option>
              <option value="return">Return</option>
              <option value="damage">Damage</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              From Date
            </label>
            <input
              type="date"
              value={filters.dateFrom}
              onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              To Date
            </label>
            <input
              type="date"
              value={filters.dateTo}
              onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex items-end">
            <button
              onClick={() => setFilters({ productId: '', type: '', dateFrom: '', dateTo: '', search: '' })}
              className="w-full bg-gray-100 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-200 transition-colors flex items-center justify-center space-x-2"
            >
              <Filter className="h-4 w-4" />
              <span>Clear</span>
            </button>
          </div>
        </div>
      </div>

      {/* Ledger Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date & Time
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Product
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Quantity
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Balance
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Reference
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created By
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {entries.map((entry) => (
                  <tr key={entry.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {new Date(entry.createdAt).toLocaleDateString()}
                          </div>
                          <div className="text-sm text-gray-500">
                            {new Date(entry.createdAt).toLocaleTimeString()}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {entry.productName}
                      </div>
                      <div className="text-sm text-gray-500">
                        ID: {entry.productId}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        {getTypeIcon(entry.type)}
                        <span className={`px-2 py-1 text-xs font-medium rounded-full capitalize ${getTypeColor(entry.type)}`}>
                          {entry.type}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`text-sm font-medium ${
                        entry.quantity > 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {entry.quantity > 0 ? '+' : ''}{entry.quantity}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-medium text-gray-900">
                        {entry.balance}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {entry.reference}
                        </div>
                        {entry.notes && (
                          <div className="text-sm text-gray-500 truncate max-w-xs">
                            {entry.notes}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {entry.createdBy}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button className="text-blue-600 hover:text-blue-800 transition-colors">
                        <Eye className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {entries.length === 0 && !loading && (
          <div className="text-center py-12">
            <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No stock movements found</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default StockLedger;