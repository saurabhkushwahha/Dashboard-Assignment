import { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  useMediaQuery,
  useTheme as useMuiTheme,
  Divider,
} from '@mui/material';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useNavigate } from 'react-router-dom';
import MenuIcon from '@mui/icons-material/Menu';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import DashboardIcon from '@mui/icons-material/Dashboard';
import LogoutIcon from '@mui/icons-material/Logout';
import PersonIcon from '@mui/icons-material/Person';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { darkMode, toggleDarkMode } = useTheme();
  const navigate = useNavigate();
  const muiTheme = useMuiTheme();
  const isMobile = useMediaQuery(muiTheme.breakpoints.down('md'));
  const [drawerOpen, setDrawerOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const toggleDrawer = (open) => (event) => {
    if (event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
      return;
    }
    setDrawerOpen(open);
  };

  const menuItems = [
    {
      text: 'Dashboard',
      icon: <DashboardIcon />,
      onClick: () => {
        navigate('/');
        setDrawerOpen(false);
      },
    },
    {
      text: darkMode ? 'Light Mode' : 'Dark Mode',
      icon: darkMode ? <Brightness7Icon /> : <Brightness4Icon />,
      onClick: () => {
        toggleDarkMode();
        setDrawerOpen(false);
      },
    },
    {
      text: 'Logout',
      icon: <LogoutIcon />,
      onClick: () => {
        handleLogout();
        setDrawerOpen(false);
      },
    },
  ];

  const drawer = (
    <Box
      sx={{ width: 250 }}
      role="presentation"
    >
      <Box sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
        <PersonIcon />
        <Typography variant="subtitle1" noWrap>
          {user?.email}
        </Typography>
      </Box>
      <Divider />
      <List>
        {menuItems.map((item) => (
          <ListItem button key={item.text} onClick={item.onClick}>
            <ListItemIcon>{item.icon}</ListItemIcon>
            <ListItemText primary={item.text} />
          </ListItem>
        ))}
      </List>
    </Box>
  );

  if (!user) return null;

  return (
    <>
      <AppBar
        position="static"
        elevation={0}
        sx={{
          backdropFilter: 'blur(8px)',
          borderBottom: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Toolbar>
          {isMobile && (
            <IconButton
              color="inherit"
              edge="start"
              onClick={toggleDrawer(true)}
              sx={{
                mr: 2,
                transition: 'all 0.3s',
                '&:hover': {
                  transform: 'scale(1.1) rotate(90deg)',
                }
              }}
            >
              <MenuIcon />
            </IconButton>
          )}
          <Typography
            variant="h6"
            component="div"
            sx={{
              flexGrow: 1,
              fontWeight: 700,

            }}
          >
            Dashboard
          </Typography>
          {!isMobile && (
            <Box sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 2,
              '& .MuiButton-root': {
                px: 3,
                py: 1,
              }
            }}>
              <Typography
                component="span"
                sx={{
                  fontWeight: 500,
                  color: 'text.secondary'
                }}
              >
                {user.email}
              </Typography>
              <IconButton
                onClick={toggleDarkMode}
                color="inherit"
                sx={{
                  transition: 'all 0.3s',
                  '&:hover': {
                    transform: 'rotate(180deg)',
                    background: 'rgba(255, 255, 255, 0.1)',
                  }
                }}
              >
                {darkMode ? <Brightness7Icon /> : <Brightness4Icon />}
              </IconButton>
              <Button
                color="inherit"
                onClick={handleLogout}
                variant="outlined"
                sx={{
                  borderColor: 'rgba(255, 255, 255, 0.3)',
                  '&:hover': {
                    borderColor: 'rgba(255, 255, 255, 0.8)',
                    background: 'rgba(255, 255, 255, 0.1)',
                  }
                }}
              >
                Logout
              </Button>
            </Box>
          )}
        </Toolbar>
      </AppBar>
      <Drawer
        anchor="left"
        open={drawerOpen}
        onClose={toggleDrawer(false)}
        sx={{
          '& .MuiDrawer-paper': {
            background: (theme) => theme.palette.background.default,
            transition: 'transform 0.3s ease-in-out !important',
          }
        }}
        transitionDuration={300}
      >
        {drawer}
      </Drawer>
    </>
  );
};

export default Navbar;