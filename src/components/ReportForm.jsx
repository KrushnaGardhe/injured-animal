import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import { Camera, RefreshCw } from 'lucide-react';
import { Link } from "react-router-dom";
import { supabase } from '../lib/supabase';
import 'leaflet/dist/leaflet.css';

function LocationMarker({ position, setPosition }) {
  const map = useMap();

  useMapEvents({
    click(e) {
      setPosition([e.latlng.lat, e.latlng.lng]);
    },
  });

  useEffect(() => {
    if (position) {
      map.setView(position, map.getZoom());
    }
  }, [position, map]);

  return position ? <Marker position={position} /> : null;
}

function AutoLocate({ setPosition }) {
  const map = useMap();

  useEffect(() => {
    map.locate();

    map.on('locationfound', (e) => {
      setPosition([e.latlng.lat, e.latlng.lng]);
      map.flyTo(e.latlng, map.getZoom());
    });

    map.on('locationerror', () => {
      console.log('Could not find location.');
    });
  }, [map, setPosition]);

  return null;
}

export default function ReportForm() {
  const [description, setDescription] = useState('');
  const [position, setPosition] = useState(null);
  const [image, setImage] = useState(null);
  const [showCamera, setShowCamera] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [cameraFacingMode, setCameraFacingMode] = useState('environment');
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const startCamera = async (facingMode = cameraFacingMode) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode }
      });
      console.log('Camera stream accessed successfully:', stream);

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      streamRef.current = stream;
      setShowCamera(true);
    } catch (err) {
      console.error('Error accessing camera:', err);
      alert('Could not access camera. Please make sure you have granted camera permissions.');
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  };

  const flipCamera = () => {
    stopCamera();
    const newFacingMode = cameraFacingMode === 'environment' ? 'user' : 'environment';
    setCameraFacingMode(newFacingMode);
    startCamera(newFacingMode);
  };

  const capturePhoto = () => {
    const video = videoRef.current;
    if (!video || !video.videoWidth || !video.videoHeight) {
      console.error('Video element or video dimensions are not available.');
      return;
    }

    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const context = canvas.getContext('2d');
    if (context) {
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      canvas.toBlob(async (blob) => {
        if (blob) {
          setImage(blob);
          setShowCamera(false);
          stopCamera();
        } else {
          console.error('Failed to create image blob.');
        }
      }, 'image/jpeg', 0.8);
    } else {
      console.error('Could not get canvas context.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!position || !image) return;

    setSubmitting(true);
    try {
      const fileName = `${Date.now()}.jpg`;
      const { data: imageData, error: uploadError } = await supabase.storage
        .from('animal-images')
        .upload(fileName, image);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('animal-images')
        .getPublicUrl(fileName);

      const { error: reportError } = await supabase
        .from('reports')
        .insert({
          description,
          latitude: position[0],
          longitude: position[1],
          image_url: publicUrl,
          status: 'pending'
        });

      if (reportError) throw reportError;

      setDescription('');
      setPosition(null);
      setImage(null);
      alert('Report submitted successfully!');
    } catch (error) {
      console.error('Error submitting report:', error);
      alert('Error submitting report. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-lg shadow p-6 flex flex-col items-center">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Report an Animal in Need</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="flex flex-col items-center">
          <label className="block text-xl font-medium text-gray-700">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            className="mt-1 border-2 block w-full rounded-md border-black shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            rows={4}
            placeholder="Describe the animal's condition..."
          />
        </div>

        <div className="flex w-[340px] sm:w-[500px] flex-col items-center justify-center bg-zinc-100 rounded-3xl gap-4 h-[550px]">
          <label className="block text-2xl font-medium text-gray-700 mb-2 m-auto">Location</label>
          <div className="h-[400px] w-[320px] sm:w-[450px] rounded-2xl overflow-hidden flex justify-center items-center bg-black">
            <MapContainer
              center={[51.505, -0.09]}
              zoom={13}
              style={{ height: '100%', width: '100%' }}>
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              <LocationMarker position={position} setPosition={setPosition} />
              <AutoLocate setPosition={setPosition} />
            </MapContainer>
          </div>
          <div className="mt-2 flex gap-4 items-center m-auto sm:gap-28">
            <p className="text-md text-black">
              {position ? 'Select Location' : 'click on map'}
            </p>
            <p className="text-md">OR</p>
            <button
              type="button"
              onClick={() => navigator.geolocation.getCurrentPosition(
                (position) => setPosition([position.coords.latitude, position.coords.longitude])
              )}
              className="text-sm text-white w-32 rounded-full h-10 bg-black"
            >
              Use my location
            </button>
          </div>
        </div>

        <div className="flex flex-col items-center">
          <label className="block text-2xl font-medium text-gray-700 mb-2">Photo</label>
          {showCamera ? (
            <div className="relative">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                className="w-full rounded-lg"
              />
              <button
                type="button"
                onClick={capturePhoto}
                className="absolute bottom-4 left-1/2 transform -translate-x-1/2 px-4 py-2 bg-indigo-600 text-white rounded-full shadow-lg hover:bg-indigo-700"
              >
                Take Photo
              </button>
              <button
                type="button"
                onClick={flipCamera}
                className="absolute bottom-4 right-4 px-4 py-2 bg-gray-600 text-white rounded-full shadow-lg hover:bg-gray-700"
              >
                <RefreshCw className="w-5 h-5" />
              </button>
            </div>
          ) : (
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg">
              <div className="space-y-1 text-center">
                {image ? (
                  <div className="space-y-4">
                    <img
                      src={URL.createObjectURL(image)}
                      alt="Preview"
                      className="mx-auto h-32 w-32 object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => setImage(null)}
                      className="text-sm text-red-600 hover:text-red-500"
                    >
                      Remove photo
                    </button>
                  </div>
                ) : (
                  <>
                    <Camera className="mx-auto h-12 w-60 sm:w-[400px] sm:h-14 text-gray-400" />
                    <div className="flex justify-center">
                      <button
                        type="button"
                        onClick={startCamera}
                        className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
                      >
                        Take a photo
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-center">
          <Link to="/Sub" className="w-[220px] bg-black text-white h-10 rounded-lg flex justify-center items-center">
            <button
              type="submit"
              disabled={submitting || !position || !image || !description}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-black disabled:bg-gray-400 disabled:rounded-md disabled:border-2"
            >
              {submitting ? 'Submitting...' : 'Submit Report'}
            </button>
          </Link>
        </div>
      </form>
    </div>
  );
}