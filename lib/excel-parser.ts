import JSZip from 'jszip'
import * as XLSX from 'xlsx'
import { promises as fs } from 'fs'
import path from 'path'
import { randomUUID } from 'crypto'

export interface ParsedQuestionRow {
  course?: string
  subject?: string
  chapter?: string
  topic?: string
  question: string
  option_a: string
  option_b: string
  option_c?: string
  option_d?: string
  correct_option: string
  explanation?: string
  direction?: string
  difficulty?: string
  marks?: number
  [key: string]: any
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

  // 4. Extract images to Data URIs (Serverless / Vercel friendly with 0 filesystem dependencies)
  const rowSavedImageUrlMap = new Map<number, string>()
  for (const [rowNum, mediaPath] of rowImageMap.entries()) {
    const mediaFile = zip.file(mediaPath)
    if (mediaFile) {
      const imgBuffer = await mediaFile.async('nodebuffer')
      const ext = (path.extname(mediaPath) || '.png').replace('.', '').toLowerCase()
      const mimeType = ext === 'jpg' || ext === 'jpeg' ? 'image/jpeg' : ext === 'svg' ? 'image/svg+xml' : ext === 'webp' ? 'image/webp' : 'image/png'
      const base64Str = imgBuffer.toString('base64')
      const dataUri = `data:${mimeType};base64,${base64Str}`
      rowSavedImageUrlMap.set(rowNum, dataUri)
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

/**
 * Helper to retrieve a value from rowObj matching any given alias.
 * It first does direct key lookup, then checks if any key matches the alias without underscores.
 */
function getColumnValue(row: Record<string, string>, aliases: string[]): string {
  // 1. Direct exact match
  for (const alias of aliases) {
    if (row[alias] !== undefined && row[alias] !== '') {
      return row[alias]
    }
  }

  // 2. Fallback: Check if any normalized key contains the alias
  const rowKeys = Object.keys(row)
  for (const alias of aliases) {
    const matchedKey = rowKeys.find(k => k === alias || k.replace(/_/g, '') === alias.replace(/_/g, ''))
    if (matchedKey && row[matchedKey] !== undefined && row[matchedKey] !== '') {
      return row[matchedKey]
    }
  }

  return ''
}

function mapObjectToQuestion(
  row: Record<string, string>,
  attachedImageUrl?: string,
  defaults?: { course?: string; subject?: string; chapter?: string }
): ParsedQuestionRow | null {
  // Extract Question Text
  const qText = getColumnValue(row, [
    'question', 'question_text', 'questiontext', 'text', 'q', 
    'question_name', 'question_statement', 'questionstatement', 
    'problem', 'item', 'title', 'questions'
  ])

  // Extract Options A through D
  const optA = getColumnValue(row, [
    'option_a', 'optiona', 'option_1', 'option1', 'opta', 'opt_a', 
    'opt1', 'opt_1', 'choice_a', 'choicea', 'choice_1', 'choice1', 
    'a', 'ans_a', 'ansa'
  ])

  const optB = getColumnValue(row, [
    'option_b', 'optionb', 'option_2', 'option2', 'optb', 'opt_b', 
    'opt2', 'opt_2', 'choice_b', 'choiceb', 'choice_2', 'choice2', 
    'b', 'ans_b', 'ansb'
  ])

  const optC = getColumnValue(row, [
    'option_c', 'optionc', 'option_3', 'option3', 'optc', 'opt_c', 
    'opt3', 'opt_3', 'choice_c', 'choicec', 'choice_3', 'choice3', 
    'c', 'ans_c', 'ansc'
  ])

  const optD = getColumnValue(row, [
    'option_d', 'optiond', 'option_4', 'option4', 'optd', 'opt_d', 
    'opt4', 'opt_4', 'choice_d', 'choiced', 'choice_4', 'choice4', 
    'd', 'ans_d', 'ansd'
  ])

  // Extract Correct Option / Answer
  const correctVal = getColumnValue(row, [
    'correct_option', 'correctoption', 'correct_answer', 'correctanswer', 
    'correct_ans', 'correctans', 'correct_choice', 'correctchoice',
    'right_answer', 'rightanswer', 'right_ans', 'rightans', 'right_opt', 'rightopt',
    'answer', 'ans', 'correct', 'answer_key', 'answerkey', 'key'
  ]) || 'A'

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

  // Extract optional metadata fields
  const course = getColumnValue(row, ['course', 'course_name', 'exam', 'exam_name', 'course_title', 'category']) || defaults?.course || 'JEE Main'
  const subject = getColumnValue(row, ['subject', 'subject_name', 'subject_title', 'subj']) || defaults?.subject || 'Physics'
  const chapter = getColumnValue(row, ['chapter', 'chapter_name', 'chapter_title', 'chap']) || defaults?.chapter || 'General'
  const topic = getColumnValue(row, ['topic', 'topic_name', 'topic_title', 'top']) || ''
  
  const explanation = getColumnValue(row, ['explanation', 'solution', 'rationale', 'exp', 'reason', 'sol'])
  const direction = getColumnValue(row, ['direction', 'directions', 'description', 'passage', 'instructions', 'instruction'])
  const difficulty = getColumnValue(row, ['difficulty', 'difficulty_level', 'level', 'diff']) || 'Medium'
  
  const rawMarks = getColumnValue(row, ['marks', 'mark', 'score', 'points', 'point'])
  const marks = parseInt(rawMarks || '1') || 1

  return {
    course,
    subject,
    chapter,
    topic,
    question: finalQuestion,
    option_a: optA,
    option_b: optB,
    option_c: optC,
    option_d: optD,
    correct_option: correctVal.toUpperCase().trim(),
    explanation,
    direction,
    difficulty,
    marks
  }
}
