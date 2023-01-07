const http = require('http');
const qs = require('querystring');
const { EventEmitter } = require('events');
const sqlite3 = require('sqlite3').verbose();

let db = new sqlite3.Database('data.db', sqlite3.OPEN_READWRITE, (err) => {
    if (err) {
      console.error(err.message);
    }
    console.log('Connected to the database.');
});

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
            console.log("pit from " +  req.socket.remoteAddress)
            res.end('pit form');
        } else if (formData.formType === 'main') {
            console.log("main from " +  req.socket.remoteAddress)
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
