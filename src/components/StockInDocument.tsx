import React, { useState, useEffect } from 'react';
import { apiService } from '../services/api';
import { Package, Plus, Trash2, Save, FileText, Calendar, User } from 'lucide-react';

interface StockInItem {
  productId: string;
  productName: string;
  quantity: number;
  unitCost: number;
  totalCost: number;
}

interface StockInDocument {
  id: string;
  documentNumber: string;
  supplierId: string;
  supplierName: string;
  items: StockInItem[];
  totalAmount: number;
  receivedBy: string;
  receivedDate: Date;
  notes: string;
  status: 'draft' | 'completed';
}

interface StockInDocumentProps {
  onClose: () => void;
  onSave: (document: Omit<StockInDocument, 'id'>) => void;
}

const StockInDocument: React.FC<StockInDocumentProps> = ({ onClose, onSave }) => {
  const [products, setProducts] = useState<any[]>([]);
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [document, setDocument] = useState<Omit<StockInDocument, 'id'>>({
    documentNumber: `SI-${Date.now()}`,
    supplierId: '',
    supplierName: '',
    items: [],
    totalAmount: 0,
    receivedBy: '',
    receivedDate: new Date(),
    notes: '',
    status: 'draft'
  });

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    const total = document.items.reduce((sum, item) => sum + item.totalCost, 0);
    setDocument(prev => ({ ...prev, totalAmount: total }));
  }, [document.items]);

  const fetchData = async () => {
    try {
      const [productsData, suppliersData] = await Promise.all([
        apiService.getProducts(),
        apiService.getSuppliers()
      ]);
      
      setProducts(Array.isArray(productsData) ? productsData : productsData.products || []);
      setSuppliers(suppliersData);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    }
  };

  const addItem = () => {
    const newItem: StockInItem = {
      productId: '',
      productName: '',
      quantity: 1,
      unitCost: 0,
      totalCost: 0
    };
    setDocument(prev => ({
      ...prev,
      items: [...prev.items, newItem]
    }));
  };

  const updateItem = (index: number, field: keyof StockInItem, value: any) => {
    const updatedItems = [...document.items];
    updatedItems[index] = { ...updatedItems[index], [field]: value };
    
    if (field === 'productId') {
      const product = products.find(p => p.id === value);
      if (product) {
        updatedItems[index].productName = product.name;
      }
    }
    
    if (field === 'quantity' || field === 'unitCost') {
      updatedItems[index].totalCost = updatedItems[index].quantity * updatedItems[index].unitCost;
    }
    
    setDocument(prev => ({ ...prev, items: updatedItems }));
  };

  const removeItem = (index: number) => {
    setDocument(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }));
  };

  const handleSupplierChange = (supplierId: string) => {
    const supplier = suppliers.find(s => s.id === supplierId);
    setDocument(prev => ({
      ...prev,
      supplierId,
      supplierName: supplier ? supplier.name : ''
    }));
  };

  const handleSave = (status: 'draft' | 'completed') => {
    if (document.items.length === 0) {
      alert('Please add at least one item');
      return;
    }
    
    if (!document.supplierId) {
      alert('Please select a supplier');
      return;
    }
    
    if (!document.receivedBy) {
      alert('Please enter received by');
      return;
    }
    
    onSave({ ...document, status });
  };

  const generatePrintDocument = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    
    const documentHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Stock In Document ${document.documentNumber}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          .header { text-align: center; margin-bottom: 30px; }
          .document-info { display: flex; justify-content: space-between; margin-bottom: 20px; }
          .supplier-info { margin-bottom: 20px; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background-color: #f2f2f2; }
          .totals { text-align: right; }
          .signatures { display: flex; justify-content: space-between; margin-top: 50px; }
          .signature { text-align: center; width: 200px; }
          @media print {
            body { margin: 0; }
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>STOCK IN DOCUMENT</h1>
        </div>
        
        <div class="document-info">
          <div>
            <strong>Document #:</strong> ${document.documentNumber}<br>
            <strong>Date:</strong> ${new Date(document.receivedDate).toLocaleDateString()}
          </div>
          <div>
            <strong>Status:</strong> ${document.status.toUpperCase()}<br>
            <strong>Received By:</strong> ${document.receivedBy}
          </div>
        </div>
        
        <div class="supplier-info">
          <strong>Supplier:</strong> ${document.supplierName}
        </div>
        
        <table>
          <thead>
            <tr>
              <th>Product</th>
              <th>Quantity</th>
              <th>Unit Cost</th>
              <th>Total Cost</th>
            </tr>
          </thead>
          <tbody>
            ${document.items.map(item => `
              <tr>
                <td>${item.productName}</td>
                <td>${item.quantity}</td>
                <td>฿${item.unitCost.toLocaleString()}</td>
                <td>฿${item.totalCost.toLocaleString()}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        
        <div class="totals">
          <p><strong>Total Amount: ฿${document.totalAmount.toLocaleString()}</strong></p>
        </div>
        
        ${document.notes ? `<p><strong>Notes:</strong> ${document.notes}</p>` : ''}
        
        <div class="signatures">
          <div class="signature">
            <div style="border-top: 1px solid #000; margin-top: 50px; padding-top: 5px;">
              Received By
            </div>
          </div>
          <div class="signature">
            <div style="border-top: 1px solid #000; margin-top: 50px; padding-top: 5px;">
              Authorized By
            </div>
          </div>
        </div>
        
        <div class="no-print" style="margin-top: 30px; text-align: center;">
          <button onclick="window.print()">Print</button>
          <button onclick="window.close()">Close</button>
        </div>
      </body>
      </html>
    `;
    
    printWindow.document.write(documentHTML);
    printWindow.document.close();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center space-x-2">
              <Package className="h-6 w-6 text-blue-600" />
              <h2 className="text-xl font-bold text-gray-900">Stock In Document</h2>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              ×
            </button>
          </div>

          {/* Document Header */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Document Number
              </label>
              <input
                type="text"
                value={document.documentNumber}
                onChange={(e) => setDocument(prev => ({ ...prev, documentNumber: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Supplier
              </label>
              <select
                value={document.supplierId}
                onChange={(e) => handleSupplierChange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Supplier</option>
                {suppliers.map(supplier => (
                  <option key={supplier.id} value={supplier.id}>
                    {supplier.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Received By
              </label>
              <input
                type="text"
                value={document.receivedBy}
                onChange={(e) => setDocument(prev => ({ ...prev, receivedBy: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Employee name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Received Date
              </label>
              <input
                type="date"
                value={new Date(document.receivedDate).toISOString().split('T')[0]}
                onChange={(e) => setDocument(prev => ({ ...prev, receivedDate: new Date(e.target.value) }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Items Section */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Items</h3>
              <button
                onClick={addItem}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center space-x-2"
              >
                <Plus className="h-4 w-4" />
                <span>Add Item</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-gray-300">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="border border-gray-300 px-4 py-2 text-left">Product</th>
                    <th className="border border-gray-300 px-4 py-2 text-center">Quantity</th>
                    <th className="border border-gray-300 px-4 py-2 text-right">Unit Cost</th>
                    <th className="border border-gray-300 px-4 py-2 text-right">Total Cost</th>
                    <th className="border border-gray-300 px-4 py-2 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {document.items.map((item, index) => (
                    <tr key={index}>
                      <td className="border border-gray-300 px-4 py-2">
                        <select
                          value={item.productId}
                          onChange={(e) => updateItem(index, 'productId', e.target.value)}
                          className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                        >
                          <option value="">Select Product</option>
                          {products.map(product => (
                            <option key={product.id} value={product.id}>
                              {product.name}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="border border-gray-300 px-4 py-2">
                        <input
                          type="number"
                          value={item.quantity}
                          onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value) || 0)}
                          className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 text-center"
                          min="1"
                        />
                      </td>
                      <td className="border border-gray-300 px-4 py-2">
                        <input
                          type="number"
                          value={item.unitCost}
                          onChange={(e) => updateItem(index, 'unitCost', parseFloat(e.target.value) || 0)}
                          className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 text-right"
                          step="0.01"
                        />
                      </td>
                      <td className="border border-gray-300 px-4 py-2 text-right">
                        ฿{item.totalCost.toLocaleString()}
                      </td>
                      <td className="border border-gray-300 px-4 py-2 text-center">
                        <button
                          onClick={() => removeItem(index)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {document.items.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No items added. Click "Add Item" to start.
              </div>
            )}
          </div>

          {/* Total */}
          <div className="mb-6">
            <div className="text-right">
              <div className="text-2xl font-bold text-blue-600">
                Total Amount: ฿{document.totalAmount.toLocaleString()}
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notes
            </label>
            <textarea
              rows={3}
              value={document.notes}
              onChange={(e) => setDocument(prev => ({ ...prev, notes: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Additional notes..."
            />
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3">
            <button
              onClick={() => handleSave('draft')}
              className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition-colors flex items-center space-x-2"
            >
              <Save className="h-4 w-4" />
              <span>Save as Draft</span>
            </button>
            <button
              onClick={() => handleSave('completed')}
              className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors flex items-center space-x-2"
            >
              <Package className="h-4 w-4" />
              <span>Complete & Update Stock</span>
            </button>
            <button
              onClick={generatePrintDocument}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center space-x-2"
            >
              <FileText className="h-4 w-4" />
              <span>Print Document</span>
            </button>
            <button
              onClick={onClose}
              className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StockInDocument;