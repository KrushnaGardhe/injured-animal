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



function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50">
        {/* <Navbar /> */}
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