import React from 'react';
import { Link } from 'react-router-dom';
import './NotFoundPage.css';

export default function NotFoundPage() {
  return (
    <div className="not-found-page">
      <div className="not-found-card glass-card">
        <h1 className="not-found-code text-gradient">404</h1>
        <h2 className="not-found-title">Page Not Found</h2>
        <p className="not-found-message">
          The page you are looking for does not exist or has been moved.
        </p>
        <Link to="/feed" className="btn btn--primary">
          Go Home
        </Link>
      </div>
    </div>
  );
}
