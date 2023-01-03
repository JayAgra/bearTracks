const sqlite3 = require('sqlite3').verbose();
const formidable = require('formidable');
const http = require('http');

http.createServer(function(req, res) {
  if (req.url == '/uploadMain' && req.method.toLowerCase() == 'post') {
    // parse the form data
    var form = new formidable.IncomingForm();

    form.parse(req, function(err, fields, files) {
      //log data
      //remove this later
      //seriously
      //remove
      //do it
      console.log(fields);

      let db = new sqlite3.Database('data.db', sqlite3.OPEN_READWRITE, (err) => {
        if (err) {
          console.error(err.message);
        }
        console.log('Connected to the data.db database.');
      });
      db.serialize(() => {
        let stmt = db.prepare('INSERT INTO main VALUES (?, ?)');
        for (let field in fields) {
          stmt.run(field, fields[field]);
        }
        stmt.finalize();
      });
      db.close((err) => {
        if (err) {
          console.error(err.message);
        }
        console.log('Closed the database connection.');
      });

      // send a response that says "submitted"
      res.writeHead(200, {'Content-Type': 'text/html'});
      res.end('<html><head><title>Submitted</title></head><body><p>Submitted</p></body></html>');
    });

    return;
  }

  res.writeHead(200, {'Content-Type': 'text/html'});
  res.end(
    'done'
  );
}).listen(766);

