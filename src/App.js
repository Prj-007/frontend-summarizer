import React, { useMemo, useState } from 'react';
import axios from 'axios';
import {
  CheckCircle2,
  Clipboard,
  FileText,
  Loader2,
  Server,
  Sparkles,
  UploadCloud,
} from 'lucide-react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './App.css';

const API_BASE_URL = (process.env.REACT_APP_API_URL || 'http://localhost:8080').replace(/\/$/, '');

const formatBytes = (bytes) => {
  if (!bytes && bytes !== 0) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

function App() {
  const [file, setFile] = useState(null);
  const [docId, setDocId] = useState('');
  const [summary, setSummary] = useState('');
  const [loadingAction, setLoadingAction] = useState('');
  const [extractedText, setExtractedText] = useState('');
  const [lastAction, setLastAction] = useState('');

  const hasDocument = Boolean(docId);
  const isBusy = Boolean(loadingAction);

  const fileLabel = useMemo(() => {
    if (!file) return 'No file selected';
    return `${file.name} - ${formatBytes(file.size)}`;
  }, [file]);

  const onFileChange = (event) => {
    const selectedFile = event.target.files?.[0];
    setFile(selectedFile || null);
    setDocId('');
    setSummary('');
    setExtractedText('');
    setLastAction('');
  };

  const upload = async () => {
    if (!file) {
      toast.error('Choose a document first');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    try {
      setLoadingAction('upload');
      const res = await axios.post(`${API_BASE_URL}/api/document/upload`, formData);
      setDocId(res.data);
      setSummary('');
      setExtractedText('');
      setLastAction('Document uploaded');
      toast.success('Document uploaded');
    } catch (err) {
      console.error(err);
      toast.error('Upload failed');
    } finally {
      setLoadingAction('');
    }
  };

  const extract = async () => {
    if (!docId) {
      toast.error('Upload a document first');
      return;
    }

    try {
      setLoadingAction('extract');
      const res = await axios.post(`${API_BASE_URL}/api/document/extract-text/${docId}`);
      setExtractedText(res.data);
      setLastAction('Text extracted');
      toast.success('Text extracted');
    } catch (err) {
      console.error(err);
      toast.error('Text extraction failed');
    } finally {
      setLoadingAction('');
    }
  };

  const summarize = async () => {
    if (!docId) {
      toast.error('Upload a document first');
      return;
    }

    try {
      setLoadingAction('summarize');
      const res = await axios.post(`${API_BASE_URL}/api/document/summarize/${docId}`);
      setSummary(res.data);
      setLastAction('Summary generated');
      toast.success('Summary generated');
    } catch (err) {
      console.error(err);
      toast.error('Summary failed');
    } finally {
      setLoadingAction('');
    }
  };

  const copyText = async (value, label) => {
    if (!value) return;
    await navigator.clipboard.writeText(value);
    toast.success(`${label} copied`);
  };

  const ActionIcon = loadingAction ? Loader2 : CheckCircle2;

  return (
    <main className="app-shell">
      <header className="top-bar">
        <div>
          <div className="eyebrow">Document Workspace</div>
          <h1>Document Summarizer</h1>
        </div>
        <div className="api-status">
          <Server size={16} />
          <span>API connected</span>
        </div>
      </header>

      <section className="workspace">
        <div className="panel control-panel">
          <div className="section-heading">
            <div>
              <span className="section-kicker">Source</span>
              <h2>Upload</h2>
            </div>
            {hasDocument && (
              <span className="ready-pill">
                <CheckCircle2 size={14} />
                Ready
              </span>
            )}
          </div>

          <label className="upload-zone" htmlFor="document-file">
            <UploadCloud size={28} />
            <span>{file ? file.name : 'Select a document'}</span>
            <small>{file ? formatBytes(file.size) : 'PDF or TXT'}</small>
          </label>
          <input
            id="document-file"
            className="file-input"
            type="file"
            accept=".pdf,.txt,application/pdf,text/plain"
            onChange={onFileChange}
          />

          <div className="file-row">
            <FileText size={18} />
            <span>{fileLabel}</span>
          </div>

          <div className="action-grid">
            <button className="button primary" onClick={upload} disabled={!file || isBusy}>
              {loadingAction === 'upload' ? <Loader2 className="spin" size={18} /> : <UploadCloud size={18} />}
              Upload
            </button>
            <button className="button secondary" onClick={extract} disabled={!hasDocument || isBusy}>
              {loadingAction === 'extract' ? <Loader2 className="spin" size={18} /> : <FileText size={18} />}
              Extract
            </button>
            <button className="button accent" onClick={summarize} disabled={!hasDocument || isBusy}>
              {loadingAction === 'summarize' ? <Loader2 className="spin" size={18} /> : <Sparkles size={18} />}
              Summarize
            </button>
          </div>

          <div className="status-card">
            <ActionIcon className={loadingAction ? 'spin' : ''} size={18} />
            <div>
              <span>Status</span>
              <strong>{loadingAction ? `${loadingAction} in progress` : lastAction || 'Waiting for document'}</strong>
            </div>
          </div>
        </div>

        <div className="panel result-panel">
          <div className="section-heading">
            <div>
              <span className="section-kicker">Output</span>
              <h2>Results</h2>
            </div>
          </div>

          <div className="result-section summary-section">
            <div className="result-header">
              <h3>Summary</h3>
              <button className="icon-button" onClick={() => copyText(summary, 'Summary')} disabled={!summary}>
                <Clipboard size={16} />
              </button>
            </div>
            {summary ? (
              <pre>{summary}</pre>
            ) : (
              <div className="empty-state">No summary yet</div>
            )}
          </div>

          <div className="result-section">
            <div className="result-header">
              <h3>Extracted Text</h3>
              <button className="icon-button" onClick={() => copyText(extractedText, 'Extracted text')} disabled={!extractedText}>
                <Clipboard size={16} />
              </button>
            </div>
            {extractedText ? (
              <pre>{extractedText}</pre>
            ) : (
              <div className="empty-state">No extracted text yet</div>
            )}
          </div>
        </div>
      </section>

      <ToastContainer autoClose={1800} position="bottom-right" />
    </main>
  );
}

export default App;
