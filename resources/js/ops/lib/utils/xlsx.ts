/**
 * Minimal, dependency-free .xlsx writer for report exports — a single styled worksheet packaged
 * as an uncompressed (STORE) zip. Layout (shared by every report, matching the PDF export): logo + brand
 * on the left and company details on the right, a divider, the report title and filter lines, optional
 * summary cards, the table (colored header row, typed number/currency/percent cells, highlighted totals
 * row), then notes and the closing tagline. Print setup: margins, orientation, repeating header row, page numbers.
 */

export type XlsxColumnType = 'text' | 'currency' | 'number' | 'integer' | 'percent'

export type XlsxCell = string | number | null | undefined

export interface XlsxPalette {
  /** Header fill, brand name and divider accent — `rrggbb`, no `#`. */
  primary: string
  /** Report title color. */
  dark: string
  /** Light tint for summary cards and the totals row. */
  light: string
}

export const DEFAULT_XLSX_PALETTE: XlsxPalette = { primary: '247A41', dark: '184828', light: 'E7FBEF' }

export interface XlsxSheetSpec {
  sheetName: string
  /** Left of the header: the brand name and its tagline, next to the logo. */
  brandName: string
  brandTagline: string
  /** Slogan under the tagline, shown in the brand color. */
  brandSlogan?: string
  /** Right of the header. */
  companyName: string
  companyAddress?: string
  companyContact?: string
  /** PNG bytes of the logo to place at the top-left; omitted → no picture. */
  logoPng?: Uint8Array
  title: string
  /** One line per filter / period, under the title. */
  metaLines: string[]
  /** Summary cards (label over value), laid out across the table's columns. */
  summary?: { label: string; value: string }[]
  header: string[]
  columnTypes: XlsxColumnType[]
  body: XlsxCell[][]
  footer?: XlsxCell[]
  notes: string[]
  closingTagline?: string
  palette?: XlsxPalette
  orientation?: 'portrait' | 'landscape'
}

// ---------- Styles (cellXfs indexes) ----------

const NUMFMT_CURRENCY = 164
const NUMFMT_NUMBER = 165
const NUMFMT_INTEGER = 166
const NUMFMT_PERCENT = 167

const TYPE_ORDER: XlsxColumnType[] = ['text', 'currency', 'number', 'integer', 'percent']
const XF_BRAND = 1
const XF_TAGLINE = 2
const XF_COMPANY = 3
const XF_COMPANY_SMALL = 4
const XF_DIVIDER = 5
const XF_TITLE = 6
const XF_META = 7
const XF_CARD_LABEL = 8
const XF_CARD_VALUE = 9
const XF_HEADER_LEFT = 10
const XF_HEADER_RIGHT = 11
const XF_BODY_BASE = 12 // + type index (5 types)
const XF_TOTAL_BASE = 17
const XF_NOTES_TITLE = 22
const XF_NOTES = 23
const XF_CLOSING = 24
const XF_SLOGAN = 25

const NUMFMT_FOR_TYPE: Record<XlsxColumnType, number> = {
  text: 0,
  currency: NUMFMT_CURRENCY,
  number: NUMFMT_NUMBER,
  integer: NUMFMT_INTEGER,
  percent: NUMFMT_PERCENT,
}

function bodyXfs(fillId: number, borderId: number, fontId: number): string {
  return TYPE_ORDER.map((type) => {
    const numFmtId = NUMFMT_FOR_TYPE[type]
    const horizontal = type === 'text' ? 'left' : 'right'
    return `<xf numFmtId="${numFmtId}" fontId="${fontId}" fillId="${fillId}" borderId="${borderId}" xfId="0" applyNumberFormat="1" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1"><alignment horizontal="${horizontal}" vertical="center"${type === 'text' ? ' wrapText="1"' : ''}/></xf>`
  }).join('')
}

const GRAY_LINE = 'FFD1D5DB'
const GRAY_CELL = 'FFE5E7EB'

