import { createContext, useContext, useState, useEffect } from 'react';
import { ThemeProvider as MuiThemeProvider, createTheme } from '@mui/material';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('darkMode');
    return saved ? JSON.parse(saved) : false;
  });

  const theme = createTheme({
    palette: {
      mode: darkMode ? 'dark' : 'light',
      primary: {
        main: darkMode ? '#FFD700' : '#FFC107',
        light: darkMode ? '#FFE57F' : '#FFD54F',
        dark: darkMode ? '#FFA000' : '#FF8F00',
      },
      secondary: {
        main: darkMode ? '#FFB300' : '#FF9800',
        light: darkMode ? '#FFE082' : '#FFCC80',
        dark: darkMode ? '#FF8F00' : '#F57C00',
      },
      background: {
        default: darkMode ? '#1A1A1A' : '#FFFDF7',
        paper: darkMode ? '#262626' : '#FFFFFF',
      },
      text: {
        primary: darkMode ? '#FFFFFF' : '#212121',
        secondary: darkMode ? '#B0B0B0' : '#757575',
      },
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 8,
            textTransform: 'none',
            fontWeight: 600,
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            borderRadius: 12,
            boxShadow: darkMode
              ? '0 4px 6px rgba(0, 0, 0, 0.3)'
              : '0 4px 6px rgba(0, 0, 0, 0.1)',
          },
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: {
            background: darkMode
              ? 'linear-gradient(45deg, #FFD700 30%, #FFA000 90%)'
              : 'linear-gradient(45deg, #FFC107 30%, #FF8F00 90%)',
          },
        },
      },
    },
  });

  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(darkMode));
  }, [darkMode]);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  return (
    <ThemeContext.Provider value={{ darkMode, toggleDarkMode }}>
      <MuiThemeProvider theme={theme}>
        {children}
      </MuiThemeProvider>
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  return useContext(ThemeContext);
};