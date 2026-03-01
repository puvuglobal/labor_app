'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { 
  Box, 
  Container, 
  TextField, 
  Button, 
  Typography, 
  Paper,
  Link,
  Alert,
  IconButton,
  InputAdornment,
  Stepper,
  Step,
  StepLabel,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material'
import { Visibility, VisibilityOff, ArrowBack, ArrowForward } from '@mui/icons-material'
import { createClient } from '@/lib/supabase/client'

const steps = ['Account Type', 'Email & Password', 'Verify']

const validatePassword = (password: string): { valid: boolean; message: string } => {
  if (password.length < 16) {
    return { valid: false, message: 'Password must be at least 16 characters long' }
  }
  if (!/[a-z]/.test(password)) {
    return { valid: false, message: 'Password must contain at least one lowercase letter' }
  }
  if (!/[A-Z]/.test(password)) {
    return { valid: false, message: 'Password must contain at least one uppercase letter' }
  }
  if (!/[0-9]/.test(password)) {
    return { valid: false, message: 'Password must contain at least one number' }
  }
  if (!/[!@#$%^&*()_+\-=\[\]{}|;':\",.\/<>?]/.test(password)) {
    return { valid: false, message: 'Password must contain at least one special character' }
  }
  return { valid: true, message: 'Password is valid' }
}

export default function SignupPage() {
  const router = useRouter()
  const supabase = createClient()
  
  const [activeStep, setActiveStep] = useState(0)
  const [role, setRole] = useState<'candidate' | 'client'>('candidate')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const passwordValidation = validatePassword(password)

  const handleNext = () => {
    if (activeStep === 0) {
      if (!role) {
        setError('Please select an account type')
        return
      }
    }
    if (activeStep === 1) {
      if (!email) {
        setError('Email is required')
        return
      }
      if (!password || !confirmPassword) {
        setError('Password is required')
        return
      }
      if (!passwordValidation.valid) {
        setError(passwordValidation.message)
        return
      }
      if (password !== confirmPassword) {
        setError('Passwords do not match')
        return
      }
    }
    setError('')
    setActiveStep((prev) => prev + 1)
  }

  const handleBack = () => {
    setActiveStep((prev) => prev - 1)
    setError('')
  }

  const handleSignup = async () => {
    setLoading(true)
    setError('')

    const { error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          role: role,
        }
      }
    })

    if (authError) {
      setError(authError.message)
      setLoading(false)
      return
    }

    setSuccess('Account created! Please check your email to verify your account.')
    setTimeout(() => {
      router.push('/login')
    }, 3000)
    
    setLoading(false)
  }

  const getRoleDisplayName = () => {
    if (role === 'candidate') return 'Candidate'
    return 'VIP Client'
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #f5f7fa 0%, #e4e8ec 100%)',
        py: 4,
      }}
    >
      <Container maxWidth="sm">
        <Paper
          elevation={0}
          sx={{
            p: 4,
            borderRadius: 3,
            background: 'rgba(255, 255, 255, 0.9)',
            backdropFilter: 'blur(10px)',
          }}
        >
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Box sx={{ 
              width: 120, 
              height: 120, 
              mx: 'auto', 
              mb: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: 'primary.main',
              borderRadius: 2,
            }}>
              <Typography variant="h4" fontWeight={700} color="white">
                LOGO
              </Typography>
            </Box>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Create your account
            </Typography>
          </Box>

          <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          {success && (
            <Alert severity="success" sx={{ mb: 3 }}>
              {success}
            </Alert>
          )}

          {activeStep === 0 && (
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h6" gutterBottom>
                Select Account Type
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
                <Paper
                  sx={{
                    p: 3,
                    flex: 1,
                    cursor: 'pointer',
                    border: role === 'candidate' ? '2px solid' : '1px solid',
                    borderColor: role === 'candidate' ? 'primary.main' : 'grey.200',
                    '&:hover': { borderColor: 'primary.main' }
                  }}
                  onClick={() => setRole('candidate')}
                >
                  <Typography variant="h6" fontWeight={600}>
                    Candidate
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Looking for employment opportunities
                  </Typography>
                </Paper>
                <Paper
                  sx={{
                    p: 3,
                    flex: 1,
                    cursor: 'pointer',
                    border: role === 'client' ? '2px solid' : '1px solid',
                    borderColor: role === 'client' ? 'secondary.main' : 'grey.200',
                    '&:hover': { borderColor: 'secondary.main' }
                  }}
                  onClick={() => setRole('client')}
                >
                  <Typography variant="h6" fontWeight={600} color="secondary.main">
                    VIP Client
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Employer seeking candidates
                  </Typography>
                </Paper>
              </Box>
            </Box>
          )}

          {activeStep === 1 && (
            <Box>
              <TextField
                fullWidth
                label="Email Address"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                sx={{ mb: 2 }}
              />
              
              <TextField
                fullWidth
                label="Password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                sx={{ mb: 2 }}
                helperText="16+ characters: uppercase, lowercase, number, special character"
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
              
              <TextField
                fullWidth
                label="Confirm Password"
                type={showPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                sx={{ mb: 2 }}
              />

              {password && (
                <Alert severity={passwordValidation.valid ? 'success' : 'warning'} sx={{ mt: 1 }}>
                  {passwordValidation.message}
                </Alert>
              )}
            </Box>
          )}

          {activeStep === 2 && (
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h6" gutterBottom>
                Confirm Your Information
              </Typography>
              <Paper sx={{ p: 2, mt: 2, bgcolor: 'grey.50' }}>
                <Typography><strong>Account Type:</strong> {getRoleDisplayName()}</Typography>
                <Typography><strong>Email:</strong> {email}</Typography>
              </Paper>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                By creating an account, you agree to our Terms of Service and Privacy Policy.
              </Typography>
            </Box>
          )}

          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
            <Button
              onClick={handleBack}
              disabled={activeStep === 0}
              startIcon={<ArrowBack />}
            >
              Back
            </Button>
            
            {activeStep === steps.length - 1 ? (
              <Button
                variant="contained"
                onClick={handleSignup}
                disabled={loading}
              >
                {loading ? 'Creating Account...' : 'Create Account'}
              </Button>
            ) : (
              <Button
                variant="contained"
                onClick={handleNext}
                endIcon={<ArrowForward />}
              >
                Next
              </Button>
            )}
          </Box>

          <Box sx={{ textAlign: 'center', mt: 3 }}>
            <Typography variant="body2">
              Already have an account?{' '}
              <Link href="/auth/login" underline="hover" fontWeight={600}>
                Sign In
              </Link>
            </Typography>
          </Box>
        </Paper>
      </Container>
    </Box>
  )
}
