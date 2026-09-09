import JSZip from 'jszip'
import * as XLSX from 'xlsx'
import { promises as fs } from 'fs'
import path from 'path'
import { randomUUID } from 'crypto'

export interface ParsedQuestionRow {
  course?: string
  subject?: string
  chapter?: string
  question: string
  option_a: string
  option_b: string
  option_c?: string
  option_d?: string
  correct_option: string
  explanation?: string
  difficulty?: string
  marks?: number
}

/**
 * Parses XLSX / XLS / CSV buffer and extracts any embedded images automatically.
 */
export async function parseQuestionsFile(
  fileBuffer: Buffer,
  fileName: string,
  defaults?: { course?: string; subject?: string; chapter?: string }
): Promise<ParsedQuestionRow[]> {
  const isXlsx = fileName.toLowerCase().endsWith('.xlsx')
  const isXls = fileName.toLowerCase().endsWith('.xls')
  const isCsv = fileName.toLowerCase().endsWith('.csv')

  if (isXlsx) {
    return await parseXlsxWithImages(fileBuffer, defaults)
  } else if (isXls || isCsv) {
    return parseSheetWithoutImages(fileBuffer, defaults)
  }

  // Fallback try as xlsx first, then standard sheet
  try {
    return await parseXlsxWithImages(fileBuffer, defaults)
  } catch {
    return parseSheetWithoutImages(fileBuffer, defaults)
  }
}

/**
 * Handles .xlsx files, parsing XML structures to extract images anchored in rows.
 */
