
const token = localStorage.getItem("authToken");
const currentUser = localStorage.getItem("user");


$(document).ready(function() {
  getSavedFeedback();
 });

function getSavedFeedback() {
  $.ajax({
    type: 'GET',
    url: `api/feedback/${currentUser}`,
    contentType: 'application/json',
    dataType: 'json',
    success: function(resultData) {
      console.log(resultData)
      displayFeedbackTableData(resultData)
      $('.ui.accordion').accordion()
    }
  });
}

function getSavedStudents() {
  $.ajax({
    type: 'GET',
    url: `api/students/${currentUser}`,
    contentType: 'application/json',
    dataType: 'json',
    success: function(resultData) {
      console.log(resultData)
      displayStudentTableData(resultData);
    }
  });
}

function getStudentInfo(studentId) {
    $.ajax({
    type: 'GET',
    url: `api/students/${studentId}`,
    contentType: 'application/json',
    dataType: 'json',
    success: function(resultData) {
      console.log(resultData)
      displayStudentTableData(resultData);
    }
  });
}

function renderFeedbackResult(result) {
  return `<div class="ui accordion">
    <tr>
    <div class="title">
      <i class="dropdown icon"></i> 
      ${result.studentId}
      ${result.lessonId}
      ${result.created}
    </div>
      <div class="content">
        <p class="savedFeedback">${result.text}</p>
      </div>
    </tr>
  </div>`;
};

function renderStudentResult(result) {
  return `<tr>
      <td><button id="editStudent" title="Edit student info" data-id="${result.id}"><i class="pencil alternate icon"></i></button></td>
      <td>${result.name}</td>
      <td>${result.nickName}</td>
      <td>${result.pronoun}</td>
      <td>${result.notes}</td>
    </tr>
  `
}

function displayFeedbackTableData(data) {
  const results = data.feedback.map((item, index) => renderFeedbackResult(item));
  $('#feedbackTableData').html(results);
}

function displayStudentTableData(data) {
  const results = data.students.map((item, index) => renderStudentResult(item));
  $('#student-rows').html(results);
}



// this is mock data, but when we create our API
// we'll have it return data that looks like this

let userClosing = 'Thanks for another great lesson and if you enjoyed the lesson, please leave a rating if you can! - Teacher Stephanie'

// this function's name and argument can stay the
// same after we have a live API, but its internal
// implementation will change. Instead of using a
// timeout function that returns mock data, it will
// use jQuery's AJAX functionality to make a call
// to the server and then run the callbackFn 
function getFeedback(callbackFn) {
  $.getJSON(`api/templates/5abd5bcbc835fa1568861076`, callbackFn);
}

let feedback = `-name- did a great job today learning the new words 'mom' and 'dad'. \
  -Pronoun- was able to practice drawing a line on the screen. -Pronoun- repeated\
  the sounds after the teacher and -pronoun- can say the word 'mom' and 'dad' after\
  looking at a picture of each person.`

// this function stays the same when we connect
// to real API later
let student = $('input[name="student"]').val();
let pronoun = 'he'
let Pronoun = 'He'
let possessive = 'him'
let Possessive = 'Him'

mapObj = {
  "-Pronoun-": Pronoun,
  "-pronoun-": pronoun,
  "-name-": student
}


function copyFeedback() {
  /* Get the text field */
  var copyText = document.getElementById("feedback-input");

  /* Select the text field */
  copyText.select();

  /* Copy the text inside the text field */
  document.execCommand("Copy");

  $('#copied-message').prop('hidden', false)
}

function getAndDisplayFeedback() {
  $('#templateForm').submit(event => {
    event.preventDefault();
    $('.js-template-output').prop('hidden', false);
	  getFeedback(displayFeedback);
    $('.ui.modal.js-template-output').modal('show');
  });
}

function watchSaveFeedbackClick() {
  $('.js-template-output').on('submit', '#templateForm', function(event) {
    event.preventDefault();
    classroomUrl = $('#classroom-url').val();
    urlRefs = classroomUrl.split('-')
    lessonId = urlRefs[1]
    studentId = urlRefs[2]
   $.ajax({
      type: 'POST',
      url: 'api/feedback',
      contentType: 'application/json',
      dataType: 'json',
      data: JSON.stringify({
        lessonId,
        userId: currentUser,
        studentId,
        text: $('.feedback-input').val()
    }),

    success: function(resultData) {
      getSavedFeedback();
      $('#classroom-url').val('');
      $('#student').val('');
    },
    error: handleError,
    beforeSend: function(xhr) { 
      xhr.setRequestHeader('Authorization','Bearer ' + token) 
    }
  })
  })
}

