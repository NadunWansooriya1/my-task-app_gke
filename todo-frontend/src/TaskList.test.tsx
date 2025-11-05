/**
 * @jest-environment jsdom
 */
import React from 'react';
import { render, screen } from '@testing-library/react';
import TaskList from './TaskList'; // Will now import the component with forwardRef
import axios from 'axios';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';

// Mock axios globally
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

beforeEach(() => {
  jest.resetAllMocks();
  mockedAxios.post.mockResolvedValue({ data: 'fake-token' });
  mockedAxios.create = jest.fn(() => ({
    get: jest.fn((url: string) => {
      if (url.includes('/tasks/analytics')) return Promise.resolve({ data: { total: 0, completed: 0, pending: 0 } });
      return Promise.resolve({ data: [] });
    }),
    post: jest.fn().mockResolvedValue({ data: { id: 1, title: 'New Task', completed: false, description: '', taskDate: '2025-10-27' } }),
    put: jest.fn().mockResolvedValue({ data: {} }),
    delete: jest.fn().mockResolvedValue({}),
    defaults: { headers: { common: {} } },
    interceptors: { request: { use: jest.fn() }, response: { use: jest.fn() } }
  })) as any;
});

test('renders loading text initially when token is null', () => {
  const theme = createTheme({ palette: { mode: 'dark' } });
  render(
    <ThemeProvider theme={theme}>
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        {/* Provide all required props */}
        <TaskList token={null} refreshKey={0} setRefreshKey={() => {}} />
      </LocalizationProvider>
    </ThemeProvider>
  );
  // The component will show "Loading..." because the token is null
  expect(screen.getByRole('progressbar')).toBeInTheDocument();
});