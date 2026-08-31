import { useState, type FormEvent } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/features/auth/useAuth'

type RegisterFormProps = {
  onSuccess: () => void
  onSwitch: () => void
}

export function RegisterForm({ onSuccess, onSwitch }: RegisterFormProps) {
  const { signUp, configured } = useAuth()
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | undefined>()
  const [pending, setPending] = useState(false)

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setPending(true)
    const message = await signUp(email, password, fullName)
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
          <Label htmlFor="register-name" className="text-xs">
            Nombre
          </Label>
          <Input
            id="register-name"
            autoComplete="name"
            value={fullName}
            onChange={(event) => setFullName(event.target.value)}
            required
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="register-email" className="text-xs">
            Correo
          </Label>
          <Input
            id="register-email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="register-password" className="text-xs">
            Contraseña
          </Label>
          <Input
            id="register-password"
            type="password"
            autoComplete="new-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            aria-invalid={Boolean(error)}
            minLength={6}
            required
          />
          {error ? <p className="text-xs text-destructive">{error}</p> : null}
        </div>
        <Button type="submit" disabled={pending || !configured}>
          Registrarme
        </Button>
      </form>
      <Button variant="ghost" size="sm" onClick={onSwitch}>
        Ya tengo cuenta
      </Button>
    </div>
  )
}
