import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { LoginForm } from '@/features/auth/LoginForm'
import { RegisterForm } from '@/features/auth/RegisterForm'

export type AuthModalView = 'login' | 'register'

type AuthModalProps = {
  view: AuthModalView | null
  onViewChange: (view: AuthModalView) => void
  onClose: () => void
}

export function AuthModal({ view, onViewChange, onClose }: AuthModalProps) {
  const open = view !== null
  const isLogin = view === 'login'

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) onClose()
      }}
    >
      <DialogContent className="gap-4 sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>{isLogin ? 'Entrar' : 'Crear cuenta'}</DialogTitle>
          <DialogDescription>
            {isLogin
              ? 'Opcional. Sirve para historial y promociones.'
              : 'Crea una cuenta para guardar tu historial.'}
          </DialogDescription>
        </DialogHeader>
        {isLogin ? (
          <LoginForm
            onSuccess={onClose}
            onSwitch={() => onViewChange('register')}
          />
        ) : (
          <RegisterForm
            onSuccess={onClose}
            onSwitch={() => onViewChange('login')}
          />
        )}
      </DialogContent>
    </Dialog>
  )
}
