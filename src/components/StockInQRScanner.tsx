import React, { useState } from 'react';
import QRScanner from './QRScanner';
import { apiService } from '../services/api';
import { QrCode, Package, Plus, Minus, Save } from 'lucide-react';

interface StockInQRScannerProps {
  onClose: () => void;
  onStockUpdated: () => void;
}

interface ScannedProduct {
  id: string;
  name: string;
  currentStock: number;
  addedQuantity: number;
  price: number;
  imageUrl: string;
}

const StockInQRScanner: React.FC<StockInQRScannerProps> = ({ onClose, onStockUpdated }) => {
  const [showScanner, setShowScanner] = useState(true);
  const [scannedProducts, setScannedProducts] = useState<ScannedProduct[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleQRScan = async (qrData: string) => {
    setShowScanner(false);
    setLoading(true);
    setError('');

    try {
      // Extract product ID from QR code
      // QR code format could be: "PROD-001" or JSON like {"productId": "1", "type": "product"}
      let productId = '';
      
      try {
        const parsed = JSON.parse(qrData);
        productId = parsed.productId || parsed.id;
      } catch {
        // If not JSON, treat as direct product ID or QR code
        productId = qrData.replace(/^PROD-/, ''); // Remove PROD- prefix if exists
      }

      // Find product by ID or QR code
      const products = await apiService.getProducts();
      const productList = Array.isArray(products) ? products : products.products || [];
      
      const product = productList.find((p: any) => 
        p.id === productId || 
        p.qrCode === qrData ||
        p.barcode === qrData
      );

      if (!product) {
        setError(`Product not found for QR code: ${qrData}`);
        return;
      }

      // Check if product already scanned
      const existingIndex = scannedProducts.findIndex(p => p.id === product.id);
      
      if (existingIndex >= 0) {
        // Increase quantity for existing product
        setScannedProducts(prev => 
          prev.map((p, index) => 
            index === existingIndex 
              ? { ...p, addedQuantity: p.addedQuantity + 1 }
              : p
          )
        );
      } else {
        // Add new product
        const scannedProduct: ScannedProduct = {
          id: product.id,
          name: product.name,
          currentStock: product.stock,
          addedQuantity: 1,
          price: product.price,
          imageUrl: product.imageUrl
        };
        setScannedProducts(prev => [...prev, scannedProduct]);
      }

    } catch (err) {
      console.error('QR scan error:', err);
      setError('Failed to process QR code');
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = (productId: string, change: number) => {
    setScannedProducts(prev =>
      prev.map(product => {
        if (product.id === productId) {
          const newQuantity = Math.max(0, product.addedQuantity + change);
          return { ...product, addedQuantity: newQuantity };
        }
        return product;
      }).filter(product => product.addedQuantity > 0)
    );
  };

  const removeProduct = (productId: string) => {
    setScannedProducts(prev => prev.filter(p => p.id !== productId));
  };

  const saveStockIn = async () => {
    if (scannedProducts.length === 0) return;

    setLoading(true);
    try {
      // Create stock-in document
      const stockInDoc = {
        documentNumber: `SI-QR-${Date.now()}`,
        supplierId: '',
        supplierName: 'QR Code Stock-In',
        items: scannedProducts.map(product => ({
          productId: product.id,
          productName: product.name,
          quantity: product.addedQuantity,
          unitCost: product.price,
          totalCost: product.price * product.addedQuantity
        })),
        totalAmount: scannedProducts.reduce((sum, p) => sum + (p.price * p.addedQuantity), 0),
        receivedBy: 'QR Scanner',
        receivedDate: new Date(),
        notes: 'Stock added via QR code scanning',
        status: 'completed' as const
      };

      // Update stock for each product
      for (const product of scannedProducts) {
        await apiService.updateProduct(product.id, {
          stock: product.currentStock + product.addedQuantity
        });
      }

      onStockUpdated();
      onClose();
      
      // Show success message
      alert(`Successfully added stock for ${scannedProducts.length} products!`);
      
    } catch (err) {
      console.error('Stock-in save error:', err);
      setError('Failed to save stock-in');
    } finally {
      setLoading(false);
    }
  };

  const totalItems = scannedProducts.reduce((sum, p) => sum + p.addedQuantity, 0);
  const totalValue = scannedProducts.reduce((sum, p) => sum + (p.price * p.addedQuantity), 0);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      {showScanner ? (
        <QRScanner
          isOpen={true}
          onScan={handleQRScan}
          onClose={onClose}
          title="Scan Product QR Code"
        />
      ) : (
        <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto m-4">
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center space-x-2">
                <Package className="h-6 w-6 text-blue-600" />
                <h2 className="text-xl font-bold text-gray-900">QR Code Stock-In</h2>
              </div>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-md p-3 mb-4">
                <p className="text-sm text-red-600">{error}</p>
                <button
                  onClick={() => {
                    setError('');
                    setShowScanner(true);
                  }}
                  className="mt-2 text-sm text-red-700 hover:text-red-900 underline"
                >
                  Scan Again
                </button>
              </div>
            )}

            {loading && (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Processing...</p>
              </div>
            )}

            {scannedProducts.length > 0 && (
              <>
                <div className="mb-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">Scanned Products</h3>
                    <button
                      onClick={() => setShowScanner(true)}
                      className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center space-x-2"
                    >
                      <QrCode className="h-4 w-4" />
                      <span>Scan More</span>
                    </button>
                  </div>

                  <div className="space-y-3">
                    {scannedProducts.map((product) => (
                      <div key={product.id} className="bg-gray-50 rounded-lg p-4">
                        <div className="flex items-center space-x-4">
                          <img
                            src={product.imageUrl}
                            alt={product.name}
                            className="w-16 h-16 object-cover rounded-lg"
                          />
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900">{product.name}</h4>
                            <p className="text-sm text-gray-600">
                              Current Stock: {product.currentStock}
                            </p>
                            <p className="text-sm text-gray-600">
                              Price: ฿{product.price.toLocaleString()}
                            </p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => updateQuantity(product.id, -1)}
                              className="p-1 bg-gray-200 rounded-full hover:bg-gray-300 transition-colors"
                            >
                              <Minus className="h-4 w-4" />
                            </button>
                            <span className="w-12 text-center font-medium">
                              +{product.addedQuantity}
                            </span>
                            <button
                              onClick={() => updateQuantity(product.id, 1)}
                              className="p-1 bg-gray-200 rounded-full hover:bg-gray-300 transition-colors"
                            >
                              <Plus className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => removeProduct(product.id)}
                              className="ml-2 text-red-600 hover:text-red-800 text-sm"
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-blue-50 rounded-lg p-4 mb-6">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm text-blue-700">Total Items: {totalItems}</p>
                      <p className="text-lg font-bold text-blue-900">
                        Total Value: ฿{totalValue.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex space-x-3">
                  <button
                    onClick={saveStockIn}
                    disabled={loading || scannedProducts.length === 0}
                    className="flex-1 bg-green-600 text-white py-3 px-4 rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
                  >
                    <Save className="h-5 w-5" />
                    <span>Save Stock-In</span>
                  </button>
                  <button
                    onClick={onClose}
                    className="flex-1 bg-gray-300 text-gray-700 py-3 px-4 rounded-md hover:bg-gray-400 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </>
            )}

            {scannedProducts.length === 0 && !loading && !error && (
              <div className="text-center py-12">
                <QrCode className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-4">No products scanned yet</p>
                <button
                  onClick={() => setShowScanner(true)}
                  className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition-colors flex items-center space-x-2 mx-auto"
                >
                  <QrCode className="h-5 w-5" />
                  <span>Start Scanning</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default StockInQRScanner;