var express = require('express');
var app = express();
var request = require('request');
var sortJS = require("./js/sort.js");
var jsonfile = require('jsonfile');
var json = 'data.json';


var CLIENT_ID = '16e4d098754ab5be4fcc',
    CLIENT_SECRET = '4e09d95dd6619fd7e9d066521eaeda3d071184d6';

var oauth2 = require('simple-oauth2')({
  clientID: CLIENT_ID,
  clientSecret: CLIENT_SECRET,
  site: 'https://github.com/login',
  tokenPath: '/oauth/access_token',
  authorizationPath: '/oauth/authorize'
});

// Authorization uri definition
var authorization_uri = oauth2.authCode.authorizeURL({
  redirect_uri: 'http://localhost:3000/callback',
  scope: 'notifications',
  state: '3(#0/!~'
});

// Initial page redirecting to Github
app.get('/auth', function (req, res) {
    res.redirect(authorization_uri);
});

// Callback service parsing the authorization token and asking for the access token
app.get('/callback', function (req, res) {
  var code = req.query.code;
  oauth2.authCode.getToken({
    code: code,
    redirect_uri: 'http://localhost:3000/callback'
  }, saveTokenandGetTutors);

  function saveTokenandGetTutors(error, result) {
    if (error) { console.log('Access Token Error', error.message); }
    token = oauth2.accessToken.create(result);
    res.redirect('/tutors');
    console.log("authorization successful");
  }


});

app.get('/tutors', function(req, res){
  getFollowers();
});


var getFollowers = function(){

    var actualToken = oauth2.accessToken.token.split('&')[0].split('=')[1];
    requestHeaders =
    {
        "Authorization" : "token "+ actualToken,
        "User-Agent": "samkho10"
    };
      request({url : 'https://api.github.com/user/following',headers: requestHeaders}, function (error, response, follower_data)
        {getRepos(follower_data);
          console.log("got followers");
        }
      );
};

var getRepos = function(data){
  var tutorJSON = [];
  var followerJSON = JSON.parse(data);
  console.log(followerJSON);
  for(i=0; i<followerJSON.length; i++){ //FOR EACH FOLLOWER
    (function(i){
      all_languages = []; //INITIALIZE EMPTY LANGUAGES ARRAY
      request({url:followerJSON[i].repos_url, headers:requestHeaders},function(error, response, repo_data){
        console.log("got repos");
        repo_dataJSON = JSON.parse(repo_data);
        // console.log(repo_dataJSON);
        for(k=0; k<repo_dataJSON.length; k++){ //FOR EACH REPO
          (function(k){
             request({url:repo_dataJSON[k].languages_url, headers:requestHeaders},function(error, response, language_data){
              {
                getLanguages(language_data);
                if(k==repo_dataJSON.length-1)
                {
                  var userJSON = {};
                  var username = "username";
                  var languages = "languages";
                  userJSON[username] = followerJSON[i].login;
                  userJSON[languages] = sortJS.sort(all_languages);
                  tutorJSON.push(userJSON);
                  console.log("sorted all languages");
                  // console.log(tutorJSON);
                  if(i==followerJSON.length-1){
                    console.log(followerJSON.length);
                    console.log(tutorJSON);
                    jsonfile.writeFile(json, tutorJSON, function(err){
                      console.error(err);
                      console.log("wrote data to json file!");
                    });
                    // res.render(__dirname + '/index.jade', {
                    //   following: tutorJSON,
                    // });
                   }

                }
              }
            });
          })(k);
        }
      })
    })(i);
  }
};

var getLanguages = function(language_data){
  // console.log("calling getlanguages function");
  var language_dataJSON = JSON.parse(language_data);
  // console.log(language_dataJSON);
  var lang = Object.keys(language_dataJSON);
  if(lang!=null){
    for(b=0; b<lang.length; b++)
    {all_languages.push(lang[b]);}
    console.log("pushed to languages array");
    //PUSH LANGUAGES TO LANGUAGES ARRAY
  }
  console.log(k);
  console.log(repo_dataJSON.length);
  // if(k==repo_dataJSON.length-1)
  // {
  //   tutorJSON[followerJSON[i].login] = sortJS.sort(all_languages);
  //   console.log("sorted all languages");
  //   // console.log(tutorJSON);
  //   if(i==followerJSON.length-1){
  //     console.log(followerJSON.length);
  //     // console.log(tutorJSON);
  //     res.render(__dirname + '/index.jade', {
  //       following: tutorJSON,
  //     });
  //    }
  //
  // }
};





//
// app.get('/tutors', function(req, res){
//   var actualToken = oauth2.accessToken.token.split('&')[0].split('=')[1];
//   var requestHeaders =
//   {
//       "Authorization" : "token "+ actualToken,
//       "User-Agent": "samkho10",
//   };
//    request({url : 'https://api.github.com/user/following',headers: requestHeaders}, function (error, response, data){
//     var tutorJSON = {};
//     var followerJSON = JSON.parse(data);
//     // console.log(followerJSON);
//      for(i=0; i<followerJSON.length; i++){ //FOR EACH FOLLOWER
//         (function(i){
//           var all_languages = []; //INITIALIZE EMPTY LANGUAGES ARRAY
//           request({url:followerJSON[i].repos_url, headers:requestHeaders},function(error, response, repo_data){ //GET LIST OF REPOS OF FOLLOWER
//             var repo_dataJSON = JSON.parse(repo_data);
//             // console.log(repo_dataJSON);
//             for(k=0; k<repo_dataJSON.length; k++){ //FOR EACH REPO
//               (function(k){
//                  request({url:repo_dataJSON[k].languages_url, headers:requestHeaders},function(error, response, language_data){ //GET LIST OF LANGUAGES
//                     var language_dataJSON = JSON.parse(language_data);
//                     // console.log(language_dataJSON);
//                     var lang = Object.keys(language_dataJSON);
//                     if(lang!=null){
//                       for(b=0; b<lang.length; b++)
//                       {
//                         all_languages.push(lang[b]); //PUSH LANGUAGES TO LANGUAGES ARRAY
//                       }
//
//                     }
//                     if(k==repo_dataJSON.length-1)
//                     {
//                       tutorJSON[followerJSON[i].login] = sortJS.sort(all_languages);
//                       // console.log(tutorJSON);
//                       if(i==followerJSON.length-1){
//                         console.log(followerJSON.length);
//                         // console.log(tutorJSON);
//                         res.render(__dirname + '/index.jade', {
//                           following: tutorJSON,
//                         });
//                        }
//
//                     }
//
//                 })
//               })(k);
//             }
//           });
//         })(i);
//       }
//
//  });
// });




app.get('/', function (req, res) {
  res.send('Hello<br><a href="/auth">Log in with Github</a>');
});

app.listen(3000);

console.log('Express server started on port 3000');
