/*
 * Minimal .xlsx reader — turns the first worksheet into CSV text so it can go through the same parser as
 * the device .csv exports. Reads shared strings, inline strings, booleans and numbers, and converts
 * date-formatted numeric cells (Excel serials) to "YYYY-MM-DD HH:MM:SS" / "HH:MM:SS" text.
 * Uses the browser's DecompressionStream, so no extra dependency is needed.
 */

interface ZipEntry {
  method: number
  compressedSize: number
  offset: number
}

const decoder = new TextDecoder('utf-8')

function readZipDirectory(bytes: Uint8Array): Map<string, ZipEntry> {
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength)
  let eocd = -1
  for (let i = bytes.length - 22; i >= Math.max(0, bytes.length - 65557); i--) {
    if (view.getUint32(i, true) === 0x06054b50) {
      eocd = i
      break
    }
  }
  if (eocd === -1) throw new Error('Not a valid .xlsx file')
  const count = view.getUint16(eocd + 10, true)
  let pos = view.getUint32(eocd + 16, true)
  const entries = new Map<string, ZipEntry>()
  for (let n = 0; n < count; n++) {
    if (view.getUint32(pos, true) !== 0x02014b50) break
    const method = view.getUint16(pos + 10, true)
    const compressedSize = view.getUint32(pos + 20, true)
    const nameLength = view.getUint16(pos + 28, true)
    const extraLength = view.getUint16(pos + 30, true)
    const commentLength = view.getUint16(pos + 32, true)
    const offset = view.getUint32(pos + 42, true)
    entries.set(decoder.decode(bytes.subarray(pos + 46, pos + 46 + nameLength)), { method, compressedSize, offset })
    pos += 46 + nameLength + extraLength + commentLength
  }
  return entries
}

async function readEntry(bytes: Uint8Array, entry: ZipEntry): Promise<string> {
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength)
  const nameLength = view.getUint16(entry.offset + 26, true)
  const extraLength = view.getUint16(entry.offset + 28, true)
  const start = entry.offset + 30 + nameLength + extraLength
  const data = bytes.subarray(start, start + entry.compressedSize)
  if (entry.method === 0) return decoder.decode(data)
  if (entry.method !== 8) throw new Error('Unsupported compression in .xlsx file')
  const stream = new Blob([data as BlobPart]).stream().pipeThrough(new DecompressionStream('deflate-raw'))
  return decoder.decode(await new Response(stream).arrayBuffer())
}

const parseXml = (xml: string) => new DOMParser().parseFromString(xml, 'application/xml')

/** Local-name lookup so the namespace prefix doesn't matter. */
const elements = (root: Document | Element, name: string) => Array.from(root.getElementsByTagNameNS('*', name))

function columnIndex(ref: string): number {
  const letters = ref.replace(/[^A-Za-z]/g, '').toUpperCase()
  let index = 0
  for (const ch of letters) index = index * 26 + (ch.charCodeAt(0) - 64)
  return index - 1
}

const BUILTIN_DATE_FORMATS = new Set([14, 15, 16, 17, 18, 19, 20, 21, 22, 45, 46, 47])

