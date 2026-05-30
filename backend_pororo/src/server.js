const app = require("./app");

const PORT = process.env.PORT || 5001;

// Серверийг асааж байгаа үндсэн файл.
// Бүх route болон middleware app.js дотор тусдаа байна.
app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});