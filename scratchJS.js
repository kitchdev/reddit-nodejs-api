 getAllPosts: function(options, callback) {
      // In case we are called without an options parameter, shift all the parameters manually
      if (!callback) {
        callback = options;
        options = {};
      }
      var limit = options.numPerPage || 25; // if options.numPerPage is "falsy" then use 25
      var offset = (options.page || 0) * limit;
      
      
      
      
      conn.query(`
         
         SELECT 
          users.id AS users_id,
          users.username AS users_username,
          users.createdOn AS users_createdOn,
          users.updatedOn AS users_updatedOn,
          subreddits.id AS subreddits_id,
          subreddits.name AS subreddits_name,
          subreddits.description AS subreddits_description,
          subreddits.createdAt AS subreddits_createdAt,
          subreddits.updatedAt AS subreddits_updatedAt,
          votes.postId AS votes_postId,
          votes.userId AS votes_userId,
          votes.vote AS votes_vote,
          votes.createdAt AS votes_createdAt
          FROM posts
          JOIN users ON posts.userId = users.id
          LEFT JOIN subreddits ON posts.subredditId = subreddits.id
          LEFT JOIN votes ON posts.id = votes.postId
          ORDER BY posts.createdAt DESC
          LIMIT ? OFFSET ? `
        , [limit, offset],
        function(err, results) {
          if (err) {
            callback(err);
          }
          else {
            callback(null, results);
          }
        }
      );
    },
    
    
    // numUpvotes < numDownvotes ? totalVotes * (numUpvotes / numDownvotes) : totalVotes * (numDownvotes / numUpvotes)
    
    
    
     getAllPosts: function(options, callback) {
      // In case we are called without an options parameter, shift all the parameters manually
      if (!callback) {
        callback = options;
        options = {};
      }
      var limit = options.numPerPage || 25; // if options.numPerPage is "falsy" then use 25
      var offset = (options.page || 0) * limit;
      
      conn.query(`
         SELECT *
          FROM posts
          INNER JOIN (SELECT users.id AS uid, users.username, users.createdOn, users.updatedOn from users) as user
          ON posts.userId = user.uid
          LEFT JOIN (SELECT subreddits.id As sid,
          subreddits.name, subreddits.description,
          subreddits.createdAt,
          subreddits.updatedAt from subreddits) as sub
          ON posts.subredditId = sub.sid
          LEFT JOIN (SELECT votes.postId as post_id, 
          votes.userId as user_id, sum(votes.vote) as voteScore,
          votes.createdAt as vote_created from votes) as voted
          ON posts.id = voted.post_Id
          ORDER BY posts.createdAt DESC
          LIMIT ? OFFSET ?`
        , [limit, offset],
        function(err, results) {
          if (err) {
            callback(err);
          }
          else {
            callback(null, results);
          }
        }
      );
    },
    
    
    
    
        // else{
//       var htmlresult = (`
//   <div id="contents">
//   <h1>REDDIT</h1>
//     <h5>the front page of the internet</h5>
//     <ul class="contents-list">`);
    
//     for(var i = 0; i < 5; i++){
//       htmlresult +=
//         `<li class="${result[i].id}">
//         <h2 class="${result[i].subreddit_name}">
//         <a href="${result[i].posts_url}">${result[i].posts_title}</a>
//       </h2>
//       <p>${result[i].users_username}</p>`}
  
//       var htmlEnd = (
//   ` </li>
//   </ul>
// </div>`);
//       }
//       console.log(result);


function checkLogin(user, pass, cb) {
  conn.query('SELECT * FROM users WHERE username = ?', [user], function(err, result) {
    // check for errors, then...
    if (result.length === 0) {
      callback(new Error('username or password incorrect')); // in this case the user does not exists
    }
    else {
      var user = result[0];
      var actualHashedPassword = user.password;
      bcrypt.compare(pass, actualHashedPassword, function(err, result) {
        if(result === true) { // let's be extra safe here
          callback(null, user);
        }
        else {
          callback(new Error('username or password incorrect')); // in this case the password is wrong, but we reply with the same error
        }
      });
    }
  });
}

