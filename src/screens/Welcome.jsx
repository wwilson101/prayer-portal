import { useState } from 'react'
import { ChevronRight, Sparkles, ArrowLeft } from 'lucide-react'

export default function Welcome({ onSignUp, onSignIn }) {
  const [step, setStep] = useState('landing') // landing | signup | signin
  const [error, setError] = useState('')

  const [signupForm, setSignupForm] = useState({ name: '', email: '', phone: '' })
  const [signinForm, setSigninForm] = useState({ email: '' })
  const [signupErrors, setSignupErrors] = useState({})

  const validateSignup = () => {
    const errs = {}
    if (!signupForm.name.trim())     errs.name  = 'Name is required'
    if (!signupForm.email.trim())    errs.email = 'Email is required'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(signupForm.email))
                                     errs.email = 'Enter a valid email'
    return errs
  }

  const handleSignUp = () => {
    const errs = validateSignup()
    if (Object.keys(errs).length) { setSignupErrors(errs); return }
    setError('')
    try {
      onSignUp(signupForm)
    } catch (err) {
      setError(err.message || 'Sign up failed.')
    }
  }

  const handleSignIn = () => {
    if (!signinForm.email.trim()) {
      setError('Please enter your email.')
      return
    }
    setError('')
    try {
      onSignIn(signinForm)
    } catch (err) {
      setError(err.message || 'Sign in failed.')
    }
  }

  if (step === 'landing') {
    return (
      <div className="min-h-screen flex flex-col relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute -top-20 -left-20 w-64 h-64 rounded-full bg-sky-200/50 blur-3xl" />
          <div className="absolute top-40 -right-20 w-72 h-72 rounded-full bg-violet-200/50 blur-3xl" />
          <div className="absolute bottom-20 left-10 w-48 h-48 rounded-full bg-blue-200/40 blur-3xl" />
        </div>
        <div className="flex-1 flex flex-col items-center justify-center px-8 animate-fade-in relative z-10">
          <div className="mb-8 relative">
            <div className="w-28 h-28 rounded-3xl gradient-bg-deep flex items-center justify-center shadow-xl shadow-violet-200">
              <svg width="52" height="60" viewBox="0 0 52 60" fill="none">
                <rect x="22" y="0" width="8" height="60" rx="4" fill="white" opacity="0.95"/>
                <rect x="8" y="12" width="36" height="8" rx="4" fill="white" opacity="0.95"/>
              </svg>
            </div>
            <div className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-yellow-100 flex items-center justify-center shadow">
              <Sparkles size={14} className="text-yellow-500" />
            </div>
          </div>
          <h1 className="text-4xl font-bold gradient-text mb-2">Prayer Portal</h1>
          <p className="text-base text-slate-500 text-center mb-3 leading-relaxed max-w-xs">
            Share your heart. Lift each other up.<br/>Experience God's faithfulness together.
          </p>
          <div className="flex flex-wrap justify-center gap-2 mb-12">
            {['Private Groups', 'Prayer Feed', 'Track Answered Prayer'].map(f => (
              <span key={f} className="text-xs px-3 py-1.5 rounded-full glass-card-purple text-violet-600 font-medium border border-violet-200/50">{f}</span>
            ))}
          </div>
          <button onClick={() => setStep('signup')} className="btn-primary w-full max-w-xs text-base flex items-center justify-center gap-2">
            Get Started <ChevronRight size={18} />
          </button>
          <button onClick={() => setStep('signin')} className="mt-3 text-sm text-violet-500 font-medium hover:text-violet-700 transition-colors">
            Already have an account? Sign in
          </button>
        </div>
      </div>
    )
  }

  if (step === 'signup') {
    return (
      <div className="min-h-screen flex flex-col px-6 pt-14 pb-6 relative overflow-hidden animate-slide-up">
        <div className="absolute -top-10 -right-10 w-48 h-48 rounded-full bg-violet-200/40 blur-3xl pointer-events-none" />
        <div className="relative z-10 flex-1 flex flex-col">
          <button onClick={() => setStep('landing')} className="flex items-center gap-1 text-sm text-slate-400 mb-8 w-fit hover:text-violet-500 transition-colors">
            <ArrowLeft size={16} /> Back
          </button>
          <div className="mb-8">
            <div className="w-12 h-12 rounded-2xl gradient-bg-deep flex items-center justify-center mb-5 shadow-lg shadow-violet-200">
              <svg width="22" height="26" viewBox="0 0 52 60" fill="none">
                <rect x="22" y="0" width="8" height="60" rx="4" fill="white"/>
                <rect x="8" y="12" width="36" height="8" rx="4" fill="white"/>
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-indigo-900 mb-1">Create your account</h2>
            <p className="text-sm text-slate-500">Join your prayer community</p>
          </div>
          <div className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-indigo-700 uppercase tracking-wide mb-1.5 block">Full Name *</label>
              <input type="text" placeholder="First & Last Name" value={signupForm.name}
                onChange={e => { setSignupForm(f => ({ ...f, name: e.target.value })); setSignupErrors(x => ({ ...x, name: '' })) }}
                className="input-field" />
              {signupErrors.name && <p className="text-xs text-red-500 mt-1">{signupErrors.name}</p>}
            </div>
            <div>
              <label className="text-xs font-semibold text-indigo-700 uppercase tracking-wide mb-1.5 block">Email Address *</label>
              <input type="email" placeholder="you@example.com" value={signupForm.email}
                onChange={e => { setSignupForm(f => ({ ...f, email: e.target.value })); setSignupErrors(x => ({ ...x, email: '' })) }}
                className="input-field" />
              {signupErrors.email && <p className="text-xs text-red-500 mt-1">{signupErrors.email}</p>}
            </div>
            <div>
              <label className="text-xs font-semibold text-indigo-700 uppercase tracking-wide mb-1.5 block">
                Phone <span className="text-slate-400 normal-case font-normal">(optional · for prayer reminders)</span>
              </label>
              <input type="tel" placeholder="(555) 000-0000" value={signupForm.phone}
                onChange={e => setSignupForm(f => ({ ...f, phone: e.target.value }))}
                className="input-field" />
            </div>
          </div>
          {error && <div className="mt-4 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">{error}</div>}
          <div className="mt-auto pt-6">
            <button onClick={handleSignUp} className="btn-primary w-full flex items-center justify-center gap-2 text-base">
              <span>Create Account</span><ChevronRight size={18} />
            </button>
            <button onClick={() => setStep('signin')} className="mt-3 w-full text-sm text-center text-violet-500 font-medium hover:text-violet-700 transition-colors py-2">
              Already have an account? Sign in
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Sign In
  return (
    <div className="min-h-screen flex flex-col px-6 pt-14 pb-6 relative overflow-hidden animate-slide-up">
      <div className="absolute -top-10 -left-10 w-48 h-48 rounded-full bg-sky-200/40 blur-3xl pointer-events-none" />
      <div className="relative z-10 flex-1 flex flex-col">
        <button onClick={() => setStep('landing')} className="flex items-center gap-1 text-sm text-slate-400 mb-8 w-fit hover:text-violet-500 transition-colors">
          <ArrowLeft size={16} /> Back
        </button>
        <div className="mb-8">
          <div className="w-12 h-12 rounded-2xl gradient-bg-deep flex items-center justify-center mb-5 shadow-lg shadow-violet-200">
            <svg width="22" height="26" viewBox="0 0 52 60" fill="none">
              <rect x="22" y="0" width="8" height="60" rx="4" fill="white"/>
              <rect x="8" y="12" width="36" height="8" rx="4" fill="white"/>
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-indigo-900 mb-1">Welcome back</h2>
          <p className="text-sm text-slate-500">Sign in with your email</p>
        </div>
        <div className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-indigo-700 uppercase tracking-wide mb-1.5 block">Email Address</label>
            <input type="email" placeholder="you@example.com" value={signinForm.email}
              onChange={e => { setSigninForm(f => ({ ...f, email: e.target.value })); setError('') }}
              onKeyDown={e => e.key === 'Enter' && handleSignIn()}
              className="input-field" />
          </div>
        </div>
        {error && <div className="mt-4 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">{error}</div>}
        <div className="mt-auto pt-6">
          <button onClick={handleSignIn} className="btn-primary w-full flex items-center justify-center gap-2 text-base">
            <span>Sign In</span><ChevronRight size={18} />
          </button>
          <button onClick={() => setStep('signup')} className="mt-3 w-full text-sm text-center text-violet-500 font-medium hover:text-violet-700 transition-colors py-2">
            New here? Create an account
          </button>
        </div>
      </div>
    </div>
  )
}
