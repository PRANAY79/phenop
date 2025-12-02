const express = require('express');
const app = express();

console.log("Express version:", require('express/package.json').version);

app.get('/', (req, res) => {
  res.send('Root works');
});

app.get('/something-unique', (req, res) => {
  res.send('Hello from right backend!');
});

app.listen(5000, () => {
  console.log("Minimal test server running on port 5000");
});
