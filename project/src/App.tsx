import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import { Shield, AlertTriangle, AlertCircle, Info, Search, UserPlus, FileUp, LogOut } from 'lucide-react';
import { supabase } from './lib/supabase';
import AdminDashboard from './pages/AdminDashboard';
import AdvisoriesList from './pages/AdvisoriesList';
import Login from './pages/Login';

function App() {
  const [session, setSession] = React.useState(null);
  const [isAdmin, setIsAdmin] = React.useState(false);

  React.useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      checkAdminStatus(session?.user?.id);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      checkAdminStatus(session?.user?.id);
    });

    return () => subscription.unsubscribe();
  }, []);

  const checkAdminStatus = async (userId: string | undefined) => {
    if (!userId) return;
    
    const { data } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .single();
    
    setIsAdmin(data?.role === 'admin');
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  if (!session) {
    return <Login />;
  }

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between">
              <Link to="/" className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <Shield className="w-8 h-8 text-indigo-600" />
                Security Advisories
              </Link>
              <div className="flex items-center gap-4">
                {isAdmin && (
                  <>
                    <Link
                      to="/admin/users"
                      className="flex items-center gap-2 px-4 py-2 rounded-lg text-gray-700 hover:bg-gray-100"
                    >
                      <UserPlus className="w-5 h-5" />
                      Manage Users
                    </Link>
                    <Link
                      to="/admin/advisories"
                      className="flex items-center gap-2 px-4 py-2 rounded-lg text-gray-700 hover:bg-gray-100"
                    >
                      <FileUp className="w-5 h-5" />
                      New Advisory
                    </Link>
                  </>
                )}
                <button
                  onClick={handleSignOut}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg text-gray-700 hover:bg-gray-100"
                >
                  <LogOut className="w-5 h-5" />
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        </header>

        <Routes>
          <Route path="/" element={<AdvisoriesList />} />
          {isAdmin && (
            <>
              <Route path="/admin/*" element={<AdminDashboard />} />
            </>
          )}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;