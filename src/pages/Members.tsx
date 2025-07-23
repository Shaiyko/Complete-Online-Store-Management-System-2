import React, { useState, useEffect } from 'react';
import { apiService } from '../services/api';
import { Member } from '../types';
import EnhancedMemberManagement from '../components/EnhancedMemberManagement';
import { Users, Search, Plus, Gift, Phone, Calendar, TrendingUp } from 'lucide-react';

const Members: React.FC = () => {
  return (
    <EnhancedMemberManagement />
  );
};

export default Members;