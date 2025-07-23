import React, { useState, useEffect } from 'react';
import { apiService } from '../services/api';
import { Product, Category, Supplier } from '../types';
import SearchFilters from '../components/SearchFilters';
import EnhancedProductCard from '../components/EnhancedProductCard';
import StockInDocument from '../components/StockInDocument';
import BarcodeQRScanner from '../components/BarcodeQRScanner';
import { 
  Plus, 
  Edit2, 
  Trash2, 
  Package,
  AlertTriangle,
  Star,
  FileText,
  QrCode
} from 'lucide-react';

const Products: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [showStockInModal, setShowStockInModal] = useState(false);
  const [showScannerStockIn, setShowScannerStockIn] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [productsData, categoriesData, suppliersData] = await Promise.all([
        apiService.getProducts({ page: 1, limit: 20 }),
        apiService.getCategories(),
        apiService.getSuppliers()
      ]);
      
      // Handle different response formats
      let productList = [];
      if (Array.isArray(productsData)) {
        productList = productsData;
      } else if (productsData && productsData.products) {
        productList = productsData.products;
        setPagination(productsData.pagination || pagination);
      } else if (productsData && productsData.data) {
        productList = productsData.data;
      }
      
      setProducts(productList);
      if (productsData.pagination) {
        setPagination(productsData.pagination);
      }
      setCategories(categoriesData);
      setSuppliers(suppliersData);
    } catch (error) {
      console.error('Failed to fetch data:', error);
      // Set empty arrays on error to prevent crashes
      setProducts([]);
      setCategories([]);
      setSuppliers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (filters: any) => {
    try {
      const data = await apiService.getProducts(filters);
      setProducts(data.products || data);
      if (data.pagination) {
        setPagination(data.pagination);
      }
    } catch (error) {
      console.error('Search failed:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        setLoading(true);
        await apiService.deleteProduct(id);
        await fetchData(); // Refresh data after successful deletion
        alert('Product deleted successfully!');
      } catch (error) {
        console.error('Delete failed:', error);
        alert('Failed to delete product. Please try again.');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleStockInScan = async (scanData: string, type: 'barcode' | 'qr') => {
    setShowScannerStockIn(false);
    
    try {
      // Find product by barcode or QR code
      const product = products.find(p => 
        p.barcode === scanData || 
        p.qrCode === scanData ||
        p.id === scanData
      );

      if (product) {
        // Show stock-in modal with pre-selected product
        setShowStockInModal(true);
        // You could pass the product to the modal here
        alert(`พบสินค้า: ${product.name} - เพิ่มในเอกสารรับสินค้า`);
      } else {
        alert(`ไม่พบสินค้าสำหรับ ${type === 'qr' ? 'QR Code' : 'Barcode'}: ${scanData}`);
      }
    } catch (error) {
      console.error('Stock-in scan error:', error);
      alert('เกิดข้อผิดพลาดในการสแกน');
    }
  };

  const handleStockInSave = async (document: any) => {
    try {
      // In a real app, this would save to the backend
      console.log('Stock in document:', document);
      
      if (document.status === 'completed') {
        // Update product stock
        document.items.forEach((item: any) => {
          const productIndex = products.findIndex(p => p.id === item.productId);
          if (productIndex !== -1) {
            products[productIndex].stock += item.quantity;
          }
        });
        
        alert('Stock updated successfully!');
      } else {
        alert('Stock in document saved as draft!');
      }
      
      setShowStockInModal(false);
      fetchData(); // Refresh data
    } catch (error) {
      console.error('Failed to save stock in document:', error);
      alert('Failed to save stock in document');
    }
  };

  const ProductModal: React.FC<{ product?: Product; onClose: () => void }> = ({ 
    product, 
    onClose 
  }) => {
    const [formData, setFormData] = useState({
      name: product?.name || '',
      barcode: product?.barcode || '',
      qrCode: product?.qrCode || '',
      price: product?.price || '',
      stock: product?.stock || '',
      category: product?.category || '',
      supplier: product?.supplier || '',
      description: product?.description || ''
    });

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      try {
        const submitLoading = true;
        if (product) {
          await apiService.updateProduct(product.id, formData);
          alert('Product updated successfully!');
        } else {
          await apiService.createProduct(formData);
          alert('Product created successfully!');
        }
        await fetchData();
        onClose();
      } catch (error) {
        console.error('Save failed:', error);
        alert('Failed to save product. Please try again.');
      }
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">
                {product ? 'Edit Product' : 'Add New Product'}
              </h2>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Product Name
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Barcode
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.barcode}
                    onChange={(e) => setFormData({...formData, barcode: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    QR Code
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.qrCode}
                    onChange={(e) => setFormData({...formData, qrCode: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Price (฿)
                  </label>
                  <input
                    type="number"
                    required
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({...formData, price: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Stock
                  </label>
                  <input
                    type="number"
                    required
                    value={formData.stock}
                    onChange={(e) => setFormData({...formData, stock: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category
                  </label>
                  <select
                    required
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select category</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.name.toLowerCase()}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Supplier
                  </label>
                  <select
                    required
                    value={formData.supplier}
                    onChange={(e) => setFormData({...formData, supplier: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select supplier</option>
                    {suppliers.map(sup => (
                      <option key={sup.id} value={sup.name}>
                        {sup.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
                >
                  {product ? 'Update Product' : 'Create Product'}
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  };

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
        <h1 className="text-2xl font-bold text-gray-900">Products</h1>
        <div className="flex space-x-2">
          <button
            onClick={() => setShowScannerStockIn(true)}
            className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 transition-colors flex items-center space-x-2"
          >
            <QrCode className="h-5 w-5" />
            <span>สแกนรับสินค้า</span>
          </button>
          <button
            onClick={() => setShowStockInModal(true)}
            className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors flex items-center space-x-2"
          >
            <FileText className="h-5 w-5" />
            <span>Stock In</span>
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center space-x-2"
          >
            <Plus className="h-5 w-5" />
            <span>Add Product</span>
          </button>
        </div>
      </div>

      {/* Enhanced Search and Filters */}
      <SearchFilters onSearch={handleSearch} categories={categories} />

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((product) => (
          <EnhancedProductCard
            key={product.id}
            product={product}
            onViewDetails={() => setEditingProduct(product)}
            showActions={false}
          />
        ))}
      </div>

      {products.length === 0 && (
        <div className="text-center py-12">
          <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">No products found</p>
        </div>
      )}

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="flex justify-center items-center space-x-2 mt-6">
          <button
            onClick={() => handleSearch({ page: pagination.page - 1 })}
            disabled={pagination.page === 1}
            className="px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          
          <span className="text-sm text-gray-600">
            Page {pagination.page} of {pagination.pages}
          </span>
          
          <button
            onClick={() => handleSearch({ page: pagination.page + 1 })}
            disabled={pagination.page === pagination.pages}
            className="px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      )}

      {/* Modals */}
      {showAddModal && (
        <ProductModal onClose={() => setShowAddModal(false)} />
      )}
      {editingProduct && (
        <ProductModal
          product={editingProduct}
          onClose={() => setEditingProduct(null)}
        />
      )}
      {showStockInModal && (
        <StockInDocument
          onClose={() => setShowStockInModal(false)}
          onSave={handleStockInSave}
        />
      )}
      {showScannerStockIn && (
        <BarcodeQRScanner
          isOpen={true}
          onScan={handleStockInScan}
          onClose={() => setShowScannerStockIn(false)}
          title="สแกนสินค้าเพื่อรับเข้าสต็อก"
        />
      )}
    </div>
  );
};

export default Products;