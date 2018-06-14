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

function watchDemo() {
  $('#demo').on('click', function(event) {
      event.preventDefault(); 
      console.log('click')
      requestLoginJWT('demo', 'password123');
  });
}

function requestLoginJWT(username, password) {
$.ajax({
    type: 'POST',
    url: 'api/auth/login',
    contentType: 'application/json',
    dataType: 'json',
    data: JSON.stringify({
    username: username,
    password: password
  }),
  success: function(resultData) {
    console.log(resultData.userId)
    localStorage.setItem('token', resultData.authToken);
    localStorage.setItem('user', resultData.userId);
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
    console.info('The login information is incorrect');
    console.error(err);
  } 
});
}

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
        requestJWT(username, email, password);
      },
      error: function(err) {
        $('#registration-errors').prop('hidden', false);
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
        } else if (err.responseJSON.message === 'Email Address already taken') {
          $('#registration-errors').html(`<div class="ui error message"><ul class="list"><li>The email already exists. Please try a different one or <a href="/login">log in</a>.</li></ul>
          </div>`);
          $('#emailField').addClass('error');
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
        success: $('#registration-success').prop('hidden', false)
      })
    },
    error: function(err) {
      console.error(err);
      $('#registration-errors').html(`<div class="ui error message"><ul class="list"><li>There was an error. Please try again.</li></ul>
          </div>`);
    } 
  });
}

function handleRegistration() {
  watchCreateAccountSubmit();
  watchDemo();
}

$(handleRegistration);
