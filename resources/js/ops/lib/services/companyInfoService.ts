import { api } from '@ops/lib/api/http'
import type { Address, Company, CompanyContact, CompanyRegistration } from '@ops/types/domain'

/** Company Info tab, backed by `/api/company-info`. The screen keeps the `Company` shape of `types/domain.ts`; this file converts it. */

interface AddressDto {
  building_unit?: string
  street?: string
  barangay?: string
  city?: string
  province?: string
  region?: string
  zip_code?: string
  country?: string
}

interface ContactDto {
  name?: string
  position?: string
  email?: string
  contact_number?: string
}

interface CompanyInfoDto {
  id: number
  logo_url: string | null
  name: string
  trade_name: string | null
  company_type: NonNullable<Company['companyType']>
  industry: string | null
  website: string | null
  email: string | null
  phone: string | null
  description: string | null
  use_logo_colors: boolean
  brand_color: string | null
  plan_tier: Company['planTier']
  timezone: string
  payroll_frequency: Company['payrollFrequency']
  created_at: string
  registration: {
    sec_number: string
    dti_number: string
    tin: string
    rdo_code: string
    philhealth_pen: string
    sss_number: string
    pagibig_hdmf: string
    business_permit_number: string
  }
  registered_address: AddressDto
  office_address: AddressDto
  same_as_registered: boolean
  primary_contact: ContactDto
  payroll_contact: ContactDto
  hr_contact: ContactDto
}

const toAddress = (a: AddressDto): Address => ({
  buildingUnit: a.building_unit,
  street: a.street,
  barangay: a.barangay,
  city: a.city,
  province: a.province,
  region: a.region,
  zipCode: a.zip_code,
  country: a.country || 'Philippines',
})

const fromAddress = (a: Address | undefined): AddressDto => ({
  building_unit: a?.buildingUnit,
  street: a?.street,
  barangay: a?.barangay,
  city: a?.city,
  province: a?.province,
  region: a?.region,
  zip_code: a?.zipCode,
  country: a?.country,
})

const toContact = (c: ContactDto): CompanyContact => ({ name: c.name ?? '', position: c.position, email: c.email ?? '', contactNumber: c.contact_number ?? '' })

const fromContact = (c: CompanyContact | undefined): ContactDto => ({ name: c?.name, position: c?.position, email: c?.email, contact_number: c?.contactNumber })

const toRegistration = (r: CompanyInfoDto['registration']): CompanyRegistration => ({
  secNo: r.sec_number,
  dtiNo: r.dti_number,
  birTin: r.tin,
  rdoCode: r.rdo_code,
  philhealthEmployerNo: r.philhealth_pen,
  sssEmployerNo: r.sss_number,
  pagibigEmployerNo: r.pagibig_hdmf,
  businessPermitNo: r.business_permit_number,
})

function toCompany(c: CompanyInfoDto): Company {
  return {
    id: String(c.id),
    name: c.name,
    tradeName: c.trade_name ?? undefined,
    logoUrl: c.logo_url ?? undefined,
    useLogoTheme: c.use_logo_colors,
    brandColor: c.brand_color ?? undefined,
    companyType: c.company_type,
    industry: c.industry ?? undefined,
    description: c.description ?? undefined,
    website: c.website ?? undefined,
    email: c.email ?? undefined,
    contactNumber: c.phone ?? undefined,
    planTier: c.plan_tier,
    timezone: c.timezone,
    payrollFrequency: c.payroll_frequency,
    createdAt: c.created_at,
    registration: toRegistration(c.registration),
    registeredAddress: toAddress(c.registered_address),
    officeAddress: toAddress(c.office_address),
    sameAsRegisteredAddress: c.same_as_registered,
    primaryContact: toContact(c.primary_contact),
    payrollContact: toContact(c.payroll_contact),
    hrContact: toContact(c.hr_contact),
  }
}

export async function getCompanyInfo(): Promise<Company> {
  const res = await api.get<{ data: CompanyInfoDto }>('/api/company-info')
  return toCompany(res.data)
}

/** What the form edits. The plan, timezone and billing fields of `Company` are never sent. */
export type CompanyInfoInput = Pick<
  Company,
  'name' | 'tradeName' | 'companyType' | 'industry' | 'description' | 'website' | 'email' | 'contactNumber' | 'registration' | 'registeredAddress' | 'officeAddress' | 'sameAsRegisteredAddress' | 'primaryContact' | 'payrollContact' | 'hrContact' | 'useLogoTheme' | 'brandColor'
>

export async function updateCompanyInfo(input: CompanyInfoInput): Promise<Company> {
  const r = input.registration
  const res = await api.put<{ data: CompanyInfoDto }>('/api/company-info', {
    name: input.name,
    trade_name: input.tradeName,
    company_type: input.companyType,
    industry: input.industry,
    description: input.description,
    website: input.website,
    email: input.email,
    phone: input.contactNumber,
    use_logo_colors: input.useLogoTheme ?? false,
    brand_color: input.brandColor,
    sec_number: r?.secNo,
    dti_number: r?.dtiNo,
    tin: r?.birTin,
    rdo_code: r?.rdoCode,
    philhealth_pen: r?.philhealthEmployerNo,
    sss_number: r?.sssEmployerNo,
    pagibig_hdmf: r?.pagibigEmployerNo,
    business_permit_number: r?.businessPermitNo,
    same_as_registered: input.sameAsRegisteredAddress ?? false,
    registered_address: fromAddress(input.registeredAddress),
    office_address: fromAddress(input.officeAddress),
    primary_contact: fromContact(input.primaryContact),
    payroll_contact: fromContact(input.payrollContact),
    hr_contact: fromContact(input.hrContact),
  })
  return toCompany(res.data)
}

/** Uploads a new logo and returns the company with its new `logoUrl`. */
export async function uploadCompanyLogo(file: File): Promise<Company> {
  const form = new FormData()
  form.append('logo', file)
  const res = await api.upload<{ data: CompanyInfoDto }>('/api/company-info/logo', form)
  return toCompany(res.data)
}
