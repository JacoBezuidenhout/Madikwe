angular.module('userModule', ['ngSails'])
.factory('authFactory', ['$sails',function($sails) {
  
  var me = {};
  
    var login = function(identifier,password,cb){
      console.log('Login Called',identifier,password);
      me = {name: 'Jaco', email: 'jaco@peoplesoft.co.za'};
      cb(me);
    };

    var register = function(form,cb){
      console.log('Register Called',form);
      me = {name: 'Jaco', email: 'jaco@peoplesoft.co.za'};
      cb(me);
    };

    var logout = function(){
      console.log('Logout Called');
      me = {};
    };

    var user = function(cb){
      console.log(me);
      $sails.get("/me",function(data)
      {
        me = data;  
        console.log('/me', data);
        cb(me);
      });
    };

  return {
    login: login,
    logout: logout,
    register: register,
    user: user
  };
}]);