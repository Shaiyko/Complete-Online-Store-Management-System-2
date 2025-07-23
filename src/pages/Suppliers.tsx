import React, { useState, useEffect } from 'react';
import { apiService } from '../services/api';
import { Supplier } from '../types';
import { Truck, Search, Plus, Phone, Mail, Edit2, Trash2 } from 'lucide-react';

const Suppliers: React.FC = () => {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const fetchSuppliers = async () => {
    try {
      const data = await apiService.getSuppliers();
      setSuppliers(data);
    } catch (error) {
      console.error('Failed to fetch suppliers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (supplier: Supplier) => {
    setEditingSupplier(supplier);
    setShowAddModal(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('คุณแน่ใจหรือไม่ที่จะลบซัพพลายเออร์นี้?')) {
      try {
        // In a real app, this would call the API
        setSuppliers(prev => prev.filter(s => s.id !== id));
        alert('ลบซัพพลายเออร์เรียบร้อยแล้ว');
      } catch (error) {
        alert('ไม่สามารถลบซัพพลายเออร์ได้');
      }
    }
  };

  const SupplierModal = () => {
    const [formData, setFormData] = useState({
      name: editingSupplier?.name || '',
      contact: editingSupplier?.contact || '',
      phone: editingSupplier?.phone || ''
    });

    useEffect(() => {
      if (editingSupplier) {
        setFormData({
          name: editingSupplier.name,
          contact: editingSupplier.contact,
          phone: editingSupplier.phone
        });
      }
    }, [editingSupplier]);

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      try {
        if (editingSupplier) {
          // Update existing supplier
          setSuppliers(prev => prev.map(s => 
            s.id === editingSupplier.id 
              ? { ...s, ...formData }
              : s
          ));
          alert('แก้ไขซัพพลายเออร์เรียบร้อยแล้ว');
        } else {
          // Create new supplier
          const newSupplier = {
            id: Date.now().toString(),
            ...formData
          };
          setSuppliers(prev => [...prev, newSupplier]);
          alert('เพิ่มซัพพลายเออร์เรียบร้อยแล้ว');
        }
        fetchSuppliers();
        setShowAddModal(false);
        setEditingSupplier(null);
        setFormData({ name: '', contact: '', phone: '' });
      } catch (error) {
        alert('ไม่สามารถบันทึกข้อมูลซัพพลายเออร์ได้');
      }
    };

    const handleClose = () => {
      setShowAddModal(false);
      setEditingSupplier(null);
      setFormData({ name: '', contact: '', phone: '' });
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg max-w-md w-full">
          <div className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">
                {editingSupplier ? 'แก้ไขซัพพลายเออร์' : 'เพิ่มซัพพลายเออร์ใหม่'}
              </h2>
              <button
                onClick={handleClose}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  ชื่อซัพพลายเออร์
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="กรอกชื่อซัพพลายเออร์"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  อีเมลติดต่อ
                </label>
                <input
                  type="email"
                  required
                  value={formData.contact}
                  onChange={(e) => setFormData({...formData, contact: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="กรอกอีเมลติดต่อ"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  เบอร์โทรศัพท์
                </label>
                <input
                  type="text"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="กรอกเบอร์โทรศัพท์"
                />
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
                >
                  {editingSupplier ? 'บันทึกการแก้ไข' : 'เพิ่มซัพพลายเออร์'}
                </button>
                <button
                  type="button"
                  onClick={handleClose}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400 transition-colors"
                >
                  ยกเลิก
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  };

  const filteredSuppliers = suppliers.filter(supplier =>
    supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    supplier.contact.toLowerCase().includes(searchTerm.toLowerCase()) ||
    supplier.phone.includes(searchTerm)
  );

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
        <h1 className="text-2xl font-bold text-gray-900">Suppliers</h1>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center space-x-2"
        >
          <Plus className="h-5 w-5" />
          <span>Add Supplier</span>
        </button>
      </div>

      {/* Search */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search suppliers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Suppliers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredSuppliers.map((supplier) => (
          <div key={supplier.id} className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <Truck className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{supplier.name}</h3>
                  <p className="text-sm text-gray-500">Supplier</p>
                </div>
              </div>
              <div className="flex space-x-2">
                <button 
                  onClick={() => handleEdit(supplier)}
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                >
                  <Edit2 className="h-4 w-4" />
                </button>
                <button 
                  onClick={() => handleDelete(supplier.id)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <Mail className="h-4 w-4 text-gray-400" />
                <span className="text-sm text-gray-600">{supplier.contact}</span>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="h-4 w-4 text-gray-400" />
                <span className="text-sm text-gray-600">{supplier.phone}</span>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-200">
              <button className="w-full bg-blue-100 text-blue-700 py-2 px-4 rounded-md hover:bg-blue-200 transition-colors text-sm font-medium">
                View Products
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredSuppliers.length === 0 && (
        <div className="text-center py-12">
          <Truck className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">No suppliers found</p>
        </div>
      )}

      {/* Add Supplier Modal */}
      {showAddModal && <SupplierModal />}
    </div>
  );
};

export default Suppliers;