import Link from 'next/link'
import Image from 'next/image'

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
      <div style={{ position: 'relative', width: 200, height: 80, marginBottom: '1rem' }}>
        <Image
          src="/SEMA_LOGO_Login.png"
          alt="SEMA Logo"
          fill
          style={{ objectFit: 'contain' }}
        />
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
