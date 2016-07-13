var express = require('express');
var app = express();
var request = require('request');


//USING PUG AS VIEW ENGINE
app.set('view engine', 'pug');

//GITHUB CLIENT ID AND SECRET
var CLIENT_ID = '16e4d098754ab5be4fcc',
    CLIENT_SECRET = '4e09d95dd6619fd7e9d066521eaeda3d071184d6';

//OAUTH CONFIG
var oauth2 = require('simple-oauth2')({
  clientID: CLIENT_ID,
  clientSecret: CLIENT_SECRET,
  site: 'https://github.com/login',
  tokenPath: '/oauth/access_token',
  authorizationPath: '/oauth/authorize'
});

// AUTHORIZATION URI DEFINITION
var authorization_uri = oauth2.authCode.authorizeURL({
  redirect_uri: 'http://localhost:3000/callback',
  scope: 'notifications',
  state: '3(#0/!~'
});

// INITIAL PAGE REDIRECTING TO GITHUB
app.get('/auth', function (req, res) {
    res.redirect(authorization_uri);
});

// CALLBACK SERVICE PARSING THE AUTHORIZATION TOKEN AND ASKING FOR THE ACCESS TOKEN
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

app.use('/tutors', function(req, res, next){
  var actualToken = oauth2.accessToken.token.split('&')[0].split('=')[1];
  requestHeaders =
  {
      "Authorization" : "token "+ actualToken,
      "User-Agent": "samkho10"
  };
    request({url : 'https://api.github.com/user/following',headers: requestHeaders}, function (error, response, follower_data)
      {
        var tutor_array = [];
        var follower_data_array = JSON.parse(follower_data);

        follower_data_array.forEach(function(follower){
          request({url:follower.repos_url, headers:requestHeaders}, function(error, response, repo_data){
            var repo_data_array = JSON.parse(repo_data);
            tutor_array.push({
              username: repo_data_array[0].owner.login,
              language: repo_data_array[0].language,
          });
          if(tutor_array.length == follower_data_array.length)
            res.render('tutors', {title: 'GitTutor', followers: tutor_array});
          });
        });
      });
})

app.get('/tutors', function(req, res){

});




app.use(express.static(__dirname + '/views'));


app.get('/', function (req, res) {
  res.render('welcome');
});

app.listen(process.env.PORT || 3000, function(){
  console.log("Express server listening on port %d in %s mode", this.address().port, app.settings.env);
});
