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
} from '@mui/icons-material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import TaskList, { TaskListHandle } from './TaskList';
import Login from './Login';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const drawerWidth = 260;

const App: React.FC = () => {
  const [darkMode, setDarkMode] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));

  const taskListRef = useRef<TaskListHandle>(null);

  const theme = createTheme({
    palette: { mode: darkMode ? 'dark' : 'light' },
    typography: { fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif' },
    shape: { borderRadius: 12 },
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
    <Box sx={{ width: drawerWidth }} onClick={toggleDrawer(false)}>
      <Toolbar />
      <Divider />
      <List>
        <ListItem disablePadding>
          <ListItemButton>
            <ListItemIcon><HomeIcon /></ListItemIcon>
            <ListItemText primary="Dashboard" />
          </ListItemButton>
        </ListItem>
      </List>
      <Divider />
      <List>
        <ListItem disablePadding>
          <ListItemButton onClick={handleLogout}>
            <ListItemIcon><LogoutIcon /></ListItemIcon>
            <ListItemText primary="Logout" />
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
                sx={{ zIndex: (t) => t.zIndex.drawer + 1, width: { sm: `calc(100% - ${drawerOpen ? drawerWidth : 0}px)` }, ml: { sm: drawerOpen ? `${drawerWidth}px` : 0 } }}
              >
                <Toolbar>
                  <IconButton color="inherit" edge="start" onClick={toggleDrawer(true)} sx={{ mr: 2 }}>
                    <MenuIcon />
                  </IconButton>
                  <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
                    My Daily Tasks
                  </Typography>
                  <IconButton color="inherit" onClick={handleRefresh}>
                    <RefreshIcon />
                  </IconButton>
                  <Switch checked={darkMode} onChange={() => setDarkMode(!darkMode)} />
                  <Typography variant="button" sx={{ ml: 0.5 }}>
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
                  bgcolor: '#2e7d32',
                  '&:hover': { bgcolor: '#1b5e20' },
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