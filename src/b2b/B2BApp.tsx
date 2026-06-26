// B2B (Nexbit) root. Scopes the B2B MUI theme (square corners, monochrome +
// one accent, Inter) to this subtree only — it never leaks into B2C. Mounted by
// App.tsx at '/b2b/*'. Frontend-only: no providers for auth/API here.
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import { ScopedCssBaseline } from '@mui/material';
import { b2bTheme } from './theme/b2bTokens';
import B2BShell from './layout/B2BShell';
import { SECTIONS } from './layout/sections';
import Placeholder from './views/Placeholder';
import Upload from './views/Upload';
import Overview from './views/Overview';
import Reconciliation from './views/Reconciliation';
import Disputes from './views/Disputes';
import Channels from './views/Channels';
import Contracts from './views/Contracts';
import AskNex from './views/AskNex';
// Reuse the exact same Integrations module from the B2C app.
import Integrations from '../pages/Integrations';

// Sections with a real view built; the rest fall back to a titled placeholder.
const VIEWS: Record<string, React.ReactNode> = {
  upload: <Upload />,
  overview: <Overview />,
  reconciliation: <Reconciliation />,
  disputes: <Disputes />,
  channels: <Channels />,
  contracts: <Contracts />,
  ask: <AskNex />,
};

const B2BApp: React.FC = () => (
  <ThemeProvider theme={b2bTheme}>
    <ScopedCssBaseline>
      <Routes>
        <Route element={<B2BShell />}>
          <Route index element={<Navigate to="overview" replace />} />
          {SECTIONS.map((s) => (
            <Route key={s.key} path={s.path} element={VIEWS[s.key] ?? <Placeholder title={s.title} />} />
          ))}
          <Route path="upload" element={<Upload />} />
          <Route path="integrations" element={<Integrations />} />
          <Route path="*" element={<Navigate to="overview" replace />} />
        </Route>
      </Routes>
    </ScopedCssBaseline>
  </ThemeProvider>
);

export default B2BApp;
