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

var reddit = require('./old-reddit');
var redditAPI = reddit(connection);

app.set('view engine', 'pug');

var cookieParser = require('cookie-parser');
app.use(cookieParser())

app.use(checkLoginToken);
app.use(bodyParser.urlencoded({ extended: false }));

app.use(morgan('dev'));
//ex1
// app.get('/', function (req, res) {
//   res.send('<h1>Hello World!</h1>');
// });

// ex2A
// app.get('/hello', function(request, response) {
//   var name = request.query.name || "World";
//   response.send("<h1>Hello " + name + "!</h1>");
// });
//ex2B
// app.get('/name/:name', function(request, response){
//   response.send('<h1>Hello ' + request.params.name + '!</h1>');
// })


// ex3
// app.get('/calculator/:operation', function(req, res){
  
  
//   var num1 = parseInt(req.query.num1);
//   var num2 = parseInt(req.query.num2);
 
//   var obj = {
//     "operator": req.params.operation,
//   "firstOperand": req.query.num1,
//   "secondOperand": req.query.num2
//   }
  
//   switch(req.params.operation){
//     case 'add':
//     obj.solution = num1 + num2;
//       break;
//     case 'sub':
//     obj.solution = num1 - num2;
//       break;
//     case 'div':
//       obj.solution = num1/num2;
//       break;
//     case 'mult':
//       obj.solution = num1*num2;
//       break;
//       default: 
//       obj.operation = ' ';
//         break;
//     }
//     if(obj.opertaion){
//       res.status(404).send({ error: 'EROROROROR' });
//     }
//     else{
//     res.send(`${JSON.stringify(obj)}`);
//     }
    
//   })
  
function checkLoginToken(request, response, next){
  if(request.cookies.SESSION){
    redditAPI.getUserFromSession(request.cookies.SESSION, function(err, user){
      if(err){response.status(401).send("whoops, something weird happened", {err})};
      
      if(user){ console.log(user)
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




//ex4

app.get('/', function(request, response){
  
  redditAPI.getAllPosts({numPerPage: 50}, function(err, result){
    if(err){
      response.status(500).send("oops something went wrong")
    }
   
    response.render('post-list', {posts: result});
  });
});



//ex6
var urlencodedParser = bodyParser.urlencoded({ extended: false })


app.post('/sortingMethod', urlencodedParser, function(request, response){
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

app.post('/sortingMethodHome', urlencodedParser, function(request, response){
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
        response.status(500).send("oopsies something went wrong")
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

app.post('/', urlencodedParser, function(request, response){
    redditAPI.checkLogin(request.body.username, request.body.password, function(err, user){
      
      if(err){
        console.log(err)
        response.status(400).send(err)  
        
      }
 
      else{
        redditAPI.createSession(user.id, function(err, token){
          if(err.code === 'ER_DUP_ENTRY'){
            response.redirect('/homepage')
          }
         else if(err && !err.code === 'ER_DUP_ENTRY'){
        response.status(400).send(err,"You've entered the incorrect username or password")
          }
          else{
            response.cookie('SESSION', token);
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
       if (!request.loggedInUser) {
         
    // HTTP status code 401 means Unauthorized
    response.redirect('/');
  }
  else{
    
    redditAPI.getAllPosts(0, function(err, result){
    if(err){
        
      response.status(500).send(err.code)
    }
    else{
       
    response.render('homepage', {posts: result});
    console.log(request.cookie)
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


// Boilerplate code to start up the web server
var server = app.listen(process.env.PORT, process.env.IP, function () {
  var host = server.address().address;
  var port = server.address().port;

  console.log('Example app listening at http://%s:%s', host, port);
});

app.get('/r/#{')

//decodeURIcomponent()
//encodeURIcomponent()