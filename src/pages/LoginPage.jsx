import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { Music2, Mail, Lock, ArrowRight, Eye, EyeOff } from 'lucide-react'
import toast from 'react-hot-toast'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isForgot, setIsForgot] = useState(false)

  const { signIn, resetPassword } = useAuth()
  const navigate = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()
    setIsLoading(true)

    try {
      if (isForgot) {
        await resetPassword(email)
        toast.success('Email de réinitialisation envoyé !')
        setIsForgot(false)
      } else {
        await signIn(email, password)
        toast.success('Connexion réussie !')
        navigate('/dashboard')
      }
    } catch (err) {
      toast.error(
        err.message === 'Invalid login credentials'
          ? 'Email ou mot de passe incorrect'
          : err.message
      )
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* ── Panneau gauche : visuel ── */}
      <div className="hidden lg:flex lg:w-1/2 bg-brand-900 relative overflow-hidden items-center justify-center">
        {/* Cercles décoratifs */}
        <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-brand-500/10" />
        <div className="absolute bottom-[-15%] right-[-10%] w-[400px] h-[400px] rounded-full bg-accent-green/8" />
        <div className="absolute top-[40%] right-[10%] w-[200px] h-[200px] rounded-full bg-brand-400/10" />

        <div className="relative z-10 text-center px-12">
          <div className="w-20 h-20 rounded-2xl bg-brand-500 flex items-center justify-center mx-auto mb-8
                          shadow-lg shadow-brand-500/30">
            <Music2 size={40} className="text-white" />
          </div>
          <h1 className="font-display text-4xl font-bold text-white mb-4">
            Studio Manager
          </h1>
          <p className="text-white/50 text-lg max-w-md mx-auto leading-relaxed">
            Gérez vos sessions, vos clients et vos finances depuis une seule interface.
          </p>

          {/* Indicateurs visuels */}
          <div className="mt-12 flex gap-6 justify-center">
            {[
              { value: '∞', label: 'Sessions' },
              { value: '24/7', label: 'Accès' },
              { value: '100%', label: 'Sécurisé' },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="font-display text-2xl font-bold text-brand-400">{stat.value}</p>
                <p className="text-white/30 text-xs mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Panneau droit : formulaire ── */}
      <div className="flex-1 flex items-center justify-center p-8 bg-surface-50">
        <div className="w-full max-w-md animate-fade-in">
          {/* Logo mobile */}
          <div className="lg:hidden flex items-center gap-3 mb-10">
            <div className="w-10 h-10 rounded-xl bg-brand-500 flex items-center justify-center">
              <Music2 size={22} className="text-white" />
            </div>
            <span className="font-display font-bold text-xl text-brand-900">Studio Manager</span>
          </div>

          <h2 className="font-display text-2xl font-bold text-brand-900 mb-2">
            {isForgot ? 'Mot de passe oublié' : 'Connexion'}
          </h2>
          <p className="text-brand-900/40 text-sm mb-8">
            {isForgot
              ? 'Entre ton email pour recevoir un lien de réinitialisation.'
              : 'Connecte-toi pour accéder à ton espace.'
            }
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label className="label">Email</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-brand-900/30" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ton@email.com"
                  required
                  className="input pl-10"
                />
              </div>
            </div>

            {/* Password */}
            {!isForgot && (
              <div>
                <label className="label">Mot de passe</label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-brand-900/30" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="input pl-10 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-900/30 
                               hover:text-brand-900/60 transition-colors"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary w-full relative"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  {isForgot ? 'Envoyer le lien' : 'Se connecter'}
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          {/* Lien mot de passe oublié */}
          <button
            type="button"
            onClick={() => setIsForgot(!isForgot)}
            className="mt-6 text-sm text-brand-500 hover:text-brand-600 transition-colors font-medium"
          >
            {isForgot ? '← Retour à la connexion' : 'Mot de passe oublié ?'}
          </button>
        </div>
      </div>
    </div>
  )
}
