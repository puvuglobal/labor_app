'use client'

import { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { 
  Box, 
  Paper,
  IconButton,
  Badge,
  useTheme,
  useMediaQuery
} from '@mui/material'
import { 
  Home as HomeIcon,
  School as SchoolIcon,
  Description as PolicyIcon,
  Person as PersonIcon,
  Logout as LogoutIcon
} from '@mui/icons-material'
import { createClient } from '@/lib/supabase/client'

const navItems = [
  { path: '/dashboard/home', label: 'Home', icon: HomeIcon },
  { path: '/dashboard/classroom', label: 'Classroom', icon: SchoolIcon },
  { path: '/dashboard/policies', label: 'Policies', icon: PolicyIcon },
]

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const pathname = usePathname()
  const supabase = createClient()
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
  
  const [user, setUser] = useState<any>(null)
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
    }
    getUser()
  }, [supabase])

  const handleNavClick = (path: string) => {
    router.push(path)
  }

  const handleProfileClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget)
  }

  const handleClose = () => {
    setAnchorEl(null)
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', pb: isMobile ? 8 : 0 }}>
      {children}
      
      {isMobile && (
        <Paper
          sx={{
            position: 'fixed',
            bottom: 24,
            left: '50%',
            transform: 'translateX(-50%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            px: 3,
            py: 1.5,
            borderRadius: '50px',
            background: 'rgba(255, 255, 255, 0.15)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.3)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.15)',
            gap: 1,
            zIndex: 1000,
          }}
        >
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.path
            return (
              <IconButton
                key={item.path}
                onClick={() => handleNavClick(item.path)}
                sx={{
                  color: isActive ? 'primary.main' : 'text.secondary',
                  bgcolor: isActive ? 'rgba(37, 99, 235, 0.1)' : 'transparent',
                  borderRadius: '16px',
                  px: 2,
                  py: 1,
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    bgcolor: isActive ? 'rgba(37, 99, 235, 0.15)' : 'rgba(0, 0, 0, 0.05)',
                  }
                }}
              >
                <Icon />
              </IconButton>
            )
          })}
          <IconButton
            onClick={() => router.push('/dashboard/profile')}
            sx={{
              color: pathname === '/dashboard/profile' ? 'primary.main' : 'text.secondary',
              bgcolor: pathname === '/dashboard/profile' ? 'rgba(37, 99, 235, 0.1)' : 'transparent',
              borderRadius: '16px',
              px: 2,
              py: 1,
            }}
          >
            <PersonIcon />
          </IconButton>
        </Paper>
      )}
    </Box>
  )
}
