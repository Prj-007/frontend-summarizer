import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Circles } from 'react-loader-spinner';
import axios from 'axios';
import './App.css';

function App() {
  const [file, setFile] = useState(null);
  const [docId, setDocId] = useState('');
  const [summary, setSummary] = useState('');
  const [loading, setLoading] = useState(false);
  const [extractedText, setExtractedText] = useState('');



  const upload = async () => {
    const formData = new FormData();
    formData.append("file", file);
    try {
    const res = await axios.post('http://localhost:8080/api/document/upload', formData);
    setDocId(res.data);
    toast.success(" File uploaded successfully!");
 
  } catch (err) {
    console.error(err);
    toast.error(" Failed to upload file");
  }
};


  const extract = async () => {
     if (!docId) {
    toast.error(" Please upload a file first");
    return;
  }
    try {
       setLoading(true);
    const res = await axios.post(`http://localhost:8080/api/document/extract-text/${docId}`);
    setExtractedText(res.data);
    toast.success("🔍 Text extracted successfully!");
     
  } catch (err) {
       console.error(err);
    toast.error(" Failed to extract text");
  }finally {
    setLoading(false);  // <-- important to reset loading here
  }
};

  const summarize = async () => {
    if (!docId) {
    toast.error(" Please upload a file first");
    return;
  }
    try {
      setLoading(true);
       setExtractedText('');
    const res = await axios.post(`http://localhost:8080/api/document/summarize/${docId}`);
    setSummary(res.data);
     toast.success(" Summary generated!");
 
    } catch (err) {
    console.error(err);
    toast.error(" Failed to summarize document");
  } finally {
    setLoading(false);
  }

};


  return (
    <div className="App">
      <h1>📄 Document Summarizer</h1>
      <input type="file" onChange={e => setFile(e.target.files[0])} />
      <div style={{ display: 'flex',justifyContent: 'center',marginTop: '20px' , gap: '20px' }}>
      <button onClick={upload}>Upload</button>
      <button onClick={extract} Extract={!docId}>Extract Text</button>
      <button onClick={summarize} Summarize={!docId}>Summarize</button>
      </div>

      {loading ? (
      <div className="loader-container">
        <Circles height="60" width="60" color="#4fa94d" />
      </div>
      ) : extractedText && (
  <div className="extracted-box" style={{ maxWidth: '100%', overflowX: 'auto' }}>
    <h2>📄 Extracted Text:</h2>
    <pre>{extractedText}</pre>
  </div>
)}
      {loading ? (
      <div className="loader-container">
        <Circles height="60" width="60" color="#4fa94d" />
      </div>
      ) : summary && (
        <div className="summary-box" style={{ maxWidth: '100%', overflowX: 'auto' }}>
          <h2>📝 Summary:</h2>
          <pre style={{ whiteSpace: 'pre-wrap', wordWrap: 'break-word' }}>{summary}</pre>
          {/* <p>{summary}</p> */}

        </div>
      )}
      <ToastContainer autoClose={1500} />
      
    </div>
  );
}

export default App;

