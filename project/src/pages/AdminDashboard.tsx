import React from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import ManageUsers from './ManageUsers';
import CreateAdvisory from './CreateAdvisory';

export default function AdminDashboard() {
  const navigate = useNavigate();

  React.useEffect(() => {
    checkAdmin();
  }, []);

  const checkAdmin = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate('/');
      return;
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profile?.role !== 'admin') {
      navigate('/');
    }
  };

  return (
    <Routes>
      <Route path="users" element={<ManageUsers />} />
      <Route path="advisories" element={<CreateAdvisory />} />
    </Routes>
  );
}