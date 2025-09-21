import React, { useState, useRef } from 'react';
import { profileService } from '../services/api';

const ResumeUpload = ({ onUploadSuccess, onUploadError }) => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [dragActive, setDragActive] = useState(false);
  const [parsedData, setParsedData] = useState(null);
  const fileInputRef = useRef(null);

  const acceptedTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain'
  ];

  const maxFileSize = 5 * 1024 * 1024; // 5MB

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (selectedFile) => {
    // Validate file type
    if (!acceptedTypes.includes(selectedFile.type)) {
      onUploadError('Please upload a PDF, DOC, DOCX, or TXT file.');
      return;
    }

    // Validate file size
    if (selectedFile.size > maxFileSize) {
      onUploadError('File size must be less than 5MB.');
      return;
    }

    setFile(selectedFile);
    setParsedData(null);
  };

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    setUploadProgress(0);

    try {
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + 10;
        });
      }, 200);

      const response = await profileService.uploadResume(file);
      
      clearInterval(progressInterval);
      setUploadProgress(100);

      if (response.success) {
        setParsedData(response.data);
        onUploadSuccess(response.data);
        
        // Auto-populate form fields if parsing was successful
        if (response.data.parsedFields) {
          populateFormFields(response.data.parsedFields);
        }
      } else {
        onUploadError(response.message || 'Upload failed');
      }
    } catch (error) {
      onUploadError('Error uploading resume: ' + error.message);
    } finally {
      setUploading(false);
      setTimeout(() => setUploadProgress(0), 2000);
    }
  };

  const populateFormFields = (fields) => {
    // This would be called by the parent component to populate form fields
    // with the parsed data from the resume
    console.log('Parsed fields:', fields);
  };

  const removeFile = () => {
    setFile(null);
    setParsedData(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="resume-upload">
      <div className="upload-container">
        <div
          className={`upload-area ${dragActive ? 'drag-active' : ''} ${file ? 'has-file' : ''}`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.doc,.docx,.txt"
            onChange={handleFileSelect}
            style={{ display: 'none' }}
          />

          {!file ? (
            <div className="upload-content">
              <div className="upload-icon">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                  <polyline points="14,2 14,8 20,8"/>
                  <line x1="16" y1="13" x2="8" y1="13"/>
                  <line x1="16" y1="17" x2="8" y1="17"/>
                  <polyline points="10,9 9,9 8,9"/>
                </svg>
              </div>
              <h3>Upload Your Resume</h3>
              <p>Drag and drop your resume here, or click to browse</p>
              <div className="file-types">
                <span>Supported formats: PDF, DOC, DOCX, TXT</span>
                <span>Max size: 5MB</span>
              </div>
            </div>
          ) : (
            <div className="file-info">
              <div className="file-icon">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                  <polyline points="14,2 14,8 20,8"/>
                </svg>
              </div>
              <div className="file-details">
                <h4>{file.name}</h4>
                <p>{formatFileSize(file.size)}</p>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  removeFile();
                }}
                className="remove-file"
              >
                ×
              </button>
            </div>
          )}
        </div>

        {file && (
          <div className="upload-actions">
            {uploading ? (
              <div className="upload-progress">
                <div className="progress-bar">
                  <div 
                    className="progress-fill" 
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
                <p>Uploading... {uploadProgress}%</p>
              </div>
            ) : (
              <button
                onClick={handleUpload}
                className="btn btn-primary upload-btn"
              >
                Upload & Parse Resume
              </button>
            )}
          </div>
        )}

        {parsedData && (
          <div className="parsed-data">
            <h4>Resume Parsed Successfully!</h4>
            <div className="parsed-fields">
              {parsedData.parsedFields && Object.entries(parsedData.parsedFields).map(([key, value]) => (
                <div key={key} className="parsed-field">
                  <strong>{key}:</strong> {value}
                </div>
              ))}
            </div>
            <div className="ai-suggestions">
              <h5>AI Suggestions:</h5>
              <ul>
                {parsedData.suggestions?.map((suggestion, index) => (
                  <li key={index}>{suggestion}</li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResumeUpload;
