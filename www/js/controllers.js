'use strict';

var app = angular.module('app.controllers', []);

app.controller('homeCtrl', function($scope, $cordovaOauth, $state, $rootScope, $http) {
  $scope.facebookSignIn = function() {
    $cordovaOauth.facebook("942618409193104", ["email"]).then(function(result) {
      $rootScope.access_token = result.access_token;
      $http.get("https://graph.facebook.com/v2.2/me", {params: {access_token: result.access_token, fields: "id", format: "json"}})
      .then(function(result) {
        $rootScope.id = result.data.id;
        $http.post('https://localhost:3000/api', $rootScope.id)
        .then(function(result) {
          var result = JSON.stringify(result.data);
          console.log('result:',result);
          if (result == 'true') {
            console.log('result == true');
            console.log('New user created');
            $state.go('categories');
          }
          else {
            console.log('result == false');
            //user already exists, take them to their profile
            $state.go('profile');
          }
        }, function(err) {
          console.log('error:',JSON.stringify(err));
        });
      }, function(err) {
        console.log('error:', err);
      });
    }, function(err) {
      console.log('error:',JSON.stringify(err));
      $state.go('home');
    });
  };
});

app.controller('profileCtrl', function($scope, $state, $http, $rootScope) {
  var access_token = $rootScope.access_token;
  $http.get("https://graph.facebook.com/v2.2/me", {params: {access_token: access_token, fields: "id,name,location,about,picture", format: "json"}})
  .then(function(result) {
    var id = result.data.id;
    var name = result.data.name;
    var location = result.data.location;
    var about = result.data.about;
    var picture = result.data.picture.data.url;
    console.log('id:', id);
    console.log('name:', name);
    console.log('location:',result.data.location);
    console.log('about:',result.data.about);
    $scope.profileData = {name: name, location: location, about: about, profilePicture: picture};
  }, function(err) {
    console.log('error:',JSON.stringify(err));
  });
});

app.controller('categoriesCtrl', function($scope, $state, $http, $rootScope) {
  console.log('in categoriesCtrl');
  $scope.categories = ["Scifi", "Fiction", ""]
});
