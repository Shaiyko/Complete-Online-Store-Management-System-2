import React, { useState, useEffect } from 'react';
import { apiService } from '../services/api';
import { Product, CartItem, Member } from '../types';
import StripePayment from '../components/StripePayment';
import CashPaymentModal from '../components/CashPaymentModal';
import InvoiceGenerator from '../components/InvoiceGenerator';
import EnhancedProductCard from '../components/EnhancedProductCard';
import BarcodeQRScanner from '../components/BarcodeQRScanner';
import { showNotification } from '../components/EnhancedNotificationSystem';
import { 
  ShoppingCart, 
  Plus, 
  Minus, 
  Trash2, 
  Search, 
  CreditCard,
  Smartphone,
  Banknote,
  User,
  Gift,
  QrCode
} from 'lucide-react';
import QRCode from 'react-qr-code';

const PointOfSale: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [memberPhone, setMemberPhone] = useState('');
  const [discount, setDiscount] = useState(0);
  const [pointsToUse, setPointsToUse] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'bank_transfer' | 'promptpay' | 'card'>('cash');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showCashModal, setShowCashModal] = useState(false);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [completedSale, setCompletedSale] = useState<any>(null);
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [loading, setLoading] = useState(true);

  // รวม fetchProducts function เป็นอันเดียวและแก้ไขการจัดการ response
  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await apiService.getProducts();
      console.log("Fetched products:", response);
      
      // ตรวจสอบ response structure และแก้ไขให้ถูกต้อง
      let productData: Product[] = [];
      
      if (Array.isArray(response)) {
        productData = response;
      } else if (response && Array.isArray(response.data)) {
        productData = response.data;
      } else if (response && response.products && Array.isArray(response.products)) {
        productData = response.products;
      } else {
        console.error('Unexpected response structure:', response);
        productData = [];
      }
      
      setProducts(productData);
    } catch (error) {
      console.error('Failed to fetch products:', error);
      setProducts([]); // ตั้งค่าเป็น empty array เมื่อเกิด error
      // แสดง notification เมื่อเกิด error
      showNotification({
        type: 'error',
        title: 'เกิดข้อผิดพลาด',
        message: 'ไม่สามารถโหลดข้อมูลสินค้าได้',
        duration: 5000
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
    
    // Listen for real-time inventory updates
    const handleInventoryUpdate = (event: CustomEvent) => {
      const { productId, newStock } = event.detail;
      setProducts(prev => 
        prev.map(product => 
          product.id === productId 
            ? { ...product, stock: newStock }
            : product
        )
      );
      
      // Update cart if product stock changed
      setCart(prev => 
        (Array.isArray(prev) ? prev : [])
          .map(item => 
            item.product.id === productId
              ? { ...item, product: { ...item.product, stock: newStock } }
              : item
          )
          .filter(item => item.quantity <= item.product.stock)
      );
    };

    window.addEventListener('inventory-update', handleInventoryUpdate as EventListener);
    
    return () => {
      window.removeEventListener('inventory-update', handleInventoryUpdate as EventListener);
    };
  }, []);

  const addToCart = (product: Product) => {
    if (product.stock === 0) {
      showNotification({
        type: 'warning',
        title: 'สินค้าหมด',
        message: `${product.name} หมดสต็อกแล้ว`,
        duration: 3000
      });
      return;
    }

    const existingItem = cart.find(item => item.product.id === product.id);
    if (existingItem) {
      if (existingItem.quantity < product.stock) {
        setCart(cart.map(item => 
          item.product.id === product.id 
            ? { ...item, quantity: item.quantity + 1 }
            : item
        ));
        // แสดง notification เมื่อเพิ่มสินค้าสำเร็จ
        showNotification({
          type: 'success',
          title: 'เพิ่มสินค้าแล้ว',
          message: `เพิ่ม ${product.name} ในตะกร้าแล้ว`,
          duration: 2000
        });
      } else {
        showNotification({
          type: 'warning',
          title: 'สต็อกไม่เพียงพอ',
          message: `${product.name} มีสต็อกเพียง ${product.stock} ชิ้น`,
          duration: 3000
        });
      }
    } else {
      setCart([...cart, { product, quantity: 1 }]);
      // แสดง notification เมื่อเพิ่มสินค้าใหม่
      showNotification({
        type: 'success',
        title: 'เพิ่มสินค้าแล้ว',
        message: `เพิ่ม ${product.name} ในตะกร้าแล้ว`,
        duration: 2000
      });
    }
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity === 0) {
      setCart(cart.filter(item => item.product.id !== productId));
      showNotification({
        type: 'info',
        title: 'ลบสินค้าแล้ว',
        message: 'ลบสินค้าออกจากตะกร้าแล้ว',
        duration: 2000
      });
    } else {
      const product = products.find(p => p.id === productId);
      if (product && quantity <= product.stock) {
        setCart(cart.map(item => 
          item.product.id === productId 
            ? { ...item, quantity }
            : item
        ));
      } else {
        showNotification({
          type: 'warning',
          title: 'สต็อกไม่เพียงพอ',
          message: `สินค้ามีสต็อกเพียง ${product?.stock || 0} ชิ้น`,
          duration: 3000
        });
      }
    }
  };

  const handleScan = async (scanData: string, type: 'barcode' | 'qr') => {
    setShowScanner(false);
    
    try {
      // Extract product ID from scan data
      let productId = '';
      
      try {
        const parsed = JSON.parse(scanData);
        productId = parsed.productId || parsed.id;
      } catch {
        // If not JSON, treat as direct product ID, QR code, or barcode
        productId = scanData.replace(/^PROD-/, ''); // Remove PROD- prefix if exists
      }

      // Find product by ID, QR code, or barcode  
      const product = products.find(p => 
        p.id === productId || 
        p.qrCode === scanData ||
        p.barcode === scanData
      );

      if (product) {
        addToCart(product);
        // แสดง notification เมื่อสแกนสำเร็จ
        showNotification({
          type: 'success',
          title: 'สแกนสำเร็จ',
          message: `เพิ่ม ${product.name} ในตะกร้าแล้ว`,
          duration: 3000
        });
      } else {
        showNotification({
          type: 'error',
          title: 'ไม่พบสินค้า',
          message: `ไม่พบสินค้าสำหรับ ${type === 'qr' ? 'QR Code' : 'Barcode'}: ${scanData}`,
          duration: 4000
        });
      }
    } catch (error) {
      console.error('Scan error:', error);
      showNotification({
        type: 'error',
        title: 'เกิดข้อผิดพลาด',
        message: `ไม่สามารถประมวลผล ${type === 'qr' ? 'QR Code' : 'Barcode'} ได้`,
        duration: 4000
      });
    }
  };

  const searchMember = async () => {
    if (!memberPhone) return;
    
    try {
      const member = await apiService.getMember(memberPhone);
      setSelectedMember(member);
      setShowMemberModal(false);
      showNotification({
        type: 'success',
        title: 'พบสมาชิก',
        message: `พบสมาชิก: ${member.name}`,
        duration: 3000
      });
    } catch (error) {
      showNotification({
        type: 'warning',
        title: 'ไม่พบสมาชิก',
        message: 'ไม่พบสมาชิกด้วยเบอร์โทรนี้',
        duration: 3000
      });
    }
  };

  const createMember = async (name: string) => {
    try {
      const member = await apiService.createMember({ phone: memberPhone, name });
      setSelectedMember(member);
      setShowMemberModal(false);
      showNotification({
        type: 'success',
        title: 'สร้างสมาชิกสำเร็จ',
        message: `สร้างสมาชิก ${name} เรียบร้อยแล้ว`,
        duration: 3000
      });
    } catch (error) {
      showNotification({
        type: 'error',
        title: 'เกิดข้อผิดพลาด',
        message: 'ไม่สามารถสร้างสมาชิกได้',
        duration: 4000
      });
    }
  };

  const subtotal = cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
  const pointsDiscount = pointsToUse * 1; // 1 point = 1 THB
  const total = subtotal - discount - pointsDiscount;

  const processSale = async (cashReceived?: number, change?: number) => {
    if (cart.length === 0) return;
    
    setProcessing(true);
    
    try {
      const saleData = {
        items: cart.map(item => ({
          productId: item.product.id,
          name: item.product.name,
          quantity: item.quantity,
          price: item.product.price
        })),
        subtotal,
        discount: discount + pointsDiscount,
        total,
        paymentMethod,
        memberId: selectedMember?.id,
        memberPhone: selectedMember?.phone,
        pointsUsed: pointsToUse
      };

      const completedSaleData = await apiService.createSale(saleData);
      
      // Add cash payment details if applicable
      if (paymentMethod === 'cash' && cashReceived !== undefined) {
        completedSaleData.cashReceived = cashReceived;
        completedSaleData.change = change;
      }
      
      setCompletedSale(completedSaleData);
      
      // Reset cart and state
      setCart([]);
      setDiscount(0);
      setPointsToUse(0);
      setSelectedMember(null);
      setMemberPhone('');
      setShowPaymentModal(false);
      setShowCashModal(false);
      
      // Show invoice modal
      setShowInvoiceModal(true);
      
      // แสดง notification เมื่อขายสำเร็จ
      showNotification({
        type: 'success',
        title: 'ขายสำเร็จ',
        message: `ขายสินค้าเป็นเงิน ฿${total.toLocaleString()} เรียบร้อยแล้ว`,
        duration: 5000
      });

      // Trigger new sale event for other components
      const newSaleEvent = new CustomEvent('new-sale', {
        detail: {
          total,
          items: cart,
          cashierName: 'Current User' // Replace with actual user name
        }
      });
      window.dispatchEvent(newSaleEvent);

      // Refresh products to update stock
      fetchProducts();
    } catch (error) {
      showNotification({
        type: 'error',
        title: 'เกิดข้อผิดพลาด',
        message: 'ไม่สามารถประมวลผลการขายได้',
        duration: 5000
      });
    } finally {
      setProcessing(false);
    }
  };

  const handleCashPayment = (cashReceived: number, change: number) => {
    setShowCashModal(false);
    processSale(cashReceived, change);
  };

  // เพิ่ม safety check สำหรับ filteredProducts
  const filteredProducts = Array.isArray(products) 
    ? products.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.barcode.includes(searchTerm) ||
        product.qrCode.includes(searchTerm)
      )
    : [];

  const PaymentModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" role="dialog" aria-labelledby="payment-modal-title" aria-modal="true">
      <div className="bg-white rounded-lg max-w-md w-full">
        <div className="p-6">
          <h2 id="payment-modal-title" className="text-xl font-bold mb-4">Payment</h2>
          
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-600">Subtotal</p>
              <p className="text-lg font-semibold">฿{subtotal.toLocaleString()}</p>
            </div>
            
            {discount > 0 && (
              <div>
                <p className="text-sm text-gray-600">Discount</p>
                <p className="text-lg font-semibold text-red-600">-฿{discount.toLocaleString()}</p>
              </div>
            )}
            
            {pointsDiscount > 0 && (
              <div>
                <p className="text-sm text-gray-600">Points Discount</p>
                <p className="text-lg font-semibold text-green-600">-฿{pointsDiscount.toLocaleString()}</p>
              </div>
            )}
            
            <div className="border-t pt-4">
              <p className="text-sm text-gray-600">Total</p>
              <p className="text-2xl font-bold text-blue-600">฿{total.toLocaleString()}</p>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Payment Method
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                <button
                  aria-label="Pay with cash"
                  onClick={() => setPaymentMethod('cash')}
                  className={`p-3 rounded-md border-2 transition-colors ${
                    paymentMethod === 'cash' 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-300'
                  }`}
                >
                  <Banknote className="h-6 w-6 mx-auto mb-1" />
                  <span className="text-xs">Cash</span>
                </button>
                <button
                  aria-label="Pay with bank transfer"
                  onClick={() => setPaymentMethod('bank_transfer')}
                  className={`p-3 rounded-md border-2 transition-colors ${
                    paymentMethod === 'bank_transfer' 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-300'
                  }`}
                >
                  <CreditCard className="h-6 w-6 mx-auto mb-1" />
                  <span className="text-xs">Bank Transfer</span>
                </button>
                <button
                  aria-label="Pay with PromptPay"
                  onClick={() => setPaymentMethod('promptpay')}
                  className={`p-3 rounded-md border-2 transition-colors ${
                    paymentMethod === 'promptpay' 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-300'
                  }`}
                >
                  <Smartphone className="h-6 w-6 mx-auto mb-1" />
                  <span className="text-xs">PromptPay</span>
                </button>
                <button
                  aria-label="Pay with credit card"
                  onClick={() => setPaymentMethod('card')}
                  className={`p-3 rounded-md border-2 transition-colors ${
                    paymentMethod === 'card' 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-300'
                  }`}
                >
                  <CreditCard className="h-6 w-6 mx-auto mb-1" />
                  <span className="text-xs">Card</span>
                </button>
              </div>
            </div>

            {paymentMethod === 'promptpay' && (
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-4">Scan to pay</p>
                <div className="bg-white p-4 rounded-lg inline-block">
                  <QRCode 
                    value={`promptpay://0123456789?amount=${total}`}
                    size={150}
                  />
                </div>
              </div>
            )}

            {paymentMethod === 'card' ? (
              <div className="pt-4">
                <StripePayment
                  amount={total}
                  onSuccess={(paymentIntent) => {
                    console.log('Payment successful:', paymentIntent);
                    processSale();
                  }}
                  onError={(error) => {
                    console.error('Payment failed:', error);
                    showNotification({
                      type: 'error',
                      title: 'การชำระเงินล้มเหลว',
                      message: error,
                      duration: 5000
                    });
                  }}
                />
                <button
                  aria-label="Cancel payment"
                  onClick={() => setShowPaymentModal(false)}
                  className="w-full mt-3 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400 transition-colors touch-target"
                >
                  Cancel
                </button>
              </div>
            ) : paymentMethod === 'cash' ? (
              <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 pt-4">
                <button
                  onClick={() => {
                    setShowPaymentModal(false);
                    setShowCashModal(true);
                  }}
                  className="flex-1 bg-green-600 text-white py-3 px-4 rounded-md hover:bg-green-700 transition-colors touch-target"
                >
                  Enter Cash Amount
                </button>
                <button
                  aria-label="Cancel payment"
                  onClick={() => setShowPaymentModal(false)}
                  className="flex-1 bg-gray-300 text-gray-700 py-3 px-4 rounded-md hover:bg-gray-400 transition-colors touch-target"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 pt-4">
                <button
                  onClick={processSale}
                  disabled={processing}
                  className="flex-1 bg-green-600 text-white py-3 px-4 rounded-md hover:bg-green-700 transition-colors disabled:opacity-50 touch-target"
                >
                  {processing ? 'Processing...' : 'Complete Sale'}
                </button>
                <button
                  aria-label="Cancel payment"
                  onClick={() => setShowPaymentModal(false)}
                  className="flex-1 bg-gray-300 text-gray-700 py-3 px-4 rounded-md hover:bg-gray-400 transition-colors touch-target"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  const MemberModal = () => {
    const [newMemberName, setNewMemberName] = useState('');
    
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" role="dialog" aria-labelledby="member-modal-title" aria-modal="true">
        <div className="bg-white rounded-lg max-w-md w-full">
          <div className="p-6">
            <h2 id="member-modal-title" className="text-xl font-bold mb-4">Add Member</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number
                </label>
                <input
                  type="text"
                  value={memberPhone}
                  onChange={(e) => setMemberPhone(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 form-input"
                  placeholder="Enter phone number"
                  aria-describedby="phone-help"
                />
                <p id="phone-help" className="text-xs text-gray-500 mt-1">
                  กรอกเบอร์โทรศัพท์เพื่อค้นหาสมาชิก
                </p>
              </div>
              
              <div className="flex space-x-2">
                <button
                  onClick={searchMember}
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors touch-target"
                >
                  Search Member
                </button>
              </div>
              
              <div className="text-center text-gray-500">or</div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Create New Member
                </label>
                <input
                  type="text"
                  value={newMemberName}
                  onChange={(e) => setNewMemberName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 form-input"
                  placeholder="Enter member name"
                />
              </div>
              
              <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
                <button
                  onClick={() => createMember(newMemberName)}
                  disabled={!newMemberName}
                  className="flex-1 bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition-colors disabled:opacity-50 touch-target"
                >
                  Create Member
                </button>
                <button
                  aria-label="Cancel member creation"
                  onClick={() => setShowMemberModal(false)}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400 transition-colors touch-target"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // เพิ่ม Loading state
  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center" role="status" aria-label="Loading products">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" aria-hidden="true"></div>
          <p className="text-gray-600">Loading products...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col lg:flex-row" role="main">
      {/* Left Panel - Products */}
      <section className="flex-1 flex flex-col order-2 lg:order-1" aria-label="Products">
        <header className="p-4 border-b bg-white sticky top-0 z-20">
          <h1 className="text-xl font-bold text-gray-900 mb-4 desktop-only">Point of Sale</h1>
          <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center">
            <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" aria-hidden="true" />
            <input
              type="text"
              placeholder="Search products or scan barcode..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 form-input"
              aria-label="Search products"
            />
          </div>
          <button
            aria-label="Open barcode scanner"
            onClick={() => setShowScanner(true)}
            className="bg-blue-600 text-white px-4 py-3 rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2 touch-target w-full sm:w-auto"
          >
            <QrCode className="h-5 w-5" />
            <span>สแกน</span>
          </button>
          </div>
        </header>
        
        <main className="flex-1 overflow-y-auto p-4 bg-gray-50">
          {filteredProducts.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">
                {searchTerm ? 'No products found' : 'No products available'}
              </p>
            </div>
          ) : (
            <div className="grid-responsive">
              {filteredProducts.map((product) => (
                <EnhancedProductCard
                  key={product.id}
                  product={product}
                  onAddToCart={addToCart}
                  compact={true}
                />
              ))}
            </div>
          )}
        </main>
      </section>

      {/* Right Panel - Cart - Responsive */}
      <aside className="w-full lg:w-96 bg-white border-t lg:border-t-0 lg:border-l flex flex-col order-1 lg:order-2 max-h-screen lg:h-screen" aria-label="Shopping cart">
        <header className="p-4 border-b bg-white">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Cart</h2>
            <ShoppingCart className="h-6 w-6 text-gray-600" aria-hidden="true" />
          </div>
          
          {/* Member Section */}
          <div className="mb-4">
            {selectedMember ? (
              <div className="bg-green-50 p-3 rounded-md" role="region" aria-label="Selected member">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-green-800">{selectedMember.name}</p>
                    <p className="text-sm text-green-600">Points: {selectedMember.points}</p>
                  </div>
                  <button
                    aria-label="Remove selected member"
                    onClick={() => setSelectedMember(null)}
                    className="text-green-600 hover:text-green-800 touch-target"
                  >
                    ×
                  </button>
                </div>
                
                {selectedMember.points > 0 && (
                  <div className="mt-2">
                    <label className="block text-sm font-medium text-green-700 mb-1">
                      Use Points (1 point = ฿1)
                    </label>
                    <input
                      type="number"
                      min="0"
                      max={Math.min(selectedMember.points, total)}
                      value={pointsToUse}
                      onChange={(e) => setPointsToUse(Number(e.target.value))}
                      className="w-full px-3 py-2 border border-green-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 form-input"
                      aria-describedby="points-help"
                    />
                    <p id="points-help" className="text-xs text-green-600 mt-1">
                      Available points: {selectedMember.points}
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <button
                aria-label="Add member to this sale"
                onClick={() => setShowMemberModal(true)}
                className="w-full bg-blue-100 text-blue-700 py-3 px-4 rounded-md hover:bg-blue-200 transition-colors flex items-center justify-center space-x-2 touch-target"
              >
                <User className="h-5 w-5" />
                <span>Add Member</span>
              </button>
            )}
          </div>

          {/* Discount */}
          <div className="mb-4">
            <label htmlFor="discount-input" className="block text-sm font-medium text-gray-700 mb-1">
              Discount (฿)
            </label>
            <input
              id="discount-input"
              type="number"
              min="0"
              max={subtotal}
              value={discount}
              onChange={(e) => setDiscount(Number(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 form-input"
              aria-describedby="discount-help"
            />
            <p id="discount-help" className="text-xs text-gray-500 mt-1">
              Maximum discount: ฿{subtotal.toLocaleString()}
            </p>
          </div>
        </header>
        
        <main className="flex-1 overflow-y-auto p-4 bg-gray-50">
          {cart.length === 0 ? (
            <div className="text-center py-12">
              <ShoppingCart className="h-12 w-12 text-gray-400 mx-auto mb-4" aria-hidden="true" />
              <p className="text-gray-500">Cart is empty</p>
            </div>
          ) : (
            <div className="space-y-3" role="list" aria-label="Cart items">
              {cart.map((item) => (
                <div key={item.product.id} className="bg-white p-3 rounded-md shadow-sm" role="listitem">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-medium text-sm text-responsive">{item.product.name}</h4>
                    <button
                      aria-label={`Remove ${item.product.name} from cart`}
                      onClick={() => updateQuantity(item.product.id, 0)}
                      className="text-red-500 hover:text-red-700 touch-target"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center space-x-2" role="group" aria-label={`Quantity controls for ${item.product.name}`}>
                      <button
                        aria-label="Decrease quantity"
                        onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                        className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center hover:bg-gray-300 touch-target"
                      >
                        <Minus className="h-4 w-4" />
                      </button>
                      <span className="w-10 text-center font-medium" aria-label={`Quantity: ${item.quantity}`}>
                        {item.quantity}
                      </span>
                      <button
                        aria-label="Increase quantity"
                        onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                        className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center hover:bg-gray-300 touch-target"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>
                    <span className="font-semibold text-responsive">
                      ฿{(item.product.price * item.quantity).toLocaleString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
        
        {cart.length > 0 && (
          <footer className="border-t p-4 bg-white">
            <div className="space-y-2 mb-4">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>฿{subtotal.toLocaleString()}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-red-600">
                  <span>Discount:</span>
                  <span>-฿{discount.toLocaleString()}</span>
                </div>
              )}
              {pointsDiscount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Points Discount:</span>
                  <span>-฿{pointsDiscount.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-lg border-t pt-2">
                <span>Total:</span>
                <span>฿{total.toLocaleString()}</span>
              </div>
            </div>
            <button
              aria-label="Proceed to payment"
              onClick={() => setShowPaymentModal(true)}
              className="w-full bg-green-600 text-white py-4 px-4 rounded-md hover:bg-green-700 transition-colors font-semibold touch-target"
            >
              Proceed to Payment
            </button>
          </footer>
        )}
      </aside>

      {/* Modals */}
      {showPaymentModal && <PaymentModal />}
      {showCashModal && (
        <CashPaymentModal
          total={total}
          onComplete={handleCashPayment}
          onCancel={() => setShowCashModal(false)}
        />
      )}
      {showInvoiceModal && completedSale && (
        <InvoiceGenerator
          sale={completedSale}
          onClose={() => setShowInvoiceModal(false)}
        />
      )}
      {showMemberModal && <MemberModal />}
      {showScanner && (
        <BarcodeQRScanner
          isOpen={true}
          onScan={handleScan}
          onClose={() => setShowScanner(false)}
          title="สแกนบาร์โค้ดหรือ QR Code สินค้า"
        />
      )}
    </div>
  );
};

export default PointOfSale;