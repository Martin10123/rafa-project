import { useState, type FormEvent } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/features/auth/useAuth'

type LoginFormProps = {
  onSuccess: () => void
  onSwitch: () => void
}

export function LoginForm({ onSuccess, onSwitch }: LoginFormProps) {
  const { signIn, configured } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | undefined>()
  const [pending, setPending] = useState(false)

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setPending(true)
    const message = await signIn(email, password)
    setPending(false)
    if (message) {
      setError(message)
      return
    }
    setError(undefined)
    onSuccess()
  }

  return (
    <div className="flex flex-col gap-4">
      <form className="flex flex-col gap-3" onSubmit={onSubmit}>
        {!configured ? (
          <p className="text-xs text-muted-foreground text-pretty">
            Configura VITE_SUPABASE_URL y VITE_SUPABASE_PUBLISHABLE_KEY en
            .env.local.
          </p>
        ) : null}
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="login-email" className="text-xs">
            Correo
          </Label>
          <Input
            id="login-email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="login-password" className="text-xs">
            Contraseña
          </Label>
          <Input
            id="login-password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            aria-invalid={Boolean(error)}
            required
          />
          {error ? <p className="text-xs text-destructive">{error}</p> : null}
        </div>
        <Button type="submit" disabled={pending || !configured}>
          Entrar
        </Button>
      </form>
      <Button variant="ghost" size="sm" onClick={onSwitch}>
        Crear cuenta
      </Button>
    </div>
  )
}
