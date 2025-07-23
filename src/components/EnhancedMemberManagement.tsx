import React, { useState, useEffect } from 'react';
import { apiService } from '../services/api';
import { Member } from '../types';
import { 
  Users, 
  Search, 
  Plus, 
  Gift, 
  Phone, 
  Calendar, 
  TrendingUp,
  Star,
  Award,
  CreditCard,
  History,
  Edit2,
  Trash2,
  Mail,
  MapPin
} from 'lucide-react';

interface EnhancedMember extends Member {
  email?: string;
  address?: string;
  birthDate?: Date;
  tier: 'bronze' | 'silver' | 'gold' | 'platinum';
  pointsHistory: PointsTransaction[];
  purchaseHistory: PurchaseHistory[];
  preferences: MemberPreferences;
}

interface PointsTransaction {
  id: string;
  type: 'earned' | 'redeemed' | 'expired' | 'bonus';
  points: number;
  description: string;
  date: Date;
  reference?: string;
}

interface PurchaseHistory {
  id: string;
  date: Date;
  total: number;
  items: number;
  paymentMethod: string;
}

interface MemberPreferences {
  notifications: boolean;
  emailMarketing: boolean;
  smsMarketing: boolean;
  favoriteCategories: string[];
}

const EnhancedMemberManagement: React.FC = () => {
  const [members, setMembers] = useState<EnhancedMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMember, setSelectedMember] = useState<EnhancedMember | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingMember, setEditingMember] = useState<EnhancedMember | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [filterTier, setFilterTier] = useState('');

  // Mock enhanced member data
  const mockMembers: EnhancedMember[] = [
    {
      id: '1',
      phone: '0812345678',
      name: 'Alice Johnson',
      email: 'alice@example.com',
      address: '123 Main St, Bangkok',
      points: 1250,
      totalSpent: 125000,
      tier: 'gold',
      createdAt: new Date('2024-01-15'),
      lastVisit: new Date('2024-01-20'),
      birthDate: new Date('1990-05-15'),
      pointsHistory: [
        {
          id: '1',
          type: 'earned',
          points: 625,
          description: 'Purchase reward',
          date: new Date('2024-01-20'),
          reference: 'SALE-001'
        },
        {
          id: '2',
          type: 'redeemed',
          points: -100,
          description: 'Discount redemption',
          date: new Date('2024-01-18'),
          reference: 'SALE-002'
        }
      ],
      purchaseHistory: [
        {
          id: '1',
          date: new Date('2024-01-20'),
          total: 125000,
          items: 3,
          paymentMethod: 'Credit Card'
        }
      ],
      preferences: {
        notifications: true,
        emailMarketing: true,
        smsMarketing: false,
        favoriteCategories: ['electronics', 'books']
      }
    },
    {
      id: '2',
      phone: '0823456789',
      name: 'Bob Smith',
      email: 'bob@example.com',
      points: 450,
      totalSpent: 45000,
      tier: 'silver',
      createdAt: new Date('2024-01-10'),
      lastVisit: new Date('2024-01-18'),
      pointsHistory: [
        {
          id: '3',
          type: 'earned',
          points: 225,
          description: 'Purchase reward',
          date: new Date('2024-01-18'),
          reference: 'SALE-003'
        }
      ],
      purchaseHistory: [
        {
          id: '2',
          date: new Date('2024-01-18'),
          total: 45000,
          items: 2,
          paymentMethod: 'Cash'
        }
      ],
      preferences: {
        notifications: true,
        emailMarketing: false,
        smsMarketing: true,
        favoriteCategories: ['food', 'clothing']
      }
    }
  ];

  useEffect(() => {
    fetchMembers();
  }, []);

  const fetchMembers = async () => {
    try {
      // In a real app, this would fetch enhanced member data
      await new Promise(resolve => setTimeout(resolve, 500));
      setMembers(mockMembers);
    } catch (error) {
      console.error('Failed to fetch members:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'bronze':
        return 'bg-orange-100 text-orange-800';
      case 'silver':
        return 'bg-gray-100 text-gray-800';
      case 'gold':
        return 'bg-yellow-100 text-yellow-800';
      case 'platinum':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTierIcon = (tier: string) => {
    switch (tier) {
      case 'bronze':
        return <Award className="h-4 w-4 text-orange-600" />;
      case 'silver':
        return <Award className="h-4 w-4 text-gray-600" />;
      case 'gold':
        return <Award className="h-4 w-4 text-yellow-600" />;
      case 'platinum':
        return <Award className="h-4 w-4 text-purple-600" />;
      default:
        return <Award className="h-4 w-4 text-gray-600" />;
    }
  };

  const calculateTier = (totalSpent: number): EnhancedMember['tier'] => {
    if (totalSpent >= 200000) return 'platinum';
    if (totalSpent >= 100000) return 'gold';
    if (totalSpent >= 50000) return 'silver';
    return 'bronze';
  };

  const filteredMembers = members.filter(member => {
    const matchesSearch = member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         member.phone.includes(searchTerm) ||
                         member.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTier = !filterTier || member.tier === filterTier;
    return matchesSearch && matchesTier;
  });

  const handleEdit = (member: EnhancedMember) => {
    setEditingMember(member);
    setShowAddModal(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('คุณแน่ใจหรือไม่ที่จะลบสมาชิกนี้?')) {
      try {
        setMembers(prev => prev.filter(m => m.id !== id));
        alert('ลบสมาชิกเรียบร้อยแล้ว');
      } catch (error) {
        alert('ไม่สามารถลบสมาชิกได้');
      }
    }
  };

  const MemberModal = () => {
    const [formData, setFormData] = useState({
      name: editingMember?.name || '',
      phone: editingMember?.phone || '',
      email: editingMember?.email || '',
      address: editingMember?.address || ''
    });

    useEffect(() => {
      if (editingMember) {
        setFormData({
          name: editingMember.name,
          phone: editingMember.phone,
          email: editingMember.email || '',
          address: editingMember.address || ''
        });
      }
    }, [editingMember]);

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      try {
        if (editingMember) {
          // Update existing member
          setMembers(prev => prev.map(m => 
            m.id === editingMember.id 
              ? { ...m, ...formData }
              : m
          ));
          alert('แก้ไขข้อมูลสมาชิกเรียบร้อยแล้ว');
        } else {
          // Create new member
          const newMember: EnhancedMember = {
            id: Date.now().toString(),
            ...formData,
            points: 0,
            totalSpent: 0,
            tier: 'bronze',
            createdAt: new Date(),
            lastVisit: new Date(),
            pointsHistory: [],
            purchaseHistory: [],
            preferences: {
              notifications: true,
              emailMarketing: false,
              smsMarketing: false,
              favoriteCategories: []
            }
          };
          setMembers(prev => [...prev, newMember]);
          alert('เพิ่มสมาชิกเรียบร้อยแล้ว');
        }
        handleClose();
      } catch (error) {
        alert('ไม่สามารถบันทึกข้อมูลสมาชิกได้');
      }
    };

    const handleClose = () => {
      setShowAddModal(false);
      setEditingMember(null);
      setFormData({ name: '', phone: '', email: '', address: '' });
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg max-w-md w-full">
          <div className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">
                {editingMember ? 'แก้ไขข้อมูลสมาชิก' : 'เพิ่มสมาชิกใหม่'}
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
                  ชื่อ-นามสกุล
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="กรอกชื่อ-นามสกุล"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  เบอร์โทรศัพท์
                </label>
                <input
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="กรอกเบอร์โทรศัพท์"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  อีเมล
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="กรอกอีเมล (ไม่บังคับ)"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  ที่อยู่
                </label>
                <textarea
                  rows={3}
                  value={formData.address}
                  onChange={(e) => setFormData({...formData, address: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="กรอกที่อยู่ (ไม่บังคับ)"
                />
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
                >
                  {editingMember ? 'บันทึกการแก้ไข' : 'เพิ่มสมาชิก'}
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

  const MemberDetailsModal = () => {
    if (!selectedMember) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                  <Users className="h-8 w-8 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{selectedMember.name}</h2>
                  <div className="flex items-center space-x-2 mt-1">
                    {getTierIcon(selectedMember.tier)}
                    <span className={`px-2 py-1 text-xs font-medium rounded-full capitalize ${getTierColor(selectedMember.tier)}`}>
                      {selectedMember.tier} Member
                    </span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Member Info */}
              <div className="lg:col-span-1 space-y-6">
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-3">Contact Information</h3>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Phone className="h-4 w-4 text-gray-400" />
                      <span className="text-sm">{selectedMember.phone}</span>
                    </div>
                    {selectedMember.email && (
                      <div className="flex items-center space-x-2">
                        <Mail className="h-4 w-4 text-gray-400" />
                        <span className="text-sm">{selectedMember.email}</span>
                      </div>
                    )}
                    {selectedMember.address && (
                      <div className="flex items-center space-x-2">
                        <MapPin className="h-4 w-4 text-gray-400" />
                        <span className="text-sm">{selectedMember.address}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-3">Statistics</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Total Spent</span>
                      <span className="text-sm font-medium">฿{selectedMember.totalSpent.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Current Points</span>
                      <span className="text-sm font-medium text-green-600">{selectedMember.points}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Member Since</span>
                      <span className="text-sm font-medium">{new Date(selectedMember.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Last Visit</span>
                      <span className="text-sm font-medium">{new Date(selectedMember.lastVisit).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Points History */}
              <div className="lg:col-span-2 space-y-6">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Points History</h3>
                  <div className="bg-gray-50 rounded-lg p-4 max-h-64 overflow-y-auto">
                    {selectedMember.pointsHistory.map((transaction) => (
                      <div key={transaction.id} className="flex items-center justify-between py-2 border-b border-gray-200 last:border-b-0">
                        <div className="flex items-center space-x-3">
                          <div className={`w-2 h-2 rounded-full ${
                            transaction.type === 'earned' ? 'bg-green-500' :
                            transaction.type === 'redeemed' ? 'bg-red-500' :
                            transaction.type === 'bonus' ? 'bg-blue-500' : 'bg-gray-500'
                          }`} />
                          <div>
                            <p className="text-sm font-medium">{transaction.description}</p>
                            <p className="text-xs text-gray-500">{transaction.date.toLocaleDateString()}</p>
                          </div>
                        </div>
                        <span className={`text-sm font-medium ${
                          transaction.points > 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {transaction.points > 0 ? '+' : ''}{transaction.points}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Purchase History</h3>
                  <div className="bg-gray-50 rounded-lg p-4">
                    {selectedMember.purchaseHistory.map((purchase) => (
                      <div key={purchase.id} className="flex items-center justify-between py-2 border-b border-gray-200 last:border-b-0">
                        <div>
                          <p className="text-sm font-medium">฿{purchase.total.toLocaleString()}</p>
                          <p className="text-xs text-gray-500">
                            {purchase.items} items • {purchase.paymentMethod} • {purchase.date.toLocaleDateString()}
                          </p>
                        </div>
                        <button className="text-blue-600 hover:text-blue-800 text-sm">
                          View Details
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6 pt-6 border-t">
              <button
                onClick={() => setShowDetailsModal(false)}
                className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
              >
                ปิด
              </button>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
                แก้ไขข้อมูล
              </button>
            </div>
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
        <h1 className="text-2xl font-bold text-gray-900">Enhanced Member Management</h1>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center space-x-2"
        >
          <Plus className="h-5 w-5" />
          <span>เพิ่มสมาชิก</span>
        </button>
      </div>

      {/* Enhanced Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Members</p>
              <p className="text-2xl font-bold text-gray-900">{members.length}</p>
            </div>
            <Users className="h-8 w-8 text-blue-600" />
          </div>
          <p className="text-sm text-green-600 mt-2">+12% this month</p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Points</p>
              <p className="text-2xl font-bold text-gray-900">
                {members.reduce((sum, member) => sum + member.points, 0).toLocaleString()}
              </p>
            </div>
            <Gift className="h-8 w-8 text-green-600" />
          </div>
          <p className="text-sm text-green-600 mt-2">+8% this month</p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Lifetime Value</p>
              <p className="text-2xl font-bold text-gray-900">
                ฿{members.reduce((sum, member) => sum + member.totalSpent, 0).toLocaleString()}
              </p>
            </div>
            <TrendingUp className="h-8 w-8 text-purple-600" />
          </div>
          <p className="text-sm text-green-600 mt-2">+15% this month</p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Gold+ Members</p>
              <p className="text-2xl font-bold text-gray-900">
                {members.filter(m => m.tier === 'gold' || m.tier === 'platinum').length}
              </p>
            </div>
            <Star className="h-8 w-8 text-yellow-600" />
          </div>
          <p className="text-sm text-green-600 mt-2">+5% this month</p>
        </div>
      </div>

      {/* Enhanced Search and Filters */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search members by name, phone, or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          
          <select
            value={filterTier}
            onChange={(e) => setFilterTier(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Tiers</option>
            <option value="bronze">Bronze</option>
            <option value="silver">Silver</option>
            <option value="gold">Gold</option>
            <option value="platinum">Platinum</option>
          </select>
        </div>
      </div>

      {/* Enhanced Members Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredMembers.map((member) => (
          <div key={member.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{member.name}</h3>
                  <div className="flex items-center space-x-1">
                    {getTierIcon(member.tier)}
                    <span className={`px-2 py-1 text-xs font-medium rounded-full capitalize ${getTierColor(member.tier)}`}>
                      {member.tier}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex space-x-1">
                <button
                  onClick={() => {
                    setSelectedMember(member);
                    setShowDetailsModal(true);
                  }}
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                >
                  <History className="h-4 w-4" />
                </button>
                <button 
                  onClick={() => handleEdit(member)}
                  className="p-2 text-gray-600 hover:bg-gray-50 rounded-md transition-colors"
                >
                  <Edit2 className="h-4 w-4" />
                </button>
                <button 
                  onClick={() => handleDelete(member.id)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Phone className="h-4 w-4 text-gray-400" />
                <span className="text-sm text-gray-600">{member.phone}</span>
              </div>
              
              {member.email && (
                <div className="flex items-center space-x-2">
                  <Mail className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-600">{member.email}</span>
                </div>
              )}

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Gift className="h-4 w-4 text-green-500" />
                  <span className="text-sm font-medium text-green-600">
                    {member.points.toLocaleString()} points
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <CreditCard className="h-4 w-4 text-purple-500" />
                  <span className="text-sm font-medium text-purple-600">
                    ฿{member.totalSpent.toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between text-sm text-gray-500">
                <div className="flex items-center space-x-1">
                  <Calendar className="h-4 w-4" />
                  <span>Joined {new Date(member.createdAt).toLocaleDateString()}</span>
                </div>
                <span>Last visit {new Date(member.lastVisit).toLocaleDateString()}</span>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-200">
              <button
                onClick={() => {
                  setSelectedMember(member);
                  setShowDetailsModal(true);
                }}
                className="w-full bg-blue-100 text-blue-700 py-2 px-4 rounded-md hover:bg-blue-200 transition-colors text-sm font-medium"
              >
                ดูรายละเอียด
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredMembers.length === 0 && (
        <div className="text-center py-12">
          <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">No members found</p>
        </div>
      )}

      {/* Member Details Modal */}
      {showDetailsModal && <MemberDetailsModal />}
      
      {/* Add/Edit Member Modal */}
      {showAddModal && <MemberModal />}
    </div>
  );
};

export default EnhancedMemberManagement;