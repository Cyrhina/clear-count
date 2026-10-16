import { CheckCircle2, Clock, ImagePlus, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Button } from '@ops/components/ui/Button'
import { Checkbox } from '@ops/components/ui/Checkbox'
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@ops/components/ui/Dialog'
import { FormField } from '@ops/components/ui/FormField'
import { Input } from '@ops/components/ui/Input'
import { TermsDialog, type LegalDoc } from '@ops/features/subscription/components/TermsDialog'
import { apiErrorMessage } from '@ops/lib/api/http'
import { PLAN_DETAILS, formatEmployeeLimit } from '@ops/lib/plans'
import { getUpgradeAmount, newPaymentReference, submitUpgradePayment } from '@ops/lib/services/subscriptionService'
import { formatCurrency } from '@ops/lib/utils/format'
import type { PlanTier } from '@ops/types/domain'

/**
 * Upgrade payment: the company scans the QR, pays, then submits the receipt's reference number. The plan is NOT
 * changed here — the Clear Count billing team verifies the payment first (see CompaniesPage for the confirm step).
 * The QR in `public/brand/payment-qr.svg` is a placeholder: replace it with the provider's QR (InstaPay / e-wallet).
 */
const PROOF_TYPES = ['image/png', 'image/jpeg', 'image/webp']
const PROOF_MAX_BYTES = 2 * 1024 * 1024

