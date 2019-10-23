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
            WITH post, COLLECT([tag, upvotes])[0..2] AS toptags
            UNWIND toptags AS tags
            RETURN post, tags
            ORDER BY tags[0] DESC
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
      // ORDER BY tagname DESC


//TOP 3 categories returns post, [[cat1],[cat2],[cat3]]
// MATCH (a:Crosspost)-[t:TAGGED]->(b:Tag)
//       WITH a.name AS post, b.tagname AS tag, t.upvotes AS upvotes
//       ORDER BY upvotes DESC 
//       WITH post, COLLECT([tag, upvotes])[0..3] AS toptags
//       UNWIND toptags AS toptagsupvotes
//       WITH post, COLLECT(toptagsupvotes) AS tags
//       RETURN post, tags
//       ORDER BY post DESC




// MATCH (a:Crosspost)-[t:TAGGED]->(b:Tag)
// OPTIONAL MATCH (c:Crosspost)-[]->(b)
// WHERE NOT c.name =~ a.name
//       WITH a.name AS post, b.tagname AS tag, t.upvotes AS upvotes, c
//       ORDER BY upvotes DESC 
//       WITH post, collect([tag, upvotes, c.name])[0..3] AS toptags
//       UNWIND toptags AS toptagsupvotes
//         WITH post, COLLECT(toptagsupvotes) AS test
//       RETURN post, test
//       ORDER BY post DESC











// MATCH (a:Crosspost)-[t:TAGGED]->(b:Tag)
//       WITH a.name AS post, b.tagname AS tag, t.upvotes AS upvotes, b, a
//       ORDER BY upvotes DESC 
//       WITH post, collect([tag, upvotes])[0..3] AS toptags, b, a
//       UNWIND toptags AS toptagsupvotes
//         OPTIONAL MATCH (d:Crosspost)-[]->(b)<-[]-(a)
//         WHERE toptagsupvotes[0] =~ b.tagname
//         WITH post, COLLECT(d.name) AS test
//         RETURN post, test
//         ORDER BY post DESC


function retrieveDatabase(results){

}


http.listen(80, function (){
  //  http://[2606:a000:101a:101:0:5a8b:1cd5:fa71]:3000/index.html
  console.log('Crossroads app listening on port 80 like a slut!');
});