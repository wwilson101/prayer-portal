import { useState, useRef } from 'react'

export default function Tooltip({ label, children, position = 'top' }) {
  const [visible, setVisible] = useState(false)
  const timer = useRef(null)

  const show = () => {
    clearTimeout(timer.current)
    setVisible(true)
    timer.current = setTimeout(() => setVisible(false), 1800)
  }

  const hide = () => {
    clearTimeout(timer.current)
    setVisible(false)
  }

  const posStyles = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-1.5',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-1.5',
    left: 'right-full top-1/2 -translate-y-1/2 mr-1.5',
    right: 'left-full top-1/2 -translate-y-1/2 ml-1.5',
  }

  return (
    <div
      className="relative inline-flex"
      onMouseEnter={show}
      onMouseLeave={hide}
      onTouchStart={show}
      onTouchEnd={hide}
    >
      {children}
      {visible && (
        <div
          className={`absolute z-50 pointer-events-none whitespace-nowrap text-[11px] font-semibold px-2 py-1 rounded-lg ${posStyles[position]}`}
          style={{ background: '#1a1710', color: '#f0ede0', border: '1px solid #2d2820', boxShadow: '0 4px 12px rgba(0,0,0,0.5)' }}
        >
          {label}
        </div>
      )}
    </div>
  )
}
