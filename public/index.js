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
        if (err.responseJSON.message === 'Username already taken') {
          $('#registration-errors').html(`<div class="ui error message"><ul class="list"><li>The username already exists. Please try a different one.</li></ul>
          </div>`);
          $('#usernameField').addClass('error');
        } else if (err.responseJSON.message === 'Must be at least 10 characters long') {
          $('#registration-errors').html(`<div class="ui error message"><ul class="list"><li>The password must be at least 10 characters long.</li></ul>
          </div>`);
          $('#passwordField').addClass('error');
        } else if (err.responseJSON.message === 'Cannot start or end with whitespace') {
          $('#registration-errors').html(`<div class="ui error message"><ul class="list"><li>The password cannot start or end with a space.</li></ul>
          </div>`);
          $('#passwordField').addClass('error');
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
        success: window.location.href = "/feedback"
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
