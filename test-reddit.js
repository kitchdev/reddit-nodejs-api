var bcrypt = require('bcrypt');
var HASH_ROUNDS = 10;
//require('longjohn');
var secureRandom = require('secure-random');

module.exports = function RedditAPI(conn) {
  var API =  {
    createUser: function(user, callback) {
      
      // first we have to hash the password...
      bcrypt.hash(user.password, HASH_ROUNDS, function(err, hashedPassword) {
        if (err) {
          callback(err);
        }
        else {
          conn.query(
            'INSERT INTO users (username,password, createdOn) VALUES (?, ?, ?)', [user.username, hashedPassword, new Date()],
            function(err, result) {
              if (err) {
                /*
                There can be many reasons why a MySQL query could fail. While many of
                them are unknown, there's a particular error about unique usernames
                which we can be more explicit about!
                */
                if (err.code === 'ER_DUP_ENTRY') {
                  callback(new Error('A user with this username already exists'));
                }
                else {
                  callback(err);
                }
              }
              else {
                /*
                Here we are INSERTing data, so the only useful thing we get back
                is the ID of the newly inserted row. Let's use it to find the user
                and return it
                */
                conn.query(
                  'SELECT id, username, createdOn, updatedOn FROM users WHERE id = ?', [result.insertId],
                  function(err, result) {
                    if (err) {
                      callback(err);
                    }
                    else {
                      /*
                      Finally! Here's what we did so far:
                      1. Hash the user's password
                      2. Insert the user in the DB
                      3a. If the insert fails, report the error to the caller
                      3b. If the insert succeeds, re-fetch the user from the DB
                      4. If the re-fetch succeeds, return the object to the caller
                      */
                        callback(null, result[0]);
                    }
                  }
                );
              }
            }
          );
        }
      });
    },
    
    createPost: function(subredditId, post, callback) {
      conn.query(
        'INSERT INTO posts (userId, title, url, createdAt, subredditId) VALUES (?, ?, ?, ?, ?)', [post.userId, post.title, post.url, new Date(), subredditId],
        function(err, result) {
          if (err) {
            console.log(err);
          }
          else {
            /*
            Post inserted successfully. Let's use the result.insertId to retrieve
            the post and send it to the caller!
            */
            conn.query(
              'SELECT id,title,url,userId, createdAt, updatedAt, subredditId FROM posts WHERE id = ?', [result.insertId],
              function(err, result) {
                if (err) {
                  callback(err);
                }
                else {
                  callback(null, result[0]);
                }
              }
            );
          }
        }
      );
    },
    
    getAllPosts: function(options, callback) {
      // In case we are called without an options parameter, shift all the parameters manually
      if (!callback) {
        callback = options;
        options = {};
      }
      var limit = options.numPerPage || 25; // if options.numPerPage is "falsy" then use 25
      var offset = (options.page || 0) * limit;
      var sortingMethod = '';
      
      switch(options.sortingMethod){
        case 'numUpvotes':
          sortingMethod = `ORDER BY numUpvotes DESC`;
          break;
        case 'numDownvotes':
          sortingMethod = 'ORDER BY numDownvotes DESC'
          break;
        case 'topRanking':
          sortingMethod = `ORDER BY topRanking DESC`;
          break;
        case 'totalVotes':
          sortingMethod = `ORDER BY totalVotes DESC`;
          break;
        case 'hotnessRanking':
          sortingMethod = `ORDER BY hotnessRanking DESC`;
          break;
        case 'Newest':
          sortingMethod = 'ORDER BY Newest DESC';
          break;
        case 'latestFive':
          sortingMethod = 'ORDER BY latestFive DESC LIMIT 5';
          break;
        default: 
        break;
      }
      
      
      conn.query(`
         SELECT 
          posts.id AS posts_id,
          posts.title AS posts_title,
          posts.url AS posts_url,
          posts.userId AS posts_userId,
          posts.createdAt AS posts_createdAt,
          posts.updatedAt AS posts_updatedAt,
          posts.subredditId AS posts_subredditId,
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
          votes.createdAt AS votes_createdAt,
          sum(votes.vote) AS voteTotal,
          sum(votes.vote) AS topRanking,
          count(votes.vote) AS totalVotes,
          (SELECT count(votes.vote) from votes where votes.vote = 1 AND votes.postId = posts.id) AS numUpvotes,
          (SELECT count(votes.vote) from votes where votes.vote = -1 AND votes.postId = posts.id) AS numDownvotes,
          sum(votes.vote)/(datediff(curDate(), posts.createdAt)) AS hotnessRanking,
          posts.createdAt AS Newest,
          posts.createdAt AS latestFive
          FROM posts
          JOIN users ON posts.userId = users.id
          LEFT JOIN subreddits ON posts.subredditId = subreddits.id
          LEFT JOIN votes ON posts.id = votes.postId
          ${options.subreddit ? 'WHERE subreddits.name =  ?' : ''}
          GROUP BY posts.id
          ${sortingMethod ? sortingMethod : `ORDER BY posts.createdAt DESC`}
          LIMIT ? OFFSET ?`
        , options.subreddit ?  [options.subreddit, limit, offset]: [limit, offset],
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
    
    getAllPostsForUser: function(userId, options, callback) {
    
    if(!callback) {
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
        WHERE user.uid = ?
        ORDER BY posts.createdAt DESC
        LIMIT ? OFFSET ?`
        , [userId, limit, offset],
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
    
    getSinglePost: function(postId, callback) {
        
          
          conn.query(`
              SELECT *
            FROM posts
            INNER JOIN (SELECT users.id AS uid, users.username, users.createdOn, users.updatedOn from users) as user
            ON posts.userId = user.uid
            WHERE posts.id = ?
            ORDER BY posts.createdAt DESC`
            , [postId],
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
    
    createSubreddit: function(sub, callback){
          conn.query(
        'INSERT INTO subreddits (id, name, description, createdAt) VALUES (?, ?, ?, ?)', [sub.Id, sub.name, sub.description, new Date()],
        function(err, result) {
          if (err) {
            callback(err);
          }
          else {
            /*
            Post inserted successfully. Let's use the result.insertId to retrieve
            the post and send it to the caller!
            */
                  conn.query(
                  'SELECT id, name, description, createdAt, updatedAt FROM subreddits WHERE id = ?', [result.insertId],
                  function(err, result) {
                    if (err) {
                      callback(err);
                    }
                    else {
                      callback(null, result[0]);
                    }
                  }
                );
      
              }
            }
          );
        },
        
    getAllSubreddits: function(callback){
          conn.query(
            `SELECT 
            subreddits.id as subreddits_id,
            subreddits.name as subreddits_name,
            subreddits.createdAt as subreddits_createdAt,
            subreddits.description as subreddits_description
            FROM subreddits 
            ORDER BY createdAt DESC`,
          function(err, result){
            if(err){
              callback(err);
            }
            else {
                callback(null, result);
              }
            }
          );
        },
        
    getSubredditContents: function(subreddit, sortingMethod, callback){
        function noSpace(str){
          return str.replace(/ /g, "")
        }
                switch(sortingMethod){
        case 'numUpvotes':
          sortingMethod = `ORDER BY numUpvotes DESC`;
          break;
        case 'numDownvotes':
          sortingMethod = 'ORDER BY numDownvotes DESC'
          break;
        case 'topRanking':
          sortingMethod = `ORDER BY topRanking DESC`;
          break;
        case 'totalVotes':
          sortingMethod = `ORDER BY totalVotes DESC`;
          break;
        case 'hotnessRanking':
          sortingMethod = `ORDER BY hotnessRanking DESC`;
          break;
        case 'Newest':
          sortingMethod = 'ORDER BY posts.createdAt DESC';
          break;
        case 'latestFive':
          sortingMethod = 'ORDER BY latestFive DESC LIMIT 5';
          break;
        default: 
        break;
      }
          conn.query(
            `select posts.id as posts_id,
            posts.title as posts_title, 
            posts.url as posts_url,
            posts.createdAt as posts_createdAt,
            posts.userId as posts_userId,
            posts.subredditId as posts_subredditId,
            users.username as users_username,
            votes.vote as votes_vote,
            (SELECT sum(votes.vote) from votes where votes.vote = 1 AND votes.postId = posts.id) AS voteTotal,
            subreddits.id as subreddits_id,
            subreddits.name As subreddits_name,
            subreddits.createdAt as subreddits_createdAt,
            subreddits.description as subreddits_description,
            sum(votes.vote) AS voteTotal
            from posts
            JOIN subreddits ON posts.subredditId = subreddits.id
            JOIN users On posts.userId = users.id
            LEFT JOIN votes ON posts.id = votes.postId
            WHERE subreddits.name = ?
            GROUP BY posts.id
          ${sortingMethod ? sortingMethod : `ORDER BY posts.createdAt DESC`}`
            , [subreddit, sortingMethod],
            
          function(err, result){
            if(err){
              callback(err);
            }
            else {
              
                callback(null, result.map(function(item){
                  return {
                    page: (item.posts_title).replace(/ /g, ""),
                    title: item.posts_title,
                    submitted_by: item.users_username,
                    score: item.voteTotal
                  }
                }));
              }
            })
    },
    
    createOrUpdateVote: function(vote, callback){
          if(vote.vote === 1 || vote.vote === 0 || vote.vote === -1){
            conn.query('INSERT INTO `votes` SET `postId`=?, `userId`=?, `vote`=? ON DUPLICATE KEY UPDATE `vote`=?',[vote.postId, vote.userId, vote.vote, vote.vote],
              function(err, result){
                if(err){
                 callback(err)
                }
                else {
                    callback(null, result[0]);
                  }
                }
               )
              }
          else{
            console.log('vote', vote);

          callback(new Error('you must create an upvote or downvote'));
          }
        },
    
    checkLogin: function(user, pass, callback) {
        conn.query('SELECT * FROM users WHERE username = ?', [user], function(err, result) {
          if(err){callback(err)}
          else{
          // check for errors, then...
          if (result.length === 0) {
            callback(new Error('username or password incorrect')); // in this case the user does not exists
          }
          else {
            var user = result[0];
            var actualHashedPassword = user.password;
            bcrypt.compare(pass, actualHashedPassword, function(err, result) {
              if(err){ callback(err, "there's been an error")}
              if(result === true) { // let's be extra safe here
                callback(null, user);
              }
              else {
                callback(new Error('username or password incorrect')); // in this case the password is wrong, but we reply with the same error
                }
              
            });
          }
          }
        });
      },
      
    createSessionToken: function(){
        return secureRandom.randomArray(100).map(code => code.toString(36)).join('');
      },
    
    createSession: function(userid, callback){
        var token = API.createSessionToken();
        conn.query(`INSERT INTO sessions SET id =?, token= ?`, [userid, token], function(err, result){
          if(err.code === 'ER_DUP_ENTRY') {
            console.log(err,"this is where i am")
            callback(err);
            console.log(token, 'Error: dup entry, token from create session')
            }
            else if(err && !err.code === 'ER_DUP_ENTRY'){	
              callback(err);
            }
            else{
              console.log(token,"please get here")
              callback(null, token);
            }
        })
      },
    
    getUserFromSession: function(cookies, callback){
        conn.query( `SELECT sessions.id,
                    sessions.token as sessionToken
                    from sessions
                    WHERE token = ?
                    `, [cookies], function(err, result){
                      if(err){
                        callback(err)
                      }
                      else{
                      	  console.log("what does it look like",result);
                          var userId = result[0]
                        console.log(userId, "user ID dude")
                        callback(null, userId);
//						  callback(null,result)
                    
                        
                      }
                      
                    })
                },
      
    signout: function(userid, callback)  { 
    
      conn.query(`DELETE FROM sessions WHERE id = ?`, [userid], function(err, result) {
          if(err){
            callback(err)
          }
          else{
            callback(null, result)
          }
      });
    }  
      
    };
    return API;
  };
      