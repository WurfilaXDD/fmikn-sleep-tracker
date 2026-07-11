import { useToast } from '../hooks/useToast'

export function Toast() {
  const { message, visible } = useToast()
  return (
    <div
      className="toast"
      style={{
        transform: `translateX(-50%) translateY(${visible ? '0' : '10px'})`,
        opacity: visible ? 1 : 0,
      }}
    >
      {message}
    </div>
  )
}
