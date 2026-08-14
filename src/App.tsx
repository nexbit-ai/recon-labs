import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// B2B module (Nexbit) - frontend-only, isolated theme + shell
import B2BApp from './b2b/B2BApp';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/b2b/*" element={<B2BApp />} />
        <Route path="*" element={<Navigate to="/b2b" replace />} />
      </Routes>
    </Router>
  );
}

export default App; 