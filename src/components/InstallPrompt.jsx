import { useState, useEffect } from 'react'
import { X, Download } from 'lucide-react'

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null)
  const [showPrompt, setShowPrompt] = useState(false)
  const [isIOS, setIsIOS] = useState(false)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    if (localStorage.getItem('installPromptDismissed')) return

    const ios = /iphone|ipad|ipod/i.test(navigator.userAgent)
    const standalone = window.navigator.standalone === true
    const isInStandaloneMode = window.matchMedia('(display-mode: standalone)').matches

    if (isInStandaloneMode || standalone) return

    if (ios) {
      setIsIOS(true)
      setTimeout(() => setShowPrompt(true), 3000)
      return
    }

    const handler = (e) => {
      e.preventDefault()
      setDeferredPrompt(e)
      setTimeout(() => setShowPrompt(true), 3000)
    }

    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  const handleInstall = async () => {
    if (!deferredPrompt) return
    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    if (outcome === 'accepted') {
      setShowPrompt(false)
    }
    setDeferredPrompt(null)
  }

  const handleDismiss = () => {
    setShowPrompt(false)
    setDismissed(true)
    localStorage.setItem('installPromptDismissed', '1')
  }

  if (!showPrompt || dismissed) return null

  return (
    <div className="fixed bottom-24 left-4 right-4 z-50 animate-slide-up">
      <div
        className="rounded-2xl p-4 shadow-2xl border border-white/10"
        style={{ background: 'rgba(20, 20, 20, 0.96)', backdropFilter: 'blur(20px)' }}
      >
        <button
          onClick={handleDismiss}
          className="absolute top-3 right-3 text-gray-400 hover:text-white transition-colors"
        >
          <X size={18} />
        </button>

        <div className="flex items-center gap-3 pr-6">
          <img
            src="/Screenshot_2026-03-27_at_8.26.27_PM.png"
            alt="Prayer Portal"
            className="w-12 h-12 rounded-xl object-cover flex-shrink-0"
          />
          <div className="flex-1 min-w-0">
            <p className="text-white font-semibold text-sm">Add to Home Screen</p>
            <p className="text-gray-400 text-xs mt-0.5">
              {isIOS
                ? 'Tap the share button then "Add to Home Screen"'
                : 'Install Prayer Portal for quick access'}
            </p>
          </div>
        </div>

        {!isIOS && (
          <button
            onClick={handleInstall}
            className="mt-3 w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all active:scale-95"
            style={{ background: 'linear-gradient(135deg, #22c55e, #16a34a)', color: '#fff' }}
          >
            <Download size={16} />
            Install App
          </button>
        )}

        {isIOS && (
          <div className="mt-3 flex items-center gap-2 bg-white/5 rounded-xl px-3 py-2">
            <span className="text-gray-300 text-xs">Tap</span>
            <span className="text-blue-400 text-sm font-medium">Share</span>
            <span className="text-gray-300 text-xs">then</span>
            <span className="text-blue-400 text-sm font-medium">"Add to Home Screen"</span>
          </div>
        )}
      </div>
    </div>
  )
}
