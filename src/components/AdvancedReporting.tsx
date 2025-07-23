import React, { useState, useEffect } from 'react';
import { apiService } from '../services/api';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { 
  Calendar, 
  Download, 
  TrendingUp, 
  Users, 
  Clock,
  Star,
  FileText,
  Filter
} from 'lucide-react';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';

interface EmployeeStats {
  id: string;
  name: string;
  role: string;
  workingHours: number;
  totalSales: number;
  transactionCount: number;
  averageTransaction: number;
}

interface SalesData {
  date: string;
  sales: number;
  transactions: number;
  employee: string;
}

interface BestSellingItem {
  productId: string;
  productName: string;
  quantitySold: number;
  revenue: number;
  category: string;
}

interface PeakHour {
  hour: string;
  sales: number;
  transactions: number;
}

const AdvancedReporting: React.FC = () => {
  const [salesData, setSalesData] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    period: '7days'
  });
  
  const [reportData, setReportData] = useState({
    employeeStats: [] as any[],
    dailySalesData: [] as SalesData[],
    bestSellingItems: [] as BestSellingItem[],
    peakHours: [] as PeakHour[],
    summary: {
      totalRevenue: 0,
      totalTransactions: 0,
      averageTransaction: 0,
      topEmployee: '',
      bestSellingProduct: ''
    }
  });
  
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchReportData();
  }, [dateRange]);

  const fetchReportData = async () => {
    setLoading(true);
    try {
      console.log('Fetching advanced report data...');
      
      // Fetch real data
      const [salesResponse, productsResponse] = await Promise.all([
        apiService.getSales(),
        apiService.getProducts()
      ]);
      
      console.log('Advanced Report - Sales Response:', salesResponse);
      console.log('Advanced Report - Products Response:', productsResponse);
      
      const productList = Array.isArray(productsResponse) 
        ? productsResponse 
        : productsResponse.products || [];
      setProducts(productList);
      
      // Filter sales by date range
      const allSales = Array.isArray(salesResponse) ? salesResponse : [];
      const filteredSales = allSales.filter((sale: any) => {
        const saleDate = new Date(sale.createdAt);
        const startDate = new Date(dateRange.startDate);
        const endDate = new Date(dateRange.endDate);
        return saleDate >= startDate && saleDate <= endDate;
      });
      
      console.log('Advanced Report - Filtered Sales:', filteredSales);
      setSalesData(filteredSales);
      
      // Calculate employee stats from real data
      const employeeStatsMap = new Map();
      filteredSales.forEach((sale: any) => {
        const cashierId = sale.cashierId;
        const cashierName = sale.cashierName;
        
        if (!employeeStatsMap.has(cashierId)) {
          employeeStatsMap.set(cashierId, {
            id: cashierId,
            name: cashierName,
            role: 'cashier', // Default role
            workingHours: 8, // Default hours
            totalSales: 0,
            transactionCount: 0,
            averageTransaction: 0
          });
        }
        
        const empStats = employeeStatsMap.get(cashierId);
        empStats.totalSales += sale.total;
        empStats.transactionCount += 1;
        empStats.averageTransaction = empStats.totalSales / empStats.transactionCount;
      });
      
      const employeeStats = Array.from(employeeStatsMap.values());
      
      console.log('Employee Stats:', employeeStats);
      
      // Calculate daily sales data
      const dailySalesMap = new Map();
      filteredSales.forEach((sale: any) => {
        const date = new Date(sale.createdAt).toISOString().split('T')[0];
        if (!dailySalesMap.has(date)) {
          dailySalesMap.set(date, {
            date,
            sales: 0,
            transactions: 0,
            employee: sale.cashierName
          });
        }
        const dayData = dailySalesMap.get(date);
        dayData.sales += sale.total;
        dayData.transactions += 1;
      });
      
      const dailySalesData = Array.from(dailySalesMap.values()).sort((a, b) => 
        new Date(a.date).getTime() - new Date(b.date).getTime()
      );
      
      console.log('Daily Sales Data:', dailySalesData);
      
      // Calculate best selling items
      const productSalesMap = new Map();
      filteredSales.forEach((sale: any) => {
        sale.items.forEach((item: any) => {
          if (!productSalesMap.has(item.productId)) {
            const product = productList.find((p: any) => p.id === item.productId);
            productSalesMap.set(item.productId, {
              productId: item.productId,
              productName: item.name,
              quantitySold: 0,
              revenue: 0,
              category: product?.category || 'unknown'
            });
          }
          const productData = productSalesMap.get(item.productId);
          productData.quantitySold += item.quantity;
          productData.revenue += item.price * item.quantity;
        });
      });
      
      const bestSellingItems = Array.from(productSalesMap.values())
        .sort((a, b) => b.revenue - a.revenue);
        
      console.log('Best Selling Items:', bestSellingItems);
      
      // Calculate peak hours from real data
      const hourlyStatsMap = new Map();
      filteredSales.forEach((sale: any) => {
        const hour = new Date(sale.createdAt).getHours();
        const hourKey = `${hour.toString().padStart(2, '0')}:00`;
        
        if (!hourlyStatsMap.has(hourKey)) {
          hourlyStatsMap.set(hourKey, {
            hour: hourKey,
            sales: 0,
            transactions: 0
          });
        }
        
        const hourData = hourlyStatsMap.get(hourKey);
        hourData.sales += sale.total;
        hourData.transactions += 1;
      });
      
      const peakHours = Array.from(hourlyStatsMap.values())
        .sort((a, b) => parseInt(a.hour) - parseInt(b.hour));
        
      console.log('Peak Hours:', peakHours);
      
      // Calculate summary
      const totalRevenue = filteredSales.reduce((sum: number, sale: any) => sum + sale.total, 0);
      const totalTransactions = filteredSales.length;
      const averageTransaction = totalTransactions > 0 ? totalRevenue / totalTransactions : 0;
      const topEmployee = employeeStats.reduce((top, emp) => 
        emp.totalSales > top.totalSales ? emp : top, employeeStats[0] || { name: 'N/A' }
      );
      const bestSellingProduct = bestSellingItems[0]?.productName || 'N/A';
      
      console.log('Summary:', { totalRevenue, totalTransactions, averageTransaction, topEmployee: topEmployee?.name, bestSellingProduct });
      
      setReportData({
        employeeStats,
        dailySalesData,
        bestSellingItems,
        peakHours,
        summary: {
          totalRevenue,
          totalTransactions,
          averageTransaction,
          topEmployee: topEmployee.name,
          bestSellingProduct
        }
      });
    } catch (error) {
      console.error('Failed to fetch report data:', error);
      alert('ไม่สามารถโหลดข้อมูลรายงานได้: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePeriodChange = (period: string) => {
    const now = new Date();
    let startDate: Date;
    
    switch (period) {
      case '7days':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '1month':
        startDate = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
        break;
      case '1year':
        startDate = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
        break;
      default:
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    }
    
    setDateRange({
      startDate: startDate.toISOString().split('T')[0],
      endDate: now.toISOString().split('T')[0],
      period
    });
  };

  const exportToExcel = () => {
    const workbook = XLSX.utils.book_new();
    
    // Employee Stats Sheet
    const employeeWS = XLSX.utils.json_to_sheet(reportData.employeeStats);
    XLSX.utils.book_append_sheet(workbook, employeeWS, 'Employee Stats');
    
    // Sales Data Sheet
    const salesWS = XLSX.utils.json_to_sheet(reportData.salesData);
    XLSX.utils.book_append_sheet(workbook, salesWS, 'Daily Sales');
    
    // Best Selling Items Sheet
    const itemsWS = XLSX.utils.json_to_sheet(reportData.bestSellingItems);
    XLSX.utils.book_append_sheet(workbook, itemsWS, 'Best Selling Items');
    
    // Peak Hours Sheet
    const hoursWS = XLSX.utils.json_to_sheet(reportData.peakHours);
    XLSX.utils.book_append_sheet(workbook, hoursWS, 'Peak Hours');
    
    XLSX.writeFile(workbook, `advanced-report-${dateRange.startDate}-to-${dateRange.endDate}.xlsx`);
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;
    let yPos = 20;
    
    // Title
    doc.setFontSize(20);
    doc.text('Advanced Sales Report', pageWidth / 2, yPos, { align: 'center' });
    yPos += 20;
    
    // Date Range
    doc.setFontSize(12);
    doc.text(`Period: ${dateRange.startDate} to ${dateRange.endDate}`, 20, yPos);
    yPos += 20;
    
    // Summary
    doc.setFontSize(14);
    doc.text('Summary', 20, yPos);
    yPos += 10;
    
    doc.setFontSize(10);
    doc.text(`Total Revenue: ฿${reportData.summary.totalRevenue.toLocaleString()}`, 20, yPos);
    yPos += 8;
    doc.text(`Total Transactions: ${reportData.summary.totalTransactions}`, 20, yPos);
    yPos += 8;
    doc.text(`Average Transaction: ฿${reportData.summary.averageTransaction.toLocaleString()}`, 20, yPos);
    yPos += 8;
    doc.text(`Top Employee: ${reportData.summary.topEmployee}`, 20, yPos);
    yPos += 8;
    doc.text(`Best Selling Product: ${reportData.summary.bestSellingProduct}`, 20, yPos);
    yPos += 20;
    
    // Employee Stats
    doc.setFontSize(14);
    doc.text('Employee Performance', 20, yPos);
    yPos += 10;
    
    reportData.employeeStats.forEach((emp) => {
      doc.setFontSize(10);
      doc.text(`${emp.name} (${emp.role}):`, 20, yPos);
      yPos += 6;
      doc.text(`  Working Hours: ${emp.workingHours}h`, 25, yPos);
      yPos += 6;
      doc.text(`  Total Sales: ฿${emp.totalSales.toLocaleString()}`, 25, yPos);
      yPos += 6;
      doc.text(`  Transactions: ${emp.transactionCount}`, 25, yPos);
      yPos += 10;
    });
    
    doc.save(`advanced-report-${dateRange.startDate}-to-${dateRange.endDate}.pdf`);
  };

  const tabs = [
    { id: 'overview', name: 'Overview', icon: BarChart },
    { id: 'employees', name: 'Employee Performance', icon: Users },
    { id: 'products', name: 'Product Analysis', icon: Star },
    { id: 'timing', name: 'Peak Hours', icon: Clock }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Advanced Reporting</h2>
        <div className="flex space-x-2">
          <button
            onClick={exportToExcel}
            className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors flex items-center space-x-2"
          >
            <Download className="h-4 w-4" />
            <span>Excel</span>
          </button>
          <button
            onClick={exportToPDF}
            className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors flex items-center space-x-2"
          >
            <FileText className="h-4 w-4" />
            <span>PDF</span>
          </button>
        </div>
      </div>

      {/* Period Selection */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-4">
          <div className="flex items-center space-x-2">
            <Calendar className="h-5 w-5 text-gray-400" />
            <span className="text-sm font-medium text-gray-700">Period:</span>
          </div>
          
          <div className="flex space-x-2">
            {[
              { value: '7days', label: '7 Days' },
              { value: '1month', label: '1 Month' },
              { value: '1year', label: '1 Year' }
            ].map((period) => (
              <button
                key={period.value}
                onClick={() => handlePeriodChange(period.value)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  dateRange.period === period.value
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {period.label}
              </button>
            ))}
          </div>
          
          <div className="flex space-x-2">
            <input
              type="date"
              value={dateRange.startDate}
              onChange={(e) => setDateRange(prev => ({ ...prev, startDate: e.target.value, period: 'custom' }))}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <span className="flex items-center text-gray-500">to</span>
            <input
              type="date"
              value={dateRange.endDate}
              onChange={(e) => setDateRange(prev => ({ ...prev, endDate: e.target.value, period: 'custom' }))}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">รายได้รวม</p>
              <p className="text-2xl font-bold text-green-600">
                ฿{reportData.summary.totalRevenue.toLocaleString()}
              </p>
            </div>
            <TrendingUp className="h-8 w-8 text-green-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">รายการขาย</p>
              <p className="text-2xl font-bold text-blue-600">
                {reportData.summary.totalTransactions}
              </p>
            </div>
            <FileText className="h-8 w-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">ยอดขายเฉลี่ย</p>
              <p className="text-2xl font-bold text-purple-600">
                ฿{Math.round(reportData.summary.averageTransaction).toLocaleString()}
              </p>
            </div>
            <Calendar className="h-8 w-8 text-purple-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">พนักงานยอดเยี่ยม</p>
              <p className="text-lg font-bold text-orange-600">
                {reportData.summary.topEmployee}
              </p>
            </div>
            <Users className="h-8 w-8 text-orange-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">สินค้าขายดี</p>
              <p className="text-sm font-bold text-yellow-600">
                {reportData.summary.bestSellingProduct}
              </p>
            </div>
            <Star className="h-8 w-8 text-yellow-600" />
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white rounded-lg shadow-md">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span>{tab.name}</span>
                </button>
              );
            })}
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">แนวโน้มยอดขายรายวัน</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={reportData.dailySalesData || []}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="sales" fill="#3B82F6" name="ยอดขาย (฿)" />
                      <Bar dataKey="transactions" fill="#10B981" name="รายการขาย" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">ประสิทธิภาพพนักงาน</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={reportData.employeeStats || []}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="totalSales" fill="#3B82F6" name="ยอดขายรวม (฿)" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
              
              {/* No Data Message */}
              {(!reportData.dailySalesData || reportData.dailySalesData.length === 0) && (
                <div className="text-center py-8">
                  <div className="text-gray-400 mb-2">📈</div>
                  <p className="text-gray-500">ไม่มีข้อมูลการขายในช่วงเวลาที่เลือก</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'employees' && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">รายละเอียดประสิทธิภาพพนักงาน</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">พนักงาน</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ตำแหน่ง</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ชั่วโมงทำงาน</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ยอดขายรวม</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">รายการขาย</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ยอดขายเฉลี่ย</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {(reportData.employeeStats || []).map((employee) => (
                      <tr key={employee.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="font-medium text-gray-900">{employee.name}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800 capitalize">
                            {employee.role}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {employee.workingHours}h
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                          ฿{employee.totalSales.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {employee.transactionCount}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          ฿{employee.averageTransaction.toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                
                {(!reportData.employeeStats || reportData.employeeStats.length === 0) && (
                  <div className="text-center py-8">
                    <div className="text-gray-400 mb-2">👥</div>
                    <p className="text-gray-500">ไม่มีข้อมูลประสิทธิภาพพนักงาน</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'products' && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">สินค้าขายดี</h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">สินค้า</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">จำนวนขาย</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">รายได้</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {(reportData.bestSellingItems || []).slice(0, 10).map((item) => (
                        <tr key={item.productId}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="font-medium text-gray-900">{item.productName}</div>
                            <div className="text-sm text-gray-500 capitalize">{item.category}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {item.quantitySold}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                            ฿{item.revenue.toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  
                  {(!reportData.bestSellingItems || reportData.bestSellingItems.length === 0) && (
                    <div className="text-center py-8">
                      <div className="text-gray-400 mb-2">📦</div>
                      <p className="text-gray-500">ไม่มีข้อมูลสินค้าขายดี</p>
                    </div>
                  )}
                </div>

                <div>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={(reportData.bestSellingItems || []).slice(0, 5)}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ productName, quantitySold }) => `${productName}: ${quantitySold}`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="quantitySold"
                      >
                        {(reportData.bestSellingItems || []).slice(0, 5).map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'][index]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'timing' && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">ช่วงเวลาขายดี</h3>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={reportData.peakHours || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="hour" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="sales" fill="#3B82F6" name="ยอดขาย (฿)" />
                  <Bar dataKey="transactions" fill="#10B981" name="รายการขาย" />
                </BarChart>
              </ResponsiveContainer>
              
              {(!reportData.peakHours || reportData.peakHours.length === 0) && (
                <div className="text-center py-8">
                  <div className="text-gray-400 mb-2">🕐</div>
                  <p className="text-gray-500">ไม่มีข้อมูลช่วงเวลาขายดี</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdvancedReporting;