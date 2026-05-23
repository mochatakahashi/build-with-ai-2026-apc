import React, { useState, useEffect } from 'react';
import QRCode from 'react-qr-code';
import { RefreshCw, Clock } from 'lucide-react';
import { generateQRData } from '../utils/qrHelpers';
import './QRCode.css';

export default function QRCodeGenerator({ studentId, studentName, eventId, eventName }) {
  const [qrValue, setQrValue] = useState('');
  const [timeLeft, setTimeLeft] = useState(30);

  // Function to refresh QR Code data
  const refreshQR = () => {
    const data = generateQRData(studentId, eventId);
    setQrValue(data);
    setTimeLeft(30);
  };

  // Generate QR on initial render
  useEffect(() => {
    refreshQR();
  }, [studentId, eventId]);

  // Set up refresh interval and countdown timer
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          refreshQR();
          return 30;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [studentId, eventId]);

  return (
    <div className="qr-generator glass-card">
      <div className="qr-generator__header">
        <h3 className="qr-generator__event-title">{eventName}</h3>
        <p className="qr-generator__subtitle">Attendance QR Code</p>
      </div>

      <div className="qr-generator__code-container">
        {qrValue ? (
          <div className="qr-generator__code-wrapper">
            <QRCode
              value={qrValue}
              size={220}
              style={{ height: "auto", maxWidth: "100%", width: "100%" }}
              viewBox={`0 0 256 256`}
              fgColor="#0a0e1a"
              bgColor="#ffffff"
            />
          </div>
        ) : (
          <div className="qr-generator__loading">Generating...</div>
        )}
      </div>

      <div className="qr-generator__student-info">
        <h4 className="qr-generator__student-name">{studentName}</h4>
        <p className="qr-generator__student-id">ID: {studentId}</p>
      </div>

      <div className="qr-generator__footer">
        <p className="qr-generator__instruction">
          Present this QR code to the event organizer to record your attendance.
        </p>
        <div className="qr-generator__timer flex items-center justify-center gap-xs mt-sm">
          <Clock size={14} className="qr-generator__timer-icon" />
          <span>Refreshing in <strong>{timeLeft}s</strong></span>
          <button className="qr-generator__refresh-btn btn btn--icon btn--sm btn--ghost" onClick={refreshQR} title="Refresh QR Now">
            <RefreshCw size={12} />
          </button>
        </div>
      </div>
    </div>
  );
}
