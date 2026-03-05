import { useEffect, useRef } from 'react'
import './Popover.css'

export default function Popover({ children, onClose }) {
  const ref = useRef(null)

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) onClose()
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [onClose])

  return (
    <div className="popover" ref={ref}>
      {children}
    </div>
  )
}