function stylesXml(p: XlsxPalette): string {
  const primary = `FF${p.primary}`
  const dark = `FF${p.dark}`
  const light = `FF${p.light}`
  const font = (extra: string, sz: number, color: string) => `<font>${extra}<sz val="${sz}"/><color rgb="${color}"/><name val="Calibri"/><family val="2"/></font>`
  const side = (name: string, style: string, color: string) => `<${name} style="${style}"><color rgb="${color}"/></${name}>`
  const box = (l: string, r: string, t: string, b: string) => `<border>${l}${r}${t}${b}<diagonal/></border>`
  const thin = (color: string) => (n: string) => side(n, 'thin', color)
  const cell = thin(GRAY_CELL)
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
<numFmts count="4">
<numFmt numFmtId="${NUMFMT_CURRENCY}" formatCode="&quot;₱&quot;#,##0.00;\\-&quot;₱&quot;#,##0.00"/>
<numFmt numFmtId="${NUMFMT_NUMBER}" formatCode="#,##0.00"/>
<numFmt numFmtId="${NUMFMT_INTEGER}" formatCode="#,##0"/>
<numFmt numFmtId="${NUMFMT_PERCENT}" formatCode="0.0%"/>
</numFmts>
<fonts count="11">
${font('', 10, 'FF1F2937')}
${font('<b/>', 16, primary)}
${font('', 9, 'FF6B7280')}
${font('<b/>', 12, 'FF111827')}
${font('<b/>', 18, dark)}
${font('', 10, 'FF374151')}
${font('<b/>', 10, 'FFFFFFFF')}
${font('<b/>', 10, 'FF111827')}
${font('<b/>', 9, 'FF111827')}
${font('<i/>', 12, primary)}
${font('<b/><i/>', 9, primary)}
</fonts>
<fills count="4">
<fill><patternFill patternType="none"/></fill>
<fill><patternFill patternType="gray125"/></fill>
<fill><patternFill patternType="solid"><fgColor rgb="${primary}"/><bgColor indexed="64"/></patternFill></fill>
<fill><patternFill patternType="solid"><fgColor rgb="${light}"/><bgColor indexed="64"/></patternFill></fill>
</fills>
<borders count="5">
<border><left/><right/><top/><bottom/><diagonal/></border>
${box(thin(primary)('left'), thin(primary)('right'), thin(primary)('top'), thin(primary)('bottom'))}
${box(cell('left'), cell('right'), cell('top'), cell('bottom'))}
${box(cell('left'), cell('right'), side('top', 'thin', primary), side('bottom', 'thin', primary))}
${box('<left/>', '<right/>', '<top/>', side('bottom', 'thin', GRAY_LINE))}
</borders>
<cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs>
<cellXfs count="26">
<xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/>
<xf numFmtId="0" fontId="1" fillId="0" borderId="0" xfId="0" applyFont="1" applyAlignment="1"><alignment horizontal="left" vertical="center"/></xf>
<xf numFmtId="0" fontId="2" fillId="0" borderId="0" xfId="0" applyFont="1" applyAlignment="1"><alignment horizontal="left" vertical="center"/></xf>
<xf numFmtId="0" fontId="3" fillId="0" borderId="0" xfId="0" applyFont="1" applyAlignment="1"><alignment horizontal="right" vertical="center"/></xf>
<xf numFmtId="0" fontId="2" fillId="0" borderId="0" xfId="0" applyFont="1" applyAlignment="1"><alignment horizontal="right" vertical="center"/></xf>
<xf numFmtId="0" fontId="0" fillId="0" borderId="4" xfId="0" applyBorder="1"/>
<xf numFmtId="0" fontId="4" fillId="0" borderId="0" xfId="0" applyFont="1" applyAlignment="1"><alignment horizontal="left" vertical="center"/></xf>
<xf numFmtId="0" fontId="5" fillId="0" borderId="0" xfId="0" applyFont="1"/>
<xf numFmtId="0" fontId="2" fillId="3" borderId="2" xfId="0" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1"><alignment horizontal="left" vertical="center" wrapText="1"/></xf>
<xf numFmtId="0" fontId="3" fillId="3" borderId="2" xfId="0" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1"><alignment horizontal="left" vertical="center"/></xf>
<xf numFmtId="0" fontId="6" fillId="2" borderId="1" xfId="0" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1"><alignment horizontal="left" vertical="center" wrapText="1"/></xf>
<xf numFmtId="0" fontId="6" fillId="2" borderId="1" xfId="0" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1"><alignment horizontal="right" vertical="center" wrapText="1"/></xf>
${bodyXfs(0, 2, 0)}
${bodyXfs(3, 3, 7)}
<xf numFmtId="0" fontId="8" fillId="0" borderId="0" xfId="0" applyFont="1"/>
<xf numFmtId="0" fontId="2" fillId="0" borderId="0" xfId="0" applyFont="1"/>
<xf numFmtId="0" fontId="9" fillId="0" borderId="0" xfId="0" applyFont="1" applyAlignment="1"><alignment horizontal="right" vertical="center"/></xf>
<xf numFmtId="0" fontId="10" fillId="0" borderId="0" xfId="0" applyFont="1" applyAlignment="1"><alignment horizontal="left" vertical="center"/></xf>
</cellXfs>
<cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles>
</styleSheet>`
}

// ---------- Worksheet ----------

function escapeXml(value: string): string {
  return value
    // eslint-disable-next-line no-control-regex
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function columnLetter(index: number): string {
  let n = index + 1
  let letters = ''
  while (n > 0) {
    const rem = (n - 1) % 26
    letters = String.fromCharCode(65 + rem) + letters
    n = Math.floor((n - 1) / 26)
  }
  return letters
}

function cellXml(ref: string, value: XlsxCell, styleId: number): string {
  if (value === null || value === undefined || value === '') return `<c r="${ref}" s="${styleId}"/>`
  if (typeof value === 'number' && Number.isFinite(value)) return `<c r="${ref}" s="${styleId}"><v>${value}</v></c>`
  return `<c r="${ref}" s="${styleId}" t="inlineStr"><is><t xml:space="preserve">${escapeXml(String(value))}</t></is></c>`
}

/** Display width (in characters) of a value once Excel applies the column's number format. */
function displayLength(value: XlsxCell, type: XlsxColumnType): number {
  if (value === null || value === undefined || value === '') return 0
  if (typeof value !== 'number') return Math.max(...String(value).split('\n').map((l) => l.length))
  const abs = Math.abs(value)
  const sign = value < 0 ? 1 : 0
  if (type === 'percent') return (abs * 100).toFixed(1).length + 1 + sign
  const decimals = type === 'integer' ? 0 : 2
  const grouped = abs.toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })
  return grouped.length + sign + (type === 'currency' ? 1 : 0)
}

/** Width of the empty first column that holds the logo (about 68px — the logo is 56px). */
const GUTTER_WIDTH = 9

interface SheetLayout {
  xml: string
  headerRow: number
}

function worksheetXml(spec: XlsxSheetSpec): SheetLayout {
  const { header, columnTypes, body, footer } = spec
  const colCount = header.length
  const lastColIndex = Math.max(colCount - 1, 1)
  const lastLetter = columnLetter(lastColIndex + 1)

  // Padded widths from header + every data cell (title rows are excluded so they don't bloat column A).
  const widths = header.map((h, i) => {
    const type = columnTypes[i] ?? 'text'
    let max = h.length + 2
    for (const row of footer ? [...body, footer] : body) max = Math.max(max, displayLength(row[i], type))
    return Math.min(Math.max(max + 3, 12), 60)
  })

  const rows: string[] = []
  let r = 0
  const push = (xml: string) => rows.push(xml)
  const next = () => ++r

  // Rows 1–3: logo + brand (left), company details (right).
  const topRows: [number, string, number, string | undefined, number][] = [
    [26, spec.brandName, XF_BRAND, spec.companyName, XF_COMPANY],
    [16, spec.brandTagline, XF_TAGLINE, spec.companyAddress, XF_COMPANY_SMALL],
    [16, spec.brandSlogan ?? '', XF_SLOGAN, spec.companyContact, XF_COMPANY_SMALL],
  ]
  for (const [ht, left, leftXf, right, rightXf] of topRows) {
    const n = next()
    const cells = [cellXml(`B${n}`, left, leftXf), right ? cellXml(`${lastLetter}${n}`, right, rightXf) : '']
    push(`<row r="${n}" ht="${ht}" customHeight="1">${cells.join('')}</row>`)
  }
  // Divider
  {
    const n = next()
    push(`<row r="${n}" ht="5" customHeight="1">${Array.from({ length: lastColIndex + 2 }, (_, i) => cellXml(`${columnLetter(i)}${n}`, '', XF_DIVIDER)).join('')}</row>`)
  }
  push(`<row r="${next()}" ht="8" customHeight="1"/>`)
  // Title + filter lines
  {
    const n = next()
    push(`<row r="${n}" ht="28" customHeight="1">${cellXml(`B${n}`, spec.title, XF_TITLE)}</row>`)
  }
  for (const line of spec.metaLines) {
    const n = next()
    push(`<row r="${n}">${cellXml(`B${n}`, line, XF_META)}</row>`)
  }
  push(`<row r="${next()}" ht="8" customHeight="1"/>`)
  // Summary cards: label over value, spread across the table's columns.
  const cards = spec.summary ?? []
  for (let i = 0; i < cards.length; i += colCount) {
    const chunk = cards.slice(i, i + colCount)
    const labelRow = next()
    const valueRow = next()
    push(`<row r="${labelRow}" ht="16" customHeight="1">${chunk.map((c, k) => cellXml(`${columnLetter(k + 1)}${labelRow}`, c.label, XF_CARD_LABEL)).join('')}</row>`)
    push(`<row r="${valueRow}" ht="22" customHeight="1">${chunk.map((c, k) => cellXml(`${columnLetter(k + 1)}${valueRow}`, c.value, XF_CARD_VALUE)).join('')}</row>`)
  }
  if (cards.length > 0) push(`<row r="${next()}" ht="8" customHeight="1"/>`)

  // Table
  const headerRow = next()
  push(
    `<row r="${headerRow}" ht="20" customHeight="1">${header
      .map((h, i) => cellXml(`${columnLetter(i + 1)}${headerRow}`, h, (columnTypes[i] ?? 'text') === 'text' ? XF_HEADER_LEFT : XF_HEADER_RIGHT))
      .join('')}</row>`,
  )
  for (const row of body) {
    const n = next()
    const cells = Array.from({ length: colCount }, (_, i) => cellXml(`${columnLetter(i + 1)}${n}`, row[i], XF_BODY_BASE + TYPE_ORDER.indexOf(columnTypes[i] ?? 'text')))
    push(`<row r="${n}">${cells.join('')}</row>`)
  }
  if (footer) {
    const n = next()
    const cells = Array.from({ length: colCount }, (_, i) => cellXml(`${columnLetter(i + 1)}${n}`, footer[i], XF_TOTAL_BASE + TYPE_ORDER.indexOf(columnTypes[i] ?? 'text')))
    push(`<row r="${n}" ht="18" customHeight="1">${cells.join('')}</row>`)
  }

  // Notes + closing tagline
  push(`<row r="${next()}" ht="10" customHeight="1"/>`)
  if (spec.notes.length > 0) {
    const n = next()
    push(`<row r="${n}">${cellXml(`B${n}`, 'Notes:', XF_NOTES_TITLE)}</row>`)
    for (const note of spec.notes) {
      const m = next()
      push(`<row r="${m}">${cellXml(`B${m}`, `•  ${note}`, XF_NOTES)}</row>`)
    }
  }
  if (spec.closingTagline) {
    const n = next()
    push(`<row r="${n}" ht="24" customHeight="1">${cellXml(`${lastLetter}${n}`, spec.closingTagline, XF_CLOSING)}</row>`)
  }

  const cols = [`<col min="1" max="1" width="${GUTTER_WIDTH}" customWidth="1"/>`, ...widths.map((w, i) => `<col min="${i + 2}" max="${i + 2}" width="${w}" customWidth="1"/>`)].join('')
  const orientation = spec.orientation ?? (colCount > 7 ? 'landscape' : 'portrait')

  const xml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
<sheetPr><pageSetUpPr fitToPage="1"/></sheetPr>
<dimension ref="A1:${lastLetter}${r}"/>
<sheetViews><sheetView workbookViewId="0" showGridLines="0"/></sheetViews>
<sheetFormatPr defaultRowHeight="15"/>
<cols>${cols}</cols>
<sheetData>${rows.join('')}</sheetData>
<printOptions horizontalCentered="1"/>
<pageMargins left="0.5" right="0.5" top="0.5" bottom="0.6" header="0.3" footer="0.3"/>
<pageSetup paperSize="1" orientation="${orientation}" fitToWidth="1" fitToHeight="0"/>
<headerFooter><oddFooter>&amp;L&amp;8Confidential — for internal use only&amp;R&amp;8Page &amp;P of &amp;N</oddFooter></headerFooter>
${spec.logoPng ? '<drawing r:id="rId1"/>' : ''}
</worksheet>`
  return { xml, headerRow }
}

