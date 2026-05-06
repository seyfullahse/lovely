import { Component, type ReactNode } from 'react'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '2rem',
          background: '#FDF6F0',
          fontFamily: 'Inter, sans-serif'
        }}>
          <div style={{
            textAlign: 'center',
            maxWidth: '400px',
            background: 'rgba(255,255,255,0.7)',
            borderRadius: '1rem',
            padding: '3rem 2rem',
            border: '1px solid rgba(184,160,220,0.15)'
          }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>💔</div>
            <h2 style={{
              fontFamily: "'Playfair Display', serif",
              color: '#3D2C3E',
              fontSize: '1.5rem',
              marginBottom: '0.75rem'
            }}>
              Bir şeyler ters gitti
            </h2>
            <p style={{ color: '#9A949D', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
              Endişelenme, bu geçici bir sorun. Sayfayı yenileyerek tekrar deneyebilirsin.
            </p>
            {this.state.error && (
              <p style={{ color: '#B8A9BC', fontSize: '0.7rem', marginBottom: '1rem', wordBreak: 'break-word' }}>
                Hata: {this.state.error.message}
              </p>
            )}
            <button
              onClick={() => {
                this.setState({ hasError: false, error: null })
                window.location.href = '/'
              }}
              style={{
                background: 'linear-gradient(135deg, #FADADD, #E8DFF5)',
                color: '#3D2C3E',
                border: 'none',
                padding: '0.625rem 2rem',
                borderRadius: '9999px',
                fontWeight: 500,
                fontSize: '0.875rem',
                cursor: 'pointer'
              }}
            >
              Ana Sayfaya Dön
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
