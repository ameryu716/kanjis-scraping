import axios from 'axios'
import { load } from 'cheerio'
import { createObjectCsvWriter as createCsvWriter } from 'csv-writer'

// Wikipediaの常用漢字のページURL
const url = "https://ja.wikipedia.org/wiki/常用漢字一覧"

// CSVライターの設定
const csvWriter = createCsvWriter({
  path: 'kanji_reading.csv',
  header: [
    { id: 'kanji', title: 'Kanji' },
    { id: 'reading', title: 'Reading' }
  ],
  encoding: 'utf-8'
})

// Webページを取得して処理
try {
  const response = await axios.get(url)
  const $ = load(response.data)
  const kanjiData = []

  // 各テーブルからデータを抽出
  $('table').each((index, table) => {
    $(table).find('tr').each((i, row) => {
      const cols = $(row).find('td')
      if (cols.length >= 2) {
        const kanji = $(cols[1]).text().trim()
        const reading = $(cols[8]).text().trim()
        kanjiData.push({ kanji, reading })
      }
    })
  })

  // CSVに書き込む
  await csvWriter.writeRecords(kanjiData)
  console.log('常用漢字とその読みがkanji_reading.csvに保存されました。')
} catch (error) {
  console.error('エラーが発生しました:', error)
}
