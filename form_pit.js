const fs = require('fs');
const gm = require('gm');
const sqlite3 = require('sqlite3').verbose();
const formidable = require('formidable');
const http = require('http');
//none of this works yet, sqlite error because i need to add all at same time
http.createServer(function(req, res) {
  if (req.url == '/upload' && req.method.toLowerCase() == 'post') {
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
        let stmt = db.prepare('INSERT INTO pit VALUES (?, ?)');
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

      // send upload progress bar
      res.writeHead(200, {'Content-Type': 'text/html'});
      res.write('<html><head><title>Upload Progress</title></head>');
      res.write('<body><p>Upload Progress:</p><br/><br/>');
      res.write('<progress id="progress" value="0" max="100"></progress>');
      res.write('<p id="progress-text"></p><br/><br/>');
      res.write('</body></html>');

      // process the uploaded images
      let numImagesProcessed = 0;
      for (let file in files) {
        // convert the image
        gm(files[file].path).setFormat('png').stream((err, stdout, stderr) => {
          if (err) {
            console.error(err);
          }

          let writeStream = fs.createWriteStream(file + '.png');
          stdout.pipe(writeStream);
          stderr.pipe(process.stderr);

          writeStream.on('close', () => {
            // update progress bar
            res.write('<script>document.getElementById("progress").value = ' + (++numImagesProcessed / Object.keys(files).length * 100) + ';</script>');
            res.write('<script>document.getElementById("progress-text").innerHTML = "' + numImagesProcessed + ' of ' + Object.keys(files).length + ' images processed.";</script>');

            // check processed #
            if (numImagesProcessed == Object.keys(files).length) {
                //file name making
                let fileName = Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
  
                let db = new sqlite3.Database('data.db', sqlite3.OPEN_READWRITE, (err) => {
                  if (err) {
                    console.error(err.message);
                  }
                  console.log('Connected to the data.db database.');
                });
                db.serialize(() => {
                  let stmt = db.prepare('INSERT INTO pit VALUES (?, ?)');
                  stmt.run('img1', fileName);
                  stmt.finalize();
                });
                db.close((err) => {
                  if (err) {
                    console.error(err.message);
                  }
                  console.log('Closed the database connection.');
                });
  
                res.end('<html><head><title>Submitted</title></head><body><p>Submitted</p></body></html>');
              }
            });
          });
        }
      });
  
      return;
    }
  
    // show a file upload form
    res.writeHead(200, {'Content-Type': 'text/html'});
    res.end(
      'doooooooooooooooone'
    );
  }).listen(766);
  
