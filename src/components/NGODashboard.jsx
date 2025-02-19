import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { supabase } from '../lib/supabase';
import 'leaflet/dist/leaflet.css';
import { PawPrint, LogOut } from 'lucide-react';

export default function NGODashboard() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState([18.5204, 73.8567]); // Default: Pune
  const navigate = useNavigate();

  useEffect(() => {
    checkAuth();
    fetchReports();
    getUserLocation();
  }, []);

  const checkAuth = async () => {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) {
      console.error('Auth check error:', error);
      return;
    }
    if (!session) {
      navigate('/ngo/login');
    }
  };

  const fetchReports = async () => {
    try {
      const { data, error } = await supabase
        .from('reports')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setReports(data || []);
    } catch (error) {
      console.error('Error fetching reports:', error);
      // alert('Error fetching reports');
    } finally {
      setLoading(false);
    }
  };

  const getUserLocation = () => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation([position.coords.latitude, position.coords.longitude]);
        },
        (error) => {
          console.error('Error fetching location:', error);
        }
      );
    }
  };

  const updateReportStatus = async (id, status) => {
    try {
      const { error } = await supabase
        .from('reports')
        .update({ status })
        .eq('id', id);

      if (error) throw error;

      setReports(reports.map(report =>
        report.id === id ? { ...report, status } : report
      ));
    } catch (error) {
      console.error('Error updating report:', error);
      // alert('Error updating report status');
    }
  };

  const ChangeView = () => {
    const map = useMap();
    map.setView(userLocation, 13);
    return null;
  };

  if (loading) {
    return <div className="mt-[400px] ml-[500px] text-5xl">Loading...</div>;
  }

  return (
    <div>
      <nav className="bg-white shadow-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between h-16">
                <div className="flex">
                  <div  className="flex items-center">
                    <PawPrint className="h-8 w-8 text-indigo-600" />
                    <span className="ml-2 text-xl font-bold text-gray-900">Animal Rescue</span>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  
                        <Link
                          to="/ngo/login"
                          className="px-4 py-2 rounded-md text-sm font-medium text-white bg-red-500 hover:bg-red-700"
                        >
                          Logout
                        </Link>
                        
                </div>
              </div>
            </div>
          </nav>
    <div className="space-y-6">
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Reports Map</h2>
        <div className="h-[400px] rounded-lg overflow-hidden">
          <MapContainer
            center={userLocation}
            zoom={13}
            style={{ height: '100%', width: '100%' }}
          >
            <ChangeView />
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            {reports
              .filter(report => report.latitude && report.longitude)
              .map((report) => (
                <Marker key={report.id} position={[report.latitude, report.longitude]}>
                  <Popup>
                    <div className="max-w-xs">
                      <img src={report.image_url} alt="Animal" className="w-full rounded-lg mb-2" />
                      <p className="text-sm">{report.description}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        Status: {report.status}
                      </p>
                    </div>
                  </Popup>
                </Marker>
              ))}
          </MapContainer>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Reports List</h2>
        <div className="space-y-4">
          {reports.map((report) => (
            <div key={report.id} className="border rounded-lg p-4">
              <div className="flex items-start space-x-4">
                <img
                  src={report.image_url}
                  alt="Animal"
                  className="w-32 h-32 object-cover rounded-lg"
                />
                <div className="flex-1">
                  <p className="text-gray-900">{report.description}</p>
                  <p className="text-sm text-gray-500 mt-1">
                    Reported on: {new Date(report.created_at).toLocaleDateString()}
                  </p>
                  <p className="text-sm text-gray-500">
                    Status: <span className="font-medium">{report.status}</span>
                  </p>
                  {report.status === 'pending' && (
                    <div className="mt-4 space-x-2">
                      <button
                        onClick={() => updateReportStatus(report.id, 'accepted')}
                        className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                      >
                        Accept
                      </button>
                      <button
                        onClick={() => updateReportStatus(report.id, 'declined')}
                        className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                      >
                        Decline
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
    </div>
  );
}
