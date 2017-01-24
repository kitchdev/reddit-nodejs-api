 SELECT posts.id, posts.title, posts.url, posts.userId, posts.createdAt, posts.updatedAt,
 users.id, users.username, users.createdAt, users.updatedAt
 FROM posts
 JOIN users ON(posts.userId = users.id)
 ORDER BY posts.createdAt DESC
 LIMIT ? OFFSET ?
 
 
ALTER TABLE users
  CHANGE COLUMN users.createdAt users.createdOn datetime;
  
  ALTER TABLE users
  UPDATE COLUMN updatedAt TO updatedOn datetime;
  
  
  SELECT user.username
  FROM posts
  INNER JOIN (SELECT users.id AS uid, users.username, users.createdOn, users.updatedOn from users) as user
  ON posts.userId = user.uid
  ORDER BY posts.createdAt DESC
  LIMIT ? OFFSET 
  
  
  CREATE TABLE subreddits
  (
  id int auto_increment primary key,
  name varchar(30) unique key,
  description varchar(200),
  createdAt datetime,
  modifiedAt datetime
  )
  
ALTER TABLE posts
ADD FOREIGN KEY (subredditId)           
REFERENCES subreddits(id)


SELECT *
FROM subreddits
INNER JOIN (SELECT users.id AS uid, users.username, users.createdOn, users.updatedOn from users) as user
ON posts.userId = user.uid
ORDER BY posts.createdAt DESC
LIMIT ? OFFSET ?



SELECT *
FROM posts
INNER JOIN (SELECT users.id AS uid, users.username, users.createdOn, users.updatedOn from users) as user
ON posts.userId = user.uid
LEFT JOIN (SELECT subreddits.id, subreddits.name, subreddits.description, subreddits.createdAt, subreddits.updatedAt from subreddits) as sub
ON posts.subredditId = sub.id
ORDER BY posts.createdAt DESC
LIMIT ? OFFSET ?

DELETE FROM 
posts 
WHERE subredditId = null;

     select * from posts
     join (select * from subreddits) as sub
     on posts.subredditId = sub.id
     join (select * from users) as user
     on posts.userId = user.id
     order by posts.createdAt;
     
     
     UPDATE posts
    SET userId = 8
    WHERE userId IS null;
     
     
     ALTER TABLE users CHANGE COLUMN users.updatedOn users.updatedOn datetime NOT NULL;
     
     
     
     CREATE TABLE votes(
     postId int,
     userId int,
     vote TINYINT,
     crearedAt datetime,
     updatedAt datetime,
     PRIMARY KEY (postId, userId),
     foreign key(postId) references posts(id),
     foreign key(userId) references users(id)
     );
     
     alter table votes
     modify column vote tinyint not null;
     
     
     
    --sum of votes for posts
    
    SELECT sum(vote) as voteScore
    from votes 
     
     
     UPDATE users
SET username = 'johnny Smith'
WHERE username = 'hello23';


update posts
set userId = 12
where userId is NULL;

CREATE TABLE sessions(
userid int PRIMARY KEY,
token int UNIQUE KEY,
 FOREIGN KEY (userid) references users (id)
)

ALTER TABLE sessions
ADD COLUMN username varchar(300)
FOREIGN KEY (username) references users (id);


SELECT users.id,
users.username,
users.password,
users.createdOn,
users.updatedOn,
sessions.userid,
sessions.token
from users
LEFT JOIN sessions
ON sessions.userid = users.id;


alter table votes
add column createdAt now() NOT NULL;


select posts.id,
posts.title, 
posts.url,
posts.createdAt,
posts.userId,
users.username
from posts
JOIN users On posts.userId = users.id;


DELETE FROM posts
LEFT OUTER JOIN (
   SELECT MIN(posts.title) as title, Col1, Col2, Col3 
   FROM posts
   GROUP BY Col1, Col2, Col3
) as posts ON
   posts.RowId = KeepRows.RowId
WHERE
   KeepRows.RowId IS NULL
   
   
   DELETE FROM posts WHERE title NOT IN (SELECT MIN(title) FROM posts GROUP BY id, title, url)

| sessions | CREATE TABLE `sessions` (
  `userid` int(11) NOT NULL,
  `token` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`userid`),
  UNIQUE KEY `token` (`token`),
  CONSTRAINT `sessions_ibfk_1` FOREIGN KEY (`userid`) REFERENCES `users` (`id`)
  
  
  
       CREATE TABLE votes(
     postId int,
     userId int,
     vote TINYINT,
     crearedAt datetime,
     updatedAt datetime,
     PRIMARY KEY (postId, userId),
     foreign key(postId) references posts(id),
     foreign key(userId) references users(id)
     );
     
  create table
  sessions(id int PRIMARY key not null auto_increment,
  userid int not null,
  token varchar(255),
  UNIQUE KEY(token),
  foreign key(userid) references users(id));
  
  
  posts | CREATE TABLE `posts` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `title` varchar(300) DEFAULT NULL,
  `url` varchar(2000) DEFAULT NULL,
  `userId` int(11) DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  `subredditId` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `userId` (`userId`),
  KEY `subredditId` (`subredditId`),
  CONSTRAINT `posts_ibfk_1` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `posts_ibfk_2` FOREIGN KEY (`subredditId`) REFERENCES `subreddits` (`id`)
  
  
  users | CREATE TABLE `users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `username` varchar(50) NOT NULL,
  `password` varchar(60) NOT NULL,
  `createdOn` datetime DEFAULT NULL,
  `updatedOn` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`)
  
  
  | subreddits | CREATE TABLE `subreddits` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(30) DEFAULT NULL,
  `description` varchar(200) DEFAULT NULL,
  `createdAt` datetime DEFAULT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`)
  
  
  | votes | CREATE TABLE `votes` (
  `postId` int(11) NOT NULL DEFAULT '0',
  `userId` int(11) NOT NULL DEFAULT '0',
  `vote` tinyint(4) NOT NULL,
  `updatedAt` datetime NOT NULL,
  `createdAt` datetime NOT NULL,
  PRIMARY KEY (`postId`,`userId`),
  KEY `userId` (`userId`),
  CONSTRAINT `votes_ibfk_1` FOREIGN KEY (`postId`) REFERENCES `posts` (`id`),
  CONSTRAINT `votes_ibfk_2` FOREIGN KEY (`userId`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1 |


| sessions | CREATE TABLE `sessions` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `userid` int(11) NOT NULL,
  `token` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `token` (`token`),
  KEY `userid` (`userid`),
  CONSTRAINT `sessions_ibfk_1` FOREIGN KEY (`userid`) REFERENCES `users` (`id`)
  
  
  INSERT INTO `sessions` (`id`, `token`) VALUES
(49, 't5b4g3r3l4a1p4u523b5r121b3c2c5q3kz5es6s1m1u254dg2o5k6o2or1b3i6c483z225n1m5i51246t1k2z5x714l281g1q6t6l63126c346a69313q43243wt6b4k1rm472h1u4w5o5524w6d4z4i6c6b4h4p255f3l4p5t3x302l2b5c3j386s5n3y2q'),
(1, '6e3h3b1c356w5k65w686s2i1w5b1z1l2s2u6i4w126d1m1m4i5l1l4il4s2d4g5fu601w20x3b767e6d422x2a393p3g4h1x2q181s3x41c574x1i3g3h636y6o1328g1i2z5hp42223ly67v562w1b6m2y385rr1h21s2jhr20472e2k5x3c46');