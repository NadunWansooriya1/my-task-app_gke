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
} from '@mui/material';
import {
  Delete as DeleteIcon,
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  ExpandMore as ExpandMoreIcon,
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { toast } from 'react-toastify';
import { StaticDatePicker } from '@mui/x-date-pickers/StaticDatePicker';
import dayjs, { Dayjs } from 'dayjs';
import { CSVLink } from 'react-csv';
import { API_ENDPOINTS } from './config'; // <-- 1. ADD THIS IMPORT

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
    const [loading, setLoading] = useState(false);
    const [actionLoading, setActionLoading] = useState<number | 'add' | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [analytics, setAnalytics] = useState<Analytics | null>(null);
    const [selectedDate, setSelectedDate] = useState<Dayjs>(dayjs());
    const [expandedTaskId, setExpandedTaskId] = useState<number | null>(null);
    const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);
    const [csvData, setCsvData] = useState<any[]>([]);
    const [pendingDates, setPendingDates] = useState<string[]>([]);

    const csvLinkRef = useRef<any>(null);
    const titleInputRef = useRef<HTMLInputElement>(null);

    // ────── Axios client ──────
    const apiClient = useMemo(() => {
      if (!token) return null;
      return axios.create({
        // 2. USE THE CONFIG VARIABLE INSTEAD OF A HARDCODED STRING
        baseURL: API_ENDPOINTS.TASKS.replace('/tasks', ''),
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
          setTasks(tasksRes.data);
          const desc: Record<number, string> = {};
          tasksRes.data.forEach((t) => (desc[t.id] = t.description ?? ''));
          setDescriptionEdits(desc);
          setAnalytics(analyticsRes.data);
          setPendingDates(pendingRes.data);
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
      { label: 'Date', key: 'taskDate' },
      { label: 'Description', key: 'description' },
    ];

    const exportCSV = () => {
      if (!tasks.length) return toast.info('No tasks to export');
      const data = tasks.map((t) => ({
        id: t.id,
        title: t.title,
        status: t.completed ? 'Completed' : 'Pending',
        taskDate: t.taskDate,
        description: t.description ?? '',
      }));
      flushSync(() => setCsvData(data));
      setTimeout(() => csvLinkRef.current?.link.click(), 0);
      toast.success('CSV ready');
    };

    useImperativeHandle(ref, () => ({ exportToCSV: exportCSV }));

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
            label="New task"
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addTask()}
            disabled={actionLoading === 'add'}
          />
          <Box display="flex" gap={1} flexShrink={0}>
            <Button
              variant="contained"
              onClick={addTask}
              disabled={actionLoading === 'add' || !newTask.trim()}
              sx={{ minWidth: 110 }}
            >
              {actionLoading === 'add' ? <CircularProgress size={22} /> : 'Add'}
            </Button>
            <Button variant="outlined" onClick={suggestTask} disabled={actionLoading === 'add'}>
              Suggest
            </Button>
          </Box>
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
        <List sx={{ maxHeight: { xs: 'calc(100vh - 420px)', md: '62vh' }, overflowY: 'auto' }}>
          {tasks.length === 0 && !loading ? (
            <Typography textAlign="center" color="text.secondary" my={4}>
              No tasks scheduled.
            </Typography>
          ) : (
            tasks.map((task) => {
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
                        <Typography
                          onClick={() => startEdit(task.id, task.title)}
                          sx={{
                            flexGrow: 1,
                            cursor: 'pointer',
                            textDecoration: task.completed ? 'line-through' : 'none',
                            opacity: task.completed ? 0.6 : 1,
                          }}
                        >
                          {task.title}
                        </Typography>
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
                        >
                          Save
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