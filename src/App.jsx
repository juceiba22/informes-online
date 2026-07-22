import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import CreateReport from './components/CreateReport';
import ViewReport from './components/ViewReport';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<CreateReport />} />
        <Route path="/crear" element={<Navigate to="/" replace />} />
        <Route path="/r/:id" element={<ViewReport />} />
        {/* Fallback redirect */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
