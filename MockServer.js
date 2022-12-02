const express = require('express')
const app = express()

var port = process.env.PORT || 8080;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static('public'))

app.get('/', (req, res) => res.send('Hey Aranb! Your server is running fine.'))

app.post('/login', (req, res) => {
  let masterPassForMock = "1234"
  if (req.body.password === masterPassForMock) {
    res.send(require('./mockFiles/login/loginSuccess.json'));
  } else {
    res.send(require('./mockFiles/login/loginError.json'));
  }
})

app.post("/logout", (req, res) => {
  res.status(401).send(require('./mockFiles/logout/success.json'));
})

app.get("/repoService/myClasses/:tagId/runtimeMetrics", (req, res) => {
  console.log('RuntimeMetrics for Class', req.params.tagId)
  return res.send(require('./mockFiles/runtimeMetrics.json'))
})

app.get('/chathistory', (req, res) => res.send(require('./mockFiles/chatHistoryMock/chat_history.json')))

app.listen(port, function () {
  console.log('Our app is running on http://localhost:' + port);
});
