var express = require('express');
var app = express();
// load the mysql library
var mysql = require('mysql');
var bodyParser = require('body-parser');
var morgan = require('morgan');


// create a connection to our Cloud9 server
var connection = mysql.createConnection({
  host     : 'localhost',
  user     : 'kitchdev', // CHANGE THIS :)
  password : '',
  database: 'reddit_project'
});
   
   
var reddit = require('./reddit');


var redditAPI = reddit(connection);


app.set('view engine', 'pug');


var cookieParser = require('cookie-parser');

app.use(cookieParser())

app.use(checkLoginToken);

app.use(bodyParser.urlencoded({ extended: false }));

app.use(morgan('dev'));

app.use('/', express.static('static-files'));

var urlencodedParser = bodyParser.urlencoded({ extended: false })



function checkLoginToken(request, response, next){
  if(request.cookies.SESSION){
    redditAPI.getUserFromSession(request.cookies.SESSION, function(err, user){
      if(err){response.status(401).send("whoops, something weird happened")};
      
      if(user){ 
        console.log(user.sessionId, 'hey its me')
        request.loggedInUser = user.sessionId;
        response.locals.user = user;
      }
      next();

    })
  }
  else{ 
    next();
  }
}






app.get('/', function(request, response){
  
  redditAPI.getAllPosts({numPerPage: 50}, function(err, result){
    if(err){
      response.status(500).send("oops something went wrong")
    }
   
    response.render('post-list', {posts: result});
  });
});



app.post('/sortingMethod', function(request, response){
  if (!request.body){ return response.sendStatus(400)}
  else{
    
    redditAPI.getAllPosts({sortingMethod: request.body.sortingMethod} ,function(err,result){
      if(err){
        response.status(500).send("oops something went wrong")
      }
      else{
        response.render('post-list', {posts: result});
      }
    })
    
  }

})



app.post('/sortingMethodHome', function(request, response){
  if (!request.body){ return response.sendStatus(400)}
  else{
    
    redditAPI.getAllPosts({sortingMethod: request.body.sortingMethod} ,function(err,result){
      if(err){
        response.status(500).send("oops something went wrong")
      }
      else{
        
        response.render('homepage', {posts: result});
        
      }
    })
    
  }

})



app.get('/signup', function(request, response){
   response.render('signupPug');
   
});



app.post('/signup', urlencodedParser, function(request, response){
  if (!request.body){ return response.sendStatus(400)}
  else{
    
    redditAPI.createUser({username: request.body.username, password: request.body.password} ,function(err,result){
      if(err){
        response.status(500).send("Your username is already taken")
      }
      else if(request.body.username === null || request.body.password === null){
        response.status(400).send('you must enter a valid username and password')
      }
      else{
        response.redirect('/');
      }
    })
    
  }

})



app.post('/' , function(request, response){
    redditAPI.checkLogin(request.body.username, request.body.password, function(err, user){
      console.log(request.body.username, request.body.password, "< this < shouldnt be undefined")
      if(err){
        console.log(err)
        response.status(400).send("you've entered the wrong username or password")  
        
      }
 
      else{
        redditAPI.createSession(user.id, function(err, token){
          if(err){
            console.log(err.message,"hellllppppp")
            console.log(request.loggedInUser, "should be the loggedInUser")
            response.redirect('/homepage')
          }
         else if(err && !err.code === 'ER_DUP_ENTRY'){
        response.status(400).send("You've entered the incorrect username or password")
          }
          else{
            console.log(response.cookies, "< should be cookies")
            response.cookies('SESSION', token);
            response.redirect('/homepage');
          }
          
        });
      }
    });
});



app.post('/createContent', urlencodedParser, function(request, response) {
  // before creating content, check if the user is logged in
    
  if (!request.loggedInUser) {
    
    // HTTP status code 401 means Unauthorized
    response.status(401).send('You must be logged in to create content!');
  }
  else {
    
    // here we have a logged in user, let's create the post with the user!
    redditAPI.createPost(request.body.subredditId,{
      url: request.body.url,
      title: request.body.title,
      userId: request.loggedInUser
      
    }, function(err, post) {
      if(err){
        response.status(500).send('something went wrong on out end')
      }
      else{
      // do something with the post object or just response OK to the user :)
      response.redirect("/homepage")
      }
    })
  }
})



app.get('/homepage', function(request, response){

      console.log(response.cookies)
      console.log(request.body, "request b0dy")
      if (!request.loggedInUser) {
         
    // HTTP status code 401 means Unauthorized
        response.send("there's something wrong with your login process, please refresh the browser");
  }
  else{
    
    redditAPI.getAllPosts(0, function(err, result){
    if(err){
        
      response.status(500).send(err.code)
    }
    else{
       
    response.render('homepage', {posts: result});
    
    }
  });
  }
  
})



app.post('/vote', function(request, response){
  if(!request.loggedInUser){
    response.redirect('/');
  }
  else{console.log(request.body)
    redditAPI.createOrUpdateVote({ 
      postId:  Number(request.body.postId),
      userId: request.loggedInUser,
      vote: Number(request.body.vote)
      } 
      , function(err, result){
      if(err){
       
        response.status(500).send(`jesus loves you ${err}`)
      }
      else{console.log(request.headers.referer)
          response.redirect(request.headers.referer)
      }
    })
  }
})



app.post('/subredditChoice', function(request, response){
    if (!request.body){ return response.sendStatus(400)}
  else{
    
    redditAPI.getSubredditContents(request.body.subreddit ,function(err,result){
      if(err){console.log(request.body.subreddit)
        response.status(500).send("oops something went wrong")
      }
      else{
        response.render('homepage', {posts: result});
      }
    })
    
  }

  
})



app.get('/subredditmenu', function(request, response){
  redditAPI.getAllSubreddits(function(err, result){
    
     console.log(result);
    
    if(err){console.log(result)
      return response.sendStatus(400)
    }
    else{
      console.log(result)
      response.render('subreddit-menu', {posts: result})
    }
  });
})



app.get('/r/:subreddit/:sorting', function(request, response) {
    
   var sort = request.params.sorting || "Newest";
   
   redditAPI.getAllPosts({subreddit: request.params.subreddit, sortingMethod: sort},  function(err, posts) {
     if(err) console.log(err) 
     else {
       console.log(request.params)
        response.render('subreddit-page', {posts: posts, name: request.params.subreddit, id: request.params.id, description: request.params.description});
     }
   }); 
});



app.get('/signout', function(request, response) {
  if(!request.body) { 
    console.log('there was an error obtaining the signout request, signout_1')
  }
  else if(!request.loggedInUser) { 
  console.log("User not signed in, signout_3");
  response.redirect('/');
  }
  
  redditAPI.signout(request.loggedInUser.id, function(err, result) {
    if(err){console.log(request.loggedInUser.id)
      response.sendStatus(500)
      }
    else{
    response.cookies('SESSION', request.loggedInUser.token, {expire : new Date() - 9999});
    response.redirect('/');
    }
  });
});








// Boilerplate code to start up the web server
var server = app.listen(process.env.PORT, process.env.IP, function () {
  var host = server.address().address;
  var port = server.address().port;

  console.log('Example app listening at http://%s:%s', host, port);
});



//decodeURIcomponent()
//encodeURIcomponent()