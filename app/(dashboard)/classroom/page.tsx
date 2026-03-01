'use client'

import { useState, useEffect, useRef } from 'react'
import { 
  Box, 
  Typography, 
  Paper,
  Card,
  CardContent,
  Button,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  LinearProgress,
  IconButton,
  Alert
} from '@mui/material'
import { 
  CloudUpload as UploadIcon,
  Description as FormIcon,
  PlayCircle as VideoIcon,
  Article as TextIcon,
  School as TrainingIcon,
  Close as CloseIcon,
  CheckCircle as SubmitIcon,
  Assignment as TaskIcon
} from '@mui/icons-material'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

interface Task {
  id: string
  task_id: string
  title: string
  description: string
  task_type: 'upload' | 'form' | 'video' | 'text' | 'training'
  is_mandatory: boolean
  due_date: string | null
  created_at: string
}

interface Submission {
  id: string
  task_id: string
  status: 'pending' | 'approved' | 'rejected'
}

export default function ClassroomPage() {
  const router = useRouter()
  const supabase = createClient()
  const [user, setUser] = useState<any>(null)
  const [tasks, setTasks] = useState<Task[]>([])
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [openDialog, setOpenDialog] = useState(false)
  const [formData, setFormData] = useState<any>({})
  const [file, setFile] = useState<File | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const getData = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }
      setUser(user)

      const { data: tasksData } = await supabase
        .from('tasks')
        .select('*')
        .eq('assigned_to', user.id)
        .order('created_at', { ascending: false })
      
      if (tasksData) {
        setTasks(tasksData)
      }

      const { data: submissionsData } = await supabase
        .from('task_submissions')
        .select('*')
        .eq('user_id', user.id)
      
      if (submissionsData) {
        setSubmissions(submissionsData)
      }

      setLoading(false)
    }
    getData()
  }, [supabase, router])

  const getTaskIcon = (type: string) => {
    switch (type) {
      case 'upload': return <UploadIcon />
      case 'form': return <FormIcon />
      case 'video': return <VideoIcon />
      case 'text': return <TextIcon />
      case 'training': return <TrainingIcon />
      default: return <TaskIcon />
    }
  }

  const getTaskStatus = (taskId: string) => {
    const submission = submissions.find(s => s.task_id === taskId)
    if (!submission) return null
    return submission.status
  }

  const handleTaskClick = (task: Task) => {
    setSelectedTask(task)
    setOpenDialog(true)
    setFormData({})
    setFile(null)
    setError('')
    setSuccess('')
  }

  const handleSubmit = async () => {
    if (!selectedTask || !user) return
    
    setSubmitting(true)
    setError('')

    try {
      const submissionId = Math.random().toString(36).substring(2, 7).toUpperCase()
      let content: any = { type: selectedTask.task_type }

      if (selectedTask.task_type === 'upload' && file) {
        const fileExt = file.name.split('.').pop()
        const fileName = `${user.id}/${selectedTask.task_id}/${submissionId}.${fileExt}`
        
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('uploads')
          .upload(fileName, file)

        if (uploadError) throw uploadError

        const { data: { publicUrl } } = supabase.storage
          .from('uploads')
          .getPublicUrl(fileName)

        content = { ...content, file_url: publicUrl, file_name: file.name }
      } else {
        content = { ...content, ...formData }
      }

      const { error: submitError } = await supabase
        .from('task_submissions')
        .insert({
          submission_id: submissionId,
          task_id: selectedTask.id,
          user_id: user.id,
          content,
          status: 'pending'
        })

      if (submitError) throw submitError

      setSuccess('Submission successful! Waiting for admin approval.')
      setTimeout(() => {
        setOpenDialog(false)
        setSuccess('')
        router.refresh()
      }, 2000)
    } catch (err: any) {
      setError(err.message || 'Submission failed')
    }

    setSubmitting(false)
  }

  const renderTaskForm = () => {
    if (!selectedTask) return null

    switch (selectedTask.task_type) {
      case 'upload':
        return (
          <Box>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              {selectedTask.description}
            </Typography>
            <input
              type="file"
              ref={fileInputRef}
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              style={{ display: 'none' }}
              accept="image/*,.pdf,.doc,.docx"
            />
            <Button
              variant="outlined"
              startIcon={<UploadIcon />}
              onClick={() => fileInputRef.current?.click()}
              fullWidth
            >
              {file ? file.name : 'Select File'}
            </Button>
            {file && (
              <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                Selected: {file.name}
              </Typography>
            )}
          </Box>
        )
      case 'form':
        return (
          <Box>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              {selectedTask.description}
            </Typography>
            <TextField
              fullWidth
              multiline
              rows={4}
              label="Your Answer"
              value={formData.answer || ''}
              onChange={(e) => setFormData({ ...formData, answer: e.target.value })}
            />
          </Box>
        )
      case 'video':
      case 'text':
        return (
          <Box>
            <Typography variant="body2" color="text.secondary">
              {selectedTask.description}
            </Typography>
            <Alert severity="info" sx={{ mt: 2 }}>
              Please complete this training to mark as done.
            </Alert>
          </Box>
        )
      default:
        return null
    }
  }

  if (loading) {
    return <Box sx={{ p: 3 }}><LinearProgress /></Box>
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f8fafc', pb: 12 }}>
      <Box
        sx={{
          background: 'linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)',
          color: 'white',
          px: 3,
          py: 4,
          borderRadius: '0 0 24px 24px',
        }}
      >
        <Typography variant="h5" fontWeight={600}>
          Classroom
        </Typography>
        <Typography variant="body2" sx={{ opacity: 0.9, mt: 1 }}>
          Complete your assigned tasks
        </Typography>
      </Box>

      <Box sx={{ px: 3, mt: 3 }}>
        {tasks.length === 0 ? (
          <Paper sx={{ p: 4, textAlign: 'center' }}>
            <Typography>No tasks assigned yet</Typography>
          </Paper>
        ) : (
          tasks.map((task) => {
            const status = getTaskStatus(task.id)
            return (
              <Card 
                key={task.id} 
                sx={{ mb: 2, cursor: 'pointer', '&:hover': { transform: 'translateY(-2px)' } }}
                onClick={() => handleTaskClick(task)}
              >
                <CardContent sx={{ display: 'flex', alignItems: 'center' }}>
                  <Box sx={{ 
                    p: 1.5, 
                    borderRadius: 2, 
                    bgcolor: 'primary.main', 
                    color: 'white',
                    mr: 2
                  }}>
                    {getTaskIcon(task.task_type)}
                  </Box>
                  <Box sx={{ flex: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography fontWeight={600}>{task.title}</Typography>
                      {task.is_mandatory && (
                        <Chip label="Required" size="small" color="error" sx={{ height: 20 }} />
                      )}
                    </Box>
                    <Typography variant="body2" color="text.secondary" noWrap>
                      {task.description}
                    </Typography>
                    {status && (
                      <Chip 
                        label={status === 'pending' ? 'Pending' : status === 'approved' ? 'Approved' : 'Rejected'}
                        size="small"
                        color={status === 'pending' ? 'warning' : status === 'approved' ? 'success' : 'error'}
                        sx={{ mt: 1 }}
                      />
                    )}
                  </Box>
                </CardContent>
              </Card>
            )
          })
        )}
      </Box>

      <Dialog 
        open={openDialog} 
        onClose={() => setOpenDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          {selectedTask?.title}
          <IconButton onClick={() => setOpenDialog(false)}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
          {renderTaskForm()}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button 
            variant="contained" 
            onClick={handleSubmit}
            disabled={submitting}
            startIcon={<SubmitIcon />}
          >
            {submitting ? 'Submitting...' : 'Submit'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
