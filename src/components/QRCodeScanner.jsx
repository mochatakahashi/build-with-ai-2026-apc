import React, { useState, useEffect } from 'react';
import { Camera, Scan, CheckCircle, AlertTriangle, AlertCircle, RefreshCw, Clipboard, Check } from 'lucide-react';
import { parseQRData, isTokenValid } from '../utils/qrHelpers';
import { userService } from '../services/userService';
import { recordAttendance, checkAttendance } from '../services/attendanceService';
import { useToast } from '../contexts/ToastContext';
import './QRCode.css';

export default function QRCodeScanner({ eventId, eventName, organizerId, onAttendanceRecorded }) {
  const [qrInput, setQrInput] = useState('');
  const [scannerState, setScannerState] = useState('scanning'); // 'scanning', 'success', 'error', 'verifying'
  const [scanResult, setScanResult] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const { showToast } = useToast();

  const handleVerify = async (dataString) => {
    if (!dataString.trim()) return;

    setScannerState('verifying');
    const parsed = parseQRData(dataString);

    if (!parsed) {
      setErrorMessage('Invalid QR Code format. Please scan a valid CampusConnect attendance QR code.');
      setScannerState('error');
      return;
    }

    if (parsed.eventId !== eventId) {
      setErrorMessage(`This QR Code is for a different event. This scanner is configured for "${eventName}".`);
      setScannerState('error');
      return;
    }

    if (!isTokenValid(parsed.timestamp)) {
      setErrorMessage('This QR Code has expired. Please ask the attendee to refresh their code and scan again.');
      setScannerState('error');
      return;
    }

    // Check if already registered
    const alreadyPresent = checkAttendance(parsed.studentId, eventId);
    if (alreadyPresent) {
      setErrorMessage('Attendance has already been recorded for this student.');
      setScannerState('error');
      return;
    }

    try {
      // Get student details
      const student = await userService.getUser(parsed.studentId);
      
      setScanResult({
        studentId: parsed.studentId,
        displayName: student.displayName,
        avatarUrl: student.avatarUrl,
        studentIdCode: student.studentId,
        email: student.email,
        timestamp: parsed.timestamp,
      });

      setScannerState('success');
    } catch (error) {
      // If student user not found in mock storage, fallback
      setScanResult({
        studentId: parsed.studentId,
        displayName: `Student (${parsed.studentId})`,
        avatarUrl: '',
        studentIdCode: 'Unknown ID',
        email: '',
        timestamp: parsed.timestamp,
      });
      setScannerState('success');
    }
  };

  const handleRecord = async () => {
    if (!scanResult) return;
    setScannerState('verifying');

    try {
      await recordAttendance(scanResult.studentId, eventId, organizerId);
      showToast(`Recorded attendance for ${scanResult.displayName}!`, 'success');
      
      if (onAttendanceRecorded) {
        onAttendanceRecorded();
      }
      
      // Reset scanner for next scan
      handleReset();
    } catch (error) {
      showToast(error.message || 'Failed to record attendance', 'error');
      setErrorMessage('Failed to save attendance record to database.');
      setScannerState('error');
    }
  };

  const handleReset = () => {
    setQrInput('');
    setScanResult(null);
    setErrorMessage('');
    setScannerState('scanning');
  };

  return (
    <div className="qr-scanner glass-card">
      <div className="qr-scanner__header">
        <h3 className="qr-scanner__event-title">{eventName}</h3>
        <p className="qr-scanner__subtitle">Attendance QR Code Scanner</p>
      </div>

      {scannerState === 'scanning' && (
        <div className="qr-scanner__body">
          {/* Simulated camera viewfinder */}
          <div className="qr-scanner__viewfinder">
            <div className="viewfinder-corner viewfinder-corner--tl"></div>
            <div className="viewfinder-corner viewfinder-corner--tr"></div>
            <div className="viewfinder-corner viewfinder-corner--bl"></div>
            <div className="viewfinder-corner viewfinder-corner--br"></div>
            
            <div className="viewfinder-scan-line"></div>
            
            <div className="viewfinder-content flex flex-col items-center justify-center">
              <Camera size={36} className="viewfinder-camera-icon" />
              <span className="viewfinder-status">Scanning for QR code...</span>
            </div>
          </div>

          <div className="qr-scanner__manual-input mt-md">
            <label className="form-label" htmlFor="qr-paste">Paste QR payload for simulated scan:</label>
            <div className="flex gap-sm">
              <input
                id="qr-paste"
                type="text"
                className="form-input flex-1"
                placeholder='{"studentId":"user-1","eventId":"event-1",...}'
                value={qrInput}
                onChange={(e) => setQrInput(e.target.value)}
              />
              <button className="btn btn--primary" onClick={() => handleVerify(qrInput)} disabled={!qrInput}>
                Verify
              </button>
            </div>
          </div>
        </div>
      )}

      {scannerState === 'verifying' && (
        <div className="qr-scanner__body flex flex-col items-center justify-center py-xl">
          <RefreshCw size={48} className="spinner-icon text-gradient" />
          <p className="mt-md text-secondary">Verifying attendee token...</p>
        </div>
      )}

      {scannerState === 'success' && scanResult && (
        <div className="qr-scanner__body qr-scanner__body--success flex flex-col items-center text-center">
          <div className="success-icon-wrapper mb-md">
            <CheckCircle size={48} className="success-icon" />
          </div>
          
          <h4 className="verify-success-title">Token Valid!</h4>
          
          <div className="attendee-preview glass-card p-md mt-sm mb-md flex items-center gap-md text-left width-full">
            <div className="avatar avatar--lg avatar--accent">
              {scanResult.avatarUrl ? (
                <img src={scanResult.avatarUrl} alt={scanResult.displayName} />
              ) : (
                scanResult.displayName.charAt(0)
              )}
            </div>
            <div>
              <h5 className="attendee-name">{scanResult.displayName}</h5>
              <p className="attendee-meta">ID: {scanResult.studentIdCode}</p>
              {scanResult.email && <p className="attendee-meta">{scanResult.email}</p>}
            </div>
          </div>

          <div className="flex gap-sm width-full justify-center">
            <button className="btn btn--secondary" onClick={handleReset}>
              Scan Another
            </button>
            <button className="btn btn--success" onClick={handleRecord}>
              <Check size={16} />
              Record Present
            </button>
          </div>
        </div>
      )}

      {scannerState === 'error' && (
        <div className="qr-scanner__body qr-scanner__body--error flex flex-col items-center text-center">
          <div className="error-icon-wrapper mb-md">
            <AlertCircle size={48} className="error-icon" />
          </div>
          
          <h4 className="verify-error-title">Verification Failed</h4>
          <p className="verify-error-message mt-sm mb-lg">{errorMessage}</p>

          <button className="btn btn--primary" onClick={handleReset}>
            Try Scanning Again
          </button>
        </div>
      )}
    </div>
  );
}
