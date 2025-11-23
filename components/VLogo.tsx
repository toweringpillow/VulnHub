'use client'

interface VLogoProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export default function VLogo({ size = 'md', className = '' }: VLogoProps) {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-24 h-24',
    lg: 'w-32 h-32',
  }

  return (
    <div className={`v-logo ${sizeClasses[size]} ${className}`}>
      <div className="glow-effect"></div>
      <div className="v-shape">
        <div className="scanning-line"></div>
      </div>
    </div>
  )
}

