import { router } from '@inertiajs/react'
import { ImagePlus, Palette, RotateCcw, Wand2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { Avatar } from '@ops/components/ui/Avatar'
import { Button } from '@ops/components/ui/Button'
import { Card } from '@ops/components/ui/Card'
import { FormField } from '@ops/components/ui/FormField'
import { Input, Textarea } from '@ops/components/ui/Input'
import { Select } from '@ops/components/ui/Select'
import { Switch } from '@ops/components/ui/Switch'
import { useToast } from '@ops/components/ui/Toast'
import { ApiError, apiErrorMessage } from '@ops/lib/api/http'
import { updateCompanyInfo, uploadCompanyLogo } from '@ops/lib/services/companyInfoService'
import { BRAND_SHADES, applyBrandTheme, buildBrandScale, extractBrandColor } from '@ops/lib/theme/brandTheme'
import type { Address, Company, CompanyContact, CompanyRegistration } from '@ops/types/domain'

interface FormValues {
  name: string
  tradeName: string
  companyType: NonNullable<Company['companyType']>
  industry: string
  description: string
  website: string
  email: string
  contactNumber: string
  registration: CompanyRegistration
  registeredAddress: Address
  officeAddress: Address
  sameAsRegisteredAddress: boolean
  primaryContact: CompanyContact
  payrollContact: CompanyContact
  hrContact: CompanyContact
}

const COMPANY_TYPE_OPTIONS = [
  { value: 'corporation', label: 'Corporation' },
  { value: 'partnership', label: 'Partnership' },
  { value: 'sole_proprietorship', label: 'Sole Proprietorship' },
  { value: 'other', label: 'Other' },
]

const EMPTY_ADDRESS: Address = {
  buildingUnit: '',
  street: '',
  barangay: '',
  city: '',
  province: '',
  region: '',
  zipCode: '',
  country: 'Philippines',
}

const EMPTY_CONTACT: CompanyContact = { name: '', position: '', email: '', contactNumber: '' }

function AddressFields({
  namePrefix,
  register,
  disabled,
}: {
  namePrefix: 'registeredAddress' | 'officeAddress'
  register: ReturnType<typeof useForm<FormValues>>['register']
  disabled: boolean
}) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:grid-cols-3">
      <FormField label="Building / Unit" className="col-span-2 sm:col-span-1">
        <Input disabled={disabled} {...register(`${namePrefix}.buildingUnit`)} />
      </FormField>
      <FormField label="Street">
        <Input disabled={disabled} {...register(`${namePrefix}.street`)} />
      </FormField>
      <FormField label="Barangay">
        <Input disabled={disabled} {...register(`${namePrefix}.barangay`)} />
      </FormField>
      <FormField label="City / Municipality">
        <Input disabled={disabled} {...register(`${namePrefix}.city`)} />
      </FormField>
      <FormField label="Province">
        <Input disabled={disabled} {...register(`${namePrefix}.province`)} />
      </FormField>
      <FormField label="Region">
        <Input disabled={disabled} {...register(`${namePrefix}.region`)} />
      </FormField>
      <FormField label="ZIP Code">
        <Input disabled={disabled} {...register(`${namePrefix}.zipCode`)} />
      </FormField>
      <FormField label="Country">
        <Input disabled={disabled} {...register(`${namePrefix}.country`)} />
      </FormField>
    </div>
  )
}

function ContactFields({
  namePrefix,
  register,
  disabled,
  includePosition,
}: {
  namePrefix: 'primaryContact' | 'payrollContact' | 'hrContact'
  register: ReturnType<typeof useForm<FormValues>>['register']
  disabled: boolean
  includePosition?: boolean
}) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:grid-cols-4">
      <FormField label="Contact person" className={includePosition ? '' : 'sm:col-span-2 md:col-span-2'}>
        <Input disabled={disabled} {...register(`${namePrefix}.name`)} />
      </FormField>
      {includePosition && (
        <FormField label="Position / Title">
          <Input disabled={disabled} {...register(`${namePrefix}.position`)} />
        </FormField>
      )}
      <FormField label="Email">
        <Input type="email" disabled={disabled} {...register(`${namePrefix}.email`)} />
      </FormField>
      <FormField label="Contact number">
        <Input disabled={disabled} {...register(`${namePrefix}.contactNumber`)} />
      </FormField>
    </div>
  )
}

