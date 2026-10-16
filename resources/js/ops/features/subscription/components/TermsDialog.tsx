import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@ops/components/ui/Dialog'
import { POWERED_BY_NAME } from '@ops/components/ui/BrandLogo'

export type LegalDoc = 'terms' | 'privacy'

interface Section {
  heading: string
  body: string[]
}

// Draft wording for the plan-upgrade flow. Have it reviewed by legal counsel before going live.
const DOCS: Record<LegalDoc, { title: string; updated: string; sections: Section[] }> = {
  terms: {
    title: 'Terms & Conditions',
    updated: 'Last updated October 2026',
    sections: [
      {
        heading: '1. The service',
        body: [`Clear Count is a payroll and HR service provided by ${POWERED_BY_NAME} ("Clear Count", "we"). These terms apply when your company upgrades its subscription plan.`],
      },
      {
        heading: '2. Plans and fees',
        body: [
          'Each plan has a monthly base price and a number of included employees. Employees above the limit are charged the per-employee rate shown for the plan. Enterprise pricing is quoted by FBS based on complexity.',
          'Prices are in Philippine pesos. Amounts shown in the upgrade form are estimates based on your current number of active employees and may change if that number changes.',
        ],
      },
      {
        heading: '3. Payment and verification',
        body: [
          'Upgrades are paid by scanning the payment QR code and submitting a photo of your receipt and its reference number.',
          'Your plan changes only after the Clear Count billing team has verified the payment, usually within 1 business day. Until then your current plan stays in effect. We may reject a payment that cannot be matched, is incomplete, or has an unreadable receipt, and will tell you why.',
        ],
      },
      {
        heading: '4. Your account and your data',
        body: [
          'The person submitting the upgrade confirms they are authorized to bind the company. You are responsible for the accuracy of the details and receipt you submit, and for keeping your login secure.',
          'You remain the owner of your company and employee data. Locked modules are hidden when a plan is downgraded; your data is kept and available again once the module is unlocked.',
        ],
      },
      {
        heading: '5. Renewals and refunds',
        body: [
          'Plans renew monthly. A payment that has been verified and applied is non-refundable, except where the law requires it or the upgrade could not be delivered because of an error on our side. Downgrades take effect immediately and are not refunded for the current month.',
        ],
      },
      {
        heading: '6. Changes and contact',
        body: ['We may update these terms and will show the new version here before it applies to your next upgrade. Questions: sales@frontlinebusiness.com.ph.'],
      },
    ],
  },
  privacy: {
    title: 'Privacy Policy',
    updated: 'Last updated October 2026',
    sections: [
      {
        heading: '1. What we collect',
        body: ['For an upgrade we collect the company name, the person who submitted it, the amount paid, your payment reference, the receipt reference number and the receipt photo you upload.'],
      },
      {
        heading: '2. Why we use it',
        body: ['Only to verify your payment, apply your plan, keep billing records and prevent fraud. We do not sell this information or use it for advertising.'],
      },
      {
        heading: '3. Who sees it',
        body: ['Authorized members of the Clear Count billing team, and our payment or banking partners when needed to confirm a payment. We do not share it with anyone else unless the law requires it.'],
      },
      {
        heading: '4. How long we keep it',
        body: ['Billing records and receipts are kept for as long as needed for accounting and tax purposes, then deleted or anonymized.'],
      },
      {
        heading: '5. Your rights',
        body: [
          'Under the Data Privacy Act of 2012 (RA 10173) you may ask to access, correct or delete your personal data, or object to how it is used. Contact our Data Protection Officer at privacy@frontlinebusiness.com.ph.',
        ],
      },
      {
        heading: '6. Security',
        body: ['Receipts are stored privately and are only viewable by authorized billing staff. Never upload anything other than your payment receipt.'],
      },
    ],
  },
}

/** Read-only viewer for the Terms & Conditions / Privacy Policy shown beside the upgrade agreement checkbox. */
export function TermsDialog({ doc, onClose }: { doc: LegalDoc | null; onClose: () => void }) {
  const content = doc ? DOCS[doc] : null
  return (
    <Dialog open={doc !== null} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="flex max-h-[85vh] max-w-lg flex-col overflow-hidden">
        <DialogTitle>{content?.title}</DialogTitle>
        <DialogDescription>{content?.updated}</DialogDescription>
        <div className="mt-3 min-h-0 flex-1 space-y-4 overflow-y-auto pr-1 text-sm">
          {content?.sections.map((section) => (
            <section key={section.heading} className="space-y-1.5">
              <h3 className="font-semibold">{section.heading}</h3>
              {section.body.map((p) => (
                <p key={p} className="text-muted-foreground">
                  {p}
                </p>
              ))}
            </section>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  )
}
