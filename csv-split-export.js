import { parse } from 'csv-parse'
import * as fs from 'fs'
import { createObjectCsvWriter as createCsvWriter } from 'csv-writer'
import Encoding from 'encoding-japanese'

if (!fs.existsSync('output')) {
  fs.mkdirSync('output')
}

// CSVライターの設定
const csvWriterKanjis = createCsvWriter({
  path: 'output/db_source_kanjis.csv',
  header: [
    { id: 'id', title: 'id' },
    { id: 'charcter', title: 'charcter' }
  ],
  encoding: 'utf-8'
})

// CSVライターの設定
const csvWriterReadings = createCsvWriter({
  path: 'output/db_source_readings.csv',
  header: [
    { id: 'id', title: 'id' },
    { id: 'kanjis_id', title: 'kanjis_id' },
    { id: 'read_full', title: 'read_full' },
    { id: 'yomigana', title: 'yomigana' },
    { id: 'okurigana', title: 'okurigana' },
    { id: 'is_japanese_reading', title: 'is_japanese_reading' },
  ],
  encoding: 'utf-8'
})

console.log('Source CSV Encoding...')
const encodeCharCode = (buffer) => {
  return Encoding.convert(buffer, {
    from: 'SJIS',
    to: 'UNICODE',
    type: 'string',
  })
}

const input_csv_buffer = fs.readFileSync('input.csv')
const csv_unicode = encodeCharCode(input_csv_buffer)
// console.log(csv_unicode)

const rows = csv_unicode.split('\n')

// const records = parse(csv_unicode, {
//   // columns: true,
//   // delimiter: ',',
//   relax_column_count: true,
// })

// console.log(rows[0])

rows.shift()

const records = [
  ...rows.map(_ => _.split(','))
]

const csv_kanjis_sources = []
const csv_readings_sources = []

let kanji_id = 0
let read_id = 0
// csv_row loop.
console.log('Record Analyze...')

for (const record_row of records) {
  kanji_id++

  const kanji = record_row.shift()
  const readings = [...record_row]

  const kanji_record = { id: kanji_id, charcter: kanji }
  csv_kanjis_sources.push(kanji_record)
  // reading charcter loop.
  for (const reading_sentence of readings) {
    read_id++

    const read_full = reading_sentence.replace(/（|）/g, '')
    const sentence_size = read_full.length
    const katakanas_in_sentence = read_full.match(/[ア-ン]/g)
    const katakana_size = katakanas_in_sentence ? katakanas_in_sentence.length : 0
    const is_japanese_reading = sentence_size !== katakana_size

    const [yomigana, okurigana] = read_full.split('-')

    if (!read_full) continue
    const reading_row = {
      id: read_id,
      kanjis_id: kanji_id,
      read_full,
      yomigana,
      okurigana,
      is_japanese_reading
    }
    csv_readings_sources.push(reading_row)
  }
}

console.log('Write csv[1]')
await csvWriterKanjis.writeRecords(csv_kanjis_sources)
console.log('Write csv[2]')
await csvWriterReadings.writeRecords(csv_readings_sources)
