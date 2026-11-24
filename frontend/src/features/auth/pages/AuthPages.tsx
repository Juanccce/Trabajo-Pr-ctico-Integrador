import { useForm } from '@tanstack/react-form'
import { ArrowLeft, ArrowRight, LockKeyhole, Mail, UserRound } from 'lucide-react'
import type { ReactNode } from 'react'
import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'

import { authApi } from '../api/auth'
import { handleApiError } from '../../../shared/api/handleApiError'
import { useAuthStore } from '../../../store/authStore'
import { Button } from '../../../shared/ui/Button'

export function LoginPage() {
  const login = useAuthStore((state) => state.login)
  const [error, setError] = useState('')
  const navigate = useNavigate()
  const location = useLocation()
  const destination = (location.state as { from?: string } | null)?.from
  const form = useForm({
    defaultValues: { username: '', password: '' },
    onSubmit: async ({ value }) => {
      setError('')
      try { await login(value.username, value.password); navigate(destination || (useAuthStore.getState().user?.role === 'admin' ? '/admin/resumen' : '/'), { replace: true }) } catch (reason) { setError(handleApiError(reason)) }
    },
  })
  return <AuthFrame kicker="Qué bueno verte" title="Entrá y seguimos." description="Tu próxima comida rica está a unos pasos.">
    <form className="auth-form" onSubmit={(event) => { event.preventDefault(); event.stopPropagation(); void form.handleSubmit() }}>
      <form.Field name="username" validators={{ onChange: ({ value }) => value.trim().length < 3 ? 'Usá al menos 3 caracteres.' : undefined }}>{(field) => <label className="form-field"><span>Usuario</span><div className="input-with-icon"><UserRound size={17} /><input autoComplete="username" value={field.state.value} onChange={(event) => field.handleChange(event.target.value)} required placeholder="Tu nombre de usuario" /></div>{field.state.meta.errors.map((item, index) => <small className="field-error" key={index}>{String(item)}</small>)}</label>}</form.Field>
      <form.Field name="password" validators={{ onChange: ({ value }) => value.length < 8 ? 'La contraseña necesita al menos 8 caracteres.' : undefined }}>{(field) => <label className="form-field"><span>Contraseña</span><div className="input-with-icon"><LockKeyhole size={17} /><input type="password" autoComplete="current-password" value={field.state.value} onChange={(event) => field.handleChange(event.target.value)} required placeholder="Al menos 8 caracteres" /></div>{field.state.meta.errors.map((item, index) => <small className="field-error" key={index}>{String(item)}</small>)}</label>}</form.Field>
      {error && <p className="form-error">{error}</p>}
      <Button type="submit" className="button-wide">Ingresar <ArrowRight size={17} /></Button>
      <p className="auth-switch">¿Todavía no tenés cuenta? <Link to="/registro">Creala acá</Link></p>
    </form>
  </AuthFrame>
}

export function RegisterPage() {
  const [error, setError] = useState('')
  const navigate = useNavigate()
  const form = useForm({
    defaultValues: { username: '', full_name: '', email: '', password: '' },
    onSubmit: async ({ value }) => {
      setError('')
      try { await authApi.register(value); navigate('/login', { state: { registered: true } }) } catch (reason) { setError(handleApiError(reason)) }
    },
  })
  return <AuthFrame kicker="Tu mesa ya está lista" title="Arrancamos por acá." description="Creá tu cuenta y guardá tiempo para disfrutar.">
    <form className="auth-form" onSubmit={(event) => { event.preventDefault(); event.stopPropagation(); void form.handleSubmit() }}>
      <form.Field name="full_name" validators={{ onChange: ({ value }) => value.trim().length < 2 ? 'Escribí tu nombre y apellido.' : undefined }}>{(field) => <label className="form-field"><span>Nombre y apellido</span><div className="input-with-icon"><UserRound size={17} /><input autoComplete="name" value={field.state.value} onChange={(event) => field.handleChange(event.target.value)} required /></div>{field.state.meta.errors.map((item, index) => <small className="field-error" key={index}>{String(item)}</small>)}</label>}</form.Field>
      <div className="form-row"><form.Field name="username" validators={{ onChange: ({ value }) => value.trim().length < 3 ? 'Mínimo 3 caracteres.' : undefined }}>{(field) => <label className="form-field"><span>Usuario</span><input autoComplete="username" value={field.state.value} onChange={(event) => field.handleChange(event.target.value)} minLength={3} required />{field.state.meta.errors.map((item, index) => <small className="field-error" key={index}>{String(item)}</small>)}</label>}</form.Field><form.Field name="email" validators={{ onChange: ({ value }) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) ? undefined : 'Revisá el formato del email.' }}>{(field) => <label className="form-field"><span>Email</span><div className="input-with-icon"><Mail size={17} /><input type="email" autoComplete="email" value={field.state.value} onChange={(event) => field.handleChange(event.target.value)} required /></div>{field.state.meta.errors.map((item, index) => <small className="field-error" key={index}>{String(item)}</small>)}</label>}</form.Field></div>
      <form.Field name="password" validators={{ onChange: ({ value }) => value.length < 8 ? 'La contraseña necesita al menos 8 caracteres.' : undefined }}>{(field) => <label className="form-field"><span>Contraseña</span><div className="input-with-icon"><LockKeyhole size={17} /><input type="password" autoComplete="new-password" value={field.state.value} onChange={(event) => field.handleChange(event.target.value)} minLength={8} required /></div>{field.state.meta.errors.map((item, index) => <small className="field-error" key={index}>{String(item)}</small>)}</label>}</form.Field>
      {error && <p className="form-error">{error}</p>}
      <Button type="submit" className="button-wide">Crear mi cuenta <ArrowRight size={17} /></Button>
      <p className="auth-switch">¿Ya tenés una cuenta? <Link to="/login">Ingresá</Link></p>
    </form>
  </AuthFrame>
}

function AuthFrame({ kicker, title, description, children }: { kicker: string; title: string; description: string; children: ReactNode }) {
  return <section className="auth-page"><div className="auth-picture"><div className="auth-picture-copy"><span className="eyebrow">Food Store · Cocina de barrio</span><p>El sabor de<br />quedarse <em>un rato.</em></p><span className="auth-picture-caption">Fresco, simple y recién salido de la cocina.</span></div><img src="https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=1100&q=85" alt="Mesa preparada para compartir una comida" /></div><div className="auth-panel"><Link to="/" className="back-link"><ArrowLeft size={16} /> Volver al menú</Link><div className="auth-heading"><span className="eyebrow">{kicker}</span><h1>{title}</h1><p>{description}</p></div>{children}<span className="auth-footnote"><LockKeyhole size={13} /> Tu sesión se mantiene segura.</span></div></section>
}

export function UnauthorizedPage() {
  return <div className="unauthorized"><span className="eyebrow">Acceso restringido</span><h1>Esta mesa es<br /><em>solo del equipo.</em></h1><p>Tu cuenta no tiene permisos para entrar acá.</p><Link to="/" className="button button-primary">Volver al menú <ArrowRight size={17} /></Link></div>
}
