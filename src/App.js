import React, { useState, useRef } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axios from 'axios';
import './App.css';

const API_BASE_URL = (process.env.REACT_APP_API_URL || 'http://localhost:8080').replace(/\/$/, '');

function App() {
  const [file, setFile] = useState(null);
  const [docId, setDocId] = useState('');
  const [summary, setSummary] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingAction, setLoadingAction] = useState('');
  const [extractedText, setExtractedText] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const [step, setStep] = useState(0);
  const fileInputRef = useRef(null);

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped) setFile(dropped);
  };

  const upload = async () => {
    if (!file) {
      toast.error('Please select a file first');
      return;
    }
    const formData = new FormData();
    formData.append('file', file);
    try {
      setLoading(true);
      setLoadingAction('Uploading document...');
      const res = await axios.post(`${API_BASE_URL}/api/document/upload`, formData);
      setDocId(res.data);
      setStep(1);
      toast.success('File uploaded successfully!');
    } catch (err) {
      console.error(err);
      toast.error('Failed to upload file');
    } finally {
      setLoading(false);
      setLoadingAction('');
    }
  };

  const extract = async () => {
    if (!docId) {
      toast.error('Please upload a file first');
      return;
    }
    try {
      setLoading(true);
      setLoadingAction('Extracting text from document...');
      setSummary('');
      const res = await axios.post(`${API_BASE_URL}/api/document/extract-text/${docId}`);
      setExtractedText(res.data);
      setStep(2);
      toast.success('Text extracted successfully!');
    } catch (err) {
      console.error(err);
      toast.error('Failed to extract text');
    } finally {
      setLoading(false);
      setLoadingAction('');
    }
  };

  const summarize = async () => {
    if (!docId) {
      toast.error('Please upload a file first');
      return;
    }
    try {
      setLoading(true);
      setLoadingAction('AI is summarizing your document...');
      setExtractedText('');
      const res = await axios.post(`${API_BASE_URL}/api/document/summarize/${docId}`);
      setSummary(res.data);
      setStep(3);
      toast.success('Summary generated!');
    } catch (err) {
      console.error(err);
      toast.error('Failed to summarize document');
    } finally {
      setLoading(false);
      setLoadingAction('');
    }
  };

  const reset = () => {
    setFile(null);
    setDocId('');
    setSummary('');
    setExtractedText('');
    setStep(0);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const steps = [
    { label: 'Upload', icon: '1' },
    { label: 'Extract', icon: '2' },
    { label: 'Summarize', icon: '3' },
  ];

  return (
    <div className="app-wrapper">
      <div className="bg-gradient" />
      <div className="bg-blob blob-1" />
      <div className="bg-blob blob-2" />

      <header className="app-header">
        <div className="logo">
          <div className="logo-icon">D</div>
          <span className="logo-text">DocSum <span className="logo-ai">AI</span></span>
        </div>
        <p className="header-subtitle">AI-Powered Document Summarizer</p>
      </header>

      <main className="app-main">
        <div className="stepper">
          {steps.map((s, i) => (
            <React.Fragment key={i}>
              <div className={`step ${step > i ? 'completed' : ''} ${step === i ? 'active' : ''}`}>
                <div className="step-circle">
                  {step > i ? (
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <path d="M3 8.5L6.5 12L13 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  ) : (
                    <span>{s.icon}</span>
                  )}
                </div>
                <span className="step-label">{s.label.toUpperCase()}</span>
              </div>
              {i < steps.length - 1 && (
                <div className={`step-connector ${step > i ? 'completed' : ''}`} />
              )}
            </React.Fragment>
          ))}
        </div>

        <div className="card upload-card">
          <h2 className="card-title">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="17 8 12 3 7 8"/>
              <line x1="12" y1="3" x2="12" y2="15"/>
            </svg>
            Upload Document
          </h2>

          <div
            className={`dropzone ${dragOver ? 'drag-over' : ''} ${file ? 'has-file' : ''}`}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.txt"
              onChange={(e) => setFile(e.target.files[0])}
              hidden
            />
            {file ? (
              <div className="file-info">
                <div className="file-icon-wrapper">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                    <polyline points="14 2 14 8 20 8"/>
                    <line x1="16" y1="13" x2="8" y2="13"/>
                    <line x1="16" y1="17" x2="8" y2="17"/>
                    <polyline points="10 9 9 9 8 9"/>
                  </svg>
                </div>
                <div className="file-details">
                  <span className="file-name">{file.name}</span>
                  <span className="file-size">{(file.size / 1024).toFixed(1)} KB</span>
                </div>
                <button className="file-remove" onClick={(e) => { e.stopPropagation(); setFile(null); }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                  </svg>
                </button>
              </div>
            ) : (
              <div className="dropzone-content">
                <div className="dropzone-icon">
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                    <polyline points="17 8 12 3 7 8"/>
                    <line x1="12" y1="3" x2="12" y2="15"/>
                  </svg>
                </div>
                <p className="dropzone-text">Drag & drop your file here</p>
                <p className="dropzone-hint">or click to browse</p>
                <span className="dropzone-formats">Supports PDF, TXT</span>
              </div>
            )}
          </div>

          <div className="button-row">
            <button className="btn btn-primary" onClick={upload} disabled={!file || loading}>
              {loading && loadingAction.includes('Uploading') ? (
                <span className="btn-loading"><span className="spinner" /> Uploading...</span>
              ) : (
                <>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                    <polyline points="17 8 12 3 7 8"/>
                    <line x1="12" y1="3" x2="12" y2="15"/>
                  </svg>
                  Upload
                </>
              )}
            </button>
          </div>
        </div>

        {step >= 1 && (
          <div className="actions-row">
            <div className="card action-card">
              <div className="action-icon extract-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                </svg>
              </div>
              <h3>Extract Text</h3>
              <p className="action-desc">Pull all readable text from your uploaded document</p>
              <button className="btn btn-secondary" onClick={extract} disabled={loading}>
                {loading && loadingAction.includes('Extracting') ? (
                  <span className="btn-loading"><span className="spinner" /> Extracting...</span>
                ) : 'Extract Text'}
              </button>
            </div>

            <div className="card action-card">
              <div className="action-icon summarize-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                </svg>
              </div>
              <h3>Summarize</h3>
              <p className="action-desc">Generate an AI-powered summary using Gemini</p>
              <button className="btn btn-accent" onClick={summarize} disabled={loading}>
                {loading && loadingAction.includes('summarizing') ? (
                  <span className="btn-loading"><span className="spinner" /> Summarizing...</span>
                ) : 'Summarize'}
              </button>
            </div>
          </div>
        )}

        {loading && (
          <div className="loading-overlay">
            <div className="loading-card">
              <div className="loading-pulse" />
              <p className="loading-text">{loadingAction}</p>
            </div>
          </div>
        )}

        {extractedText && !loading && (
          <div className="card result-card extracted-result">
            <div className="result-header">
              <h2 className="result-title">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                  <polyline points="14 2 14 8 20 8"/>
                  <line x1="16" y1="13" x2="8" y2="13"/>
                  <line x1="16" y1="17" x2="8" y2="17"/>
                </svg>
                Extracted Text
              </h2>
              <span className="result-badge extract-badge">RAW TEXT</span>
            </div>
            <div className="result-body">
              <pre className="result-text">{extractedText}</pre>
            </div>
          </div>
        )}

        {summary && !loading && (
          <div className="card result-card summary-result">
            <div className="result-header">
              <h2 className="result-title">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                </svg>
                AI Summary
              </h2>
              <span className="result-badge summary-badge">GEMINI AI</span>
            </div>
            <div className="result-body">
              <pre className="result-text">{summary}</pre>
            </div>
          </div>
        )}

        {step >= 1 && !loading && (
          <button className="btn btn-ghost reset-btn" onClick={reset}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="1 4 1 10 7 10"/>
              <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/>
            </svg>
            Start Over
          </button>
        )}
      </main>

      <footer className="app-footer">
        <p>Built with React &amp; Spring Boot &middot; Powered by Gemini AI</p>
      </footer>

      <ToastContainer
        autoClose={2000}
        position="bottom-right"
        theme="colored"
        toastStyle={{ borderRadius: '12px', fontFamily: 'Inter, sans-serif' }}
      />
    </div>
  );
}

export default App;