function dateFormatFlags(stylesXml: string | undefined): boolean[] {
  if (!stylesXml) return []
  const doc = parseXml(stylesXml)
  const custom = new Map<number, string>()
  for (const fmt of elements(doc, 'numFmt')) custom.set(Number(fmt.getAttribute('numFmtId')), fmt.getAttribute('formatCode') ?? '')
  const cellXfs = elements(doc, 'cellXfs')[0]
  if (!cellXfs) return []
  return Array.from(cellXfs.children).map((xf) => {
    const id = Number(xf.getAttribute('numFmtId') ?? 0)
    if (BUILTIN_DATE_FORMATS.has(id)) return true
    const code = custom.get(id)
    if (!code) return false
    // Ignore quoted text and [bracketed] sections, then look for date/time tokens.
    return /[dmyhs]/i.test(code.replace(/"[^"]*"/g, '').replace(/\[[^\]]*\]/g, ''))
  })
}

const pad2 = (n: number) => String(n).padStart(2, '0')

function serialToText(serial: number): string {
  const days = Math.floor(serial)
  let seconds = Math.round((serial - days) * 86400)
  let dayCount = days
  if (seconds >= 86400) {
    seconds -= 86400
    dayCount += 1
  }
  const time = `${pad2(Math.floor(seconds / 3600))}:${pad2(Math.floor((seconds % 3600) / 60))}:${pad2(seconds % 60)}`
  if (dayCount === 0) return time
  const d = new Date(Date.UTC(1899, 11, 30 + dayCount))
  const date = `${d.getUTCFullYear()}-${pad2(d.getUTCMonth() + 1)}-${pad2(d.getUTCDate())}`
  return seconds === 0 && Number.isInteger(serial) ? date : `${date} ${time}`
}

function csvCell(value: string): string {
  return /[",\r\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value
}

/** Reads the first worksheet of an .xlsx workbook and returns it as CSV text. */
export async function xlsxToCsv(buffer: ArrayBuffer): Promise<string> {
  const bytes = new Uint8Array(buffer)
  const entries = readZipDirectory(bytes)
  const read = async (name: string) => {
    const entry = entries.get(name)
    return entry ? readEntry(bytes, entry) : undefined
  }

  // First worksheet: workbook.xml names its relationship id, workbook.xml.rels maps it to a file.
  let sheetPath = 'xl/worksheets/sheet1.xml'
  const workbook = await read('xl/workbook.xml')
  const rels = await read('xl/_rels/workbook.xml.rels')
  if (workbook && rels) {
    const firstSheet = elements(parseXml(workbook), 'sheet')[0]
    const rid = firstSheet?.getAttributeNS('http://schemas.openxmlformats.org/officeDocument/2006/relationships', 'id') ?? firstSheet?.getAttribute('r:id')
    const target = elements(parseXml(rels), 'Relationship').find((r) => r.getAttribute('Id') === rid)?.getAttribute('Target')
    if (target) sheetPath = target.startsWith('/') ? target.slice(1) : `xl/${target.replace(/^\.\//, '')}`
  }
  const sheetXml = await read(sheetPath)
  if (!sheetXml) throw new Error('The workbook has no readable worksheet')

  const sharedXml = await read('xl/sharedStrings.xml')
  const shared = sharedXml ? elements(parseXml(sharedXml), 'si').map((si) => elements(si, 't').map((t) => t.textContent ?? '').join('')) : []
  const isDateStyle = dateFormatFlags(await read('xl/styles.xml'))

  const rows: string[][] = []
  for (const row of elements(parseXml(sheetXml), 'row')) {
    const cells: string[] = []
    for (const c of Array.from(row.children).filter((el) => el.localName === 'c')) {
      const col = columnIndex(c.getAttribute('r') ?? '')
      const type = c.getAttribute('t')
      const raw = elements(c, 'v')[0]?.textContent ?? ''
      let text = raw
      if (type === 's') text = shared[Number(raw)] ?? ''
      else if (type === 'inlineStr') text = elements(c, 't').map((t) => t.textContent ?? '').join('')
      else if (type === 'b') text = raw === '1' ? 'TRUE' : 'FALSE'
      else if (type !== 'str' && type !== 'e' && raw !== '' && !Number.isNaN(Number(raw))) {
        text = isDateStyle[Number(c.getAttribute('s') ?? 0)] ? serialToText(Number(raw)) : String(Number(raw))
      }
      cells[col >= 0 ? col : cells.length] = text.trim()
    }
    rows.push(Array.from(cells, (v) => v ?? ''))
  }

  // Drop blank rows and any title rows above the header (a header row has several filled cells).
  const filled = rows.filter((r) => r.some((v) => v !== ''))
  const headerAt = filled.findIndex((r) => r.filter((v) => v !== '').length >= 3)
  const body = headerAt === -1 ? filled : filled.slice(headerAt)
  if (body.length === 0) throw new Error('The first worksheet is empty')
  return body.map((r) => r.map(csvCell).join(',')).join('\n')
}