function handleError(err){
    if (err.status === 401){
        console.log("There was an error")
        return;
    }
    $('#feedback').append(
      `<p>Error: Server returned ${err.status}. ${err.responseText} </p>`
    );
  }

function watchInfoClick() {
  $('#instructions').click((event) => { 
    $('.ui.modal.classroomLinkInstructions').modal('show');
    $('.ui.modal.classroomLinkInstructions').prop('hidden', false);;
  })
}

function watchNewStudentClick() {
  $('#addNewStudent').click((event) => {
    $('.ui.modal.studentForm').prop('hidden', false)
    $('.ui.modal.studentForm').modal('show');
  })
}

function displayFeedback(data) {
     $('.js-template-output').html(`<i class="close icon"></i><div class="header">Feeback</div>
    <div class="content">
      <form id="templateForm" class="ui form feedbackTemplate">
        <h4 class="ui dividing header">${student} ${data.id}</h4>
        <div class="field">
          <label>Feedback Template</label>
          <textarea id="feedback-input" class="feedback-input">${feedback.replace(/-name-|-pronoun-|-Pronoun-|-possessive-|-Possessive-/gi, (matched) => { return mapObj[matched]})}
            ${userClosing}</textarea>
        </div>

      <div class="actions modal-action">
        <div class="ui cancel button">Cancel</div>
          <div class="ui green right labeled icon button copyFeedback" onclick="copyFeedback()">
          <i class="copy icon"></i>Copy Feedback</div>
          <button type="submit" class="ui approve blue button saveFeedback">Save Feedback</button>
      </div>
    </form>
    <div id="copied-message" aria-live="polite" hidden>
      <div class="ui success message">
        <div class="header">
          Your feedback has been copied!
        </div>
        <p>You may now paste your feedback in your classroom.</p>
      </div>
    </div>
  </div>`);
}

function watchSaveStudent() {
  $('.studentForm').submit((event) => {
    event.preventDefault();
    name = $('#studentName').val();
    pronoun = $('input[name="pronoun"]').val()
    nickName = $('#studentNickName').val();
    notes = $('#studentNotes').val();
    classroomUrl = $('#classroom-url').val();
    urlRefs = classroomUrl.split('-')
    studentId = urlRefs[2]
    $.ajax({
      type: 'POST',
      url: 'api/students',
      contentType: 'application/json',
      dataType: 'json',
      data: JSON.stringify({
        referenceId: studentId,
        pronoun: pronoun,
        userId: currentUser,
        name: name,
        nickName,
        notes
      }),
      success: function(resultData) {
        console.log(resultData)
      }
    });
    $('#studentNameInput').text(name)
    $('#studentNameInput').removeClass('default')
  })
}

function watchHelpClick() {
  $('#help').click( (event) => {
    event.preventDefault();
    $('.ui.modal.classroomLinkInstructions').modal('show');
    $('.ui.modal.classroomLinkInstructions').prop('hidden', false);
  })
}

function watchWelcomeMessageCLose() {
  $('.message .close').on('click', function() {
    $(this).closest('.message').transition('fade')
  });
}

function watchStudentDropDownClick() {
  $('#student').click( (event) => {
  $('.ui.dropdown').dropdown({
        apiSettings: {
        url: `/api/students/${currentUser}`
      }
  })
  })
}

function watchViewStudentsClick() {
  $('#viewStudentBtn').click((event) => {
    event.preventDefault();
    getSavedStudents();
    $('.ui.modal.viewStudents').modal('show');
    $('.ui.modal.viewStudents').prop('hidden', false);
  })
}

function watchSignOut(){
  $('#sign-out').click((event) => {
    event.preventDefault();
    localStorage.removeItem("home");
    sessionStorage.removeItem("authToken");
    window.location.href = "/"
  })
}

function watchEditStudent() {
  $('#student-rows').on('click', '#editStudent', (event) => {
    event.preventDefault();
    console.log("click")
    $('.ui.modal.viewStudents').prop('hidden', true);
    $('.ui.modal.editStudents').modal('show');
    $('.ui.modal.editStudents').prop('hidden', false);
    getStudentInfo();
  })
}

function 

function handleFeedback() {
  getAndDisplayFeedback();
  watchSaveFeedbackClick();
  watchSaveStudent();
  watchNewStudentClick();
  watchWelcomeMessageCLose();
  watchInfoClick();
  watchStudentDropDownClick();
  watchSignOut();
  watchHelpClick();
  watchViewStudentsClick();
  watchEditStudent();
}

$(handleFeedback)