/**
 * Only ever mounted once `company` has loaded, so react-hook-form's
 * `defaultValues` are correct from this component's very first render —
 * no `reset()`-after-async-fetch dance needed (which, with a Controller-based
 * Select, does not reliably propagate; see git history if this regresses).
 */
export function CompanyInfoForm({ company, canEdit, onSaved }: { company: Company; canEdit: boolean; onSaved: () => void }) {
  const { notify } = useToast()
  const [logoUrl, setLogoUrl] = useState(company.logoUrl ?? '')
  // The chosen file is uploaded when the form is saved; `logoUrl` is only its preview.
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [serverErrors, setServerErrors] = useState<string[]>([])
  const [useLogoTheme, setUseLogoTheme] = useState(company.useLogoTheme ?? false)
  const [brandColor, setBrandColor] = useState(company.brandColor ?? '')
  const [detecting, setDetecting] = useState(false)

  // Live preview: the whole app re-themes as you upload / toggle, and falls back to the saved theme if you leave without saving.
  useEffect(() => {
    applyBrandTheme(useLogoTheme ? brandColor : undefined)
    return () => applyBrandTheme(company.useLogoTheme ? company.brandColor : undefined)
  }, [useLogoTheme, brandColor, company])

  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<FormValues>({
    defaultValues: {
      name: company.name,
      tradeName: company.tradeName ?? '',
      companyType: company.companyType ?? 'corporation',
      industry: company.industry ?? '',
      description: company.description ?? '',
      website: company.website ?? '',
      email: company.email ?? '',
      contactNumber: company.contactNumber ?? '',
      registration: { ...company.registration },
      registeredAddress: { ...EMPTY_ADDRESS, ...company.registeredAddress },
      officeAddress: { ...EMPTY_ADDRESS, ...(company.officeAddress ?? company.registeredAddress) },
      sameAsRegisteredAddress: company.sameAsRegisteredAddress ?? true,
      primaryContact: { ...EMPTY_CONTACT, ...company.primaryContact },
      payrollContact: { ...EMPTY_CONTACT, ...company.payrollContact },
      hrContact: { ...EMPTY_CONTACT, ...company.hrContact },
    },
  })

  const sameAsRegistered = watch('sameAsRegisteredAddress')
  const companyType = watch('companyType')

  function handleLogoChange(file: File | undefined) {
    if (!file) return
    setLogoFile(file)
    const reader = new FileReader()
    reader.onload = () => {
      const url = String(reader.result)
      setLogoUrl(url)
      void detectColor(url, true)
    }
    reader.readAsDataURL(file)
  }

  /** Reads the logo's dominant color; a freshly uploaded logo also switches the theme on. */
  async function detectColor(url: string, enable: boolean) {
    setDetecting(true)
    const color = await extractBrandColor(url)
    setDetecting(false)
    if (!color) {
      notify({ title: 'No color found in this logo', description: 'It looks blank or fully transparent, so the default theme stays.', tone: 'default' })
      return
    }
    setBrandColor(color)
    if (enable) setUseLogoTheme(true)
  }

  async function onSubmit(values: FormValues) {
    setServerErrors([])
    try {
      await updateCompanyInfo({ ...values, useLogoTheme: useLogoTheme && !!brandColor, brandColor: brandColor || undefined })
      if (logoFile) await uploadCompanyLogo(logoFile)
    } catch (error) {
      // A 422 lists every field the server rejected; show them all instead of only the first.
      setServerErrors(error instanceof ApiError && Object.keys(error.errors).length > 0 ? Object.values(error.errors).flat() : [apiErrorMessage(error)])
      return
    }
    setLogoFile(null)
    notify({ title: 'Company settings updated', tone: 'success' })
    onSaved()
    // The theme and plan widgets read the company from the page props.
    router.reload({ only: ['auth'] })
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <Card className="p-6">
        <Card.Title>Basic Company Information</Card.Title>
        <Card.Description>Your company&apos;s public-facing profile.</Card.Description>
        <div className="mt-5 flex items-center gap-4">
          <Avatar name={company.name} src={logoUrl || undefined} size="lg" className="shrink-0 rounded-xl" />
          {canEdit && (
            <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted">
              <ImagePlus className="size-4" />
              Upload logo
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => handleLogoChange(e.target.files?.[0])}
              />
            </label>
          )}
        </div>
        <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-4 md:grid-cols-3">
          <FormField label="Company Name / Registered Name" required error={errors.name?.message} className="col-span-2 sm:col-span-1">
            <Input disabled={!canEdit} {...register('name', { required: 'Required' })} />
          </FormField>
          <FormField label="Trade Name / Business Name">
            <Input disabled={!canEdit} {...register('tradeName')} />
          </FormField>
          <FormField label="Company Type">
            <Controller
              control={control}
              name="companyType"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange} options={COMPANY_TYPE_OPTIONS} disabled={!canEdit} />
              )}
            />
          </FormField>
          <FormField label="Industry">
            <Input disabled={!canEdit} {...register('industry')} />
          </FormField>
          <FormField label="Company Website">
            <Input disabled={!canEdit} {...register('website')} placeholder="https://" />
          </FormField>
          <FormField label="Company Email">
            <Input type="email" disabled={!canEdit} {...register('email')} />
          </FormField>
          <FormField label="Company Contact Number">
            <Input disabled={!canEdit} {...register('contactNumber')} />
          </FormField>
          <FormField label="Company Description" className="col-span-1 sm:col-span-2 md:col-span-3">
            <Textarea disabled={!canEdit} {...register('description')} />
          </FormField>
        </div>
      </Card>

      <Card className="p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <Card.Title>Color Theme</Card.Title>
            <Card.Description>Re-colors the whole system — buttons, links, charts, highlights and the sidebar — from the logo you upload.</Card.Description>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Use logo colors</span>
            <Switch checked={useLogoTheme && !!brandColor} onCheckedChange={setUseLogoTheme} disabled={!canEdit || !brandColor} aria-label="Use logo colors as the system theme" />
          </div>
        </div>

        {brandColor ? (
          <div className="mt-5 space-y-3">
            <div className="flex flex-wrap items-center gap-3">
              <span className="size-9 rounded-lg border border-border shadow-sm" style={{ backgroundColor: brandColor }} aria-hidden="true" />
              <div>
                <p className="text-sm font-medium">Detected from your logo</p>
                <p className="font-mono text-xs uppercase text-muted-foreground">{brandColor}</p>
              </div>
              {canEdit && (
                <div className="ml-auto flex gap-2">
                  <Button type="button" size="sm" variant="secondary" icon={<Wand2 className="size-3.5" />} isLoading={detecting} disabled={!logoUrl} onClick={() => detectColor(logoUrl, false)}>
                    Re-detect
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    icon={<RotateCcw className="size-3.5" />}
                    onClick={() => {
                      setUseLogoTheme(false)
                      setBrandColor('')
                    }}
                  >
                    Reset to default
                  </Button>
                </div>
              )}
            </div>
            <div className="flex overflow-hidden rounded-lg border border-border" aria-label="Generated color scale">
              {BRAND_SHADES.map((shade) => (
                <span key={shade} title={`brand-${shade}`} className="h-8 flex-1" style={{ backgroundColor: buildBrandScale(brandColor)[shade] }} />
              ))}
            </div>
            {!useLogoTheme && <p className="text-xs text-muted-foreground">Turn on “Use logo colors” to apply this to the whole system.</p>}
          </div>
        ) : (
          <p className="mt-5 flex items-center gap-2 rounded-lg border border-dashed border-border px-4 py-5 text-sm text-muted-foreground">
            <Palette className="size-4" />
            {canEdit ? 'Upload your logo above and the system theme is picked from its colors.' : 'No logo theme has been set.'}
          </p>
        )}
      </Card>

      <Card className="p-6">
        <Card.Title>Business & Registration Information</Card.Title>
        <Card.Description>
          {companyType === 'sole_proprietorship'
            ? 'As a Sole Proprietorship, your DTI registration is the primary business registration on file.'
            : companyType === 'corporation' || companyType === 'partnership'
              ? 'As a Corporation/Partnership, your SEC registration is the primary business registration on file.'
              : 'Government and business registration numbers, used for statutory reporting.'}
        </Card.Description>
        <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-4 md:grid-cols-3">
          <FormField label="SEC Registration No." hint={companyType !== 'corporation' && companyType !== 'partnership' ? 'Not applicable for this company type' : undefined}>
            <Input disabled={!canEdit} {...register('registration.secNo')} />
          </FormField>
          <FormField label="DTI Registration No." hint={companyType !== 'sole_proprietorship' ? 'Not applicable for this company type' : undefined}>
            <Input disabled={!canEdit} {...register('registration.dtiNo')} />
          </FormField>
          <FormField label="BIR TIN">
            <Input disabled={!canEdit} {...register('registration.birTin')} />
          </FormField>
          <FormField label="RDO Code">
            <Input disabled={!canEdit} {...register('registration.rdoCode')} />
          </FormField>
          <FormField label="PhilHealth Employer No. / PEN">
            <Input disabled={!canEdit} {...register('registration.philhealthEmployerNo')} />
          </FormField>
          <FormField label="SSS Employer No.">
            <Input disabled={!canEdit} {...register('registration.sssEmployerNo')} />
          </FormField>
          <FormField label="Pag-IBIG Employer No. / HDMF">
            <Input disabled={!canEdit} {...register('registration.pagibigEmployerNo')} />
          </FormField>
          <FormField label="Business Permit No. / LGU License">
            <Input disabled={!canEdit} {...register('registration.businessPermitNo')} />
          </FormField>
        </div>
      </Card>

      <Card className="p-6">
        <Card.Title>Company Address</Card.Title>
        <Card.Description>Registered Address</Card.Description>
        <div className="mt-4">
          <AddressFields namePrefix="registeredAddress" register={register} disabled={!canEdit} />
        </div>

        <div className="mt-6 flex items-center justify-between border-t border-border pt-5">
          <div>
            <p className="text-sm font-medium">Office / Operating Address</p>
            <p className="text-xs text-muted-foreground">Same as Registered Address</p>
          </div>
          <Controller
            control={control}
            name="sameAsRegisteredAddress"
            render={({ field }) => <Switch checked={field.value} onCheckedChange={field.onChange} disabled={!canEdit} />}
          />
        </div>
        {!sameAsRegistered && (
          <div className="mt-4">
            <AddressFields namePrefix="officeAddress" register={register} disabled={!canEdit} />
          </div>
        )}
      </Card>

      <Card className="p-6">
        <Card.Title>Primary Company Contact</Card.Title>
        <Card.Description>The company&apos;s primary administrative contact for account and compliance matters.</Card.Description>
        <div className="mt-4">
          <ContactFields namePrefix="primaryContact" register={register} disabled={!canEdit} includePosition />
        </div>
      </Card>

      <Card className="p-6">
        <Card.Title>Payroll & HR Contacts</Card.Title>
        <Card.Description>Who to reach for payroll processing questions vs. HR/employee matters.</Card.Description>
        <div className="mt-4 space-y-5">
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Payroll Contact</p>
            <ContactFields namePrefix="payrollContact" register={register} disabled={!canEdit} />
          </div>
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">HR Contact</p>
            <ContactFields namePrefix="hrContact" register={register} disabled={!canEdit} />
          </div>
        </div>
      </Card>

      {serverErrors.length > 0 && (
        <div role="alert" className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          <p className="font-medium">The company information was not saved.</p>
          <ul className="mt-1 list-disc pl-5">
            {serverErrors.map((message) => (
              <li key={message}>{message}</li>
            ))}
          </ul>
        </div>
      )}

      {canEdit && (
        <div className="flex justify-end">
          <Button type="submit" isLoading={isSubmitting} disabled={!isDirty && !logoFile && useLogoTheme === (company.useLogoTheme ?? false) && brandColor === (company.brandColor ?? '')}>
            Save Changes
          </Button>
        </div>
      )}
    </form>
  )
}
