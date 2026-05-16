// src/pages/OCRScannerPage.jsx - Bill Image Scanner
import { useState, useRef } from 'react';
import api from '../utils/api';
import { ScanLine, Upload, CheckCircle, Plus, X, FileImage, Loader } from 'lucide-react';
import toast from 'react-hot-toast';

const CATEGORIES = [
  'Food & Dining', 'Travel & Transport', 'Shopping', 'Entertainment',
  'Health & Medical', 'Utilities & Bills', 'Education', 'Groceries',
  'Fuel', 'Subscriptions', 'Personal Care', 'Gifts & Donations', 'Other',
];

export default function OCRScannerPage() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [scanning, setScanning] = useState(false);
  const [scannedData, setScannedData] = useState(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file (JPEG, PNG, WebP)');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be smaller than 5MB');
      return;
    }

    setSelectedFile(file);
    setScannedData(null);
    setForm(null);

    // Create preview URL
    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target.result);
    reader.readAsDataURL(file);
  };

  const handleScan = async () => {
    if (!selectedFile) return toast.error('Please select a bill image first');

    setScanning(true);
    setScannedData(null);

    try {
      const formData = new FormData();
      formData.append('bill', selectedFile);

      const { data } = await api.post('/ocr/scan', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (data.success) {
        setScannedData(data.data);
        setForm({
          title: data.data.title || '',
          amount: data.data.amount || '',
          category: data.data.category || 'Other',
          date: data.data.date
            ? new Date(data.data.date).toISOString().split('T')[0]
            : new Date().toISOString().split('T')[0],
          notes: `Scanned bill. Raw OCR: ${data.data.rawText?.substring(0, 100) || ''}`,
          type: 'expense',
        });
        toast.success('Bill scanned successfully! ✨');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Scan failed. Try a clearer image.');
    } finally {
      setScanning(false);
    }
  };

  const handleSaveExpense = async () => {
    if (!form?.title || !form?.amount) {
      return toast.error('Please fill in title and amount');
    }
    setSaving(true);
    try {
      await api.post('/expenses', { ...form, fromOCR: true });
      toast.success('Expense saved from bill scan! 🎉');
      // Reset
      setSelectedFile(null);
      setPreview(null);
      setScannedData(null);
      setForm(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch {
      toast.error('Failed to save expense');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setSelectedFile(null);
    setPreview(null);
    setScannedData(null);
    setForm(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-2xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <ScanLine size={24} className="text-purple-500" />
          OCR Bill Scanner
        </h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
          Upload a photo of your bill — AI will extract the amount and details automatically
        </p>
      </div>

      {/* Upload Area */}
      <div className="card">
        <div
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
            preview
              ? 'border-purple-300 dark:border-purple-700 bg-purple-50 dark:bg-purple-900/10'
              : 'border-gray-200 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-700 hover:bg-purple-50 dark:hover:bg-purple-900/10'
          }`}
        >
          {preview ? (
            <div>
              <img
                src={preview}
                alt="Bill preview"
                className="max-h-64 mx-auto rounded-xl object-contain mb-3"
              />
              <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center justify-center gap-1">
                <FileImage size={14} /> {selectedFile?.name}
              </p>
            </div>
          ) : (
            <>
              <Upload size={36} className="text-gray-300 dark:text-gray-600 mx-auto mb-3" />
              <p className="text-gray-600 dark:text-gray-400 font-medium">Click to upload a bill image</p>
              <p className="text-gray-400 text-sm mt-1">JPEG, PNG or WebP • Max 5MB</p>
            </>
          )}
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={handleFileSelect}
          className="hidden"
        />

        <div className="flex gap-3 mt-4">
          {preview && (
            <button onClick={handleReset} className="btn-secondary flex items-center gap-2">
              <X size={15} /> Clear
            </button>
          )}
          <button
            onClick={handleScan}
            disabled={!selectedFile || scanning}
            className="btn-primary flex-1 flex items-center justify-center gap-2"
          >
            {scanning ? (
              <>
                <Loader size={16} className="animate-spin" />
                Scanning... (may take 10-30 seconds)
              </>
            ) : (
              <>
                <ScanLine size={16} /> Scan Bill
              </>
            )}
          </button>
        </div>

        {/* OCR Progress indicator */}
        {scanning && (
          <div className="mt-4 p-4 bg-purple-50 dark:bg-purple-900/10 rounded-xl">
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 border-2 border-purple-500 border-t-transparent rounded-full animate-spin flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-purple-700 dark:text-purple-300">AI is reading your bill...</p>
                <p className="text-xs text-purple-500 mt-0.5">Tesseract OCR → OpenAI extraction</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Extracted Data Form */}
      {form && scannedData && (
        <div className="card animate-slide-up">
          <div className="flex items-center gap-2 mb-5">
            <CheckCircle size={18} className="text-green-500" />
            <h2 className="font-semibold text-gray-900 dark:text-white">Extracted Data — Review & Save</h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Title / Description
              </label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                className="input"
                placeholder="Expense title"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Amount (₹)
                </label>
                <input
                  type="number"
                  value={form.amount}
                  onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))}
                  className="input"
                  placeholder="0.00"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Date
                </label>
                <input
                  type="date"
                  value={form.date}
                  onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
                  className="input"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Category
              </label>
              <select
                value={form.category}
                onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                className="input"
              >
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            {/* Raw OCR text (collapsed) */}
            {scannedData.rawText && (
              <details className="group">
                <summary className="text-xs text-gray-400 cursor-pointer hover:text-gray-600 select-none">
                  View raw OCR text
                </summary>
                <div className="mt-2 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <pre className="text-xs text-gray-600 dark:text-gray-400 whitespace-pre-wrap font-mono">
                    {scannedData.rawText}
                  </pre>
                </div>
              </details>
            )}

            <button
              onClick={handleSaveExpense}
              disabled={saving}
              className="btn-primary w-full flex items-center justify-center gap-2 py-3"
            >
              {saving
                ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                : <Plus size={16} />
              }
              Save as Expense
            </button>
          </div>
        </div>
      )}

      {/* How it works */}
      <div className="card bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900/10 dark:to-blue-900/10 border-purple-100 dark:border-purple-900/20">
        <h3 className="font-medium text-gray-900 dark:text-white mb-3 text-sm">How it works</h3>
        <div className="space-y-2">
          {[
            ['1', 'Upload a clear photo of your bill or receipt'],
            ['2', 'Tesseract OCR extracts all text from the image'],
            ['3', 'OpenAI AI intelligently parses amount, merchant & category'],
            ['4', 'Review the extracted data and save as an expense'],
          ].map(([n, text]) => (
            <div key={n} className="flex items-start gap-2">
              <span className="w-5 h-5 bg-purple-600 text-white rounded-full text-xs flex items-center justify-center flex-shrink-0 mt-0.5">
                {n}
              </span>
              <p className="text-sm text-gray-600 dark:text-gray-400">{text}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
