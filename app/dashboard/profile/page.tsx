'use client'

import { useState, useEffect } from 'react'
import { 
  Box, 
  Typography, 
  Paper,
  Avatar,
  Button,
  Switch,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  IconButton
} from '@mui/material'
import { 
  Person as PersonIcon,
  DarkMode as DarkModeIcon,
  LightMode as LightModeIcon,
  Home as AddressIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  Description as TermsIcon,
  Security as PrivacyIcon,
  Logout as LogoutIcon,
  Close as CloseIcon,
  Edit as EditIcon
} from '@mui/icons-material'
import ListItemButton from '@mui/material/ListItemButton'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

interface Profile {
  id: string
  profile_id: string
  first_name: string | null
  last_name: string | null
  email: string
  phone: string | null
  address: string | null
  profile_picture_url: string | null
  role: string
}

export default function ProfilePage() {
  const router = useRouter()
  const supabase = createClient()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [darkMode, setDarkMode] = useState(false)
  const [openDrawer, setOpenDrawer] = useState(false)
  const [openLogoutDialog, setOpenLogoutDialog] = useState(false)
  const [openEditDialog, setOpenEditDialog] = useState(false)
  const [editData, setEditData] = useState({
    first_name: '',
    last_name: '',
    phone: '',
    address: ''
  })
  const [success, setSuccess] = useState('')

  useEffect(() => {
    const getProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }

      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single()
      
      if (profileData) {
        setProfile(profileData)
        setEditData({
          first_name: profileData.first_name || '',
          last_name: profileData.last_name || '',
          phone: profileData.phone || '',
          address: profileData.address || ''
        })
      }

      setLoading(false)
    }
    getProfile()
  }, [supabase, router])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  const handleEditSave = async () => {
    if (!profile) return

    const { error } = await supabase
      .from('profiles')
      .update({
        first_name: editData.first_name,
        last_name: editData.last_name,
        phone: editData.phone,
        address: editData.address,
        updated_at: new Date().toISOString()
      })
      .eq('id', profile.id)

    if (!error) {
      setProfile({ ...profile, ...editData })
      setSuccess('Profile updated successfully')
      setTimeout(() => {
        setOpenEditDialog(false)
        setSuccess('')
      }, 2000)
    }
  }

  const getRoleDisplay = () => {
    if (!profile) return ''
    if (profile.role === 'candidate') return 'Candidate'
    if (profile.role === 'client') return 'VIP Client'
    return 'Admin'
  }

  const drawerContent = (
    <Box sx={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ p: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6" fontWeight={600}>Profile</Typography>
        <IconButton onClick={() => setOpenDrawer(false)}>
          <CloseIcon />
        </IconButton>
      </Box>

      <Divider />

      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Avatar
          src={profile?.profile_picture_url || undefined}
          sx={{ width: 100, height: 100, mx: 'auto', mb: 2 }}
        >
          {profile?.first_name?.[0] || profile?.email?.[0] || 'U'}
        </Avatar>
        <Typography variant="h6" fontWeight={600}>
          {profile?.first_name} {profile?.last_name}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {profile?.email}
        </Typography>
        <Typography variant="body2" color="primary" fontWeight={500}>
          {getRoleDisplay()}
        </Typography>
        <Button 
          size="small" 
          startIcon={<EditIcon />}
          onClick={() => setOpenEditDialog(true)}
          sx={{ mt: 2 }}
        >
          Edit Profile
        </Button>
      </Box>

      <Divider />

      <List sx={{ flex: 1 }}>
        <ListItem>
          <ListItemIcon><PersonIcon /></ListItemIcon>
          <ListItemText primary="Profile ID" secondary={profile?.profile_id} />
        </ListItem>
        {profile?.phone && (
          <ListItem>
            <ListItemIcon><PhoneIcon /></ListItemIcon>
            <ListItemText primary="Phone" secondary={profile.phone} />
          </ListItem>
        )}
        {profile?.address && (
          <ListItem>
            <ListItemIcon><AddressIcon /></ListItemIcon>
            <ListItemText primary="Address" secondary={profile.address} />
          </ListItem>
        )}
        <ListItem>
          <ListItemIcon><EmailIcon /></ListItemIcon>
          <ListItemText primary="Email" secondary={profile?.email} />
        </ListItem>
      </List>

      <Divider />

      <List>
        <ListItem>
          <ListItemIcon>
            {darkMode ? <DarkModeIcon /> : <LightModeIcon />}
          </ListItemIcon>
          <ListItemText primary="Dark Mode" />
          <Switch 
            checked={darkMode} 
            onChange={(e) => setDarkMode(e.target.checked)} 
          />
        </ListItem>
        <ListItemButton>
          <ListItemIcon><TermsIcon /></ListItemIcon>
          <ListItemText primary="Terms & Conditions" />
        </ListItemButton>
        <ListItemButton>
          <ListItemIcon><PrivacyIcon /></ListItemIcon>
          <ListItemText primary="Privacy Policy" />
        </ListItemButton>
      </List>

      <Divider />

      <Box sx={{ p: 3 }}>
        <Button
          fullWidth
          variant="contained"
          color="error"
          startIcon={<LogoutIcon />}
          onClick={() => setOpenLogoutDialog(true)}
          sx={{
            borderRadius: '50px',
            py: 1.5,
            background: 'rgba(244, 67, 54, 0.1)',
            boxShadow: '0 4px 14px rgba(244, 67, 54, 0.2)',
            '&:hover': {
              background: 'rgba(244, 67, 54, 0.2)',
            }
          }}
        >
          Sign Out
        </Button>
      </Box>
    </Box>
  )

  if (loading) {
    return <Box sx={{ p: 3 }}>Loading...</Box>
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f8fafc' }}>
      <Box
        sx={{
          background: 'linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)',
          color: 'white',
          px: 3,
          py: 4,
          borderRadius: '0 0 24px 24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}
      >
        <Box>
          <Typography variant="h5" fontWeight={600}>
            Profile
          </Typography>
          <Typography variant="body2" sx={{ opacity: 0.9, mt: 1 }}>
            {getRoleDisplay()} Account
          </Typography>
        </Box>
        <IconButton 
          onClick={() => setOpenDrawer(true)}
          sx={{ color: 'white' }}
        >
          <PersonIcon sx={{ fontSize: 32 }} />
        </IconButton>
      </Box>

      <Box sx={{ px: 3, mt: 3 }}>
        <Paper sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar
              src={profile?.profile_picture_url || undefined}
              sx={{ width: 80, height: 80 }}
            >
              {profile?.first_name?.[0] || profile?.email?.[0] || 'U'}
            </Avatar>
            <Box>
              <Typography variant="h6" fontWeight={600}>
                {profile?.first_name} {profile?.last_name}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {profile?.email}
              </Typography>
              <Typography variant="body2" color="primary" fontWeight={500}>
                {getRoleDisplay()}
              </Typography>
            </Box>
          </Box>
        </Paper>

        <Paper sx={{ p: 3, mt: 2 }}>
          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
            Profile Information
          </Typography>
          <Box sx={{ mt: 2 }}>
            <Typography variant="caption" color="text.secondary">Profile ID</Typography>
            <Typography variant="body1">{profile?.profile_id}</Typography>
          </Box>
          {profile?.phone && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="caption" color="text.secondary">Phone</Typography>
              <Typography variant="body1">{profile.phone}</Typography>
            </Box>
          )}
          {profile?.address && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="caption" color="text.secondary">Address</Typography>
              <Typography variant="body1">{profile.address}</Typography>
            </Box>
          )}
        </Paper>
      </Box>

      <Box
        sx={{
          position: 'fixed',
          top: 0,
          right: openDrawer ? 0 : '-100%',
          width: '100%',
          maxWidth: 400,
          height: '100vh',
          bgcolor: 'background.paper',
          boxShadow: '0 0 50px rgba(0,0,0,0.2)',
          transition: 'right 0.3s ease',
          zIndex: 1200,
          overflow: 'auto'
        }}
      >
        {drawerContent}
      </Box>

      {openDrawer && (
        <Box
          onClick={() => setOpenDrawer(false)}
          sx={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            bgcolor: 'rgba(0,0,0,0.5)',
            zIndex: 1100
          }}
        />
      )}

      <Dialog open={openLogoutDialog} onClose={() => setOpenLogoutDialog(false)}>
        <DialogTitle>Confirm Sign Out</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to sign out?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenLogoutDialog(false)}>Cancel</Button>
          <Button onClick={handleLogout} color="error" variant="contained">
            Sign Out
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={openEditDialog} onClose={() => setOpenEditDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Profile</DialogTitle>
        <DialogContent>
          {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
          <TextField
            fullWidth
            label="First Name"
            value={editData.first_name}
            onChange={(e) => setEditData({ ...editData, first_name: e.target.value })}
            sx={{ mt: 2, mb: 2 }}
          />
          <TextField
            fullWidth
            label="Last Name"
            value={editData.last_name}
            onChange={(e) => setEditData({ ...editData, last_name: e.target.value })}
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label="Phone"
            value={editData.phone}
            onChange={(e) => setEditData({ ...editData, phone: e.target.value })}
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label="Address"
            multiline
            rows={2}
            value={editData.address}
            onChange={(e) => setEditData({ ...editData, address: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenEditDialog(false)}>Cancel</Button>
          <Button onClick={handleEditSave} variant="contained">Save</Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
