const express = require('express');
const router = express.Router();

const {redisClient} = require('../../redisClient')

//imports
//var config = require('../../config/settings');
var kafka = require('../kafka/client');
//var jwt = require('jsonwebtoken');
//const passport = require('../../config/passport');
//var requireAuth = passport.authenticate('jwt', { session: false });

//const upload = require('../../service');
require('dotenv').config()

var aws = require('aws-sdk');
var multer = require('multer');
var multerS3 = require('multer-s3');
const uuidv4 = require('uuid/v4');
const path = require('path');

var s3 = new aws.S3({
    secretAccessKey: 'X19a/52Dm2VeHosnm+nBPelThchLyfG0kaax0FlC',
    accessKeyId: 'AKIA2MHADI4IZQ5E5M7B',
    region: "us-east-2"
});

var upload = multer({
    storage: multerS3({
        s3: s3,
        bucket: 'twitter-g12-bucket',
        acl: 'public-read',
        key: function (req, file, cb) {
            console.log("in multer...");
            console.log(file)
            const newFilename = `${uuidv4()}${path.extname(file.originalname)}`
            console.log("new file name:");
            console.log(newFilename);
            cb(null, newFilename);
        }
    })
});

router.post('/writeATweet',  upload.single('tweetImages'), function (req, res) {
    console.log("Inside write a tweet");
    console.log("Requestbody is ::");
    console.log(req.body);
    let {userFullName, username, tweetText}  = req.body;
    console.log("ref files..");
    console.log(req.file);
    let media = [];
    if(req.file){
      let tweetImage = '';
      tweetImage = req.file.key;
      media.push(tweetImage);
    }
    
    let currTimeStamp = Date.now();
    let tweetDetails =  {userFullName, username, tweetText, isRetweet : 'false', 'actualTweetId' : '', media, createdAt : currTimeStamp} ;
    kafka.make_request('tweetTopics',{'path':'writeATweet', 'tweetDetails' : tweetDetails}, function(err,result){
      var responseObj = {
        status : false,
        message :""
      };
      if (err) {
        console.log(err);
        res.status(500).json({ message: 'Database is not responding!!!' });
      }
      else if (result.status === 200)
      {
        console.log('tweet is added successfully!');
        responseObj.status = true;
        responseObj.message = result.message;
        redisClient.del("tweets_"+username);
        res.status(200).json(responseObj);
      } else if (result.status === 401){
        console.log('tweet cannot be  added!!');
        responseObj.status = false;
        responseObj.message = 'tweet cannot be added!!';
        res.status(200).json(responseObj);
      }
    });
});

router.post('/getUserTweets', function(req, res){
  let {userId} = req.body;
  console.log("in getUserTweets");
  console.log(req.body);
  try {
    let redisKey = "tweets_" + userId;
    redisClient.get(redisKey, async function(err, tweets) {
      if(err){
        console.log(err);
        res.status(400).json({status:400, message : "Error at server side!"});
      } else if(tweets){
        console.log("tweets cached in redis!!");
        res.status(200).json({message: tweets});
      } else {
        console.log("tweets not cached in redis!!");
        kafka.make_request('tweetTopics',{'path':'getUserTweets', userId}, function(err,result){
          var responseObj = {
            status : false,
            message :""
          };
          let status = 200;
          if (err) {
            console.log(err);
            res.status(500).json({ message: 'Database is not responding!!!' });
          }
          else if (result.status === 200)
          {
            //console.log('tweets returned!');
            redisClient.set(redisKey, JSON.stringify(result), function(error, response){
              if(error){
                console.log(error);
                status = 400;
              } else if(response){
                responseObj.status = true;
                responseObj.message = result.message;
                console.log("tweets set to cache in redis!!");
                redisClient.expire(redisKey, 100);
              } else{
                responseObj.status = false;
                responseObj.message = result.message;
              }
              res.status(status).json(responseObj);
            });
          } else if (result.status === 401){
            console.log('tweets cannot be returned!');
            responseObj.status = false;
            responseObj.message = 'tweet cannot be added!!';
            res.status(200).json(responseObj);
          }
        });

      }
    });
  } catch(e){
    console.log(e);
    res.status(500).json({ message: 'Error at server side!!!' });
  }
});

