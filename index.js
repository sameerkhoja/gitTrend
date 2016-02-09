var express = require('express');
var app = express();
var request = require('request');
var sort = require("./js/sort.js")

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
  }


});


app.get('/tutors', function(req, res){
  var actualToken = oauth2.accessToken.token.split('&')[0].split('=')[1];
   request(
     {
         url : 'https://api.github.com/user/followers',
         headers : {
             "Authorization" : "token "+ actualToken,
             "User-Agent": "samkho10",
         }
     },
     function (error, response, data){
        var tutorJSON = {};
        console.log(data[1213]);
         for(i=0; i<data.length; i++){ //FOR EACH FOLLOWER
            (function(i){  
              // console.log(i);
              var all_languages = []; //INITIALIZE EMPTY LANGUAGES ARRAY
              // request(data[i].repos_url, function(error, response, repo_data){ //GET LIST OF REPOS OF FOLLOWER
              //   // console.log(repo_data);
              //   // for(k=0; k<repo_data.length; k++){ //FOR EACH REPO
              //   //   (function(k){
              //   //     request(repo_data[k].languages_url, function(error, response, language_data){ //GET LIST OF LANGUAGES
              //   //       // $('#list ul').append('<li>'+Object.keys(language_data)+'</li>');
              //   //       var lang = Object.keys(language_data);
              //   //       if(lang!=null){
              //   //         for(b=0; b<lang.length; b++)
              //   //         {
              //   //           all_languages.push(lang[b]); //PUSH LANGUAGES TO LANGUAGES ARRAY
              //   //         }
                        
              //   //       } 
              //   //       if(k==repo_data.length-1)
              //   //       {
              //   //         // $('#list ul:nth-child('+(i+1)+')').append('<li>'+sortByFrequencyAndRemoveDuplicates(all_languages)+'</li>');
              //   //         tutorJSON[data[i].login] = sort(all_languages);
              //   //       }
                      
              //   //     })
              //   //   })(k);
              //   // }
              // });
            })(i);
          }
         res.render(__dirname + '/index.jade', {
            following: JSON.stringify(tutorJSON),
        });
     });
});

// function greeting(){
//   var actualToken = oauth2.accessToken.token;
//   console.log(actualToken);
//   // request("https://api.github.com/user" + "?" + token.token)
//   // console.log('Hi, %s', username);
// }
 
app.get('/', function (req, res) {
  res.send('Hello<br><a href="/auth">Log in with Github</a>');
});
 
app.listen(3000);
 
console.log('Express server started on port 3000');





 
// app.listen(3000);
 
// console.log('Express server started on port 3000');
