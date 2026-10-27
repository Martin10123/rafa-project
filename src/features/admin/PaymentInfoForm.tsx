import { useState, type FormEvent } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { StorePaymentInfo } from '@/domain/order/types'
import { isSupabaseConfigured } from '@/data/supabase/client'
import {
  usePaymentInfo,
  useUpdatePaymentInfo,
} from '@/features/checkout/usePaymentInfo'

const EMPTY: StorePaymentInfo = {
  bankName: '',
  accountType: '',
  accountNumber: '',
  holderName: '',
}

export function PaymentInfoForm() {
  const query = usePaymentInfo()
  const updateInfo = useUpdatePaymentInfo()
  const [draft, setDraft] = useState<StorePaymentInfo | null>(null)
  const [message, setMessage] = useState<string | undefined>()
  const info = draft ?? query.data ?? EMPTY

  function setField(field: keyof StorePaymentInfo, value: string) {
    setDraft({ ...info, [field]: value })
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setMessage(undefined)
    try {
      const saved = await updateInfo.mutateAsync(info)
      setDraft(saved)
      setMessage('Datos de pago guardados.')
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'No se pudo guardar.')
    }
  }

  if (!isSupabaseConfigured()) return null

  if (query.isLoading) {
    return <div className="h-28 animate-pulse rounded-xl bg-muted" />
  }

  if (query.isError) {
    return (
      <p className="text-sm text-destructive text-pretty">
        {query.error instanceof Error
          ? query.error.message
          : 'No se pudieron cargar los datos de pago.'}
      </p>
    )
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-3 rounded-xl border p-4">
      <div className="flex flex-col gap-1">
        <h2 className="text-sm font-medium text-foreground">Cuenta para transferencias</h2>
        <p className="text-xs text-muted-foreground text-pretty">
          El cliente ve estos datos antes de subir el comprobante.
        </p>
      </div>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="pay-bank" className="text-xs">
            Banco
          </Label>
          <Input
            id="pay-bank"
            value={info.bankName}
            onChange={(event) => setField('bankName', event.target.value)}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="pay-type" className="text-xs">
            Tipo de cuenta
          </Label>
          <Input
            id="pay-type"
            value={info.accountType}
            onChange={(event) => setField('accountType', event.target.value)}
            placeholder="Ahorros"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="pay-number" className="text-xs">
            Número
          </Label>
          <Input
            id="pay-number"
            value={info.accountNumber}
            onChange={(event) => setField('accountNumber', event.target.value)}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="pay-holder" className="text-xs">
            Titular
          </Label>
          <Input
            id="pay-holder"
            value={info.holderName}
            onChange={(event) => setField('holderName', event.target.value)}
          />
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Button type="submit" size="sm" disabled={updateInfo.isPending}>
          Guardar datos
        </Button>
        {message ? <span className="text-xs text-muted-foreground">{message}</span> : null}
      </div>
    </form>
  )
}