router.post('/likeATweet', function(req, res){
  let {userId, tweetId} = req.body;
  kafka.make_request('tweetTopics',{'path':'likeATweet', userId, tweetId}, function(err,result){
    var responseObj = {
      status : false,
      message :""
    };
    let status = 200;
    if (err) {
      console.log(err);
      status = 500;
      responseObj.message = 'Database is not responding!!!';
    }
    else if (result.status === 200)
    {
      console.log('Added like successfully!');
      responseObj.status = true;
      responseObj.message = result.message;
    } else if (result.status === 401){
      console.log('Like cannot be  added to the tweet!!');
      responseObj.status = false;
      responseObj.message = result.message;
    }
    res.status(status).json(responseObj);
  });

});

router.post('/unlikeATweet', function(req, res){
  let {userId, tweetId} = req.body;
  kafka.make_request('tweetTopics',{'path':'unlikeATweet', userId, tweetId}, function(err,result){
    var responseObj = {
      status : false,
      message :""
    };
    let status = 200;
    if (err) {
      console.log(err);
      status = 500;
      responseObj.message = 'Database is not responding!!!';
    }
    else if (result.status === 200)
    {
      console.log('Unliked successfully!');
      responseObj.status = true;
      responseObj.message = result.message;
    } else if (result.status === 401){
      console.log('Unlike cannot be  done to the tweet!!');
      responseObj.status = false;
      responseObj.message = result.message;
    }
    res.status(status).json(responseObj);
  });

});


router.post('/replyATweet', function(req, res){
  let {userId, tweetId, replyText} = req.body;
  console.log("in replyATweet..");
  console.log(req.body);
  kafka.make_request('tweetTopics',{'path':'replyATweet', userId, tweetId, replyText}, function(err,result){
    var responseObj = {
      status : false,
      message :""
    };
    let status = 200;
    if (err) {
      console.log(err);
      status = 500;
      responseObj.message = 'Database is not responding!!!';
    }
    else if (result.status === 200)
    {
      console.log('Added reply successfully!');
      responseObj.status = true;
      responseObj.message = result.message;
      //res.status(200).json(responseObj);
    } else if (result.status === 401){
      console.log('reply cannot be  added to the tweet!!');
      responseObj.status = false;
      responseObj.message = result.message;
    }
    res.status(status).json(responseObj);
  });
});

router.post('/getDashboardTweets', function(req, res){
  let {username} = req.body;
  //get followers list  from local storage
  kafka.make_request('tweetTopics', {'path':'getDashboardTweets', username}, function(err,result){
    var responseObj = {
      status : false,
      message :""
    };
    let status = 200;
    if (err) {
      console.log(err);
      status = 500;
      responseObj.message = 'Database is not responding!!!';
    }
    else if (result.status === 200)
    {
      console.log('Tweets returned successfully!');
      responseObj.status = true;
      responseObj.message = result.message;
      //res.status(200).json(responseObj);
    } else if (result.status === 401){
      console.log('Tweets cannot be returned!!');
      responseObj.status = false;
      responseObj.message = result.message;
    }
    res.status(status).json(responseObj);
  });
});

