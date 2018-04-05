
const token = localStorage.getItem("authToken");
const currentUser = localStorage.getItem("user");

$(document).ready(function() {
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
 });

function renderResult(result) {
  return `

  <div class="ui accordion">
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

function displayFeedbackTableData(data) {
  const results = data.feedback.map((item, index) => renderResult(item));
  $('#feedbackTableData').html(results);
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
  $.getJSON(`api/feedbackTemplates/5abd5bcbc835fa1568861076`, callbackFn);
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
    console.log(currentUser)

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
        lessonId,
        userId: currentUser,
        studentId,
        text: $('.feedback-input').val()
    }),
    success: function(resultData) {
      console.log(resultData)
      console.log(`The currentUser variable is ${currentUser}`)
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
    $('.ui.modal.classroomLinkInstructions').html(`<i class="close icon"></i><div class="header">How to Copy Classroom Link</div>
      <div id="info-content" class="content">
        <img id="instructionalGif" src="https://media.giphy.com/media/csN3ARPWeFwACe77fc/giphy.gif" alt="How to copy and paste the classroom link">
        <ol>
          <li>Enter your <a href="https://t.vipkid.com.cn/classrooms">VIPKID classroom</a> 
          <li>Highlight and right-click the link to copy the classroom link</li> 
          <li>Right-click and paste the classroom link below</li> 
          <li>Save student information</li>
          <li>Click "Add Feedback" to copy and save your feedback for your class.</li>
        </ol>
      </div>`)
    $('.ui.modal.classroomLinkInstructions').modal('show');
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
          <input type="radio" name="pronoun" value="boy" required> Boy
          <input type="radio" name="pronoun" value="girl" required> Girl
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

function handleFeedback() {
  getAndDisplayFeedback();
  watchSaveFeedbackClick();
  watchSaveStudent();
  watchNewStudentClick();
  watchWelcomeMessageCLose();
  watchInfoClick();
  watchStudentDropDownClick();
}

$(handleFeedback)

