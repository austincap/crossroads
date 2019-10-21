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
      MERGE (n:Crosspost {name:{nodename}})
      MERGE (t1:Tag {name:{tag1}}), (t2:Tag {name:{tag2}}), (t3:Tag {name:{tag3}})
      MERGE (t2)<-[:TAGGED {upvotes:1}]-(n)-[:TAGGED {upvotes:1}]->(t1)
      MERGE (n)-[:TAGGED {upvotes:1}]->(t3)
      `;
      db.cypher({
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

    socket.on('retrieveDatabase', function(infoToAdd){
    	var query = `
    	MATCH (a:Crosspost)-[t:TAGGED]->(b:Tag)
		WITH a.name AS post, b.tagname AS tag, t.upvotes AS upvotes
		ORDER BY upvotes DESC 
		WITH post, collect([tag, upvotes])[0..3] AS toptags
		UNWIND toptags AS toptagsupvotes
		RETURN post, toptagsupvotes[0] AS tagname, toptagsupvotes[1] AS upvotes
		ORDER BY tagname DESC
    	`;
    	db.cypher({
    		query: query
    	}, function(err, results){
	        if(err){console.error('Error in retrieveDatabase', err);}
	        socket.emit('sendDatabase', results);
    	});
    });
});


// MATCH (a:Crosspost)-[t:TAGGED]->(b:Tag)
// WITH a.name AS post, b.tagname AS tag, t.upvotes AS upvotes
// ORDER BY upvotes DESC 
// WITH post, collect([tag, upvotes])[0..3] AS toptags
// UNWIND toptags AS toptagsupvotes
// RETURN post, toptagsupvotes[0] AS tagname, toptagsupvotes[1] AS upvotes
// ORDER BY post, upvotes DESC





function retrieveDatabase(results){

}


http.listen(80, function (){
  //  http://[2606:a000:101a:101:0:5a8b:1cd5:fa71]:3000/index.html
  console.log('Crossroads app listening on port 80 like a slut!');
});