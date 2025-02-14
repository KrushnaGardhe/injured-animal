import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import { PawPrint, LogOut } from 'lucide-react';
import { supabase } from './lib/supabase';
import ReportForm from './components/ReportForm';
import NGOLogin from './components/NGOLogin';
import NGORegister from './components/NGORegister';
import NGODashboard from './components/NGODashboard';
import HomePage from './components/HomePage';
import Sub from './components/Sub';

function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    setUser(session?.user || null);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    navigate('/ngo/login');
  };

  const isDashboard = location.pathname === "/ngo/dashboard";

  return (
    <nav className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <Link to="/" className="flex items-center">
              <PawPrint className="h-8 w-8 text-indigo-600" />
              <span className="ml-2 text-xl font-bold text-gray-900">Animal Rescue</span>
            </Link>
          </div>
          <div className="flex items-center space-x-4">
            {!user ? (
              !isDashboard && (
                <>
                  <Link
                    to="/ngo/register"
                    className="px-4 py-2 rounded-md text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
                  >
                    Register NGO
                  </Link>
                  <Link
                    to="/ngo/login"
                    className="px-4 py-2 rounded-md text-sm font-medium text-indigo-600 hover:text-indigo-500"
                  >
                    NGO Login
                  </Link>
                </>
              )
            ) : (
              isDashboard && (
                <button
                  onClick={handleLogout}
                  className="flex items-center px-4 py-2 rounded-md text-sm font-medium text-white bg-red-600 hover:bg-red-700"
                >
                  <LogOut className="h-5 w-5 mr-2" />
                  Logout
                </button>
              )
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <main className="max-w-7xl mx-auto py-3 sm:px-6 lg:px-8">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/Report" element={<ReportForm />} />
            <Route path="/ngo/login" element={<NGOLogin />} />
            <Route path="/ngo/register" element={<NGORegister />} />
            <Route path="/Sub" element={<Sub />} />
            <Route path="/ngo/dashboard" element={<NGODashboard />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
