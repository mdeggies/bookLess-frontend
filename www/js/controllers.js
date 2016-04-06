'use strict';

var app = angular.module('app.controllers', []);

app.controller('appCtrl', function($scope, $ionicSideMenuDelegate) {
  $scope.toggleSideMenu = function() {
    console.log('in toggle side menu');
    $ionicSideMenuDelegate.toggleLeft();
  };
});

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
  console.log('in profileCtrl');
  var access_token = $rootScope.access_token;
  $http.get("https://graph.facebook.com/v2.2/me", {params: {access_token: access_token, fields: "id,name,location,about,picture", format: "json"}})
  .then(function(result) {
    var id = result.data.id;
    $rootScope.fbId = id;
    var name = result.data.name;
    var location = result.data.location;
    var about = result.data.about;
    var picture = result.data.picture.data.url;
    $scope.profileData = {name: name, location: location, about: about, profilePicture: picture};
  }, function(err) {
    console.log('error:',JSON.stringify(err));
  });
});

app.controller('categoriesCtrl', function($scope, $state, $http, $rootScope, $ionicPopup) {
  $scope.genres = [
    {title: "Scifi", image: "http://www.imgion.com/images/01/Yellow-Rose-Picture-.jpg"},
    {title: "Horror", image: "http://www.imgion.com/images/01/Yellow-Rose-Picture-.jpg"},
    {title: "Fantasy", image: "http://www.imgion.com/images/01/Yellow-Rose-Picture-.jpg"},
  ];

  var selected = [];

  $scope.selectGenre = function(genre) {
    var index = selected.indexOf(genre);
    if (index > -1) {
      selected.splice(index, 1);
      genre.selected = false;
    } else {
      selected.push(genre);
      genre.selected = true;
    }
  }

  $scope.submit = function() {
    if (selected.length <= 0) {
      $ionicPopup.alert({
        title: 'Oops!',
        content: 'You forgot to select a category'
      }).then(function(res) {
        console.log('User forgot to select category');
      });
    }
    else {
      console.log('selected:',JSON.stringify(selected));
      $rootScope.categories = selected;
      $state.go('suggestions');
    }
  };
});

app.controller('suggestionsCtrl', function($scope, $rootScope, $state, $http, $ionicLoading, TDCardDelegate) {

  $scope.bookImgs = [];
  $scope.bookDetails = [];

  $ionicLoading.show({
    content: 'Loading',
    animation: 'fade-in',
    showBackdrop: true,
    maxWidth: 200,
    showDelay: 0
  });

  $http.post('http://localhost:3000/api/bookImgs', $rootScope.categories)
  .then(function(result) {
    for (var i=0; i<result.data.length; i++) {
      var url = result.data[i].MediumImage.URL;
      $scope.bookImgs.push(url);
    }
    $http.post('http://localhost:3000/api/bookDetails', $rootScope.categories)
    .then(function(result) {
      for (var i=0; i<result.data.length; i++) {
        var title = result.data[i].ItemAttributes.Title;
        var author = result.data[i].ItemAttributes.Author;
        var url = result.data[i].DetailPageURL;
        $scope.bookDetails.push({title: title, author: author, url: url});
      }
      $ionicLoading.hide();
    }, function(err) {
      console.log('error:',JSON.stringify(err));
    });
  }, function(err) {
    console.log('error:',JSON.stringify(err));
  });
  $scope.getDetails = function(book) {
    console.log(JSON.stringify(book));
  };

  $scope.cardDestroyed = function(index) {
    console.log('card destroyed');
    $scope.bookImgs.splice(index, 1);
    $scope.bookDetails.splice(index, 1);
  };

  $scope.cardSwipedLeft = function(index) {
    console.log('left swipe- card deleted');
    $scope.bookImgs.splice(index, 1);
    $scope.bookDetails.splice(index, 1);
    //sendCards();
  };

  $scope.cardSwipedRight = function(index) {
    console.log('right swipe- card added');
    var image = $scope.bookImgs.splice(index, 1);
    var details = $scope.bookDetails.splice(index, 1);
    var book = {fbId: $rootScope.fbId, image: image, details: details};
    sendBook(book);
  };

  function sendBook(book) {
    $http.post('http://localhost:3000/api/wishlist', book)
    .then(function(result) {
      console.log('result:',JSON.stringify(result));
    }, function(err) {
      console.log('error:',JSON.stringify(err));
    });
  }
});