async function parseXlsxWithImages(
  buffer: Buffer,
  defaults?: { course?: string; subject?: string; chapter?: string }
): Promise<ParsedQuestionRow[]> {
  const zip = await JSZip.loadAsync(buffer)

  // 1. Parse Shared Strings
  const strings: string[] = []
  const sharedStringsFile = zip.file('xl/sharedStrings.xml')
  if (sharedStringsFile) {
    const ssXml = await sharedStringsFile.async('text')
    // Extract all <t> or <si> text
    const siMatches = ssXml.match(/<si\b[^>]*>[\s\S]*?<\/si>/gi) || []
    for (const si of siMatches) {
      const textOnly = si.replace(/<[^>]+>/g, '')
      strings.push(decodeXmlEntities(textOnly))
    }
  }

  // 2. Parse Drawing relationships if they exist
  const relMap = new Map<string, string>() // rId -> target media path
  const drawingRelsFile = zip.file('xl/drawings/_rels/drawing1.xml.rels')
  if (drawingRelsFile) {
    const dRelsXml = await drawingRelsFile.async('text')
    const relMatches = dRelsXml.match(/<Relationship\b[^>]+>/gi) || []
    for (const rel of relMatches) {
      const idMatch = rel.match(/Id=["']([^"']+)["']/)
      const targetMatch = rel.match(/Target=["']([^"']+)["']/)
      if (idMatch && targetMatch) {
        const targetClean = targetMatch[1].replace(/^\.\.\//, 'xl/')
        relMap.set(idMatch[1], targetClean)
      }
    }
  }

  // 3. Parse Drawings to map Row Numbers -> Image Media Paths
  const rowImageMap = new Map<number, string>() // 1-based row -> media path
  const drawingFile = zip.file('xl/drawings/drawing1.xml')
  if (drawingFile) {
    const dXml = await drawingFile.async('text')
    const anchorMatches = dXml.match(/<xdr:(?:twoCellAnchor|oneCellAnchor)\b[\s\S]*?<\/xdr:(?:twoCellAnchor|oneCellAnchor)>/gi) || []
    
    for (const anchor of anchorMatches) {
      const rowMatch = anchor.match(/<xdr:from>[\s\S]*?<xdr:row>(\d+)<\/xdr:row>/i)
      const blipMatch = anchor.match(/<(?:a:blip|blip)\b[^>]*r:embed=["']([^"']+)["']/i)
      
      if (rowMatch && blipMatch) {
        const row0 = parseInt(rowMatch[1], 10)
        const row1 = row0 + 1
        const rId = blipMatch[1]
        const mediaTarget = relMap.get(rId)
        if (mediaTarget) {
          rowImageMap.set(row1, mediaTarget)
        }
      }
    }
  }

  // 4. Save extracted images to public folder
  const uploadDir = path.resolve(process.cwd(), 'public', 'uploads', 'questions', 'extracted')
  await fs.mkdir(uploadDir, { recursive: true })

  const rowSavedImageUrlMap = new Map<number, string>()
  for (const [rowNum, mediaPath] of rowImageMap.entries()) {
    const mediaFile = zip.file(mediaPath)
    if (mediaFile) {
      const imgBuffer = await mediaFile.async('nodebuffer')
      const ext = path.extname(mediaPath) || '.png'
      const uniqueName = `img_${randomUUID().substring(0, 8)}_${rowNum}${ext}`
      const targetFilePath = path.join(uploadDir, uniqueName)
      await fs.writeFile(targetFilePath, imgBuffer)
      rowSavedImageUrlMap.set(rowNum, `/uploads/questions/extracted/${uniqueName}`)
    }
  }

  // 5. Parse Sheet 1 XML for cell values
  const sheet1File = zip.file('xl/worksheets/sheet1.xml')
  if (!sheet1File) {
    // Fallback to xlsx workbook parser
    return parseSheetWithoutImages(buffer, defaults)
  }

  const sXml = await sheet1File.async('text')
  const rowMatches = sXml.match(/<row\b[^>]*r=["'](\d+)["'][\s\S]*?<\/row>/gi) || []
  
  if (rowMatches.length === 0) {
    return parseSheetWithoutImages(buffer, defaults)
  }

  const extractedRows: ParsedQuestionRow[] = []
  let headers: Record<string, string> = {} // colLetter -> clean header name

  for (const rowXml of rowMatches) {
    const rMatch = rowXml.match(/^<row\b[^>]*r=["'](\d+)["']/i)
    if (!rMatch) continue
    const rowNum = parseInt(rMatch[1], 10)

    const cellMatches = rowXml.match(/<c\b[^>]*r=["']([A-Z]+)(\d+)["']([^>]*)>(?:<v>([\s\S]*?)<\/v>)?(?:<is><t>([\s\S]*?)<\/t><\/is>)?<\/c>/gi) || []
    
    const rowData: Record<string, string> = {}

    for (const cXml of cellMatches) {
      const colMatch = cXml.match(/r=["']([A-Z]+)\d+["']/i)
      if (!colMatch) continue
      const colLetter = colMatch[1].toUpperCase()
      const isSharedString = /t=["']s["']/i.test(cXml)
      const isInlineString = /<is><t>([\s\S]*?)<\/t><\/is>/i.exec(cXml)
      const vMatch = /<v>([\s\S]*?)<\/v>/i.exec(cXml)

      let val = ''
      if (isInlineString) {
        val = decodeXmlEntities(isInlineString[1])
      } else if (vMatch) {
        if (isSharedString) {
          const strIdx = parseInt(vMatch[1], 10)
          val = strings[strIdx] || ''
        } else {
          val = decodeXmlEntities(vMatch[1])
        }
      }
      rowData[colLetter] = val.trim()
    }

    // Row 1 is header
    if (rowNum === 1) {
      for (const [col, val] of Object.entries(rowData)) {
        headers[col] = normalizeHeader(val)
      }
      continue
    }

    // Map row columns to fields based on headers
    const rowObj: Record<string, string> = {}
    for (const [col, val] of Object.entries(rowData)) {
      const h = headers[col] || col.toLowerCase()
      rowObj[h] = val
    }

    const parsed = mapObjectToQuestion(rowObj, rowSavedImageUrlMap.get(rowNum), defaults)
    if (parsed) {
      extractedRows.push(parsed)
    }
  }

  return extractedRows
}

/**
 * Standard XLSX / XLS / CSV sheet parser (for files without embedded drawings).
 */
function parseSheetWithoutImages(
  buffer: Buffer,
  defaults?: { course?: string; subject?: string; chapter?: string }
): ParsedQuestionRow[] {
  const workbook = XLSX.read(buffer, { type: 'buffer' })
  const firstSheetName = workbook.SheetNames[0]
  if (!firstSheetName) return []

  const sheet = workbook.Sheets[firstSheetName]
  const rawRows: Record<string, any>[] = XLSX.utils.sheet_to_json(sheet, { defval: '' })

  const results: ParsedQuestionRow[] = []
  for (const rawRow of rawRows) {
    const normalizedRow: Record<string, string> = {}
    for (const [k, v] of Object.entries(rawRow)) {
      normalizedRow[normalizeHeader(k)] = (v ?? '').toString().trim()
    }
    const parsed = mapObjectToQuestion(normalizedRow, undefined, defaults)
    if (parsed) {
      results.push(parsed)
    }
  }
  return results
}

function normalizeHeader(h: string): string {
  return h
    .trim()
    .toLowerCase()
    .replace(/^[^a-z0-9]+|[^a-z0-9]+$/g, '')
    .replace(/\s+/g, '_')
}

function decodeXmlEntities(str: string): string {
  return str
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
}

function mapObjectToQuestion(
  row: Record<string, string>,
  attachedImageUrl?: string,
  defaults?: { course?: string; subject?: string; chapter?: string }
): ParsedQuestionRow | null {
  const qText = row.question || row.text || row.question_text || row.q || row.question_name || ''
  const optA = row.option_a || row.option_1 || row.option1 || row.a || row.opt_a || row.opt1 || ''
  const optB = row.option_b || row.option_2 || row.option2 || row.b || row.opt_b || row.opt2 || ''
  const optC = row.option_c || row.option_3 || row.option3 || row.c || row.opt_c || row.opt3 || ''
  const optD = row.option_d || row.option_4 || row.option4 || row.d || row.opt_d || row.opt4 || ''
  const correctVal = row.correct_option || row.right_answer || row.right_answer || row.answer || row.correct || row.ans || row.correct_answer || row.answer_key || 'A'

  if (!qText && !attachedImageUrl) return null
  if (!optA || !optB) return null

  // Attach image to question text if found
  let finalQuestion = qText
  if (attachedImageUrl) {
    if (finalQuestion) {
      finalQuestion = `${finalQuestion}\n\n![Figure](${attachedImageUrl})`
    } else {
      finalQuestion = `![Figure](${attachedImageUrl})`
    }
  }

  const course = row.course || row.exam || row.course_name || row.category || defaults?.course || 'JEE Main'
  const subject = row.subject || row.subject_name || row.subj || defaults?.subject || 'Physics'
  const chapter = row.chapter || row.chapter_name || row.chap || defaults?.chapter || 'General'
  const explanation = row.explanation || row.solution || row.rationale || row.exp || ''
  const difficulty = row.difficulty || row.level || 'Medium'
  const marks = parseInt(row.marks || row.mark || row.score || row.points || '4') || 4

  return {
    course,
    subject,
    chapter,
    question: finalQuestion,
    option_a: optA,
    option_b: optB,
    option_c: optC,
    option_d: optD,
    correct_option: correctVal.toUpperCase().trim(),
    explanation,
    difficulty,
    marks
  }
}
