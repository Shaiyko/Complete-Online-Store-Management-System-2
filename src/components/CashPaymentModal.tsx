import React, { useState, useEffect } from 'react';
import { Banknote, Calculator, DollarSign, Receipt } from 'lucide-react';

interface CashPaymentModalProps {
  total: number;
  onComplete: (cashReceived: number, change: number) => void;
  onCancel: () => void;
}

const CashPaymentModal: React.FC<CashPaymentModalProps> = ({
  total,
  onComplete,
  onCancel
}) => {
  const [cashReceived, setCashReceived] = useState<string>('');
  const [change, setChange] = useState<number>(0);
  const [error, setError] = useState<string>('');

  // Quick amount buttons
  const quickAmounts = [
    Math.ceil(total / 100) * 100, // Round up to nearest 100
    Math.ceil(total / 500) * 500, // Round up to nearest 500
    Math.ceil(total / 1000) * 1000, // Round up to nearest 1000
    total + 500,
    total + 1000
  ].filter((amount, index, arr) => arr.indexOf(amount) === index && amount > total);

  useEffect(() => {
    const received = parseFloat(cashReceived) || 0;
    const calculatedChange = received - total;
    setChange(calculatedChange);
    
    if (received > 0 && received < total) {
      setError('Cash received is less than total amount');
    } else {
      setError('');
    }
  }, [cashReceived, total]);

  const handleQuickAmount = (amount: number) => {
    setCashReceived(amount.toString());
  };

  const handleComplete = () => {
    const received = parseFloat(cashReceived);
    if (received < total) {
      setError('Cash received must be at least the total amount');
      return;
    }
    onComplete(received, change);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && parseFloat(cashReceived) >= total) {
      handleComplete();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-2">
              <Banknote className="h-6 w-6 text-green-600" />
              <h2 className="text-xl font-bold text-gray-900">Cash Payment</h2>
            </div>
            <button
              onClick={onCancel}
              className="text-gray-400 hover:text-gray-600"
            >
              ×
            </button>
          </div>

          {/* Total Amount */}
          <div className="bg-blue-50 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between">
              <span className="text-blue-700 font-medium">Total Amount:</span>
              <span className="text-2xl font-bold text-blue-900">
                ฿{total.toLocaleString()}
              </span>
            </div>
          </div>

          {/* Cash Received Input */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Cash Received
            </label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="number"
                value={cashReceived}
                onChange={(e) => setCashReceived(e.target.value)}
                onKeyPress={handleKeyPress}
                className="w-full pl-10 pr-4 py-3 text-lg border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="0.00"
                step="0.01"
                autoFocus
              />
            </div>
            {error && (
              <p className="text-red-600 text-sm mt-1">{error}</p>
            )}
          </div>

          {/* Quick Amount Buttons */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Quick Amounts
            </label>
            <div className="grid grid-cols-3 gap-2">
              {quickAmounts.slice(0, 6).map((amount) => (
                <button
                  key={amount}
                  onClick={() => handleQuickAmount(amount)}
                  className="px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
                >
                  ฿{amount.toLocaleString()}
                </button>
              ))}
            </div>
          </div>

          {/* Change Calculation */}
          <div className={`rounded-lg p-4 mb-6 ${
            change >= 0 ? 'bg-green-50' : 'bg-red-50'
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Calculator className={`h-5 w-5 ${
                  change >= 0 ? 'text-green-600' : 'text-red-600'
                }`} />
                <span className={`font-medium ${
                  change >= 0 ? 'text-green-700' : 'text-red-700'
                }`}>
                  Change:
                </span>
              </div>
              <span className={`text-2xl font-bold ${
                change >= 0 ? 'text-green-900' : 'text-red-900'
              }`}>
                ฿{Math.abs(change).toLocaleString()}
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3">
            <button
              onClick={onCancel}
              className="flex-1 bg-gray-300 text-gray-700 py-3 px-4 rounded-md hover:bg-gray-400 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleComplete}
              disabled={parseFloat(cashReceived) < total || !cashReceived}
              className="flex-1 bg-green-600 text-white py-3 px-4 rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
            >
              <Receipt className="h-5 w-5" />
              <span>Complete Sale</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CashPaymentModal;