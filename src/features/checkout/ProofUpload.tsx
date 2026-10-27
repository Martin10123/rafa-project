import { useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { logEventSafe } from '@/shared/logging'
import { useSubmitPaymentProof } from '@/features/orders/useOrders'

type ProofUploadProps = {
  orderId: string
  onUploaded?: () => void
}

export function ProofUpload({ orderId, onUploaded }: ProofUploadProps) {
  const submitProof = useSubmitPaymentProof()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [message, setMessage] = useState<string | undefined>()

  async function onUploadProof(file: File) {
    setMessage(undefined)

    try {
      await submitProof.mutateAsync({ orderId, file })
      logEventSafe({
        category: 'checkout',
        eventType: 'checkout_proof_submitted',
        success: true,
        message: 'Comprobante enviado',
        entityType: 'order',
        entityId: orderId,
      })
      onUploaded?.()
    } catch (error) {
      const msg =
        error instanceof Error ? error.message : 'No se pudo subir el comprobante.'
      logEventSafe({
        category: 'checkout',
        eventType: 'checkout_proof_error',
        success: false,
        message: msg,
        entityType: 'order',
        entityId: orderId,
      })
      setMessage(msg)
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/heic,image/heif"
        className="sr-only"
        disabled={submitProof.isPending}
        onChange={(event) => {
          const file = event.target.files?.[0]
          event.target.value = ''
          if (file) void onUploadProof(file)
        }}
      />
      <Button
        type="button"
        size="sm"
        disabled={submitProof.isPending}
        onClick={() => fileInputRef.current?.click()}
      >
        {submitProof.isPending ? 'Subiendo…' : 'Elegir imagen'}
      </Button>
      {message ? (
        <p className="text-xs text-destructive text-pretty">{message}</p>
      ) : null}
    </div>
  )
}
