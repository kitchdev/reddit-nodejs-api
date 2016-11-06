var express = require('express');
var app = express();
// load the mysql library
var mysql = require('mysql');
var bodyParser = require('body-parser');
var morgan = require('morgan');


var connection = mysql.createConnection({
  host     : 'localhost',
  user     : 'kitchdev', // CHANGE THIS :)
  password : '',
  database: 'reddit_project'
});
   
   
var reddit = require('./test-reddit');


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
	
		if (request.cookies.SESSION) {
//			redditAPI.getUserFromSession(request.cookies.SESSION, function(err, userId){
			redditAPI.getUserFromSession("t5b4g3r3l4a1p4u523b5r121b3c2c5q3kz5es6s1m1u254dg2o5k6o2or1b3i6c483z225n1m5i51246t1k2z5x714l281g1q6t6l63126c346a69313q43243wt6b4k1rm472h1u4w5o5524w6d4z4i6c6b4h4p255f3l4p5t3x302l2b5c3j386s5n3y2q", function(err, userId){
      
			  if(userId){ 
	//			console.log(user, 'hey its me')
				request.loggedInUser = userId;
				  console.log(userId, "what does user look like")
	//			response.locals.user = user;
			  }
			  next();
			}); 
		}  else {
			// no cookie session
    		next();
  		}
	}


app.get('/', function(request, response){
	
   response.cookie('SESSION','t5b4g3r3l4a1p4u523b5r121b3c2c5q3kz5es6s1m1u254dg2o5k6o2or1b3i6c483z225n1m5i51246t1k2z5x714l281g1q6t6l63126c346a69313q43243wt6b4k1rm472h1u4w5o5524w6d4z4i6c6b4h4p255f3l4p5t3x302l2b5c3j386s5n3y2q');
	console.log('Cookie is set');
	console.log(request.cookies.SESSION, 'cookies');
  redditAPI.getAllPosts({numPerPage: 50}, function(err, result){
    if(err){
      response.status(500).send(err.message)
    }
   else {
    response.render('post-list', {posts: result});
   }
   });
});



app.post('/sortingMethod', function(request, response){
  if (!request.body){ return response.sendStatus(400)}
  else{
    
    redditAPI.getAllPosts({sortingMethod: request.body.sortingMethod} ,function(err,result){
      if(err){
        response.status(500).send(err.message)
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
          if(err.code === 'ER_DUP_ENTRY'){
            console.log("id in session exists, redirect to /homepage")
            response.cookie('SESSION', token);
			console.log(request.cookies.SESSION, "cookies in browser")
            console.log(request.loggedInUser, "should be the loggedInUser")
            response.redirect('/homepage')
          }
         else if(err && !err.code === 'ER_DUP_ENTRY'){
        response.status(400).send(err.message,"You've entered the incorrect username or password")
          }
          else{
            
            response.cookie('SESSION', token);
			  console.log(request.cookies.SESSION, "< should be cookies");
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

      console.log(request.cookies, "where is my cookie")
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
  
  redditAPI.signout(request.loggedInUser, function(err, result) {
    if(err){
      response.send(err.message)
      }
    else{
    response.clearCookie('SESSION');
		console.log('logged out')
    response.redirect('/');
    }
  });
});

app.get('/testSignout', function(request, response) {
	response.clearCookie('SESSION');
		console.log('logged out')
    response.send('you have signed out your cookie');
})








// Boilerplate code to start up the web server
var server = app.listen(process.env.PORT, process.env.IP, function () {
  var host = server.address().address;
  var port = server.address().port;

  console.log('Example app listening at http://%s:%s', host, port);
});