export function UpgradePaymentDialog({ targetPlan, onClose, onSubmitted }: { targetPlan: PlanTier | null; onClose: () => void; onSubmitted: () => void }) {
  const [amount, setAmount] = useState<number | null | undefined>(undefined)
  const [paymentReference, setPaymentReference] = useState('')
  const [receiptReference, setReceiptReference] = useState('')
  const [proof, setProof] = useState<File | null>(null)
  const [proofPreview, setProofPreview] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [proofError, setProofError] = useState<string | null>(null)
  const [agreed, setAgreed] = useState(false)
  const [agreeError, setAgreeError] = useState(false)
  const [legalDoc, setLegalDoc] = useState<LegalDoc | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  useEffect(() => {
    if (!targetPlan) return
    setSubmitted(false)
    setReceiptReference('')
    setProof(null)
    setError(null)
    setProofError(null)
    setAgreed(false)
    setAgreeError(false)
    setAmount(undefined)
    setPaymentReference(newPaymentReference(targetPlan))
    void getUpgradeAmount(targetPlan).then(setAmount, () => setAmount(null))
  }, [targetPlan])

  // A local preview of the chosen photo, freed when it changes.
  useEffect(() => {
    if (!proof) return setProofPreview(null)
    const url = URL.createObjectURL(proof)
    setProofPreview(url)
    return () => URL.revokeObjectURL(url)
  }, [proof])

  function pickProof(file: File | undefined) {
    setProofError(null)
    if (!file) return
    if (!PROOF_TYPES.includes(file.type)) return setProofError('Upload a PNG, JPG or WebP photo.')
    if (file.size > PROOF_MAX_BYTES) return setProofError('The photo is too large (2 MB maximum).')
    setProof(file)
  }

  async function submit() {
    if (!targetPlan || !amount) return
    const refInvalid = receiptReference.trim().length < 6
    setError(refInvalid ? 'Enter the reference number from your payment receipt (at least 6 characters).' : null)
    if (!proof) setProofError('Upload a photo of your payment receipt.')
    setAgreeError(!agreed)
    if (refInvalid || !proof || !agreed) return
    setIsSubmitting(true)
    try {
      await submitUpgradePayment({ targetTier: targetPlan, paymentReference, receiptReference: receiptReference.trim(), proof })
      setSubmitted(true)
      onSubmitted()
    } catch (e) {
      setError(apiErrorMessage(e))
    } finally {
      setIsSubmitting(false)
    }
  }

  const plan = targetPlan ? PLAN_DETAILS[targetPlan] : null

  return (
    <Dialog open={targetPlan !== null} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md">
        {submitted ? (
          <div className="space-y-4 py-2 text-center">
            <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-warning/15 text-warning">
              <Clock className="size-6" />
            </div>
            <DialogTitle>Payment submitted</DialogTitle>
            <DialogDescription>
              The Clear Count billing team will verify your payment, usually within 1 business day. Your plan changes to {plan?.label} only after they confirm it — until then you stay on your current plan.
            </DialogDescription>
            <div className="rounded-lg border border-border bg-muted/40 px-3 py-2 text-left text-xs">
              <p className="text-muted-foreground">Payment reference</p>
              <p className="font-mono text-sm font-medium">{paymentReference}</p>
            </div>
            <Button onClick={onClose} className="w-full">
              Done
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <DialogTitle>Upgrade to {plan?.label} Plan</DialogTitle>
              <DialogDescription>{targetPlan && `${formatEmployeeLimit(targetPlan)} included. Scan the QR code with your e-wallet or banking app, then submit your receipt number.`}</DialogDescription>
            </div>

            <div className="flex flex-col items-center gap-3 rounded-xl border border-border bg-muted/30 p-4">
              <img src="/brand/payment-qr.svg" alt="Payment QR code" className="size-44 rounded-lg bg-white p-2" />
              <div className="text-center">
                <p className="text-xs text-muted-foreground">Amount to pay (monthly)</p>
                <p className="font-display text-2xl font-semibold">{amount === undefined ? '…' : amount === null ? 'Custom' : formatCurrency(amount)}</p>
              </div>
              <div className="w-full rounded-lg border border-dashed border-border bg-card px-3 py-2 text-center">
                <p className="text-[11px] text-muted-foreground">Put this in the payment note</p>
                <p className="font-mono text-sm font-semibold">{paymentReference}</p>
              </div>
            </div>

            <FormField label="Receipt reference number" error={error ?? undefined} hint="The transaction / reference number shown on your payment receipt.">
              <Input value={receiptReference} onChange={(e) => setReceiptReference(e.target.value)} placeholder="e.g. 1234 5678 9012" invalid={!!error} />
            </FormField>

            <FormField label="Proof of payment" error={proofError ?? undefined} hint="A photo or screenshot of your receipt (PNG, JPG or WebP, up to 2 MB).">
              {proof && proofPreview ? (
                <div className="relative w-fit">
                  <img src={proofPreview} alt="Proof of payment" className="max-h-40 rounded-lg border border-border" />
                  <button type="button" onClick={() => setProof(null)} aria-label="Remove photo" className="absolute -right-2 -top-2 flex size-6 items-center justify-center rounded-full border border-border bg-card text-muted-foreground shadow-soft hover:text-foreground">
                    <X className="size-3.5" />
                  </button>
                </div>
              ) : (
                <label className="flex cursor-pointer flex-col items-center gap-1.5 rounded-lg border border-dashed border-border px-3 py-5 text-xs text-muted-foreground hover:bg-muted/40">
                  <ImagePlus className="size-5" />
                  Click to upload a photo
                  <input type="file" accept={PROOF_TYPES.join(',')} className="sr-only" onChange={(e) => { pickProof(e.target.files?.[0]); e.target.value = '' }} />
                </label>
              )}
            </FormField>

            <div>
              <label className="flex items-start gap-2 text-xs">
                <Checkbox checked={agreed} onCheckedChange={(v) => { setAgreed(v === true); setAgreeError(false) }} className="mt-0.5 shrink-0" />
                <span>
                  I agree to the{' '}
                  <button type="button" onClick={() => setLegalDoc('terms')} className="font-medium text-primary hover:underline">Terms &amp; Conditions</button> and{' '}
                  <button type="button" onClick={() => setLegalDoc('privacy')} className="font-medium text-primary hover:underline">Privacy Policy</button>.
                </span>
              </label>
              {agreeError && <p className="mt-1 text-xs text-danger">You need to agree before submitting.</p>}
            </div>

            <p className="flex items-start gap-2 text-xs text-muted-foreground">
              <CheckCircle2 className="mt-0.5 size-3.5 shrink-0" />
              Your plan will not change until the Clear Count billing team has verified the payment.
            </p>

            <div className="flex justify-end gap-2">
              <Button variant="secondary" onClick={onClose}>
                Cancel
              </Button>
              <Button onClick={submit} isLoading={isSubmitting} disabled={!amount}>
                I've Paid — Submit for Verification
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
      <TermsDialog doc={legalDoc} onClose={() => setLegalDoc(null)} />
    </Dialog>
  )
}