function sanitizeSheetName(name: string): string {
  return name.replace(/[[\]:*?/\\]/g, ' ').trim().slice(0, 31) || 'Report'
}

const LOGO_EMU = 533400 // 56px square

const DRAWING_XML = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<xdr:wsDr xmlns:xdr="http://schemas.openxmlformats.org/drawingml/2006/spreadsheetDrawing" xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
<xdr:oneCellAnchor>
<xdr:from><xdr:col>0</xdr:col><xdr:colOff>57150</xdr:colOff><xdr:row>0</xdr:row><xdr:rowOff>38100</xdr:rowOff></xdr:from>
<xdr:ext cx="${LOGO_EMU}" cy="${LOGO_EMU}"/>
<xdr:pic>
<xdr:nvPicPr><xdr:cNvPr id="2" name="Logo"/><xdr:cNvPicPr><a:picLocks noChangeAspect="1"/></xdr:cNvPicPr></xdr:nvPicPr>
<xdr:blipFill><a:blip r:embed="rId1"/><a:stretch><a:fillRect/></a:stretch></xdr:blipFill>
<xdr:spPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="${LOGO_EMU}" cy="${LOGO_EMU}"/></a:xfrm><a:prstGeom prst="rect"><a:avLst/></a:prstGeom></xdr:spPr>
</xdr:pic>
<xdr:clientData/>
</xdr:oneCellAnchor>
</xdr:wsDr>`

type ZipFile = { name: string; content: string | Uint8Array }

function workbookFiles(spec: XlsxSheetSpec): ZipFile[] {
  const sheetName = escapeXml(sanitizeSheetName(spec.sheetName))
  const sheet = worksheetXml(spec)
  const hasLogo = !!spec.logoPng
  const files: ZipFile[] = [
    {
      name: '[Content_Types].xml',
      content: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
<Default Extension="xml" ContentType="application/xml"/>
${hasLogo ? '<Default Extension="png" ContentType="image/png"/>' : ''}
<Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>
<Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>
<Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>
${hasLogo ? '<Override PartName="/xl/drawings/drawing1.xml" ContentType="application/vnd.openxmlformats-officedocument.drawing+xml"/>' : ''}
</Types>`,
    },
    {
      name: '_rels/.rels',
      content: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>
</Relationships>`,
    },
    {
      name: 'xl/workbook.xml',
      content: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
<sheets><sheet name="${sheetName}" sheetId="1" r:id="rId1"/></sheets>
<definedNames><definedName name="_xlnm.Print_Titles" localSheetId="0">'${sheetName.replace(/'/g, "''")}'!$${sheet.headerRow}:$${sheet.headerRow}</definedName></definedNames>
</workbook>`,
    },
    {
      name: 'xl/_rels/workbook.xml.rels',
      content: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/>
<Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>
</Relationships>`,
    },
    { name: 'xl/styles.xml', content: stylesXml(spec.palette ?? DEFAULT_XLSX_PALETTE) },
    { name: 'xl/worksheets/sheet1.xml', content: sheet.xml },
  ]
  if (spec.logoPng) {
    files.push(
      {
        name: 'xl/worksheets/_rels/sheet1.xml.rels',
        content: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/drawing" Target="../drawings/drawing1.xml"/>
</Relationships>`,
      },
      { name: 'xl/drawings/drawing1.xml', content: DRAWING_XML },
      {
        name: 'xl/drawings/_rels/drawing1.xml.rels',
        content: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="../media/image1.png"/>
</Relationships>`,
      },
      { name: 'xl/media/image1.png', content: spec.logoPng },
    )
  }
  return files
}

// ---------- Zip (STORE) ----------

const CRC_TABLE = (() => {
  const table = new Uint32Array(256)
  for (let n = 0; n < 256; n++) {
    let c = n
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
    table[n] = c >>> 0
  }
  return table
})()

function crc32(bytes: Uint8Array): number {
  let crc = 0xffffffff
  for (let i = 0; i < bytes.length; i++) crc = CRC_TABLE[(crc ^ bytes[i]) & 0xff] ^ (crc >>> 8)
  return (crc ^ 0xffffffff) >>> 0
}

function zipStore(files: ZipFile[]): Uint8Array {
  const encoder = new TextEncoder()
  const now = new Date()
  const dosTime = (now.getHours() << 11) | (now.getMinutes() << 5) | Math.floor(now.getSeconds() / 2)
  const dosDate = ((now.getFullYear() - 1980) << 9) | ((now.getMonth() + 1) << 5) | now.getDate()

  const locals: Uint8Array[] = []
  const centrals: Uint8Array[] = []
  let offset = 0

  for (const file of files) {
    const nameBytes = encoder.encode(file.name)
    const data = typeof file.content === 'string' ? encoder.encode(file.content) : file.content
    const crc = crc32(data)

    const local = new Uint8Array(30 + nameBytes.length + data.length)
    const lv = new DataView(local.buffer)
    lv.setUint32(0, 0x04034b50, true)
    lv.setUint16(4, 20, true)
    lv.setUint16(6, 0x0800, true) // UTF-8 names
    lv.setUint16(8, 0, true) // STORE
    lv.setUint16(10, dosTime, true)
    lv.setUint16(12, dosDate, true)
    lv.setUint32(14, crc, true)
    lv.setUint32(18, data.length, true)
    lv.setUint32(22, data.length, true)
    lv.setUint16(26, nameBytes.length, true)
    lv.setUint16(28, 0, true)
    local.set(nameBytes, 30)
    local.set(data, 30 + nameBytes.length)
    locals.push(local)

    const central = new Uint8Array(46 + nameBytes.length)
    const cv = new DataView(central.buffer)
    cv.setUint32(0, 0x02014b50, true)
    cv.setUint16(4, 20, true)
    cv.setUint16(6, 20, true)
    cv.setUint16(8, 0x0800, true)
    cv.setUint16(10, 0, true)
    cv.setUint16(12, dosTime, true)
    cv.setUint16(14, dosDate, true)
    cv.setUint32(16, crc, true)
    cv.setUint32(20, data.length, true)
    cv.setUint32(24, data.length, true)
    cv.setUint16(28, nameBytes.length, true)
    cv.setUint32(42, offset, true)
    central.set(nameBytes, 46)
    centrals.push(central)

    offset += local.length
  }

  const centralSize = centrals.reduce((s, c) => s + c.length, 0)
  const end = new Uint8Array(22)
  const ev = new DataView(end.buffer)
  ev.setUint32(0, 0x06054b50, true)
  ev.setUint16(8, files.length, true)
  ev.setUint16(10, files.length, true)
  ev.setUint32(12, centralSize, true)
  ev.setUint32(16, offset, true)

  const out = new Uint8Array(offset + centralSize + end.length)
  let pos = 0
  for (const part of [...locals, ...centrals, end]) {
    out.set(part, pos)
    pos += part.length
  }
  return out
}

export function buildXlsx(spec: XlsxSheetSpec): Blob {
  const bytes = zipStore(workbookFiles(spec))
  return new Blob([bytes.buffer as ArrayBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
}

export function downloadBlob(filename: string, blob: Blob) {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  link.remove()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}
