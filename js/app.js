var app = angular.module("myApp", []);


app.controller('LangCtrl', function($scope, $http) {
  $http.get('data.json')
       .then(function(res){
          $scope.languages = res.data;                
        });
});
