import { useState } from 'react'
import { ChevronRight, Sparkles, ArrowLeft } from 'lucide-react'
import { signUp, signIn } from '../lib/auth'
import logo from '../assets/ChatGPT_Image_Mar_27,_2026_at_03_24_46_PM.png'

export default function Welcome({ onAuthSuccess }) {
  const [step, setStep] = useState('landing')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const [signupForm, setSignupForm] = useState({ name: '', email: '', phone: '', password: '' })
  const [signinForm, setSigninForm] = useState({ email: '', password: '' })
  const [signupErrors, setSignupErrors] = useState({})

  const validateSignup = () => {
    const errs = {}
    if (!signupForm.name.trim())     errs.name     = 'Name is required'
    if (!signupForm.email.trim())    errs.email    = 'Email is required'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(signupForm.email))
                                     errs.email    = 'Enter a valid email'
    if (!signupForm.password)        errs.password = 'Password is required'
    else if (signupForm.password.length < 6) errs.password = 'Password must be at least 6 characters'
    return errs
  }

  const handleSignUp = async () => {
    const errs = validateSignup()
    if (Object.keys(errs).length) { setSignupErrors(errs); return }
    setError('')
    setLoading(true)
    try {
      await signUp({
        name: signupForm.name.trim(),
        email: signupForm.email.trim(),
        phone: signupForm.phone.trim(),
        password: signupForm.password,
      })
      await onAuthSuccess()
    } catch (err) {
      setError(err.message || 'Sign up failed.')
    } finally {
      setLoading(false)
    }
  }

  const handleSignIn = async () => {
    if (!signinForm.email.trim()) { setError('Please enter your email.'); return }
    if (!signinForm.password)     { setError('Please enter your password.'); return }
    setError('')
    setLoading(true)
    try {
      await signIn({ email: signinForm.email.trim(), password: signinForm.password })
      await onAuthSuccess()
    } catch (err) {
      setError(err.message || 'Sign in failed.')
    } finally {
      setLoading(false)
    }
  }

  if (step === 'landing') {
    return (
      <div className="min-h-screen flex flex-col relative overflow-hidden" style={{ background: '#111211' }}>
        <div className="flex-1 flex flex-col items-center justify-center px-8 animate-fade-in relative z-10">
          <div className="mb-1 relative">
            <img src={logo} alt="Prayer Portal" className="w-80 h-80 object-contain" />
          </div>
          <p className="text-base text-center mb-3 leading-relaxed max-w-xs" style={{ color: '#f0ede0' }}>
            Share your heart. Lift each other up.<br/>Experience God's faithfulness together.
          </p>
          <div className="flex flex-wrap justify-center gap-2 mb-10">
            {['Private Groups', 'Prayer Feed', 'Track Answered Prayer'].map(f => (
              <span key={f} className="text-xs px-3 py-1.5 rounded-full glass-card-purple font-medium border" style={{ color: '#6ee75a', borderColor: '#2d5a2d' }}>{f}</span>
            ))}
          </div>
          <button onClick={() => setStep('signup')} className="btn-primary w-full max-w-xs text-base flex items-center justify-center gap-2">
            Get Started <ChevronRight size={18} />
          </button>
          <button onClick={() => setStep('signin')} className="mt-3 text-sm font-medium hover:opacity-80 transition-colors" style={{ color: '#6ee75a' }}>
            Already have an account? Sign in
          </button>
        </div>
      </div>
    )
  }

  if (step === 'signup') {
    return (
      <div className="min-h-screen flex flex-col px-6 pt-14 pb-6 relative overflow-hidden animate-slide-up" style={{ background: '#111211' }}>
        <div className="relative z-10 flex-1 flex flex-col">
          <button onClick={() => setStep('landing')} className="flex items-center gap-1 text-sm mb-8 w-fit hover:opacity-80 transition-colors" style={{ color: '#4a6a4a' }}>
            <ArrowLeft size={16} /> Back
          </button>
          <div className="mb-8">
            <img src={logo} alt="Prayer Portal" className="w-20 h-20 object-contain mb-5" />
            <h2 className="text-2xl font-bold mb-1" style={{ color: '#d4e8a0' }}>Create your account</h2>
            <p className="text-sm" style={{ color: '#5a7a5a' }}>Join your prayer community</p>
          </div>
          <div className="space-y-4">
            <div>
              <label className="text-xs font-semibold uppercase tracking-wide mb-1.5 block" style={{ color: '#7acc7a' }}>Full Name *</label>
              <input type="text" placeholder="First & Last Name" value={signupForm.name}
                onChange={e => { setSignupForm(f => ({ ...f, name: e.target.value })); setSignupErrors(x => ({ ...x, name: '' })) }}
                className="input-field" />
              {signupErrors.name && <p className="text-xs text-red-500 mt-1">{signupErrors.name}</p>}
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-wide mb-1.5 block" style={{ color: '#7acc7a' }}>Email Address *</label>
              <input type="email" placeholder="you@example.com" value={signupForm.email}
                onChange={e => { setSignupForm(f => ({ ...f, email: e.target.value })); setSignupErrors(x => ({ ...x, email: '' })) }}
                className="input-field" />
              {signupErrors.email && <p className="text-xs text-red-500 mt-1">{signupErrors.email}</p>}
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-wide mb-1.5 block" style={{ color: '#7acc7a' }}>
                Phone <span className="normal-case font-normal" style={{ color: '#4a6a4a' }}>(optional)</span>
              </label>
              <input type="tel" placeholder="(555) 000-0000" value={signupForm.phone}
                onChange={e => setSignupForm(f => ({ ...f, phone: e.target.value }))}
                className="input-field" />
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-wide mb-1.5 block" style={{ color: '#7acc7a' }}>Password *</label>
              <input type="password" placeholder="At least 6 characters" value={signupForm.password}
                onChange={e => { setSignupForm(f => ({ ...f, password: e.target.value })); setSignupErrors(x => ({ ...x, password: '' })) }}
                className="input-field" />
              {signupErrors.password && <p className="text-xs text-red-500 mt-1">{signupErrors.password}</p>}
            </div>
          </div>
          {error && <div className="mt-4 px-4 py-3 rounded-xl text-sm text-red-400 border border-red-800" style={{ background: '#2a0f0f' }}>{error}</div>}
          <div className="mt-auto pt-6">
            <button onClick={handleSignUp} disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2 text-base disabled:opacity-60">
              {loading ? 'Creating account...' : <><span>Create Account</span><ChevronRight size={18} /></>}
            </button>
            <button onClick={() => setStep('signin')} className="mt-3 w-full text-sm text-center font-medium hover:opacity-80 transition-colors py-2" style={{ color: '#6ee75a' }}>
              Already have an account? Sign in
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col px-6 pt-14 pb-6 relative overflow-hidden animate-slide-up" style={{ background: '#111211' }}>
      <div className="relative z-10 flex-1 flex flex-col">
        <button onClick={() => setStep('landing')} className="flex items-center gap-1 text-sm mb-8 w-fit hover:opacity-80 transition-colors" style={{ color: '#4a6a4a' }}>
          <ArrowLeft size={16} /> Back
        </button>
        <div className="mb-8">
          <img src={logo} alt="Prayer Portal" className="w-20 h-20 object-contain mb-5" />
          <h2 className="text-2xl font-bold mb-1" style={{ color: '#d4e8a0' }}>Welcome back</h2>
          <p className="text-sm" style={{ color: '#5a7a5a' }}>Sign in to your account</p>
        </div>
        <div className="space-y-4">
          <div>
            <label className="text-xs font-semibold uppercase tracking-wide mb-1.5 block" style={{ color: '#7acc7a' }}>Email Address</label>
            <input type="email" placeholder="you@example.com" value={signinForm.email}
              onChange={e => { setSigninForm(f => ({ ...f, email: e.target.value })); setError('') }}
              className="input-field" />
          </div>
          <div>
            <label className="text-xs font-semibold uppercase tracking-wide mb-1.5 block" style={{ color: '#7acc7a' }}>Password</label>
            <input type="password" placeholder="Your password" value={signinForm.password}
              onChange={e => { setSigninForm(f => ({ ...f, password: e.target.value })); setError('') }}
              onKeyDown={e => e.key === 'Enter' && handleSignIn()}
              className="input-field" />
          </div>
        </div>
        {error && <div className="mt-4 px-4 py-3 rounded-xl text-sm text-red-400 border border-red-800" style={{ background: '#2a0f0f' }}>{error}</div>}
        <div className="mt-auto pt-6">
          <button onClick={handleSignIn} disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2 text-base disabled:opacity-60">
            {loading ? 'Signing in...' : <><span>Sign In</span><ChevronRight size={18} /></>}
          </button>
          <button onClick={() => setStep('signup')} className="mt-3 w-full text-sm text-center font-medium hover:opacity-80 transition-colors py-2" style={{ color: '#6ee75a' }}>
            New here? Create an account
          </button>
        </div>
      </div>
    </div>
  )
}
