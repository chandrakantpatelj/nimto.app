import { useEffect, useState } from "react"

const TOAST_TIMEOUT = 5000

export function toast({ title, description, variant = "default" }) {
  const event = new CustomEvent("toast", {
    detail: {
      title,
      description,
      variant,
    },
  })
  window.dispatchEvent(event)
}

export function useToast() {
  const [toasts, setToasts] = useState([])

  useEffect(() => {
    const handleToast = (event) => {
      const { title, description, variant } = event.detail
      const id = Math.random().toString(36).substr(2, 9)
      
      setToasts((prev) => [...prev, { id, title, description, variant }])
      
      setTimeout(() => {
        setToasts((prev) => prev.filter((toast) => toast.id !== id))
      }, TOAST_TIMEOUT)
    }

    window.addEventListener("toast", handleToast)
    return () => window.removeEventListener("toast", handleToast)
  }, [])

  return toasts
}
