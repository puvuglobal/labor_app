'use client'

import { useState, useEffect } from 'react'
import { 
  Box, 
  Typography, 
  Paper,
  Card,
  CardContent,
  Chip,
  LinearProgress,
  IconButton,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemButton,
  Avatar
} from '@mui/material'
import { 
  Assignment as TaskIcon,
  School as TrainingIcon,
  Schedule as PendingIcon,
  Timer as TimerIcon,
  CheckCircle as CompleteIcon,
  ArrowForward as ArrowIcon
} from '@mui/icons-material'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

interface Task {
  id: string
  task_id: string
  title: string
  description: string
  task_type: string
  is_mandatory: boolean
  due_date: string | null
}

interface Training {
  id: string
  training_id: string
  title: string
  content_type: string
  progress_percentage: number
  is_completed: boolean
}

interface DocStage {
  id: string
  current_stage: string
  notes: string | null
}

export default function HomePage() {
  const router = useRouter()
  const supabase = createClient()
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [tasks, setTasks] = useState<Task[]>([])
  const [trainings, setTrainings] = useState<Training[]>([])
  const [pendingCount, setPendingCount] = useState(0)
  const [docStage, setDocStage] = useState<DocStage | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const getData = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }
      setUser(user)

      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single()
      
      if (profileData) {
        setProfile(profileData)
      }

      const { data: tasksData } = await supabase
        .from('tasks')
        .select('*')
        .eq('assigned_to', user.id)
        .order('created_at', { ascending: false })
        .limit(5)
      
      if (tasksData) {
        setTasks(tasksData)
      }

      const { data: trainingsData } = await supabase
        .from('user_trainings')
        .select('*, trainings(*)')
        .eq('user_id', user.id)
        .limit(5)
      
      if (trainingsData) {
        setTrainings(trainingsData.map(t => ({
          ...t.trainings,
          progress_percentage: t.progress_percentage,
          is_completed: t.is_completed
        })))
      }

      const { count } = await supabase
        .from('task_submissions')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('status', 'pending')
      
      setPendingCount(count || 0)

      const { data: docData } = await supabase
        .from('user_documentation')
        .select('*')
        .eq('user_id', user.id)
        .single()
      
      if (docData) {
        setDocStage(docData)
      }

      setLoading(false)
    }
    getData()
  }, [supabase, router])

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good morning'
    if (hour < 18) return 'Good afternoon'
    return 'Good evening'
  }

  const getRoleDisplay = () => {
    if (!profile) return ''
    if (profile.role === 'candidate') return 'Candidate'
    if (profile.role === 'client') return 'VIP Client'
    return 'Admin'
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
          {getGreeting()}, {profile?.first_name || 'User'}!
        </Typography>
        <Typography variant="body2" sx={{ opacity: 0.9, mt: 1 }}>
          {getRoleDisplay()} Dashboard
        </Typography>
      </Box>

      <Box sx={{ px: 3, mt: -3 }}>
        <Paper sx={{ p: 3, mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box>
              <Typography variant="h6" fontWeight={600}>
                Documentation Processor
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {docStage?.current_stage || 'Not Started'}
              </Typography>
            </Box>
            <TimerIcon sx={{ fontSize: 40, color: 'primary.main' }} />
          </Box>
          {docStage?.notes && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              {docStage.notes}
            </Typography>
          )}
        </Paper>

        <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
          To-Do List
        </Typography>
        
        {tasks.length === 0 ? (
          <Paper sx={{ p: 3, textAlign: 'center' }}>
            <TaskIcon sx={{ fontSize: 40, color: 'success.main', mb: 1 }} />
            <Typography>All caught up!</Typography>
          </Paper>
        ) : (
          tasks.map((task) => (
            <Card 
              key={task.id} 
              sx={{ mb: 2, cursor: 'pointer', '&:hover': { transform: 'translateY(-2px)' } }}
              onClick={() => router.push('/dashboard/classroom')}
            >
              <CardContent sx={{ display: 'flex', alignItems: 'center', py: 2 }}>
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
                </Box>
                <ArrowIcon color="action" />
              </CardContent>
            </Card>
          ))
        )}

        <Typography variant="h6" fontWeight={600} sx={{ mt: 3, mb: 2 }}>
          Trainings
        </Typography>
        
        {trainings.length === 0 ? (
          <Paper sx={{ p: 3, textAlign: 'center' }}>
            <Typography>No trainings assigned</Typography>
          </Paper>
        ) : (
          trainings.map((training) => (
            <Card key={training.id} sx={{ mb: 2 }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box sx={{ flex: 1 }}>
                    <Typography fontWeight={600}>{training.title}</Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                      <LinearProgress 
                        variant="determinate" 
                        value={training.progress_percentage} 
                        sx={{ flex: 1, height: 6, borderRadius: 3 }}
                      />
                      <Typography variant="caption">{training.progress_percentage}%</Typography>
                    </Box>
                  </Box>
                  {training.is_completed ? (
                    <CompleteIcon color="success" />
                  ) : (
                    <Chip 
                      label={training.content_type} 
                      size="small" 
                      color="primary" 
                      variant="outlined"
                    />
                  )}
                </Box>
              </CardContent>
            </Card>
          ))
        )}

        <Paper sx={{ p: 3, mt: 3, mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <PendingIcon sx={{ fontSize: 32, color: pendingCount > 0 ? 'warning.main' : 'success.main' }} />
            <Box>
              <Typography variant="h6" fontWeight={600}>
                Pending Approvals
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {pendingCount} submission{pendingCount !== 1 ? 's' : ''} waiting for confirmation
              </Typography>
            </Box>
          </Box>
        </Paper>
      </Box>
    </Box>
  )
}
