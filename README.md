# node-parallel-write-stream

## Sample usage with MySQL
```javascript
var writeStream = new require("@petitchevalroux/node-parallel-write-stream")({
    "concurrency": 4,
    "objectMode":true,
    "write":function(data, encoding, callback) {
        console.log(data);
        callback();
    }
});

var mysql = require('mysql');
var connection = mysql.createConnection({
    host: '<host>',
    user: '<user>',
    password: '<password>',
    database: '<database>'
});

connection.connect(function (err) {
    if (err) {
        console.error("error connecting: "" + err.stack);
        return;
    }
    readStream = connection.query("SELECT * FROM samples")
        .stream();
    readStream.on("end", function () {
        connection.destroy();
    });
    readStream.pipe(writeStream);
});
```