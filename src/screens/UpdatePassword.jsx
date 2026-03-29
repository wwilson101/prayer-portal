import { useState } from 'react'
import { ChevronRight } from 'lucide-react'
import { supabase } from '../lib/supabase'
import logo from '../assets/Prayer_Portal_logo.png'

export default function UpdatePassword({ onDone }) {
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async () => {
    setError('')
    if (!password) { setError('Please enter a new password.'); return }
    if (password.length < 6) { setError('Password must be at least 6 characters.'); return }
    if (password !== confirm) { setError('Passwords do not match.'); return }

    setLoading(true)
    try {
      const { error: updateError } = await supabase.auth.updateUser({ password })
      if (updateError) throw updateError
      setSuccess(true)
      setTimeout(() => onDone(), 2000)
    } catch (err) {
      setError(err.message || 'Failed to update password.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col px-6 pt-14 pb-6 relative overflow-hidden animate-slide-up" style={{ background: '#000000' }}>
      <div className="relative z-10 flex-1 flex flex-col">
        <div className="mb-8">
          <img src={logo} alt="Prayer Portal" className="w-20 h-20 object-contain mb-5" />
          <h2 className="text-2xl font-bold mb-1" style={{ color: '#f0ede0' }}>Set new password</h2>
          <p className="text-sm" style={{ color: '#c8b99a' }}>Choose a secure password for your account</p>
        </div>

        {success ? (
          <div className="px-4 py-4 rounded-xl text-sm border" style={{ background: '#0a1f0f', borderColor: '#2d5a3d', color: '#6fcf97' }}>
            Password updated! Signing you in...
          </div>
        ) : (
          <>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold uppercase tracking-wide mb-1.5 block" style={{ color: '#a89060' }}>New Password</label>
                <input
                  type="password"
                  placeholder="At least 6 characters"
                  value={password}
                  onChange={e => { setPassword(e.target.value); setError('') }}
                  className="input-field"
                />
              </div>
              <div>
                <label className="text-xs font-semibold uppercase tracking-wide mb-1.5 block" style={{ color: '#a89060' }}>Confirm Password</label>
                <input
                  type="password"
                  placeholder="Re-enter your new password"
                  value={confirm}
                  onChange={e => { setConfirm(e.target.value); setError('') }}
                  onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                  className="input-field"
                />
              </div>
            </div>

            {error && (
              <div className="mt-4 px-4 py-3 rounded-xl text-sm text-red-400 border border-red-800" style={{ background: '#1a0808' }}>
                {error}
              </div>
            )}

            <div className="mt-auto pt-6">
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="btn-primary w-full flex items-center justify-center gap-2 text-base disabled:opacity-60"
              >
                {loading ? 'Updating...' : <><span>Update Password</span><ChevronRight size={18} /></>}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
