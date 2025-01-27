import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { NewsProvider } from './context/NewsContext';
import { ThemeProvider } from './context/ThemeContext';
import { Toaster } from 'react-hot-toast';
import Login from './components/auth/Login';
import ProtectedRoute from './components/auth/ProtectedRoute';
import Dashboard from './components/dashboard/Dashboard';
import Navbar from './components/layout/Navbar';
import { CssBaseline } from '@mui/material';

function App() {
  return (
    <ThemeProvider>
      <CssBaseline />
      <AuthProvider>
        <NewsProvider>
          <Router>
            <Toaster position="top-right" />
            <div className="app">
              <Navbar />
              <Routes>
                <Route path="/login" element={<Login />} />
                <Route
                  path="/"
                  element={
                    <ProtectedRoute>
                      <Dashboard />
                    </ProtectedRoute>
                  }
                />
              </Routes>
            </div>
          </Router>
        </NewsProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
