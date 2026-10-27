import { paymentInfoIsPublished } from '@/domain/order/types'
import { isSupabaseConfigured } from '@/data/supabase/client'
import { usePaymentInfo } from '@/features/checkout/usePaymentInfo'

export function PaymentInstructions() {
  const query = usePaymentInfo()

  if (!isSupabaseConfigured()) {
    return (
      <p className="text-sm text-muted-foreground text-pretty">
        Configura Supabase para mostrar los datos de la transferencia.
      </p>
    )
  }

  if (query.isLoading) {
    return <div className="h-24 animate-pulse rounded-xl bg-muted" />
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

  if (!paymentInfoIsPublished(query.data)) {
    return (
      <p className="text-sm text-muted-foreground text-pretty">
        Los datos de la cuenta todavía no están publicados. Rafa puede cargarlos
        en el panel de pagos.
      </p>
    )
  }

  const info = query.data
  const rows = [
    ['Banco', info?.bankName],
    ['Tipo de cuenta', info?.accountType],
    ['Número', info?.accountNumber],
    ['Titular', info?.holderName],
  ] as const

  return (
    <div className="flex flex-col gap-2 rounded-xl border p-4">
      <h2 className="text-sm font-medium text-foreground">Datos para transferir</h2>
      <dl className="flex flex-col gap-1 text-sm">
        {rows.map(([label, value]) =>
          value?.trim() ? (
            <div key={label} className="flex flex-col">
              <dt className="text-xs text-muted-foreground">{label}</dt>
              <dd className="text-foreground">{value}</dd>
            </div>
          ) : null,
        )}
      </dl>
    </div>
  )
}
