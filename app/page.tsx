import Link from 'next/link'

export default function RootPage() {
  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center', 
      minHeight: '100vh',
      fontFamily: 'system-ui',
      gap: '1rem',
      padding: '2rem',
      textAlign: 'center'
    }}>
      <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Labor App</h1>
      <p style={{ color: '#666' }}>Employment Platform</p>
      <Link 
        href="/auth/login" 
        style={{ 
          padding: '12px 24px', 
          background: '#2563eb', 
          color: 'white', 
          borderRadius: '8px',
          textDecoration: 'none'
        }}
      >
        Go to Login
      </Link>
      <Link href="/auth/signup" style={{ color: '#2563eb' }}>
        Sign Up
      </Link>
    </div>
  )
}
