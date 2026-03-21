import { Loader2 } from 'lucide-react'

interface SpinnerContentProps {
  className?: string
  children?: React.ReactNode
}

export function Spinner({ children, className, ...props }: SpinnerContentProps) {
  return (
    <span {...props}>
      <Loader2 className={"animate-spin text-primary " + className} />
      {children}
    </span>
  )
}
