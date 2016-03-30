var app = angular.module('app.routes', []);

app.config(function($stateProvider, $urlRouterProvider, $locationProvider, $httpProvider) {
  $httpProvider.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded;charset=utf-8';
  $stateProvider
  .state('home', {
    url: '/home',
    templateUrl: 'templates/home.html',
    controller: 'homeCtrl'
  })
  .state('profile', {
    url: '/profile',
    templateUrl: 'templates/profile.html',
    controller: 'profileCtrl'
  })
  .state('categories', {
    url: '/categories',
    templateUrl: 'templates/categories.html',
    controller: 'categoriesCtrl'
  })
  .state('suggestions', {
    url: '/suggestions',
    templateUrl: 'templates/suggestions.html',
    controller: 'suggestionsCtrl'
  });
  $locationProvider.html5Mode(true);
  $urlRouterProvider.otherwise('/home');
});
