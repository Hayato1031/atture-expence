import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, CssBaseline, Box } from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { Chart as ChartJS, registerables } from 'chart.js';
import { ja } from 'date-fns/locale';
import updateService from './services/updateService';

// Import custom theme and components
import { lightTheme, darkTheme } from './theme/theme';
import Sidebar from './components/Navigation/Sidebar';
import './styles/animations.css';

// Import pages
import Dashboard from './pages/Dashboard';
import Registration from './pages/Registration';
import TransactionList from './pages/TransactionList';
import TrashManagement from './pages/TrashManagement';
import Analytics from './pages/Analytics';
import Settings from './pages/Settings';
import Invoices from './pages/Invoices';
import Notifications from './pages/Notifications';
import Users from './pages/Users';

// Register Chart.js components
ChartJS.register(...registerables);

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [themeMode, setThemeMode] = useState(() => {
    return localStorage.getItem('themeMode') || 'light';
  });

  // Storage is automatically initialized when imported

  // Initialize update service on app start
  useEffect(() => {
    const initializeUpdateService = () => {
      const updateSettings = updateService.getUpdateSettings();
      if (updateSettings.autoCheck) {
        updateService.startAutoUpdateCheck(updateSettings.checkInterval);
      }
    };

    initializeUpdateService();

    // Cleanup on unmount
    return () => {
      updateService.stopAutoUpdateCheck();
    };
  }, []);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const toggleTheme = () => {
    const newMode = themeMode === 'light' ? 'dark' : 'light';
    setThemeMode(newMode);
    localStorage.setItem('themeMode', newMode);
  };

  const currentTheme = themeMode === 'light' ? lightTheme : darkTheme;

  return (
    <Router>
      <ThemeProvider theme={currentTheme}>
        <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ja}>
          <CssBaseline />
          <Box sx={{ display: 'flex', minHeight: '100vh' }}>
            {/* Sidebar */}
            <Sidebar
              open={sidebarOpen}
              onToggle={toggleSidebar}
              themeMode={themeMode}
              onToggleTheme={toggleTheme}
            />

            {/* Main Content */}
            <Box
              component="main"
              sx={{
                flexGrow: 1,
                p: 3,
                marginLeft: 0,
                transition: 'margin-left 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                background: currentTheme.palette.mode === 'dark'
                  ? 'linear-gradient(135deg, #1e293b 0%, #334155 100%)'
                  : 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
                minHeight: '100vh',
              }}
            >
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/registration" element={<Registration />} />
                <Route path="/transactions" element={<TransactionList />} />
                <Route path="/trash" element={<TrashManagement />} />
                <Route path="/users" element={<Users />} />
                <Route path="/analytics" element={<Analytics />} />
                <Route path="/invoices" element={<Invoices />} />
                <Route path="/notifications" element={<Notifications />} />
                <Route path="/settings" element={<Settings />} />
                {/* Redirect any unknown routes to dashboard */}
                <Route path="*" element={<Dashboard />} />
              </Routes>
            </Box>
          </Box>
        </LocalizationProvider>
      </ThemeProvider>
    </Router>
  );
}

export default App;