router.post('/bookmarkATweet', function(req, res){
  let {userId, tweetId} = req.body;
  kafka.make_request('tweetTopics', {'path':'bookmarkATweet', tweetId, userId}, function(err,result){
    var responseObj = {
      status : false,
      message :""
    };
    let status = 200;
    if (err) {
      console.log(err);
      status = 500;
      responseObj.message = 'Database is not responding!!!';
    }
    else if (result.status === 200)
    {
      console.log('Tweets bookmarked successfully!');
      responseObj.status = true;
      responseObj.message = result.message;
      //res.status(200).json(responseObj);
    } else if (result.status === 401){
      console.log('Tweets cannot be bookmarked!!');
      responseObj.status = false;
      responseObj.message = result.message;
    }
    res.status(status).json(responseObj);
  });
});

router.post('/unbookmarkATweet', function(req, res){
  let {userId, tweetId} = req.body;
  kafka.make_request('tweetTopics', {'path':'unbookmarkATweet', tweetId, userId}, function(err,result){
    var responseObj = {
      status : false,
      message :""
    };
    let status = 200;
    if (err) {
      console.log(err);
      status = 500;
      responseObj.message = 'Database is not responding!!!';
    }
    else if (result.status === 200)
    {
      console.log('bookmark removed successfully!');
      responseObj.status = true;
      responseObj.message = result.message;
      //res.status(200).json(responseObj);
    } else if (result.status === 401){
      console.log('bookmark cannot be removed!!');
      responseObj.status = false;
      responseObj.message = result.message;
    }
    res.status(status).json(responseObj);
  });
});


router.post('/retweetWithComment', function(req, res){
  let {userId, actualTweetId, tweetText} = req.body;
  let currTimeStamp = Date.now();
  let tweetDetails =  {userId, tweetText, isRetweet : 'true', actualTweetId, createdAt : currTimeStamp} ;
  kafka.make_request('tweetTopics', {'path':'writeATweet', tweetDetails}, function(err,result){
    var responseObj = {
      status : false,
      message :''
    };
    let status = 200;
    if (err) {
      console.log(err);
      status = 500;
      responseObj.message = 'Database is not responding!!!';
    }
    else if (result.status === 200)
    {
      console.log('Tweets bookmarked successfully!');
      responseObj.status = true;
      responseObj.message = result.message;
      //res.status(200).json(responseObj);
    } else if (result.status === 401){
      console.log('Tweets cannot be bookmarked!!');
      responseObj.status = false;
      responseObj.message = result.message;
    }
    res.status(status).json(responseObj);
  });
});

router.post('/retweetWithoutComment', function(req, res){
  let {userId, tweetId} = req.body;
  kafka.make_request('tweetTopics', {'path':'retweetWithoutComment', tweetId, userId}, function(err,result){
    var responseObj = {
      status : false,
      message :''
    };
    let status = 200;
    if (err) {
      console.log(err);
      status = 500;
      responseObj.message = 'Database is not responding!!!';
    }
    else if (result.status === 200)
    {
      console.log('Tweet retweeted successfully!');
      responseObj.status = true;
      responseObj.message = result.message;
      //res.status(200).json(responseObj);
    } else if (result.status === 401){
      console.log('Tweets cannot be retweeted!!');
      responseObj.status = false;
      responseObj.message = result.message;
    }
    res.status(status).json(responseObj);
  });
});




router.post('/deleteATweet', function(req, res){
  let {userId, tweetId} = req.body;
  //let tweetDetails =  {userId, tweetText, isRetweet : 'true', actualTweetId} ;
  kafka.make_request('tweetTopics', {'path':'deleteATweet', tweetId, userId}, function(err,result){
    var responseObj = {
      status : false,
      message :''
    };
    let status = 200;
    if (err) {
      console.log(err);
      status = 500;
      responseObj.message = 'Database is not responding!!!';
    }
    else if (result.status === 200)
    {
      console.log('Tweet deleted successfully!');
      responseObj.status = true;
      responseObj.message = result.message;
      //res.status(200).json(responseObj);
    } else if (result.status === 401){
      console.log('Tweets cannot be deleted!!');
      responseObj.status = false;
      responseObj.message = result.message;
    }
    res.status(status).json(responseObj);
  });
});


module.exports = router;