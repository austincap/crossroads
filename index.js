var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

var neo4j = require('neo4j');

var db = new neo4j.GraphDatabase('http://neo4j:fucksluts@localhost:7474');

app.use(express.static('public'));


io.on('connection', function(socket){

	socket.on('sendNewPostToServer1', function(infoToAdd){
      var query = `
      MERGE (n:Crosspost {name:{nodename}, content:{nodecontent}, upvotes:1})
      MERGE (t1:Tag {tagname:{tag1}})
      MERGE (n)-[:TAGGED {upvotes:1}]->(t1)
      `;
      db.cypher({
        query: query,
        params: {
          nodename: infoToAdd.nodename,
          nodecontent: infoToAdd.nodecontent,
          tag1: infoToAdd.tag1
        }
      }, function(err, results){
        if(err){console.error('Error in BlockService createBlock label', err);}
      });
  });

  socket.on('sendNewPostToServer2', function(infoToAdd){
      var query = `
      MERGE (n:Crosspost {name:{nodename}, content:{nodecontent}, upvotes:1})
      MERGE (t1:Tag {tagname:{tag1}})
      MERGE (t2:Tag {tagname:{tag2}})
      MERGE (t2)<-[:TAGGED {upvotes:1}]-(n)-[:TAGGED {upvotes:1}]->(t1)
      `;
      db.cypher({
        query: query,
        params: {
          nodename: infoToAdd.nodename,
          nodecontent: infoToAdd.nodecontent,
          tag1: infoToAdd.tag1,
          tag2: infoToAdd.tag2
        }
      }, function(err, results){
        if(err){console.error('Error in BlockService createBlock label', err);}
      });
  });

  socket.on('tagPost', function(infoToChange){
      var query = `
      MATCH (n:Crosspost {name:{nodename}, content:{nodecontent}})
      MERGE (t1:Tag {tagname:{newtag}})
      MERGE (n)-[t:TAGGED {upvotes:1}]->(t1)
      RETURN n
      `;
      db.cypher({
        query: query,
        params: {
          nodename: infoToChange.nodename,
          nodecontent: infoToChange.nodecontent,
          newtag: infoToChange.newtag
        }
      }, function(err, results){
        if(err){console.error('Error upvoting tag', err);}
        console.log(infoToChange.newtag+" added to "+infoToChange.nodename);
      });
    }); 


  socket.on('upvoteTag', function(infoToChange){
      var query = `
      MATCH (n:Crosspost {name:{nodename}, content:{nodecontent}})-[t:TAGGED]->(t1:Tag {tagname:{tag1}})
      SET t.upvotes=t.upvotes+1
      RETURN t.upvotes
      `;
      db.cypher({
        query: query,
        params: {
          nodename: infoToChange.nodename,
          nodecontent: infoToChange.nodecontent,
          tag1: infoToChange.tag1
        }
      }, function(err, results){
        if(err){console.error('Error upvoting tag', err);}
        console.log(infoToChange.nodename+" to "+infoToChange.tag1+" upvoted");
      });
    }); 

  socket.on('upvotePost', function(infoToChange){
      var query = `
      MATCH (n:Crosspost {name:{nodename}, content:{nodecontent}})
      SET n.upvotes=n.upvotes+1
      RETURN n.upvotes
      `;
      db.cypher({
        query: query,
        params: {
          nodename: infoToChange.nodename,
          nodecontent: infoToChange.nodecontent
        }
      }, function(err, results){
        if(err){console.error('Error upvoting post', err);}
        console.log(infoToChange.nodename+" upvoted");
      });
  }); 

    socket.on('retrieveDatabase', function(infoToAdd){
    	var query = `
            MATCH (a:Crosspost)-[t:TAGGED]->(b:Tag)
            WITH a.name AS post, b.tagname AS tag, t.upvotes AS tagupvotes, a.upvotes AS upvotes, a.content AS content
            ORDER BY tagupvotes DESC 
            WITH post, upvotes, content, COLLECT([tag, tagupvotes])[0..2] AS toptags
            UNWIND toptags AS tags
            RETURN post, upvotes, content, tags
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