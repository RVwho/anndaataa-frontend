import React, { useState, useRef, useEffect } from 'react';
import { Loader2, Scan, Camera, MapPin, AlertCircle, RefreshCw } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Scanner = ({ setCurrentView }) => {
  const { setRecommendedTreatment, t } = useAuth();
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [error, setError] = useState(null);

  const fileInputRef = useRef(null);

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const compressImage = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target.result;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;

          if (width > 800) {
            height = Math.round((height * 800) / width);
            width = 800;
          }

          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext('2d');
          if (!ctx) {
            reject(new Error('Canvas context could not be created'));
            return;
          }
          ctx.drawImage(img, 0, 0, width, height);

          canvas.toBlob(
            (blob) => {
              if (blob) {
                const compressedFile = new File([blob], file.name || 'compressed.jpg', {
                  type: 'image/jpeg',
                  lastModified: Date.now(),
                });
                resolve(compressedFile);
              } else {
                reject(new Error('Canvas compression failed'));
              }
            },
            'image/jpeg',
            0.7
          );
        };
        img.onerror = (err) => reject(err);
      };
      reader.onerror = (err) => reject(err);
    });
  };

  const triggerFileInput = () => {
    if (isLoading) return;
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }

    setIsLoading(true);
    setError(null);
    setAnalysisResult(null);

    try {
      const compressedFile = await compressImage(file);
      const url = URL.createObjectURL(compressedFile);
      setSelectedFile(compressedFile);
      setPreviewUrl(url);
      await uploadAndAnalyze(compressedFile);
    } catch (err) {
      setError('Network Error: Failed to reach the AI analysis server.');
      setIsLoading(false);
    }
  };

  const uploadAndAnalyze = async (fileToUpload) => {
    if (!fileToUpload) return;
    setIsLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append('file', fileToUpload);

    try {
      const response = await fetch('http://localhost:8000/api/analyze-crop', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Server error');
      }

      const data = await response.json();
      setAnalysisResult(data);
      setRecommendedTreatment({
        chemical: data.primary_chemical,
        instructions: data.application_steps
      });

      const newScan = {
        id: Date.now(),
        date: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
        disease: data.disease,
        chemical: data.primary_chemical
      };
      try {
        const existingScans = JSON.parse(localStorage.getItem('anndaataa_scans')) || [];
        const updatedScans = [newScan, ...existingScans].slice(0, 5);
        localStorage.setItem('anndaataa_scans', JSON.stringify(updatedScans));
      } catch (e) {
      }
    } catch (err) {
      setError('Network Error: Failed to reach the AI analysis server.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRetry = (e) => {
    e.stopPropagation();
    uploadAndAnalyze(selectedFile);
  };

  const resetScanner = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    setSelectedFile(null);
    setPreviewUrl(null);
    setAnalysisResult(null);
    setError(null);
    setIsLoading(false);
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-6 flex flex-col">
      <style>{`
        @keyframes scan-line {
          0% { top: 0%; }
          50% { top: 100%; }
          100% { top: 0%; }
        }
      `}</style>

      <header className="mb-2">
        <h1 className="text-2xl font-bold text-slate-900">{t('Crop Health Scanner')}</h1>
        <p className="text-slate-500 mt-1">{t('Take a clear photo of the affected plant')}</p>
      </header>

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        capture="environment"
        className="hidden"
      />

      <div
        onClick={triggerFileInput}
        className={`relative border-2 border-dashed rounded-3xl p-8 flex flex-col items-center justify-center min-h-[300px] cursor-pointer overflow-hidden transition-all ${
          analysisResult
            ? 'border-emerald-200 bg-emerald-50/50'
            : error
            ? 'border-red-300 bg-red-50/30'
            : 'border-slate-300 bg-white hover:border-emerald-400 hover:bg-slate-50'
        } ${isLoading ? 'pointer-events-none' : ''}`}
      >
        {previewUrl && (
          <img
            src={previewUrl}
            alt="Preview"
            className="absolute inset-0 w-full h-full object-cover rounded-3xl"
          />
        )}

        {isLoading ? (
          <div className="absolute inset-0 bg-slate-900/60 rounded-3xl flex flex-col items-center justify-center text-white p-4">
            <div className="absolute left-0 w-full h-1 bg-emerald-500 shadow-[0_0_15px_#10b981]" style={{ animation: 'scan-line 2.5s infinite linear' }} />
            <Loader2 size={48} className="animate-spin mb-4 text-emerald-400" />
            <span className="font-semibold text-lg animate-pulse text-emerald-300">{t('Scanning Crop...')}</span>
          </div>
        ) : error ? (
          <div className="absolute inset-0 bg-slate-950/80 rounded-3xl flex flex-col items-center justify-center text-red-200 p-6 text-center">
            <AlertCircle size={48} className="mb-4 text-red-500" />
            <span className="font-semibold text-lg mb-2">{t('Scan Failed')}</span>
            <p className="text-sm text-red-300 mb-6 max-w-xs">{t(error)}</p>
            <button
              onClick={handleRetry}
              className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl flex items-center gap-2 transition-colors shadow-md"
            >
              <RefreshCw size={18} />
              {t('Retry Scan')}
            </button>
          </div>
        ) : analysisResult ? (
          <div className="absolute inset-0 bg-emerald-950/40 rounded-3xl flex flex-col items-center justify-center text-white p-4">
            <div className="w-16 h-16 bg-emerald-500/80 rounded-full flex items-center justify-center mb-2 shadow-lg">
              <Scan size={28} className="text-white" />
            </div>
            <span className="font-bold text-lg">{t('Scan Complete')}</span>
          </div>
        ) : (
          !previewUrl && (
            <div className="flex flex-col items-center text-slate-400">
              <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                <Camera size={32} className="text-slate-500" />
              </div>
              <span className="font-medium text-slate-600">{t('Tap to upload or take photo')}</span>
            </div>
          )
        )}
      </div>

      {analysisResult && (
        <div className="bg-white rounded-2xl p-5 shadow-lg border border-slate-100 animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900 mb-4">{t('Analysis Results')}</h2>
            <div className="space-y-3 mb-6">
              <div className="flex justify-between">
                <span className="text-slate-500">{t('Disease Detected')}</span>
                <span className="font-bold text-red-600">{analysisResult.disease}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">{t('Confidence')}</span>
                <span className="font-bold text-emerald-600">
                  {typeof analysisResult.confidence === 'number'
                    ? Math.round(analysisResult.confidence * 100) + '%'
                    : analysisResult.confidence}
                </span>
              </div>
              <div className="flex flex-col gap-1 mt-4 pt-4 border-t border-slate-100">
                <span className="text-slate-500">{t('Recommended Treatment')}</span>
                <span className="font-semibold text-slate-900">{analysisResult.primary_chemical}</span>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={resetScanner}
              className="flex-1 border-2 border-slate-200 hover:border-slate-300 text-slate-700 font-bold py-4 rounded-2xl transition-colors active:scale-95 text-center"
            >
              {t('Scan Another Crop')}
            </button>
            <button
              onClick={() => setCurrentView('market')}
              className="flex-1 bg-emerald-800 hover:bg-emerald-900 text-white font-bold py-4 rounded-2xl shadow-md transition-transform active:scale-95 flex items-center justify-center gap-2"
            >
              <MapPin size={20} />
              {t('Find Treatment')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Scanner;
