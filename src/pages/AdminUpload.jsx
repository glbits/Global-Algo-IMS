import React, { useState } from 'react';
import api from '../api/axios';
import { UploadCloud, FileSpreadsheet, CheckCircle, AlertCircle } from 'lucide-react';

const AdminUpload = () => {
  const [file, setFile] = useState(null);
  const [msg, setMsg] = useState({ text: '', type: '' });
  const [loading, setLoading] = useState(false);

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return setMsg({ text: 'Please select a file.', type: 'error' });
    const formData = new FormData();
    formData.append('file', file);

    try {
      setLoading(true);
      const res = await api.post('/leads/upload', formData);
      setMsg({ text: res.data.msg, type: 'success' });
    } catch (err) {
      setMsg({ text: err.response?.data?.msg || "Upload Failed", type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold text-brand-dark mb-6 flex items-center gap-2">
        <UploadCloud /> Data Ingestion
      </h1>

      <div className="bg-white rounded-xl shadow-lg border-t-4 border-brand-medium p-8">
        <p className="text-gray-500 mb-6">
          Upload raw Excel files (.xlsx). The system will automatically remove duplicates and prepare leads for distribution.
        </p>

        {msg.text && (
          <div className={`mb-6 p-4 rounded-lg flex items-center gap-3 ${
            msg.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}>
            {msg.type === 'success' ? <CheckCircle size={20}/> : <AlertCircle size={20}/>}
            {msg.text}
          </div>
        )}

        <form onSubmit={handleUpload} className="space-y-6">
          <div className="border-2 border-dashed border-gray-300 rounded-xl p-10 text-center hover:bg-gray-50 transition cursor-pointer relative">
            <input 
              type="file" 
              accept=".xlsx, .xls"
              onChange={(e) => setFile(e.target.files[0])}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <div className="text-gray-400">
              <FileSpreadsheet className="mx-auto mb-3" size={48} />
              <span className="text-lg font-medium text-brand-medium block">
                {file ? file.name : "Click or Drag Excel File Here"}
              </span>
              <span className="text-xs text-gray-400 mt-2 block">Supported formats: .xlsx, .xls</span>
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading || !file}
            className="w-full bg-brand-medium hover:bg-brand-dark text-white font-bold py-4 rounded-lg transition disabled:opacity-50 text-lg shadow-md"
          >
            {loading ? 'Processing Upload...' : 'Upload Data'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminUpload;