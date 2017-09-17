$(document).ready(function() {
   
    
    $("#loginButton").click(function() {
        alert("test"); 
        
        var email = $("#email").text;
        var password = $("#password").text;
        
        firebase.auth().signInWithEmailAndPassword(email, password).catch(function(error) {
          // Handle Errors here.
          var errorCode = error.code;
          var errorMessage = error.message;
          // ...
        });
        
    });
    
});