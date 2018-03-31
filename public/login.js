function watchlogInSubmit() {
    $('#logIn').on('submit', function(event) {
        event.preventDefault(); 
        const username = $('#username').val();
        const password = $('#password').val();
        requestJWT(username, password);
    });
}

function requestJWT(username, password) {
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

function handleLogIn() {
    watchlogInSubmit();
}

$(handleLogIn);

