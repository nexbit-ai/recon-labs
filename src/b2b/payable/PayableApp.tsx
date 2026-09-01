import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import PayableShell from './layout/PayableShell';
import APDashboard from './views/APDashboard';
import Invoices from './views/Invoices';
import Exceptions from './views/Exceptions';
import Suppliers from './views/Suppliers';
import APIngest from './views/APIngest';

const PayableApp: React.FC = () => (
  <Routes>
    <Route element={<PayableShell />}>
      <Route index element={<Navigate to="overview" replace />} />
      <Route path="overview"   element={<APDashboard />} />
      <Route path="invoices"   element={<Invoices />} />
      <Route path="exceptions" element={<Exceptions />} />
      <Route path="suppliers"  element={<Suppliers />} />
      <Route path="ingest"     element={<APIngest />} />
      <Route path="*"          element={<Navigate to="overview" replace />} />
    </Route>
  </Routes>
);

export default PayableApp;
