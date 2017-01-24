// load the mysql library
var mysql = require('mysql');

// create a connection to our Cloud9 server
var connection = mysql.createConnection({
  host     : 'localhost',
  user     : 'kitchdev', 
  password : '',
  database: 'reddit_project'
});

// load our API and pass it the connection
var reddit = require('./reddit');
var redditAPI = reddit(connection);


redditAPI.createUser({
  username: 'John Smith',
  password: 'xxx'
}, function(err, user) {
  if (err) {
    console.log(err);
  }
  else {
    redditAPI.createPost(1,{
      title: 'dorks like porks',
      url: 'https://www.reddit.com',
      userId: 5
    }, function(err, post) {
      if (err) {
        console.log(err);
      }
      else {
        console.log(post);
      }
      connection.end()
    });
  }
});
