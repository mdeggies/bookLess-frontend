'use strict';

var app = angular.module('app.controllers', []);

app.controller('homeCtrl', function($scope, $cordovaOauth, $state, $rootScope, $http) {
  $scope.facebookSignIn = function() {
    $cordovaOauth.facebook("942618409193104", ["email"]).then(function(result) {
      $rootScope.access_token = result.access_token;
      $http.get("https://graph.facebook.com/v2.2/me", {params: {access_token: result.access_token, fields: "id", format: "json"}})
      .then(function(result) {
        $rootScope.id = result.data.id;
        //'http://bookless-backend.herokuapp.com/api'
        $http.post('http://localhost:3000/api', $rootScope.id)
        .then(function(result) {
          var result = JSON.stringify(result.data);
          if (result == 'true') {
            console.log('New user created');
            $state.go('categories');
          }
          else {
            //user already exists, take them to their profile
            //$state.go('profile');
            $state.go('categories');
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

app.controller('CardsCtrl', function($scope, $rootScope, $http, TDCardDelegate) {
  console.log('in cardsCtrl');

  var cardTypes = [
    { title: 'Scifi', image: 'http://www.imgion.com/images/01/Yellow-Rose-Picture-.jpg' },
    { title: 'Mystery', image: 'http://www.imgion.com/images/01/Yellow-Rose-Picture-.jpg' },
    { title: 'Fantasy', image: 'http://www.imgion.com/images/01/Yellow-Rose-Picture-.jpg' },
    { title: 'Romance', image: 'http://www.imgion.com/images/01/Yellow-Rose-Picture-.jpg' },
    { title: 'Young Adult', image: 'http://www.imgion.com/images/01/Yellow-Rose-Picture-.jpg' }
  ];

  $scope.cards = Array.prototype.slice.call(cardTypes, 0);
  $scope.savedCards = [];

  $scope.addCard = function() {
    console.log('card added');
    var newCard = cardTypes[Math.floor(Math.random() * cardTypes.length)];
    newCard.id = Math.random();
    $scope.cards.push(angular.extend({}, newCard));
  }

  $scope.cardDestroyed = function(index) {
    console.log('card destroyed');
    $scope.cards.splice(index, 1);
};

  $scope.cardSwipedLeft = function(index) {
    console.log('left swipe- card deleted');
    $scope.cards.splice(index, 1);
    sendCards();
  };

  $scope.cardSwipedRight = function(index) {
    console.log('right swipe- card added');
    var card = $scope.cards[index];
    $scope.savedCards.push(card);
    $scope.cards.splice(index, 1);
    sendCards();
  };

  function sendCards() {
    console.log('in send cards');
    console.log('scope.cards.length:',$scope.cards.length);
    if (($scope.cards.length <= 0) && ($scope.savedCards.length >= 1)) {
      console.log('in send cards if statement');
      $http.post('http://localhost:3000/api/cards', $scope.savedCards)
      .then(function(result) {
        console.log('result:',JSON.stringify(result));
      }, function(err) {
        console.log('error:',JSON.stringify(err));
      });
    }
  };

});

app.controller('categoriesCtrl', function($scope, $state, $http) {
  console.log('in categoriesCtrl');
});

app.controller('CardCtrl', function($scope, $state, TDCardDelegate) {
  console.log('in CardCtrl');
});
