'use client'

import { useState, useEffect } from 'react'
import { 
  Box, 
  Typography, 
  Paper,
  Card,
  CardContent,
  Button,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  LinearProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Link
} from '@mui/material'
import { 
  Policy as PolicyIcon,
  CheckCircle as AckIcon,
  ExpandMore as ExpandIcon,
  Link as LinkIcon,
  Gavel as LegalIcon,
  AccountBalance as FederalIcon
} from '@mui/icons-material'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

interface Policy {
  id: string
  policy_id: string
  title: string
  content: string
  category: string
  state_code: string | null
  federal: boolean
}

interface UserPolicy {
  policy_id: string
  is_acknowledged: boolean
  acknowledged_at: string | null
}

interface LegalReference {
  id: string
  reference_id: string
  title: string
  url: string
  state_code: string | null
  federal: boolean
  category: string
  description: string
}

export default function PoliciesPage() {
  const router = useRouter()
  const supabase = createClient()
  const [user, setUser] = useState<any>(null)
  const [policies, setPolicies] = useState<Policy[]>([])
  const [userPolicies, setUserPolicies] = useState<UserPolicy[]>([])
  const [legalRefs, setLegalRefs] = useState<LegalReference[]>([])
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState<string | false>(false)

  useEffect(() => {
    const getData = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }
      setUser(user)

      const { data: policiesData } = await supabase
        .from('policies')
        .select('*')
        .order('created_at', { ascending: false })
      
      if (policiesData) {
        setPolicies(policiesData)
      }

      const { data: userPoliciesData } = await supabase
        .from('user_policies')
        .select('*')
        .eq('user_id', user.id)
      
      if (userPoliciesData) {
        setUserPolicies(userPoliciesData)
      }

      const { data: legalData } = await supabase
        .from('legal_references')
        .select('*')
        .order('created_at', { ascending: false })
      
      if (legalData) {
        setLegalRefs(legalData)
      }

      setLoading(false)
    }
    getData()
  }, [supabase, router])

  const handleAcknowledge = async (policyId: string) => {
    if (!user) return

    const { error } = await supabase
      .from('user_policies')
      .upsert({
        user_id: user.id,
        policy_id: policyId,
        is_acknowledged: true,
        acknowledged_at: new Date().toISOString(),
        assigned_by: user.id
      }, { onConflict: 'user_id, policy_id' })

    if (!error) {
      router.refresh()
    }
  }

  const isAcknowledged = (policyId: string) => {
    return userPolicies.some(up => up.policy_id === policyId && up.is_acknowledged)
  }

  const handleAccordionChange = (panel: string) => (event: React.SyntheticEvent, isExpanded: boolean) => {
    setExpanded(isExpanded ? panel : false)
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
          Policies & Legal References
        </Typography>
        <Typography variant="body2" sx={{ opacity: 0.9, mt: 1 }}>
          Review and acknowledge required policies
        </Typography>
      </Box>

      <Box sx={{ px: 3, mt: 3 }}>
        <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
          Required Policies
        </Typography>
        
        {policies.length === 0 ? (
          <Paper sx={{ p: 3, textAlign: 'center' }}>
            <PolicyIcon sx={{ fontSize: 40, color: 'text.secondary', mb: 1 }} />
            <Typography>No policies assigned</Typography>
          </Paper>
        ) : (
          policies.map((policy) => (
            <Accordion 
              key={policy.id}
              expanded={expanded === policy.id}
              onChange={handleAccordionChange(policy.id)}
              sx={{ mb: 1 }}
            >
              <AccordionSummary expandIcon={<ExpandIcon />}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flex: 1 }}>
                  <PolicyIcon color="primary" />
                  <Typography fontWeight={600}>{policy.title}</Typography>
                  {isAcknowledged(policy.id) && (
                    <Chip 
                      icon={<AckIcon />} 
                      label="Acknowledged" 
                      size="small" 
                      color="success" 
                    />
                  )}
                  {!isAcknowledged(policy.id) && (
                    <Chip label="Required" size="small" color="warning" />
                  )}
                </Box>
              </AccordionSummary>
              <AccordionDetails>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {policy.content}
                </Typography>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Chip 
                    label={policy.category} 
                    size="small" 
                    variant="outlined" 
                  />
                  {policy.state_code && (
                    <Chip label={policy.state_code} size="small" variant="outlined" />
                  )}
                  {policy.federal && (
                    <Chip label="Federal" size="small" color="primary" />
                  )}
                </Box>
                {!isAcknowledged(policy.id) && (
                  <Button 
                    variant="contained" 
                    size="small" 
                    sx={{ mt: 2 }}
                    onClick={() => handleAcknowledge(policy.id)}
                  >
                    Acknowledge
                  </Button>
                )}
              </AccordionDetails>
            </Accordion>
          ))
        )}

        <Typography variant="h6" fontWeight={600} sx={{ mt: 4, mb: 2 }}>
          Legal References
        </Typography>

        {legalRefs.length === 0 ? (
          <Paper sx={{ p: 3, textAlign: 'center' }}>
            <Typography>No legal references available</Typography>
          </Paper>
        ) : (
          legalRefs.map((ref) => (
            <Card key={ref.id} sx={{ mb: 2 }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                  <LegalIcon color="secondary" />
                  <Box sx={{ flex: 1 }}>
                    <Typography fontWeight={600}>{ref.title}</Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      {ref.description}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                      <Chip label={ref.category} size="small" variant="outlined" />
                      {ref.state_code && (
                        <Chip label={ref.state_code} size="small" variant="outlined" />
                      )}
                      {ref.federal && (
                        <Chip label="Federal" size="small" color="primary" />
                      )}
                    </Box>
                    <Link 
                      href={ref.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 2 }}
                    >
                      <LinkIcon fontSize="small" />
                      View Reference
                    </Link>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          ))
        )}
      </Box>
    </Box>
  )
}
