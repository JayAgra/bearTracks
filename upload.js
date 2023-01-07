const http = require('http');
const qs = require('querystring');
const { EventEmitter } = require('events');
const sqlite3 = require('sqlite3').verbose();

const server = http.createServer((req, res) => {
  if (req.method === 'POST' && req.url === '/submit') {
    let body = '';

    req.on('data', chunk => {
      body += chunk.toString(); // convert buffer
    });

    req.on('end', () => {
      let formData = qs.parse(body);
      console.log(formData);

      const formEmitter = new EventEmitter();
      formEmitter.on('formType', () => {
        if (formData.formType === 'pit') {
            console.log("pit recd from " +  req.socket.remoteAddress)
            let db = new sqlite3.Database('data.db', sqlite3.OPEN_READWRITE, (err) => {
                if (err) {
                  console.error(err.message);
                  res.end('pit form error! ' + err.message);
                }
                console.log('Connected to database');
            });
            let stmt = `INSERT INTO pit (event, name, game1, game2, game3, game4, game5, game6, game7, game8, game9, game10, game11, game12, game13, game14, game15, game16, game17, game18, game19, game20, confidence, bqual, overall, scoutIP) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
            let values = [formData.event, formData.name, formData.game1, formData.game2, formData.game3, formData.game4, formData.game5, formData.game6, formData.game7, formData.game8, formData.game9, formData.game10, formData.game11, formData.game12, formData.game13, formData.game14, formData.game15, formData.game16, formData.game17, formDatagame18, formDatagame19, formData.game20, formData.confidence, formData.bqual, formData.overall, req.socket.remoteAddress];
            db.run(stmt, values, function(err) {
                if (err) {
                  console.error(err.message);
                  res.end('pit form error! ' + err.message);
                }
                console.log(`row ${this.lastID} inserted`);
            });
            db.close((err) => {
                if (err) {
                  console.error(err.message);
                  res.end('pit form error! ' + err.message);
                }
                console.log('db closed');
            });
            res.end('pit form submitted');
        } else if (formData.formType === 'main') {
            console.log("main recd from " +  req.socket.remoteAddress)
            res.end('main form');
        } else {
          res.end('unknown form type');
        }
      });

      formEmitter.emit('formType');
    });
  } else {
    res.end('POST requests only on the /submit URL!');
  }
});

server.listen(766);
