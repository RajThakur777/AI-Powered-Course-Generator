import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Landing from './pages/Landing';
import DashboardLayout from './components/DashboardLayout';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/dashboard/*" element={<DashboardLayout />} />
    </Routes>
  );
}

export default App;