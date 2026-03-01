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
      <div style={{ 
        width: 100, 
        height: 100, 
        background: '#2563eb',
        borderRadius: '8px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: '1rem'
      }}>
        <span style={{ color: 'white', fontSize: '1.5rem', fontWeight: 'bold', lineHeight: 1 }}>LOGO</span>
      </div>
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
