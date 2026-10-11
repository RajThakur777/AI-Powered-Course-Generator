import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Landing from './pages/Landing';
import DashboardLayout from './components/DashboardLayout';
import ErrorBoundary from './components/ErrorBoundary';

function App() {
  return (
    <ErrorBoundary>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/dashboard/*" element={<DashboardLayout />} />
      </Routes>
    </ErrorBoundary>
  );
}

export default App;