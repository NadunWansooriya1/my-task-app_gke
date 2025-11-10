import React, { useState, useRef } from 'react';
import {
  ThemeProvider,
  createTheme,
  CssBaseline,
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Fab,
  Box,
  Switch,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Refresh as RefreshIcon,
  Home as HomeIcon,
  Logout as LogoutIcon,
  GetApp as GetAppIcon,
  Person as PersonIcon,
  Dashboard as DashboardIcon,
  CalendarMonth as CalendarIcon,
  BarChart as AnalyticsIcon,
  Category as CategoryIcon,
  Label as TagIcon,
  Archive as ArchiveIcon,
  Settings as SettingsIcon,
  HelpOutline as HelpIcon,
  Notifications as NotificationsIcon,
  Star as StarIcon,
} from '@mui/icons-material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import TaskList, { TaskListHandle } from './TaskList';
import Login from './Login';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Shadows } from '@mui/material/styles';

const drawerWidth = 260;

const App: React.FC = () => {
  const [darkMode, setDarkMode] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));

  const taskListRef = useRef<TaskListHandle>(null);

  const theme = createTheme({
    palette: {
      mode: darkMode ? 'dark' : 'light',
      primary: {
        main: darkMode ? '#14b8a6' : '#0d9488',
        light: darkMode ? '#2dd4bf' : '#14b8a6',
        dark: darkMode ? '#0d9488' : '#0f766e',
      },
      secondary: {
        main: darkMode ? '#fb923c' : '#f97316',
        light: darkMode ? '#fdba74' : '#fb923c',
        dark: darkMode ? '#f97316' : '#ea580c',
      },
      success: {
        main: darkMode ? '#34d399' : '#10b981',
        light: darkMode ? '#6ee7b7' : '#34d399',
        dark: darkMode ? '#10b981' : '#059669',
      },
      warning: {
        main: darkMode ? '#fbbf24' : '#f59e0b',
        light: darkMode ? '#fcd34d' : '#fbbf24',
        dark: darkMode ? '#f59e0b' : '#d97706',
      },
      error: {
        main: darkMode ? '#f87171' : '#ef4444',
        light: darkMode ? '#fca5a5' : '#f87171',
        dark: darkMode ? '#ef4444' : '#dc2626',
      },
      info: {
        main: darkMode ? '#22d3ee' : '#06b6d4',
        light: darkMode ? '#67e8f9' : '#22d3ee',
        dark: darkMode ? '#06b6d4' : '#0891b2',
      },
      background: {
        default: darkMode ? '#0a0f1e' : '#f8fafc',
        paper: darkMode ? '#121827' : '#ffffff',
      },
      text: {
        primary: darkMode ? '#e2e8f0' : '#0f172a',
        secondary: darkMode ? '#94a3b8' : '#64748b',
      },
    },
    typography: {
      fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", sans-serif',
      h4: {
        fontWeight: 700,
        letterSpacing: '-0.02em',
      },
      h5: {
        fontWeight: 700,
        letterSpacing: '-0.01em',
      },
      h6: {
        fontWeight: 600,
        letterSpacing: '-0.01em',
      },
      button: {
        fontWeight: 600,
        letterSpacing: '0.02em',
      },
    },
    shape: { borderRadius: 16 },
    ...(darkMode && {
      shadows: [
        'none',
        '0 1px 3px 0 rgba(0, 0, 0, 0.3), 0 1px 2px 0 rgba(0, 0, 0, 0.3)',
        '0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -1px rgba(0, 0, 0, 0.3)',
        '0 10px 15px -3px rgba(0, 0, 0, 0.3), 0 4px 6px -2px rgba(0, 0, 0, 0.3)',
        '0 20px 25px -5px rgba(0, 0, 0, 0.3), 0 10px 10px -5px rgba(0, 0, 0, 0.3)',
        ...Array(20).fill('0 25px 50px -12px rgba(0, 0, 0, 0.4)'),
      ] as Shadows,
    }),


    components: {
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: 'none',
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: {
            textTransform: 'none',
            borderRadius: 12,
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 16,
          },
        },
      },
    },
  });

  const handleRefresh = () => setRefreshKey((k) => k + 1);
  const handleLoginSuccess = (newToken: string) => {
    localStorage.setItem('token', newToken);
    setToken(newToken);
  };
  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken(null);
    toast.info('Logged out');
  };
  const toggleDrawer = (open: boolean) => () => setDrawerOpen(open);
  const triggerExport = () => taskListRef.current?.exportToCSV();

  const drawer = (
    <Box
      sx={{
        width: drawerWidth,
        height: '100%',
        background: darkMode
          ? 'linear-gradient(180deg, #162836 0%, #0a0f1e 100%)'
          : 'linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)',
        position: 'relative',
      }}
      onClick={toggleDrawer(false)}
    >
      <Toolbar sx={{ background: darkMode ? 'rgba(20, 184, 166, 0.08)' : 'rgba(13, 148, 136, 0.05)' }}>
        <Box display="flex" alignItems="center" gap={1.5} width="100%">
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #14b8a6 0%, #0d9488 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 16px rgba(20, 184, 166, 0.5), 0 0 24px rgba(13, 148, 136, 0.3)',
            }}
          >
            <PersonIcon sx={{ color: '#ffffff', fontSize: 24 }} />
          </Box>
          <Box>
            <Typography variant="body1" fontWeight={700}>
              Welcome
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Task Manager
            </Typography>
          </Box>
        </Box>
      </Toolbar>
      <Divider sx={{ borderColor: darkMode ? 'rgba(20, 184, 166, 0.15)' : 'rgba(13, 148, 136, 0.1)' }} />

      {/* Main Navigation */}
      <List sx={{ px: 1.5, py: 2 }}>
        <Typography
          variant="caption"
          sx={{
            px: 2,
            py: 1,
            color: 'text.secondary',
            fontWeight: 700,
            letterSpacing: '0.1em',
            fontSize: '0.7rem',
            display: 'block'
          }}
        >
          MAIN
        </Typography>
        <ListItem disablePadding sx={{ mb: 1 }}>
          <ListItemButton
            sx={{
              borderRadius: 2,
              background: darkMode
                ? 'linear-gradient(135deg, rgba(20, 184, 166, 0.18) 0%, rgba(20, 184, 166, 0.1) 100%)'
                : 'linear-gradient(135deg, rgba(13, 148, 136, 0.12) 0%, rgba(13, 148, 136, 0.06) 100%)',
              '&:hover': {
                background: darkMode
                  ? 'linear-gradient(135deg, rgba(20, 184, 166, 0.25) 0%, rgba(20, 184, 166, 0.15) 100%)'
                  : 'linear-gradient(135deg, rgba(13, 148, 136, 0.18) 0%, rgba(13, 148, 136, 0.12) 100%)',
                transform: 'translateX(4px)',
              },
              transition: 'all 0.2s ease',
            }}
          >
            <ListItemIcon>
              <DashboardIcon sx={{ color: '#14b8a6' }} />
            </ListItemIcon>
            <ListItemText
              primary="Dashboard"
              primaryTypographyProps={{ fontWeight: 600 }}
            />
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding sx={{ mb: 1 }}>
          <ListItemButton
            sx={{
              borderRadius: 2,
              transition: 'all 0.2s ease',
              '&:hover': {
                background: darkMode ? 'rgba(251, 146, 60, 0.12)' : 'rgba(249, 115, 22, 0.08)',
                transform: 'translateX(4px)',
              },
            }}
          >
            <ListItemIcon>
              <CalendarIcon sx={{ color: '#fb923c' }} />
            </ListItemIcon>
            <ListItemText primary="Calendar" />
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton
            sx={{
              borderRadius: 2,
              transition: 'all 0.2s ease',
              '&:hover': {
                background: darkMode ? 'rgba(251, 146, 60, 0.12)' : 'rgba(249, 115, 22, 0.08)',
                transform: 'translateX(4px)',
              },
            }}
          >
            <ListItemIcon>
              <AnalyticsIcon sx={{ color: '#fb923c' }} />
            </ListItemIcon>
            <ListItemText primary="Analytics" />
          </ListItemButton>
        </ListItem>
      </List>

      <Divider sx={{ borderColor: darkMode ? 'rgba(20, 184, 166, 0.15)' : 'rgba(13, 148, 136, 0.1)' }} />

      {/* Organize Section */}
      <List sx={{ px: 1.5, py: 2 }}>
        <Typography
          variant="caption"
          sx={{
            px: 2,
            py: 1,
            color: 'text.secondary',
            fontWeight: 700,
            letterSpacing: '0.1em',
            fontSize: '0.7rem',
            display: 'block'
          }}
        >
          ORGANIZE
        </Typography>
        <ListItem disablePadding sx={{ mb: 1 }}>
          <ListItemButton
            sx={{
              borderRadius: 2,
              transition: 'all 0.2s ease',
              '&:hover': {
                background: darkMode ? 'rgba(34, 211, 238, 0.12)' : 'rgba(6, 182, 212, 0.08)',
                transform: 'translateX(4px)',
              },
            }}
          >
            <ListItemIcon>
              <CategoryIcon sx={{ color: '#22d3ee' }} />
            </ListItemIcon>
            <ListItemText primary="Categories" />
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding sx={{ mb: 1 }}>
          <ListItemButton
            sx={{
              borderRadius: 2,
              transition: 'all 0.2s ease',
              '&:hover': {
                background: darkMode ? 'rgba(34, 211, 238, 0.12)' : 'rgba(6, 182, 212, 0.08)',
                transform: 'translateX(4px)',
              },
            }}
          >
            <ListItemIcon>
              <TagIcon sx={{ color: '#22d3ee' }} />
            </ListItemIcon>
            <ListItemText primary="Tags" />
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton
            sx={{
              borderRadius: 2,
              transition: 'all 0.2s ease',
              '&:hover': {
                background: darkMode ? 'rgba(34, 211, 238, 0.12)' : 'rgba(6, 182, 212, 0.08)',
                transform: 'translateX(4px)',
              },
            }}
          >
            <ListItemIcon>
              <ArchiveIcon sx={{ color: '#22d3ee' }} />
            </ListItemIcon>
            <ListItemText primary="Archive" />
          </ListItemButton>
        </ListItem>
      </List>

      <Divider sx={{ borderColor: darkMode ? 'rgba(20, 184, 166, 0.15)' : 'rgba(13, 148, 136, 0.1)' }} />

      {/* More Section */}
      <List sx={{ px: 1.5, py: 2 }}>
        <Typography
          variant="caption"
          sx={{
            px: 2,
            py: 1,
            color: 'text.secondary',
            fontWeight: 700,
            letterSpacing: '0.1em',
            fontSize: '0.7rem',
            display: 'block'
          }}
        >
          MORE
        </Typography>
        <ListItem disablePadding sx={{ mb: 1 }}>
          <ListItemButton
            sx={{
              borderRadius: 2,
              transition: 'all 0.2s ease',
              '&:hover': {
                background: darkMode ? 'rgba(52, 211, 153, 0.12)' : 'rgba(16, 185, 129, 0.08)',
                transform: 'translateX(4px)',
              },
            }}
          >
            <ListItemIcon>
              <NotificationsIcon sx={{ color: '#34d399' }} />
            </ListItemIcon>
            <ListItemText primary="Notifications" />
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding sx={{ mb: 1 }}>
          <ListItemButton
            sx={{
              borderRadius: 2,
              transition: 'all 0.2s ease',
              '&:hover': {
                background: darkMode ? 'rgba(52, 211, 153, 0.12)' : 'rgba(16, 185, 129, 0.08)',
                transform: 'translateX(4px)',
              },
            }}
          >
            <ListItemIcon>
              <StarIcon sx={{ color: '#34d399' }} />
            </ListItemIcon>
            <ListItemText primary="Favorites" />
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding sx={{ mb: 1 }}>
          <ListItemButton
            sx={{
              borderRadius: 2,
              transition: 'all 0.2s ease',
              '&:hover': {
                background: darkMode ? 'rgba(148, 163, 184, 0.12)' : 'rgba(100, 116, 139, 0.08)',
                transform: 'translateX(4px)',
              },
            }}
          >
            <ListItemIcon>
              <SettingsIcon sx={{ color: '#94a3b8' }} />
            </ListItemIcon>
            <ListItemText primary="Settings" />
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton
            sx={{
              borderRadius: 2,
              transition: 'all 0.2s ease',
              '&:hover': {
                background: darkMode ? 'rgba(148, 163, 184, 0.12)' : 'rgba(100, 116, 139, 0.08)',
                transform: 'translateX(4px)',
              },
            }}
          >
            <ListItemIcon>
              <HelpIcon sx={{ color: '#94a3b8' }} />
            </ListItemIcon>
            <ListItemText primary="Help & Support" />
          </ListItemButton>
        </ListItem>
      </List>

      <Divider sx={{ borderColor: darkMode ? 'rgba(20, 184, 166, 0.15)' : 'rgba(13, 148, 136, 0.1)' }} />

      {/* Account Section */}
      <List sx={{ px: 1.5, py: 2 }}>
        <ListItem disablePadding>
          <ListItemButton
            onClick={handleLogout}
            sx={{
              borderRadius: 2,
              color: '#ef4444',
              transition: 'all 0.2s ease',
              '&:hover': {
                background: 'rgba(239, 68, 68, 0.1)',
                transform: 'translateX(4px)',
              },
            }}
          >
            <ListItemIcon>
              <LogoutIcon sx={{ color: '#ef4444' }} />
            </ListItemIcon>
            <ListItemText primary="Logout" primaryTypographyProps={{ fontWeight: 600 }} />
          </ListItemButton>
        </ListItem>
      </List>
    </Box>
  );

  return (
    <ThemeProvider theme={theme}>
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <CssBaseline />
        <ToastContainer position="bottom-left" theme={darkMode ? 'dark' : 'light'} />

        {/* FULL-SCREEN ROOT */}
        <Box sx={{ display: 'flex', height: '100vh', width: '97vw', overflow: 'hidden' }}>

          {!token ? (
            <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', p: 2 }}>
              <Login onLoginSuccess={handleLoginSuccess} />
            </Box>
          ) : (
            <>
              {/* ---------- Header ---------- */}
              <AppBar
                position="fixed"
                elevation={0}
                sx={{
                  zIndex: (t) => t.zIndex.drawer + 1,
                  width: { sm: `calc(100% - ${drawerOpen ? drawerWidth : 0}px)` },
                  ml: { sm: drawerOpen ? `${drawerWidth}px` : 0 },
                  background: darkMode
                    ? 'linear-gradient(135deg, rgba(18, 24, 39, 0.92) 0%, rgba(10, 15, 30, 0.95) 100%)'
                    : 'linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(248, 250, 252, 0.95) 100%)',
                  backdropFilter: 'blur(24px) saturate(180%)',
                  borderBottom: darkMode
                    ? '1px solid rgba(20, 184, 166, 0.2)'
                    : '1px solid rgba(13, 148, 136, 0.15)',
                  boxShadow: darkMode
                    ? '0 4px 24px rgba(0, 0, 0, 0.6), 0 0 40px rgba(20, 184, 166, 0.08)'
                    : '0 4px 20px rgba(13, 148, 136, 0.1)',
                }}
              >
                <Toolbar>
                  <IconButton
                    color="inherit"
                    edge="start"
                    onClick={toggleDrawer(true)}
                    sx={{
                      mr: 2,
                      '&:hover': {
                        backgroundColor: darkMode ? 'rgba(20, 184, 166, 0.15)' : 'rgba(13, 148, 136, 0.1)',
                      },
                    }}
                  >
                    <MenuIcon />
                  </IconButton>
                  <Typography
                    variant="h6"
                    noWrap
                    component="div"
                    sx={{
                      flexGrow: 1,
                      background: darkMode
                        ? 'linear-gradient(135deg, #14b8a6 0%, #34d399 100%)'
                        : 'linear-gradient(135deg, #0d9488 0%, #10b981 100%)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      fontWeight: 800,
                      letterSpacing: '-0.03em',
                      fontSize: { xs: '1.1rem', sm: '1.25rem' },
                    }}
                  >
                    My Daily Tasks
                  </Typography>
                  <IconButton
                    color="inherit"
                    onClick={handleRefresh}
                    sx={{
                      '&:hover': {
                        backgroundColor: darkMode ? 'rgba(20, 184, 166, 0.15)' : 'rgba(13, 148, 136, 0.1)',
                        transform: 'rotate(180deg)',
                      },
                      transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                    }}
                  >
                    <RefreshIcon />
                  </IconButton>
                  <Switch
                    checked={darkMode}
                    onChange={() => setDarkMode(!darkMode)}
                    sx={{
                      '& .MuiSwitch-switchBase.Mui-checked': {
                        color: '#14b8a6',
                      },
                      '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                        backgroundColor: '#0d9488',
                      },
                    }}
                  />
                  <Typography variant="button" sx={{ ml: 0.5, fontWeight: 500 }}>
                    Dark
                  </Typography>
                </Toolbar>
              </AppBar>

              {/* ---------- Drawer ---------- */}
              <Drawer
                anchor="left"
                open={drawerOpen}
                onClose={toggleDrawer(false)}
                sx={{
                  width: drawerWidth,
                  flexShrink: 0,
                  '& .MuiDrawer-paper': { width: drawerWidth, boxSizing: 'border-box' },
                }}
              >
                {drawer}
              </Drawer>

              {/* ---------- Main Content (fills remaining space) ---------- */}
              <Box
                component="main"
                sx={{
                  flexGrow: 1,
                  p: { xs: 2, sm: 3 },
                  mt: '64px', // AppBar height
                  overflow: 'auto',
                  height: 'calc(100vh - 64px)',
                  display: 'flex',
                  flexDirection: 'column',
                  background: darkMode
                    ? 'linear-gradient(135deg, #0a0f1e 0%, #121827 50%, #0a0f1e 100%)'
                    : 'linear-gradient(135deg, #f8fafc 0%, #e0f2f1 50%, #f1f5f9 80%, #f8fafc 100%)',
                  position: 'relative',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: darkMode
                      ? `radial-gradient(circle at 20% 30%, rgba(20, 184, 166, 0.08) 0%, transparent 50%),
                         radial-gradient(circle at 80% 70%, rgba(52, 211, 153, 0.06) 0%, transparent 50%),
                         radial-gradient(circle at 50% 50%, rgba(251, 146, 60, 0.04) 0%, transparent 60%)`
                      : `radial-gradient(circle at 20% 30%, rgba(13, 148, 136, 0.1) 0%, transparent 50%),
                         radial-gradient(circle at 80% 70%, rgba(16, 185, 129, 0.08) 0%, transparent 50%),
                         radial-gradient(circle at 50% 90%, rgba(249, 115, 22, 0.06) 0%, transparent 60%)`,
                    pointerEvents: 'none',
                    animation: 'gradientShift 15s ease-in-out infinite',
                  },
                  '@keyframes gradientShift': {
                    '0%, 100%': { opacity: 1 },
                    '50%': { opacity: 0.8 },
                  },
                }}
              >
                <TaskList
                  ref={taskListRef}
                  token={token}
                  refreshKey={refreshKey}
                  setRefreshKey={setRefreshKey}
                />
              </Box>

              {/* ---------- Export FAB ---------- */}
              <Fab
                variant="extended"
                color="success"
                aria-label="Export CSV"
                onClick={triggerExport}
                sx={{
                  position: 'fixed',
                  bottom: 24,
                  right: 24,
                  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  color: '#ffffff',
                  fontWeight: 700,
                  fontSize: '0.95rem',
                  boxShadow: '0 8px 28px rgba(16, 185, 129, 0.45), 0 0 20px rgba(16, 185, 129, 0.2)',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  border: '1px solid rgba(52, 211, 153, 0.35)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                    transform: 'translateY(-6px) scale(1.08)',
                    boxShadow: '0 16px 40px rgba(16, 185, 129, 0.55), 0 0 32px rgba(16, 185, 129, 0.3)',
                    border: '1px solid rgba(52, 211, 153, 0.5)',
                  },
                  '&:active': {
                    transform: 'translateY(-2px) scale(1.02)',
                  },
                }}
              >
                <GetAppIcon sx={{ mr: 1 }} />
                Export CSV
              </Fab>
            </>
          )}
        </Box>
      </LocalizationProvider>
    </ThemeProvider>
  );
};

export default App;