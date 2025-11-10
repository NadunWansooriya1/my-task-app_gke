import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
  forwardRef,
  useImperativeHandle,
} from 'react';
import { flushSync } from 'react-dom';
import axios, { AxiosError } from 'axios';
import {
  Button,
  TextField,
  List,
  Checkbox,
  IconButton,
  Typography,
  Box,
  Paper,
  Card,
  CardContent,
  CardActions,
  CircularProgress,
  Collapse,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  ListItemButton,
  ListItemText,
  Chip,
  LinearProgress,
  Grid,
  InputAdornment,
  ToggleButton,
  ToggleButtonGroup,
  Fade,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from '@mui/material';
import {
  Delete as DeleteIcon,
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  ExpandMore as ExpandMoreIcon,
  CheckCircle as CheckCircleIcon,
  PendingActions as PendingActionsIcon,
  Assignment as AssignmentIcon,
  TrendingUp as TrendingUpIcon,
  LinearScale as LinearScaleIcon,
  Search as SearchIcon,
  FilterList as FilterListIcon,
  Close as CloseIcon,
  Flag as FlagIcon,
  Label as LabelIcon,
  PriorityHigh as PriorityHighIcon,
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { toast } from 'react-toastify';
import { StaticDatePicker } from '@mui/x-date-pickers/StaticDatePicker';
import dayjs, { Dayjs } from 'dayjs';
import { CSVLink } from 'react-csv';
import { API_BASE_URL, API_ENDPOINTS } from './config';

// ─────────────────────────────────────────────────────────────────────────────
// Types & Interfaces
// ─────────────────────────────────────────────────────────────────────────────
interface ErrorResponse { message?: string; }
interface Task {
  id: number;
  title: string;
  completed: boolean;
  taskDate: string;
  description?: string | null;
  priority?: string | null;
  category?: string | null;
}
interface Analytics { total: number; completed: number; pending: number; }
interface TaskListProps {
  token: string | null;
  refreshKey: number;
  setRefreshKey: React.Dispatch<React.SetStateAction<number>>;
}
export interface TaskListHandle {
  exportToCSV: () => void;
}

// ─────────────────────────────────────────────────────────────────────────────
// Styled Expand Button
// ─────────────────────────────────────────────────────────────────────────────
const ExpandMore = styled((props: { expand: boolean; [key: string]: any }) => {
  const { expand, ...other } = props;
  return <IconButton {...other} />;
})(({ theme, expand }) => ({
  transform: !expand ? 'rotate(0deg)' : 'rotate(180deg)',
  marginLeft: 'auto',
  transition: theme.transitions.create('transform', { duration: theme.transitions.duration.shortest }),
}));

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────
const TaskList = forwardRef<TaskListHandle, TaskListProps>(
  ({ token, refreshKey, setRefreshKey }, ref) => {
    // ────── State ──────
    const [tasks, setTasks] = useState<Task[]>([]);
    const [newTask, setNewTask] = useState('');
    const [editingId, setEditingId] = useState<number | null>(null);
    const [editingTitle, setEditingTitle] = useState('');
    const [descriptionEdits, setDescriptionEdits] = useState<Record<number, string>>({});
    const [priorityEdits, setPriorityEdits] = useState<Record<number, string>>({});
    const [categoryEdits, setCategoryEdits] = useState<Record<number, string>>({});
    const [loading, setLoading] = useState(false);
    const [actionLoading, setActionLoading] = useState<number | 'add' | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [analytics, setAnalytics] = useState<Analytics | null>(null);
    const [selectedDate, setSelectedDate] = useState<Dayjs>(dayjs());
    const [expandedTaskId, setExpandedTaskId] = useState<number | null>(null);
    const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);
    const [csvData, setCsvData] = useState<any[]>([]);
    const [pendingDates, setPendingDates] = useState<string[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterStatus, setFilterStatus] = useState<'all' | 'completed' | 'pending'>('all');

    const csvLinkRef = useRef<any>(null);
    const titleInputRef = useRef<HTMLInputElement>(null);

    // ────── Axios client ──────
    const apiClient = useMemo(() => {
      if (!token) return null;
      return axios.create({
        baseURL: `${API_BASE_URL}/api`,
        headers: { Authorization: `Bearer ${token}` },
      });
    }, [token]);

    // ────── Error handler ──────
    const handleError = useCallback(
      (error: unknown, defaultMessage: string): string => {
        let message = defaultMessage;
        if (axios.isAxiosError(error)) {
          const e = error as AxiosError<ErrorResponse>;
          if (e.response?.status === 403) {
            toast.error('Session expired. Please log in again.');
            localStorage.removeItem('token');
            window.location.reload();
            return 'Session expired';
          }
          message = e.response?.data?.message ?? `Server error (${e.response?.status})`;
        } else if (error instanceof Error) message = error.message;
        console.error(defaultMessage, error);
        return message;
      },
      []
    );

    // ────── Data fetch ──────
    useEffect(() => {
      if (!apiClient) return;
      const controller = new AbortController();
      const fetch = async () => {
        setLoading(true);
        setError(null);
        const date = selectedDate.format('YYYY-MM-DD');
        try {
          const [tasksRes, analyticsRes, pendingRes] = await Promise.all([
            apiClient.get<Task[]>('/tasks', { params: { date }, signal: controller.signal }),
            apiClient.get<Analytics>('/tasks/analytics', { params: { date }, signal: controller.signal }),
            apiClient.get<string[]>('/tasks/pending-dates', { signal: controller.signal }),
          ]);
          
          // Ensure tasksRes.data is an array
          const taskData = Array.isArray(tasksRes.data) ? tasksRes.data : [];
          setTasks(taskData);
          
          const desc: Record<number, string> = {};
          const prior: Record<number, string> = {};
          const categ: Record<number, string> = {};
          taskData.forEach((t) => {
            desc[t.id] = t.description ?? '';
            prior[t.id] = t.priority ?? 'medium';
            categ[t.id] = t.category ?? 'Other';
          });
          setDescriptionEdits(desc);
          setPriorityEdits(prior);
          setCategoryEdits(categ);
          setAnalytics(analyticsRes.data);
          setPendingDates(Array.isArray(pendingRes.data) ? pendingRes.data : []);
        } catch (err) {
          if (!axios.isCancel(err)) {
            setError(handleError(err, `Fetch failed for ${selectedDate.format('MMM D')}`));
            setTasks([]);
            setAnalytics(null);
            setPendingDates([]);
          }
        } finally {
          if (!controller.signal.aborted) setLoading(false);
        }
      };
      fetch();
      return () => controller.abort();
    }, [token, refreshKey, selectedDate, apiClient, handleError]);

    // ────── Handlers ──────
    const handleExpand = useCallback((id: number) => {
      setExpandedTaskId((prev) => (prev === id ? null : id));
    }, []);

    const handleDateChange = (newVal: Dayjs | null) => {
      if (newVal) {
        setSelectedDate(newVal);
        setExpandedTaskId(null);
        setEditingId(null);
      }
    };

    const addTask = useCallback(async () => {
      if (!apiClient || !newTask.trim()) return toast.error('Title required');
      setActionLoading('add');
      try {
        await apiClient.post<Task>('/tasks', {
          title: newTask.trim(),
          completed: false,
          taskDate: selectedDate.format('YYYY-MM-DD'),
          description: '',
          priority: 'medium',
          category: 'Other',
        });
        setNewTask('');
        toast.success('Task added');
        setRefreshKey((k) => k + 1);
      } catch (e) {
        toast.error(handleError(e, 'Add failed'));
      } finally {
        setActionLoading(null);
      }
    }, [newTask, selectedDate, apiClient, handleError, setRefreshKey]);

    const toggleComplete = useCallback(
      async (id: number, completed: boolean) => {
        if (!apiClient) return;
        const task = tasks.find((t) => t.id === id);
        if (!task) return;
        setActionLoading(id);
        try {
          await apiClient.put(`/tasks/${id}`, { ...task, completed: !completed });
          toast.info('Status updated');
          setRefreshKey((k) => k + 1);
        } catch (e) {
          toast.error(handleError(e, 'Update failed'));
        } finally {
          setActionLoading(null);
        }
      },
      [apiClient, tasks, handleError, setRefreshKey]
    );

    const startEdit = useCallback((id: number, title: string) => {
      setEditingId(id);
      setEditingTitle(title);
      setTimeout(() => titleInputRef.current?.focus(), 50);
    }, []);

    const cancelEdit = useCallback(() => {
      setEditingId(null);
      setEditingTitle('');
    }, []);

    const saveTitle = useCallback(
      async (id: number) => {
        if (!apiClient) return;
        const task = tasks.find((t) => t.id === id);
        if (!task || !editingTitle.trim() || task.title === editingTitle.trim()) {
          setEditingId(null);
          return;
        }
        setActionLoading(id);
        try {
          await apiClient.put(`/tasks/${id}`, { ...task, title: editingTitle.trim() });
          toast.success('Title saved');
          setEditingId(null);
          setRefreshKey((k) => k + 1);
        } catch (e) {
          toast.error(handleError(e, 'Save failed'));
        } finally {
          setActionLoading(null);
        }
      },
      [tasks, editingTitle, apiClient, handleError, setRefreshKey]
    );

    const saveDescription = useCallback(
      async (id: number) => {
        if (!apiClient) return;
        const task = tasks.find((t) => t.id === id);
        if (!task) return;
        const newDesc = (descriptionEdits[id] ?? '').trim();
        if ((task.description ?? '') === newDesc) return toast.info('No changes');
        setActionLoading(id);
        try {
          await apiClient.put(`/tasks/${id}`, { ...task, description: newDesc });
          toast.success('Description saved');
          setExpandedTaskId(null);
          setRefreshKey((k) => k + 1);
        } catch (e) {
          toast.error(handleError(e, 'Save failed'));
        } finally {
          setActionLoading(null);
        }
      },
      [tasks, descriptionEdits, apiClient, handleError, setRefreshKey]
    );

    const savePriority = useCallback(
      async (id: number, newPriority: string) => {
        if (!apiClient) return;
        const task = tasks.find((t) => t.id === id);
        if (!task || task.priority === newPriority) return;
        setActionLoading(id);
        try {
          await apiClient.put(`/tasks/${id}`, { ...task, priority: newPriority });
          toast.success('Priority updated');
          setRefreshKey((k) => k + 1);
        } catch (e) {
          toast.error(handleError(e, 'Update failed'));
        } finally {
          setActionLoading(null);
        }
      },
      [tasks, apiClient, handleError, setRefreshKey]
    );

    const saveCategory = useCallback(
      async (id: number, newCategory: string) => {
        if (!apiClient) return;
        const task = tasks.find((t) => t.id === id);
        if (!task || task.category === newCategory) return;
        setActionLoading(id);
        try {
          await apiClient.put(`/tasks/${id}`, { ...task, category: newCategory });
          toast.success('Category updated');
          setRefreshKey((k) => k + 1);
        } catch (e) {
          toast.error(handleError(e, 'Update failed'));
        } finally {
          setActionLoading(null);
        }
      },
      [tasks, apiClient, handleError, setRefreshKey]
    );

    const confirmDelete = useCallback((id: number) => setDeleteConfirmId(id), []);
    const deleteConfirmed = useCallback(async () => {
      if (!apiClient || deleteConfirmId === null) return;
      const id = deleteConfirmId;
      setDeleteConfirmId(null);
      setActionLoading(id);
      try {
        await apiClient.delete(`/tasks/${id}`);
        toast.warn('Task deleted');
        setRefreshKey((k) => k + 1);
      } catch (e) {
        toast.error(handleError(e, 'Delete failed'));
      } finally {
        setActionLoading(null);
      }
    }, [deleteConfirmId, apiClient, handleError, setRefreshKey]);

    const suggestTask = useCallback(() => {
      const opts = ['Update docs', 'Team sync', 'Review PR #123', 'Plan goals'];
      setNewTask(opts[Math.floor(Math.random() * opts.length)]);
      toast.info('Suggestion added');
    }, []);

    // ────── CSV Export ──────
    const csvHeaders = [
      { label: 'ID', key: 'id' },
      { label: 'Title', key: 'title' },
      { label: 'Status', key: 'status' },
      { label: 'Priority', key: 'priority' },
      { label: 'Category', key: 'category' },
      { label: 'Date', key: 'taskDate' },
      { label: 'Description', key: 'description' },
    ];

    const exportCSV = () => {
      if (!tasks.length) return toast.info('No tasks to export');
      const data = tasks.map((t) => ({
        id: t.id,
        title: t.title,
        status: t.completed ? 'Completed' : 'Pending',
        priority: t.priority ?? 'medium',
        category: t.category ?? 'Other',
        taskDate: t.taskDate,
        description: t.description ?? '',
      }));
      flushSync(() => setCsvData(data));
      setTimeout(() => csvLinkRef.current?.link.click(), 0);
      toast.success('CSV ready');
    };

    useImperativeHandle(ref, () => ({ exportToCSV: exportCSV }));

    // ────── Filtered Tasks ──────
    const filteredTasks = useMemo(() => {
      return tasks.filter((task) => {
        // Filter by search query
        const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (task.description ?? '').toLowerCase().includes(searchQuery.toLowerCase());

        // Filter by status
        const matchesStatus =
          filterStatus === 'all' ||
          (filterStatus === 'completed' && task.completed) ||
          (filterStatus === 'pending' && !task.completed);

        return matchesSearch && matchesStatus;
      });
    }, [tasks, searchQuery, filterStatus]);

    // ────── Render ──────
    if (!token)
      return (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
          <CircularProgress />
        </Box>
      );

    if (error && !tasks.length && !loading)
      return (
        <Box sx={{ textAlign: 'center', mt: 6 }}>
          <Typography color="error" gutterBottom>{error}</Typography>
          <Button variant="contained" onClick={() => setRefreshKey((k) => k + 1)}>
            Retry
          </Button>
        </Box>
      );

    return (
      <Paper elevation={4} sx={{ p: { xs: 2, md: 3 }, borderRadius: 3 }}>
        {/* Hidden CSV link */}
        <CSVLink
          data={csvData}
          headers={csvHeaders}
          filename={`Tasks_${selectedDate.format('YYYY-MM-DD')}.csv`}
          ref={csvLinkRef}
          style={{ display: 'none' }}
        />

        {/* ----- Add New Task ----- */}
        <Box display="flex" flexDirection={{ xs: 'column', sm: 'row' }} gap={2} mb={3}>
          <TextField
            fullWidth
            size="small"
            label="Add new task"
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addTask()}
            disabled={actionLoading === 'add'}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 3,
                transition: 'all 0.3s ease',
                '&:hover': {
                  boxShadow: '0 4px 12px rgba(20, 184, 166, 0.15)',
                },
                '&.Mui-focused': {
                  boxShadow: '0 4px 16px rgba(20, 184, 166, 0.2)',
                },
              },
            }}
          />
          <Box display="flex" gap={1} flexShrink={0}>
            <Button
              variant="contained"
              onClick={addTask}
              disabled={actionLoading === 'add' || !newTask.trim()}
              sx={{
                minWidth: 110,
                borderRadius: 3,
                background: 'linear-gradient(135deg, #14b8a6 0%, #0d9488 100%)',
                fontWeight: 600,
                transition: 'all 0.3s ease',
                '&:hover': {
                  background: 'linear-gradient(135deg, #0d9488 0%, #0f766e 100%)',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 8px 16px rgba(20, 184, 166, 0.4)',
                },
                '&:active': {
                  transform: 'translateY(0)',
                },
              }}
            >
              {actionLoading === 'add' ? <CircularProgress size={22} /> : 'Add Task'}
            </Button>
            <Button
              variant="outlined"
              onClick={suggestTask}
              disabled={actionLoading === 'add'}
              sx={{
                borderRadius: 3,
                fontWeight: 600,
                borderColor: 'rgba(251, 146, 60, 0.5)',
                color: '#fb923c',
                transition: 'all 0.3s ease',
                '&:hover': {
                  borderColor: '#fb923c',
                  backgroundColor: 'rgba(251, 146, 60, 0.1)',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 8px 16px rgba(251, 146, 60, 0.25)',
                },
                '&:active': {
                  transform: 'translateY(0)',
                },
              }}
            >
              Suggest
            </Button>
          </Box>
        </Box>

        {/* ----- Search and Filter ----- */}
        <Box display="flex" flexDirection={{ xs: 'column', sm: 'row' }} gap={2} mb={3}>
          <TextField
            fullWidth
            size="small"
            placeholder="Search tasks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: 'text.secondary' }} />
                </InputAdornment>
              ),
              endAdornment: searchQuery && (
                <InputAdornment position="end">
                  <IconButton size="small" onClick={() => setSearchQuery('')}>
                    <CloseIcon fontSize="small" />
                  </IconButton>
                </InputAdornment>
              ),
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 3,
                transition: 'all 0.3s ease',
                '&:hover': {
                  boxShadow: '0 4px 12px rgba(59, 130, 246, 0.1)',
                },
                '&.Mui-focused': {
                  boxShadow: '0 4px 16px rgba(59, 130, 246, 0.15)',
                },
              },
            }}
          />
          <ToggleButtonGroup
            value={filterStatus}
            exclusive
            onChange={(_, newValue) => newValue && setFilterStatus(newValue)}
            size="small"
            sx={{
              flexShrink: 0,
              '& .MuiToggleButton-root': {
                borderRadius: 2,
                px: 2.5,
                fontWeight: 600,
                textTransform: 'none',
                border: '1px solid rgba(148, 163, 184, 0.2)',
                '&.Mui-selected': {
                  background: 'linear-gradient(135deg, #14b8a6 0%, #0d9488 100%)',
                  color: '#ffffff',
                  border: '1px solid #14b8a6',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #0d9488 0%, #0f766e 100%)',
                  },
                },
              },
            }}
          >
            <ToggleButton value="all">All</ToggleButton>
            <ToggleButton value="pending">Pending</ToggleButton>
            <ToggleButton value="completed">Completed</ToggleButton>
          </ToggleButtonGroup>
        </Box>

        {/* ----- Analytics ----- */}
        <Box mb={2}>
          {loading && !analytics ? (
            <Typography variant="subtitle2">Loading analytics…</Typography>
          ) : analytics ? (
            <Typography variant="h6" gutterBottom>
              {selectedDate.format('MMMM D, YYYY')} –{' '}
              <Chip label={`${analytics.total} total`} size="small" sx={{ mx: 0.5 }} />
              <Chip label={`${analytics.completed} done`} color="success" size="small" sx={{ mx: 0.5 }} />
              <Chip label={`${analytics.pending} pending`} color="warning" size="small" sx={{ mx: 0.5 }} />
            </Typography>
          ) : (
            !loading && <Typography variant="subtitle2">No tasks today.</Typography>
          )}
        </Box>

        {/* ----- Task List ----- */}
        <Box mb={2}>
          <Typography variant="body2" color="text.secondary" mb={1}>
            {filteredTasks.length === tasks.length
              ? `Showing all ${tasks.length} task${tasks.length !== 1 ? 's' : ''}`
              : `Showing ${filteredTasks.length} of ${tasks.length} task${tasks.length !== 1 ? 's' : ''}`}
          </Typography>
        </Box>
        <List sx={{ maxHeight: { xs: 'calc(100vh - 520px)', md: '55vh' }, overflowY: 'auto' }}>
          {filteredTasks.length === 0 && !loading ? (
            <Fade in>
              <Typography textAlign="center" color="text.secondary" my={4}>
                {searchQuery || filterStatus !== 'all'
                  ? 'No tasks match your filters.'
                  : 'No tasks scheduled.'}
              </Typography>
            </Fade>
          ) : (
            filteredTasks.map((task) => {
              const editing = editingId === task.id;
              const expanded = expandedTaskId === task.id;
              const loadingThis = actionLoading === task.id;
              const desc = descriptionEdits[task.id] ?? task.description ?? '';

              return (
                <Card key={task.id} variant="outlined" sx={{ mb: 2, opacity: loadingThis ? 0.6 : 1 }}>
                  <CardContent sx={{ pb: 1 }}>
                    <Box display="flex" alignItems="center" gap={1}>
                      <Checkbox
                        checked={task.completed}
                        onChange={() => toggleComplete(task.id, task.completed)}
                        disabled={loadingThis || editing}
                      />
                      {editing ? (
                        <TextField
                          fullWidth
                          size="small"
                          value={editingTitle}
                          onChange={(e) => setEditingTitle(e.target.value)}
                          inputRef={titleInputRef}
                          onBlur={() => saveTitle(task.id)}
                          onKeyDown={(e) => e.key === 'Enter' && saveTitle(task.id)}
                          sx={{ flexGrow: 1 }}
                        />
                      ) : (
                        <Box sx={{ flexGrow: 1 }}>
                          <Typography
                            onClick={() => startEdit(task.id, task.title)}
                            sx={{
                              cursor: 'pointer',
                              textDecoration: task.completed ? 'line-through' : 'none',
                              opacity: task.completed ? 0.6 : 1,
                              mb: 0.5,
                            }}
                          >
                            {task.title}
                          </Typography>
                          <Box display="flex" gap={0.75} flexWrap="wrap">
                            <Chip
                              size="small"
                              icon={<FlagIcon sx={{ fontSize: 14 }} />}
                              label={task.priority ?? 'medium'}
                              sx={{
                                height: 20,
                                fontSize: '0.7rem',
                                fontWeight: 600,
                                backgroundColor:
                                  (task.priority ?? 'medium') === 'high'
                                    ? 'rgba(239, 68, 68, 0.15)'
                                    : (task.priority ?? 'medium') === 'medium'
                                    ? 'rgba(245, 158, 11, 0.15)'
                                    : 'rgba(16, 185, 129, 0.15)',
                                color:
                                  (task.priority ?? 'medium') === 'high'
                                    ? '#ef4444'
                                    : (task.priority ?? 'medium') === 'medium'
                                    ? '#f59e0b'
                                    : '#10b981',
                                border: 'none',
                                '& .MuiChip-icon': {
                                  color:
                                    (task.priority ?? 'medium') === 'high'
                                      ? '#ef4444'
                                      : (task.priority ?? 'medium') === 'medium'
                                      ? '#f59e0b'
                                      : '#10b981',
                                },
                              }}
                            />
                            <Chip
                              size="small"
                              icon={<LabelIcon sx={{ fontSize: 14 }} />}
                              label={task.category ?? 'Other'}
                              sx={{
                                height: 20,
                                fontSize: '0.7rem',
                                fontWeight: 600,
                                backgroundColor: 'rgba(34, 211, 238, 0.15)',
                                color: '#22d3ee',
                                border: 'none',
                                '& .MuiChip-icon': {
                                  color: '#22d3ee',
                                },
                              }}
                            />
                          </Box>
                        </Box>
                      )}
                      {!editing && (
                        <ExpandMore
                          expand={expanded}
                          onClick={() => handleExpand(task.id)}
                          disabled={loadingThis}
                        >
                          <ExpandMoreIcon />
                        </ExpandMore>
                      )}
                      {editing && (
                        <IconButton
                          onClick={() => saveTitle(task.id)}
                          color="primary"
                          disabled={loadingThis || !editingTitle.trim()}
                        >
                          {loadingThis ? <CircularProgress size={18} /> : <SaveIcon />}
                        </IconButton>
                      )}
                    </Box>
                  </CardContent>

                  <Collapse in={expanded} timeout="auto" unmountOnExit>
                    <CardContent sx={{ pt: 0 }}>
                      {/* Priority and Category Row */}
                      <Box display="flex" gap={2} mb={2} flexDirection={{ xs: 'column', sm: 'row' }}>
                        <FormControl fullWidth size="small">
                          <InputLabel>Priority</InputLabel>
                          <Select
                            value={priorityEdits[task.id] ?? 'medium'}
                            label="Priority"
                            onChange={(e) => {
                              setPriorityEdits((p) => ({ ...p, [task.id]: e.target.value }));
                              savePriority(task.id, e.target.value);
                            }}
                            disabled={loadingThis}
                            startAdornment={
                              <Box sx={{ display: 'flex', alignItems: 'center', mr: 1 }}>
                                <FlagIcon
                                  sx={{
                                    fontSize: 18,
                                    color:
                                      (priorityEdits[task.id] ?? 'medium') === 'high'
                                        ? '#ef4444'
                                        : (priorityEdits[task.id] ?? 'medium') === 'medium'
                                        ? '#f59e0b'
                                        : '#10b981',
                                  }}
                                />
                              </Box>
                            }
                          >
                            <MenuItem value="low">
                              <Box display="flex" alignItems="center" gap={1}>
                                <FlagIcon sx={{ fontSize: 18, color: '#10b981' }} />
                                <Typography>Low</Typography>
                              </Box>
                            </MenuItem>
                            <MenuItem value="medium">
                              <Box display="flex" alignItems="center" gap={1}>
                                <FlagIcon sx={{ fontSize: 18, color: '#f59e0b' }} />
                                <Typography>Medium</Typography>
                              </Box>
                            </MenuItem>
                            <MenuItem value="high">
                              <Box display="flex" alignItems="center" gap={1}>
                                <FlagIcon sx={{ fontSize: 18, color: '#ef4444' }} />
                                <Typography>High</Typography>
                              </Box>
                            </MenuItem>
                          </Select>
                        </FormControl>

                        <FormControl fullWidth size="small">
                          <InputLabel>Category</InputLabel>
                          <Select
                            value={categoryEdits[task.id] ?? 'Other'}
                            label="Category"
                            onChange={(e) => {
                              setCategoryEdits((p) => ({ ...p, [task.id]: e.target.value }));
                              saveCategory(task.id, e.target.value);
                            }}
                            disabled={loadingThis}
                            startAdornment={
                              <Box sx={{ display: 'flex', alignItems: 'center', mr: 1 }}>
                                <LabelIcon sx={{ fontSize: 18, color: '#22d3ee' }} />
                              </Box>
                            }
                          >
                            <MenuItem value="Work">Work</MenuItem>
                            <MenuItem value="Personal">Personal</MenuItem>
                            <MenuItem value="Shopping">Shopping</MenuItem>
                            <MenuItem value="Health">Health</MenuItem>
                            <MenuItem value="Learning">Learning</MenuItem>
                            <MenuItem value="Other">Other</MenuItem>
                          </Select>
                        </FormControl>
                      </Box>

                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        Description
                      </Typography>
                      <TextField
                        fullWidth
                        multiline
                        rows={3}
                        variant="outlined"
                        size="small"
                        value={desc}
                        onChange={(e) => setDescriptionEdits((p) => ({ ...p, [task.id]: e.target.value }))}
                        placeholder="Add details…"
                        disabled={loadingThis}
                        inputProps={{ maxLength: 500 }}
                      />
                      <Box textAlign="right" mt={1}>
                        <Button
                          size="small"
                          variant="contained"
                          onClick={() => saveDescription(task.id)}
                          disabled={loadingThis}
                          startIcon={loadingThis ? <CircularProgress size={16} /> : <SaveIcon />}
                          sx={{
                            background: 'linear-gradient(135deg, #14b8a6 0%, #0d9488 100%)',
                            '&:hover': {
                              background: 'linear-gradient(135deg, #0d9488 0%, #0f766e 100%)',
                            },
                          }}
                        >
                          Save Description
                        </Button>
                      </Box>
                    </CardContent>
                  </Collapse>

                  <CardActions sx={{ justifyContent: 'flex-end', pt: 0 }}>
                    {!editing && !expanded && (
                      <>
                        <IconButton onClick={() => startEdit(task.id, task.title)} color="info" disabled={loadingThis}>
                          <EditIcon />
                        </IconButton>
                        <IconButton onClick={() => confirmDelete(task.id)} color="error" disabled={loadingThis}>
                          <DeleteIcon />
                        </IconButton>
                      </>
                    )}
                    {editing && (
                      <>
                        <IconButton onClick={cancelEdit} color="warning" disabled={loadingThis}>
                          <CancelIcon />
                        </IconButton>
                        <IconButton onClick={() => confirmDelete(task.id)} color="error" disabled={loadingThis}>
                          <DeleteIcon />
                        </IconButton>
                      </>
                    )}
                    {expanded && !editing && (
                      <IconButton onClick={() => confirmDelete(task.id)} color="error" disabled={loadingThis}>
                        <DeleteIcon />
                      </IconButton>
                    )}
                  </CardActions>
                </Card>
              );
            })
          )}
        </List>

        {/* ----- Date Picker + Pending List ----- */}
        <Paper elevation={2} sx={{ mt: 4, p: 2, borderRadius: 2 }}>
          <Box display="flex" flexDirection={{ xs: 'column', md: 'row' }} gap={3}>
            {/* Pending Dates */}
            <Box flex={{ xs: 1, md: '0 0 280px' }}>
              <Typography variant="h6" gutterBottom>
                Pending Dates
              </Typography>
              {loading ? (
                <Box display="flex" justifyContent="center" my={2}>
                  <CircularProgress size={28} />
                </Box>
              ) : pendingDates.length === 0 ? (
                <Typography variant="body2" color="text.secondary">
                  All clear!
                </Typography>
              ) : (
                <List dense sx={{ maxHeight: 260, overflowY: 'auto' }}>
                  {pendingDates.map((d) => (
                    <ListItemButton
                      key={d}
                      selected={selectedDate.isSame(d, 'day')}
                      onClick={() => handleDateChange(dayjs(d))}
                    >
                      <ListItemText primary={dayjs(d).format('MMM D, YYYY')} />
                    </ListItemButton>
                  ))}
                </List>
              )}
            </Box>

            {/* Calendar */}
            <Box flex={1} minWidth={300}>
              <StaticDatePicker
                value={selectedDate}
                onChange={handleDateChange}
                readOnly={loading || actionLoading !== null}
                slotProps={{ actionBar: { actions: [] } }}
              />
            </Box>
          </Box>
        </Paper>

        {/* ----- Delete Confirm Dialog ----- */}
        <Dialog open={deleteConfirmId !== null} onClose={() => setDeleteConfirmId(null)}>
          <DialogTitle>Delete task?</DialogTitle>
          <DialogContent>
            <Typography>This action cannot be undone.</Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDeleteConfirmId(null)} disabled={actionLoading === deleteConfirmId}>
              Cancel
            </Button>
            <Button
              onClick={deleteConfirmed}
              color="error"
              disabled={actionLoading === deleteConfirmId}
            >
              {actionLoading === deleteConfirmId ? <CircularProgress size={20} /> : 'Delete'}
            </Button>
          </DialogActions>
        </Dialog>
      </Paper>
    );
  }
);

TaskList.displayName = 'TaskList';
export default TaskList;