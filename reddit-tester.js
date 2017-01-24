// load the mysql library
var mysql = require('mysql');

// create a connection to our Cloud9 server
var connection = mysql.createConnection({
  host     : 'localhost',
  user     : 'kitchdev', // CHANGE THIS :)
  password : '',
  database: 'reddit_project'
});

var reddit = require('./reddit');
var redditAPI = reddit(connection);



redditAPI.createUser({
  username: 'dipper',
  password: 'xxx'
}, function(err, user) {
  if (err) {
    console.log(err);
  }
  else {
      redditAPI.createPost(1,{
      title: 'peepeeman',
      url: 'https://www.reddit.com',
      userId: 12
    }, function(err, post) {
      if (err) {
        console.log(err);
      }
      else {
        console.log(post);
      }
      
    });
  }
});



// redditAPI.getAllPosts(25, function(err, result){
//   if(err)console.log(err.stack)
//   else{
//     var newResult = result.map(function(item){
//       return { 
//         id: item.id,
//         title: item.title,
//         url: item.url,
//         userdId: item.url,
//         createdAt: item.createdAt,
//         updatedAt: item.updatedAt,
//         userId: item.uid,
//         user: {
//           id: item.uid,
//           createdAt: item.createdOn,
//           updatedOn: item.updatedOn
//         }
//       }
//   });
//   console.log(newResult);
//   }
//   connection.end();
// })


// redditAPI.getAllPostsForUser(1,25, function(err, result){
//   if(err)console.log(err.stack)
//   else{
//     var newResult = result.map(function(item){
//       return { 
        
//         userId: item.uid,
//         username: item.username,
//         post: {
//           id: item.id,
//           title: item.title,
//           url: item.url,
//           userdId: item.url,
//           createdAt: item.createdAt,
//           updatedAt: item.updatedAt,
//           userId: item.uid
//         }
        
//       }
//   });
//   console.log(newResult);
    
//   }
//   connection.end();
// })

// redditAPI.getSinglePost(6, function(err, result){
//   if(err)console.log(err.stack);
//   else{
//     var actualpost = result.map(function(item){
//       return { id: item.id,
//       post: {
//         id: item.id,
//           title: item.title,
//           url: item.url,
//           userdId: item.url,
//           createdAt: item.createdAt,
//           updatedAt: item.updatedAt,
//           userId: item.uid
//         }
//       }
//     })
//     console.log(actualpost);
//   }
//   connection.end();
// })

    // redditAPI.createSubreddit({
    //   name: 'People and places',
    //   description: 'domino'
    // }, function(err, post) {
    //   if (err) {
    //     console.log(err);
    //   }
    //   else {
    //     console.log(post);
    //   }
    //   connection.end()
    // });
    

//   redditAPI.getAllSubreddits(function(err, result){

//   if(err)console.log(err.stack)
//   else{
    
    
//     var newResult = result.map(function(item){
//       return { 
//         id: item.id,
//         name: item.name,
//         description: item.description,
//         createdAt: item.createdAt,
//         updatedAt: item.updatedAt,
//       }
//     });
    
//     console.log(newResult);
    

//   }
//   connection.end();
// })  

redditAPI.getAllPosts({sortingMethod: ''}, function(err, result){
  if(err)console.log(err.stack)
  else{
    var newResult = result.map(function(item){
      return { 
        id: item.posts_id,
        title: item.posts_title,
        url: item.posts_url,
        userdId: item.posts_userId,
        createdAt: item.posts_createdAt,
        updatedAt: item.posts_updatedAt,
        subredditId: item.posts_subredditId,
        postScore: item.voteTotal,
        numVotes: item.totalVotes,
        numUpvotes: item.numUpvotes,
        numDownvotes: item.numDownvotes,
        hotnessRanking: item.hotnessRanking,
        user: {
          id: item.users_id,
          username: item.users_username,
          createdOn: item.users_createdOn,
          updatedOn: item.users_updatedOn
        },
        subreddit: {
        id: item.subreddits_id,
        name: item.subreddits_name,
        description: item.subreddits_description,
        createdAt: item.subreddits_createdAt,
        updatedAt: item.subreddits_updatedAt
        }
      }
  });
  console.log(newResult);
  }
  connection.end();
})


// redditAPI.createOrUpdateVote(
// { 
// postId:  13,
// userId: 1,
// vote: -1
// }
//   ,
//   function(err, result){
//   if(err){
//     console.log(err.stack)
//   }
//   else{
//       console.log(JSON.stringify(result, null, 4));   
//   }
//   connection.end();
// })

// redditAPI.createOrUpdateVote(
// { 
// postId:  14,
// userId: 1,
// vote: -1
// }
//   ,
//   function(err, result){
//   if(err){
//     console.log(err.stack)
//   }
//   else{
//       console.log(JSON.stringify(result, null, 4));   
//   }
//   connection.end();
// })

