var express = require('express');
var app = express();
var pg = require('pg');

var config = {
  user: 'somethingiffy', //env var: PGUSER 
  database: 'postgresdb', //env var: PGDATABASE 
  password: 'rugby123', //env var: PGPASSWORD 
  host: '34.206.79.166', // Server hosting the postgres database 
  port: 5432, //env var: PGPORT 
  max: 10, // max number of clients in the pool 
  idleTimeoutMillis: 30000, // how long a client is allowed to remain idle before being closed 
};
var pool = new pg.Pool(config);

app.listen('8080', () => {
  console.log('listening...');
});

app.get('/read', (req, res) => {
  //need to set option and add read for only one player
  console.log('someone is trying to get');

  pool.connect(function(err, client, done) {
    if(err) {
      return console.error('error fetching client from pool', err);
    }
    client.query('SELECT * FROM tradeinfo', function(err, result) {
      done(err);
      console.log(result);
      if(err) {
        return console.error('error running query', err);
      }
    });
    res.end();
  });
   
  pool.on('error', function (err, client) {
    console.error('idle client error', err.message, err.stack)
  })
});

app.get('/post', (req, res) => {
  //need to set option and add read for only one player
  let receivedInfo = req.url.substring(6, req.url.length);
  let recArray = [];
  while(receivedInfo.indexOf(',') !== -1) {
    recArray.push(receivedInfo.substring(0, receivedInfo.indexOf(',')));
    receivedInfo = (receivedInfo.substring(receivedInfo.indexOf(',') + 1, receivedInfo.length));
  }
  recArray.push(receivedInfo.substring(0, receivedInfo.length));
  receivedInfo = (receivedInfo.substring(receivedInfo.indexOf(',') + 1, receivedInfo.length));
  
  pool.connect(function(err, client, done) {
    if(err) {
      return console.error('error fetching client from pool', err);
    }
  });
    pool.connect(function(err, client, done) {
      if(err) {
        return console.error('error fetching client from pool', err);
      }

      let sectorInfo = '{'
      recArray.forEach((element, index) => {
        sectorInfo = sectorInfo + '{' + element + '}';
        if (recArray[index + 1]) {
          sectorInfo += ',';
        }
      })
      sectorInfo = sectorInfo + '}';
      insertData = `INSERT INTO tradeinfo(player, coords, shops) VALUES('${recArray[0]}', '{{${recArray[1]}}, {${recArray[2]}}}', '${sectorInfo}');`;
      client.query(insertData, function(err, result) {
        done(err);
        if(err) {
          return console.error('error running query', err);
        }
      });
    res.end();
  });
  
  res.end();
   
  pool.on('error', function (err, client) {
    console.error('idle client error', err.message, err.stack)
  })
});