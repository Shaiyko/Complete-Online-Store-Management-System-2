import React from 'react';
import { Sale } from '../types';
import { Printer, Download, Mail } from 'lucide-react';
import jsPDF from 'jspdf';

interface InvoiceGeneratorProps {
  sale: Sale;
  onClose: () => void;
}

const InvoiceGenerator: React.FC<InvoiceGeneratorProps> = ({ sale, onClose }) => {
  const generatePDF = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;
    
    // Header
    doc.setFontSize(20);
    doc.text('SALES INVOICE', pageWidth / 2, 20, { align: 'center' });
    
    // Store Info
    doc.setFontSize(12);
    doc.text('My Store', 20, 40);
    doc.text('123 Main Street, Bangkok', 20, 50);
    doc.text('Phone: 02-123-4567', 20, 60);
    doc.text('Tax ID: 1234567890123', 20, 70);
    
    // Invoice Details
    doc.text(`Invoice #: ${sale.id}`, pageWidth - 80, 40);
    doc.text(`Date: ${new Date(sale.createdAt).toLocaleDateString()}`, pageWidth - 80, 50);
    doc.text(`Cashier: ${sale.cashierName}`, pageWidth - 80, 60);
    
    // Customer Info
    if (sale.memberPhone) {
      doc.text('Customer:', 20, 90);
      doc.text(`Phone: ${sale.memberPhone}`, 20, 100);
    }
    
    // Items Table Header
    let yPos = 120;
    doc.setFontSize(10);
    doc.text('Item', 20, yPos);
    doc.text('Qty', 100, yPos);
    doc.text('Price', 130, yPos);
    doc.text('Total', 160, yPos);
    
    // Draw line
    doc.line(20, yPos + 5, pageWidth - 20, yPos + 5);
    yPos += 15;
    
    // Items
    sale.items.forEach((item) => {
      doc.text(item.name, 20, yPos);
      doc.text(item.quantity.toString(), 100, yPos);
      doc.text(`฿${item.price.toLocaleString()}`, 130, yPos);
      doc.text(`฿${(item.price * item.quantity).toLocaleString()}`, 160, yPos);
      yPos += 10;
    });
    
    // Totals
    yPos += 10;
    doc.line(20, yPos, pageWidth - 20, yPos);
    yPos += 10;
    
    doc.text('Subtotal:', 130, yPos);
    doc.text(`฿${sale.subtotal.toLocaleString()}`, 160, yPos);
    yPos += 10;
    
    if (sale.discount > 0) {
      doc.text('Discount:', 130, yPos);
      doc.text(`-฿${sale.discount.toLocaleString()}`, 160, yPos);
      yPos += 10;
    }
    
    doc.setFontSize(12);
    doc.text('Total:', 130, yPos);
    doc.text(`฿${sale.total.toLocaleString()}`, 160, yPos);
    
    // Payment Method
    yPos += 20;
    doc.setFontSize(10);
    doc.text(`Payment Method: ${sale.paymentMethod.replace('_', ' ').toUpperCase()}`, 20, yPos);
    
    // Footer
    yPos += 30;
    doc.text('Thank you for your business!', pageWidth / 2, yPos, { align: 'center' });
    
    doc.save(`invoice-${sale.id}.pdf`);
  };

  const printInvoice = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    
    const invoiceHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Invoice ${sale.id}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          .header { text-align: center; margin-bottom: 30px; }
          .store-info { margin-bottom: 20px; }
          .invoice-details { text-align: right; margin-bottom: 20px; }
          .customer-info { margin-bottom: 20px; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background-color: #f2f2f2; }
          .totals { text-align: right; }
          .footer { text-align: center; margin-top: 30px; }
          @media print {
            body { margin: 0; }
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>SALES INVOICE</h1>
        </div>
        
        <div class="store-info">
          <strong>My Store</strong><br>
          123 Main Street, Bangkok<br>
          Phone: 02-123-4567<br>
          Tax ID: 1234567890123
        </div>
        
        <div class="invoice-details">
          Invoice #: ${sale.id}<br>
          Date: ${new Date(sale.createdAt).toLocaleDateString()}<br>
          Cashier: ${sale.cashierName}
        </div>
        
        ${sale.memberPhone ? `
          <div class="customer-info">
            <strong>Customer:</strong><br>
            Phone: ${sale.memberPhone}
          </div>
        ` : ''}
        
        <table>
          <thead>
            <tr>
              <th>Item</th>
              <th>Quantity</th>
              <th>Price</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            ${sale.items.map(item => `
              <tr>
                <td>${item.name}</td>
                <td>${item.quantity}</td>
                <td>฿${item.price.toLocaleString()}</td>
                <td>฿${(item.price * item.quantity).toLocaleString()}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        
        <div class="totals">
          <p>Subtotal: ฿${sale.subtotal.toLocaleString()}</p>
          ${sale.discount > 0 ? `<p>Discount: -฿${sale.discount.toLocaleString()}</p>` : ''}
          <p><strong>Total: ฿${sale.total.toLocaleString()}</strong></p>
        </div>
        
        <p>Payment Method: ${sale.paymentMethod.replace('_', ' ').toUpperCase()}</p>
        
        <div class="footer">
          <p>Thank you for your business!</p>
        </div>
        
        <div class="no-print" style="margin-top: 30px; text-align: center;">
          <button onclick="window.print()">Print</button>
          <button onclick="window.close()">Close</button>
        </div>
      </body>
      </html>
    `;
    
    printWindow.document.write(invoiceHTML);
    printWindow.document.close();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-900">Sales Invoice</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              ×
            </button>
          </div>

          {/* Invoice Preview */}
          <div className="border border-gray-200 rounded-lg p-6 mb-6 bg-white">
            <div className="text-center mb-6">
              <h1 className="text-2xl font-bold">SALES INVOICE</h1>
            </div>
            
            <div className="grid grid-cols-2 gap-6 mb-6">
              <div>
                <h3 className="font-semibold mb-2">Store Information</h3>
                <p className="text-sm text-gray-600">
                  <strong>My Store</strong><br />
                  123 Main Street, Bangkok<br />
                  Phone: 02-123-4567<br />
                  Tax ID: 1234567890123
                </p>
              </div>
              
              <div className="text-right">
                <h3 className="font-semibold mb-2">Invoice Details</h3>
                <p className="text-sm text-gray-600">
                  Invoice #: {sale.id}<br />
                  Date: {new Date(sale.createdAt).toLocaleDateString()}<br />
                  Cashier: {sale.cashierName}
                </p>
              </div>
            </div>
            
            {sale.memberPhone && (
              <div className="mb-6">
                <h3 className="font-semibold mb-2">Customer Information</h3>
                <p className="text-sm text-gray-600">
                  Phone: {sale.memberPhone}
                </p>
              </div>
            )}
            
            <div className="mb-6">
              <table className="w-full border-collapse border border-gray-300">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="border border-gray-300 px-4 py-2 text-left">Item</th>
                    <th className="border border-gray-300 px-4 py-2 text-center">Qty</th>
                    <th className="border border-gray-300 px-4 py-2 text-right">Price</th>
                    <th className="border border-gray-300 px-4 py-2 text-right">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {sale.items.map((item, index) => (
                    <tr key={index}>
                      <td className="border border-gray-300 px-4 py-2">{item.name}</td>
                      <td className="border border-gray-300 px-4 py-2 text-center">{item.quantity}</td>
                      <td className="border border-gray-300 px-4 py-2 text-right">฿{item.price.toLocaleString()}</td>
                      <td className="border border-gray-300 px-4 py-2 text-right">฿{(item.price * item.quantity).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            <div className="text-right mb-6">
              <div className="space-y-1">
                <div className="flex justify-end">
                  <span className="w-24">Subtotal:</span>
                  <span className="w-32 text-right">฿{sale.subtotal.toLocaleString()}</span>
                </div>
                {sale.discount > 0 && (
                  <div className="flex justify-end">
                    <span className="w-24">Discount:</span>
                    <span className="w-32 text-right">-฿{sale.discount.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-end font-bold text-lg border-t pt-1">
                  <span className="w-24">Total:</span>
                  <span className="w-32 text-right">฿{sale.total.toLocaleString()}</span>
                </div>
              </div>
            </div>
            
            <div className="mb-6">
              <p className="text-sm">
                <strong>Payment Method:</strong> {sale.paymentMethod.replace('_', ' ').toUpperCase()}
              </p>
            </div>
            
            <div className="text-center">
              <p className="text-sm text-gray-600">Thank you for your business!</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3">
            <button
              onClick={printInvoice}
              className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
            >
              <Printer className="h-5 w-5" />
              <span>Print</span>
            </button>
            <button
              onClick={generatePDF}
              className="flex-1 bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition-colors flex items-center justify-center space-x-2"
            >
              <Download className="h-5 w-5" />
              <span>Download PDF</span>
            </button>
            <button
              onClick={onClose}
              className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvoiceGenerator;