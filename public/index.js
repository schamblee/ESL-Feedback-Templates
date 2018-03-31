$(document).ready( () => {
  $('.masthead')
    .visibility({
      once: false,
      onBottomPassed: function() {
      $('.fixed.menu').transition('fade in');
      },
      onBottomPassedReverse: function() {
      $('.fixed.menu').transition('fade out');
      }
  });
});

function watchCreateAccountSubmit() {
  $('#registerForm').on('submit', function(event) {
    event.preventDefault();
    const username = $('#username').val();
    const email = $('#email').val();
    const password = $('#password').val();
    $.ajax({
      type: 'POST',
      url: 'api/users',
      contentType: 'application/json',
      data: JSON.stringify({
        username: username,
        email: email,
        password: password
      }),
      dataType: 'json',
      success: function() {
      requestJWT(username, email, password)
      },
      error: function(err) {
      console.info('There is an error');
      console.error(err);
      $('.ui.form')
        .form({
          fields: {
            email: {
              identifier  : 'email',
              rules: [
                {
                  type   : 'empty',
                  prompt : 'Please enter your e-mail'
                },
                {
                  type   : 'email',
                  prompt : 'Please enter a valid e-mail'
                }
              ]
            },
            password: {
              identifier  : 'password',
              rules: [
                {
                  type   : 'empty',
                  prompt : 'Please enter your password'
                },
                {
                  type   : 'length[6]',
                  prompt : 'Your password must be at least 6 characters'
                }
              ]
            }
          }
        })
        if (err.responseJSON.message === 'Username already taken') {
          console.log("already taken")
        } else if (err.responseJSON.message === 'Must be at least 10 characters long') {
          console.log("must be 10 characters")
        } else if (err.responseJSON.message === 'Cannot start or end with whitespace') {
          console.log("cannot start or end with white space")
        }
      }
    });
  });
}

function requestJWT(username, email, password) {
  $.ajax({
      type: 'POST',
      url: 'api/auth/login',
      contentType: 'application/json',
      dataType: 'json',
      data: JSON.stringify({
      username: username,
      email: email,
      password: password
    }),
    success: function(resultData) {
      localStorage.setItem('token', resultData.authToken);
      localStorage.setItem('id', resultData.userID);
      $.ajax({
        type: 'GET',
        url: 'api/protected',
        contentType: 'application/json',
        dataType: 'json',
        headers: {
          'Authorization': "Bearer " + localStorage.getItem('token')
        },
        success: console.log("JWT successful")
      })
    },
    error: function(err) {
      console.info('Password is incorrect!');
      console.error(err);
    } 
  });
}

function handleRegistration() {
  watchCreateAccountSubmit();
}

$(handleRegistration);
