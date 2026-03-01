'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { 
  Box, 
  Typography, 
  Paper,
  Tabs,
  Tab,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Avatar,
  LinearProgress
} from '@mui/material'
import { 
  People as UsersIcon,
  Assignment as TasksIcon,
  Policy as PoliciesIcon,
  Description as ContractsIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  CheckCircle as ApproveIcon,
  Cancel as RejectIcon
} from '@mui/icons-material'
import { createClient } from '@/lib/supabase/client'

interface User {
  id: string
  user_id: string
  profile_id: string
  first_name: string | null
  last_name: string | null
  email: string
  role: string
  created_at: string
}

interface Task {
  id: string
  task_id: string
  title: string
  task_type: string
  is_mandatory: boolean
  assigned_to: string
}

export default function AdminPage() {
  const router = useRouter()
  const supabase = createClient()
  const [tab, setTab] = useState(0)
  const [users, setUsers] = useState<User[]>([])
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [openUserDialog, setOpenUserDialog] = useState(false)
  const [openTaskDialog, setOpenTaskDialog] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    task_type: 'form',
    assigned_to: '',
    is_mandatory: false
  })

  useEffect(() => {
    const checkAdmin = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('user_id', user.id)
        .single()

      if (!profile || profile.role !== 'admin') {
        router.push('/dashboard/home')
        return
      }

      loadData()
    }
    checkAdmin()
  }, [supabase, router])

  const loadData = async () => {
    setLoading(true)
    
    const { data: usersData } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (usersData) {
      setUsers(usersData)
    }

    const { data: tasksData } = await supabase
      .from('tasks')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (tasksData) {
      setTasks(tasksData)
    }

    setLoading(false)
  }

  const handleCreateTask = async () => {
    const taskId = Math.random().toString(36).substring(2, 7).toUpperCase()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) return

    const { error } = await supabase
      .from('tasks')
      .insert({
        task_id: taskId,
        title: newTask.title,
        description: newTask.description,
        task_type: newTask.task_type,
        assigned_to: newTask.assigned_to,
        created_by: user.id,
        is_mandatory: newTask.is_mandatory
      })

    if (!error) {
      setOpenTaskDialog(false)
      setNewTask({
        title: '',
        description: '',
        task_type: 'form',
        assigned_to: '',
        is_mandatory: false
      })
      loadData()
    }
  }

  const handleUpdateUserRole = async (userId: string, role: string) => {
    const { error } = await supabase
      .from('profiles')
      .update({ role })
      .eq('id', userId)

    if (!error) {
      loadData()
    }
  }

  if (loading) {
    return <Box sx={{ p: 3 }}><LinearProgress /></Box>
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f8fafc', pb: 12 }}>
      <Box
        sx={{
          background: 'linear-gradient(135deg, #1e293b 0%, #475569 100%)',
          color: 'white',
          px: 3,
          py: 4,
          borderRadius: '0 0 24px 24px',
        }}
      >
        <Typography variant="h5" fontWeight={600}>
          Admin Portal
        </Typography>
        <Typography variant="body2" sx={{ opacity: 0.9, mt: 1 }}>
          Manage users, tasks, and content
        </Typography>
      </Box>

      <Box sx={{ px: 3, mt: 3 }}>
        <Paper sx={{ width: '100%' }}>
          <Tabs 
            value={tab} 
            onChange={(e, v) => setTab(v)}
            sx={{ borderBottom: 1, borderColor: 'divider' }}
          >
            <Tab icon={<UsersIcon />} label="Users" />
            <Tab icon={<TasksIcon />} label="Tasks" />
            <Tab icon={<PoliciesIcon />} label="Policies" />
            <Tab icon={<ContractsIcon />} label="Contracts" />
          </Tabs>

          {tab === 0 && (
            <Box sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>User Management</Typography>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>User</TableCell>
                      <TableCell>Profile ID</TableCell>
                      <TableCell>Email</TableCell>
                      <TableCell>Role</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {users.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Avatar sx={{ width: 32, height: 32 }}>
                              {user.first_name?.[0] || user.email[0]}
                            </Avatar>
                            <Typography>
                              {user.first_name} {user.last_name}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>{user.profile_id}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>
                          <Chip 
                            label={user.role} 
                            color={user.role === 'admin' ? 'error' : user.role === 'client' ? 'secondary' : 'primary'}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <FormControl size="small" sx={{ minWidth: 120 }}>
                            <Select
                              value={user.role}
                              onChange={(e) => handleUpdateUserRole(user.id, e.target.value)}
                            >
                              <MenuItem value="candidate">Candidate</MenuItem>
                              <MenuItem value="client">VIP Client</MenuItem>
                              <MenuItem value="admin">Admin</MenuItem>
                            </Select>
                          </FormControl>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          )}

          {tab === 1 && (
            <Box sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h6">Task Management</Typography>
                <Button 
                  variant="contained" 
                  onClick={() => setOpenTaskDialog(true)}
                >
                  Create Task
                </Button>
              </Box>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Task ID</TableCell>
                      <TableCell>Title</TableCell>
                      <TableCell>Type</TableCell>
                      <TableCell>Mandatory</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {tasks.map((task) => (
                      <TableRow key={task.id}>
                        <TableCell>{task.task_id}</TableCell>
                        <TableCell>{task.title}</TableCell>
                        <TableCell>
                          <Chip label={task.task_type} size="small" variant="outlined" />
                        </TableCell>
                        <TableCell>
                          {task.is_mandatory && <Chip label="Required" color="error" size="small" />}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          )}

          {tab === 2 && (
            <Box sx={{ p: 3 }}>
              <Typography variant="h6">Policy Management</Typography>
              <Typography variant="body2" color="text.secondary">
                Manage policies and legal references
              </Typography>
            </Box>
          )}

          {tab === 3 && (
            <Box sx={{ p: 3 }}>
              <Typography variant="h6">Contract Management</Typography>
              <Typography variant="body2" color="text.secondary">
                View and manage labor contracts
              </Typography>
            </Box>
          )}
        </Paper>
      </Box>

      <Dialog open={openTaskDialog} onClose={() => setOpenTaskDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Create New Task</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Title"
            value={newTask.title}
            onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
            sx={{ mt: 2, mb: 2 }}
          />
          <TextField
            fullWidth
            label="Description"
            multiline
            rows={3}
            value={newTask.description}
            onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
            sx={{ mb: 2 }}
          />
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Task Type</InputLabel>
            <Select
              value={newTask.task_type}
              label="Task Type"
              onChange={(e) => setNewTask({ ...newTask, task_type: e.target.value })}
            >
              <MenuItem value="form">Form</MenuItem>
              <MenuItem value="upload">Upload</MenuItem>
              <MenuItem value="video">Video</MenuItem>
              <MenuItem value="text">Text</MenuItem>
              <MenuItem value="training">Training</MenuItem>
            </Select>
          </FormControl>
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Assign To</InputLabel>
            <Select
              value={newTask.assigned_to}
              label="Assign To"
              onChange={(e) => setNewTask({ ...newTask, assigned_to: e.target.value })}
            >
              {users.filter(u => u.role !== 'admin').map((user) => (
                <MenuItem key={user.id} value={user.user_id}>
                  {user.first_name} {user.last_name} ({user.email})
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenTaskDialog(false)}>Cancel</Button>
          <Button onClick={handleCreateTask} variant="contained">Create</Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
