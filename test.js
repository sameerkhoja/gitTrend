var a = function(data, callback){
  var newdata = data+"hi";
  callback(newdata);
};

var b = function(callback){
  var newerdata = newdata+"herro";
  callback(newerdata);
};

var c = function(){
  console.log(newerdata);
}

a("hi", b(c()));
