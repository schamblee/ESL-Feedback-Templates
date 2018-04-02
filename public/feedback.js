
const token = sessionStorage.getItem("token");
const currentUser = sessionStorage.getItem("user");

$(document).ready(function() {
   console.log(token)
    $('#feedbackTable').DataTable( {
        lengthChange: false,
        ajax: "api/feedback",
        type: "GET",
        columns: [
            { data: "studentId" },
            { data: "lessonId" },
            { data: "text" },
            { data: "created" }
        ],
        select: true
    } );
} );


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
  $.getJSON(`api/feedbackTemplates/5abd5bcbc835fa1568861076`, callbackFn);
}



let feedback = `-name- did a great job today learning the new words 'mom' and 'dad'. \
  -Pronoun- was able to practice drawing a line on the screen. -Pronoun- repeated\
  the sounds after the teacher and -pronoun- can say the word 'mom' and 'dad' after\
  looking at a picture of each person.`

// this function stays the same when we connect
// to real API later
let student = 'Jerry'
let pronoun = 'he'
let Pronoun = 'He'
let possessive = 'him'
let Possessive = 'Him'

mapObj = {
  "-Pronoun-": `${Pronoun}`,
  "-pronoun-": `${pronoun}`,
  "-name-": `${student}`
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
  </div>`);
  }



function copyFeedback() {
  /* Get the text field */
  var copyText = document.getElementById("feedback-input");

  /* Select the text field */
  copyText.select();

  /* Copy the text inside the text field */
  document.execCommand("Copy");

  /* Alert the copied text */
  alert("Copied the text: " + copyText.value);
}

function getAndDisplayFeedback() {
  $('#templateForm').submit(event => {
    event.preventDefault();
    console.log("submitted")
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
        lessonId: `${lessonId}`,
        userId: '123abc',
        studentId: `${studentId}`,
        text: $('.feedback-input').val()
    }),
    success: function(resultData) {
      console.log(resultData)
      $('#classroom-url').val('');
      $('#student').val('');
      /*$('.js-feedback-output').append(` 
      <div class="ui accordion">
        <div class="active title">
          <i class="dropdown icon"></i>
            What is a dog?
        </div>
        <div class="active content">
          <p>A dog is a type of domesticated animal. Known for its loyalty and faithfulness, it can be found as a welcome guest in many households across the world.</p>
        </div>
      </div>`);
      $('.ui.accordion').accordion();*/
  }
})
})
}

function watchNewStudentClick() {
  $('#addNewStudent').click((event) => {
    $('.ui.modal.studentForm').html(`<i class="close icon"></i><div class="header">Student Info</div>
      <div class="content">
      <form id="studentForm" class="ui form studentForm">
        <h4 class="ui dividing header">Save Information About Your Student</h4>
        <div class="field">
          <label for="studentName">Name</label>
          <input id="studentName" class="studentName" required>
        </div>
        <div class="field">
          <label for="studentNickName">Nick Name (for your records)</label>
          <input id="studentNickName" class="studentNickName">
        </div>
        <div class="field">
          <input type="radio" name="gender" value="boy" required> Boy
          <input type="radio" name="gender" value="girl" required> Girl
        </div>
        <div class="field">
          <label for="studentNotes">Student Notes (for your records)</label>
          <textarea id="studentNotes" class="studentNickName"></textarea>
        </div>
      <div class="actions">
        <div class="ui cancel button">Cancel</div>
          <button type="submit" class="ui approve blue button saveStudent">Save Student</button>
      </div>
    </form>
  </div>`)
    $('.ui.modal.studentForm').modal('show');
  })
}

function watchSaveStudent() {
  $('.studentForm').submit((event) => {
  event.preventDefault();
  name = $('#studentName').val();
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
        referenceId: `${studentId}`,
        userId: 'abc123',
        name: `${name}`,
        nickname: `${nickName}`,
        notes: `${notes}`
    }),
    success: function(resultData) {
      console.log(resultData)
      $('#studentName').val('');
      $('#studentNickName').val('');
      $('#studentNotes').val('');
}
})
})
}


function handleFeedback() {
  getAndDisplayFeedback();
  watchSaveFeedbackClick();
  watchSaveStudent();
  watchNewStudentClick();
}

$(handleFeedback)

