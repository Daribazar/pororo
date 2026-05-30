const fs = require("fs");
const path = require("path");
const csv = require("csv-parser");

const DATA_DIR = path.join(__dirname, "..", "data");

// CSV-г дахин дахин уншихгүй cache хийж хадгална.
const cache = {};

// CSV-ийн утгыг боломжтой бол number болгоно.
// Жишээ нь "82.5" → 82.5, харин "Комисс А" хэвээр үлдэнэ.
function normalizeValue(value) {
  if (value === undefined || value === null) return value;

  const clean = String(value).trim();

  if (clean === "") return clean;

  const numberValue = Number(clean);
  return Number.isNaN(numberValue) ? clean : numberValue;
}

// CSV унших ерөнхий функц.
// Repository layer зөвхөн data унших үүрэгтэй.
function readCsv(fileName) {
  return new Promise((resolve, reject) => {
    if (cache[fileName]) {
      return resolve(cache[fileName]);
    }

    const filePath = path.join(DATA_DIR, fileName);
    const rows = [];

    fs.createReadStream(filePath)
      .pipe(
        csv({
          mapHeaders: ({ header }) => header.replace(/^\uFEFF/, "").trim()
        })
      )
      .on("data", (row) => {
        const cleanRow = {};

        Object.keys(row).forEach((key) => {
          cleanRow[key.trim()] = normalizeValue(row[key]);
        });

        rows.push(cleanRow);
      })
      .on("end", () => {
        cache[fileName] = rows;
        resolve(rows);
      })
      .on("error", reject);
  });
}

module.exports = {
  readCsv
};