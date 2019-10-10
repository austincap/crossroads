var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

var neo4j = require('neo4j');

var db = new neo4j.GraphDatabase('http://neo4j:fucksluts@localhost:7474');

app.use(express.static('public'));


io.on('connection', function(socket){
	socket.on('sendNewPostToServer', function(infoToAdd){
      var query = `
      CREATE (n:Crosspost {name:{nodename}})
      MATCH (whomadeit:User {userID:{userID}}), (repliedBlock:Block {blockID:{replyto}}), (room:Room {name: {currentRoom}})
      MERGE (newblock:Block {blockID:{blockID}, upvotes:{upvotes}, x:{x}, y:{y}, type:{type}, url:{url}})
      MERGE (repliedBlock)<-[r:LABELS]-(newblock)<-[ra:CREATED]-(whomadeit)
      MERGE (room)-[:CONTAINS]->(newblock)
      RETURN (newblock), (repliedBlock)
      `;
      this.db.cypher({
        query: query,
        params: {
          nodename: infoToAdd.nodename,
          tag1: infoToAdd.tag1,
          tag2: infoToAdd.tag2,
          tag3: infoToAdd.tag3
        }
      }, function(err, results){
        if(err){console.error('Error in BlockService createBlock label', err);}
        callback(null, results);
      });
    }); 
});


http.listen(80, function (){
  //  http://[2606:a000:101a:101:0:5a8b:1cd5:fa71]:3000/index.html
  console.log('Crossroads app listening on port 80 like a slut!');
});