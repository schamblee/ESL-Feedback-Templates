
const token = localStorage.getItem("authToken");
const currentUser = localStorage.getItem("user");

$(document).ready(function() {
  getSavedFeedback();
  getSavedStudents(displayStudentTableData);
  getSavedStudents(displayStudentDropdownData);
 });

function getSavedFeedback() {
  $.ajax({
    type: 'GET',
    url: `api/feedback/${currentUser}`,
    contentType: 'application/json',
    dataType: 'json',
    success: function(resultData) {
      displayFeedbackTableData(resultData);
      $('.ui.accordion').accordion();
    },
    error: handleError,
    beforeSend: setHeader
  });
}

function getSavedStudents(callbackFn) {
  $.ajax({
    type: 'GET',
    url: `api/students/user/${currentUser}`,
    contentType: 'application/json',
    dataType: 'json',
    success: callbackFn,
    error: handleError,
    beforeSend: setHeader
  });
}

function getStudentInfo(studentId, callbackFn) {
    $.ajax({
    type: 'GET',
    url: `api/students/${studentId}`,
    contentType: 'application/json',
    dataType: 'json',
    success: callbackFn,
    error: handleError,
    beforeSend: setHeader
  });
}

function getTemplateData(studentId, referenceId, student, pronoun) {
    $.ajax({
    type: 'GET',
    url: `api/templates/ref/${referenceId}`,
    contentType: 'application/json',
    dataType: 'json',
    success: function(result) {
      displayTemplateModal(result, studentId, student, pronoun);
    },
    error: handleError,
    beforeSend: setHeader
  });
}

function getStudentName(id, studentId) {
  $.getJSON(`api/students/${studentId}`, 
    function success (data) {
      return data.student.name ?  
      $(`#templateStudentName-${id}`).text(data.student.name) :
      alert("There was an error loading the student's name. Please try again!")
    });
}

function getLessonCode(id, templateId) {
  console.log(templateId)
  $.getJSON(`api/templates/${templateId}`, 
    function success (data) { 
      return data.template.code ?
      $(`#templateLessonCode-${id}`).text(data.template.code) :
      alert("There was an error loading the lesson code. Please try again!")
    });
}

function renderFeedbackResult(result) {
  let id = result.id
  let date = moment(result.created).format("MMMM Do YYYY")
  getStudentName(id, result.studentId);
  getLessonCode(id, result.lessonId);
  return `<div class="ui accordion">
    <tr>
    <div class="title">
      <i class="dropdown icon"></i> 
      <p id="templateStudentName-${id}" class="templateTableHeader"></p>
      <p id="templateLessonCode-${id}" class="templateTableHeader"></p>
      <p id="createDate" class="templateTableHeader">${date}</p>
    </div>
      <div class="content">
        <p class="savedFeedback">${result.text}</p>
      </div>
    </tr>
  </div>`;
};

function renderStudentResult(result) {
  return `<tr>
      <td><button class="editStudent" title="Edit student info" data-id="${result.id}"><i class="pencil alternate icon"></i></button></td>
      <td>${result.name}</td>
      <td>${result.nickName}</td>
      <td>${result.pronoun}</td>
      <td>${result.notes}</td>
    </tr>
  `
}

function renderTemplateData(data, student, pronoun) {
  console.log(data)
  let boyMapObj = {
    "-Pronoun-": "He",
    "-pronoun-": "he",
    "-name-": student,
    "-possessive-": "his",
    "-Possessive-": "His",
    "-object-": "him"
  }
  let girlMapObj = {
    "-Pronoun-": "She",
    "-pronoun-": "she",
    "-name-": student,
    "-possessive-": "her",
    "-Possessive-": "Her",
    "-object-": "her"
  }
  let template = data.template[0].text.replace(/-name-|-pronoun-|-Pronoun-|-possessive-|-object-|-Possessive-/gi, 
    (matched) => { 
      if (pronoun === "boy") {
        return boyMapObj[matched] 
      } else {
        return girlMapObj[matched];
      }
  });
  return template;
}

function displayTemplateModal(data, studentId, student, pronoun) {
  const result = renderTemplateData(data, student, pronoun);
  $('#templateModalHeader').html(`<div id="code" data-id="${data.template[0].id}">${data.template[0].code}</div><div id="name" data-id="${studentId}">${student}</div>`)
  $('.js-template-output').prop('hidden', false);
  $('.ui.modal.js-template-output').modal('show');
  $('#feedback-input').html(result);
}

function renderStudentDropDownResult(result) {
  return `<option name="student" data-id="${result.id}" data-pronoun="${result.pronoun}" 
    data-name="${result.name}" class="item">${renderStudentDropdownName(result)}</option>`
}

function renderStudentDropdownName(result) {
  return result.nickName ? `${result.name} - ${result.nickName}` : result.name; 
}

function displayFeedbackTableData(data) {
  if ( data.feedback.length > 0 ) {
  const results = data.feedback.map((item, index) => renderFeedbackResult(item));
  $('#feedbackTableData').html(results);
  } else {
    $('#feedbackTableData').html(`
      <div class="ui warning message">
        <div class="header">
        You don't have any feedback yet!
        </div>
        Paste your classroom link, create or select a student and click "Add Feedback"
      </div>`);
  }
}

function displayStudentTableData(data) {
  const results = data.students.map((item, index) => renderStudentResult(item));
  $('#student-rows').html(results);
}

function displayStudentDropdownData(data) {
  const results = data.students.map((item, index) => renderStudentDropDownResult(item));
  $('#student').html(results);
}

function displayEditStudentModal(data) {
  $('#studentName').val(data.student.name);
  $('#studentId').text(data.student.id);
  $('input[name="pronoun"]:selected').val(data.student.pronoun);
  $('#studentNickName').val(data.student.nickName);
  $('#studentNotes').val(data.student.notes);
  $('.ui.modal.viewStudents').prop('hidden', true);
  $('.ui.modal.studentForm').modal('show');
  $('.ui.modal.studentForm').prop('hidden', false);
}


function copyFeedback() {
  var copyText = document.getElementById("feedback-input");
  copyText.select();
  document.execCommand("Copy");
  $('#copied-message').prop('hidden', false)
}

function watchAddFeedbackClick() {
  $('#templateForm').submit(event => {
    event.preventDefault();
    classroomUrl = $('#classroom-url').val();
    urlRefs = classroomUrl.split('-');
    studentName = $('option[name="student"]:selected').data('name')
    studentId = $('option[name="student"]:selected').data('id')
    pronoun = $('option[name="student"]:selected').data('pronoun')
    referenceId = urlRefs[1];
	  getTemplateData(studentId, referenceId, studentName, pronoun);
  });
}

function watchSaveFeedbackClick() {
  $('.js-template-output').on('submit', '#templateForm', function(event) {
    event.preventDefault();
    classroomUrl = $('#classroom-url').val();
    studentId = $('#name').data('id')
    lessonId = $('#code').data('id')
    $('#copied-message').prop('hidden', true);
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
    beforeSend: setHeader
  })
  })
}

function setHeader (xhr) {
  xhr.setRequestHeader('Authorization','Bearer ' + token)
}

function handleError(err) {
    if (err.status === 401){
        console.log("There was an error")
        return;
    }
    $('#feedbackTableData').append(
      `<p>Error: Server returned ${err.status}. ${err.responseText} </p>`
    );
}

function watchSaveStudent() {
  $('.studentForm').submit((event) => {
    event.preventDefault();
    name = $('#studentName').val();
    editEvent = $('#studentName').data('edit');
    id = $('#studentId').text();
    pronoun = $('input[name="pronoun"]:selected').val()
    nickName = $('#studentNickName').val();
    notes = $('#studentNotes').val();
    classroomUrl = $('#classroom-url').val();
    urlRefs = classroomUrl.split('-')
    studentRefId = urlRefs[2]


    if (id.length > 0) {
      $.ajax({
        type: 'PUT',
        url: `api/students/${id}`,
        contentType: 'application/json',
        dataType: 'json',
        data: JSON.stringify({
          id,
          pronoun: pronoun,
          userId: currentUser,
          name: name,
          nickName,
          notes
        }),
        success: function(resultData) {
        console.log(resultData)
        },
        error: handleError,
        beforeSend: setHeader
      }); 
    } 
    else {
      $.ajax({
      type: 'POST',
      url: 'api/students',
      contentType: 'application/json',
      dataType: 'json',
      data: JSON.stringify({
        referenceId: studentRefId,
        pronoun: pronoun,
        userId: currentUser,
        name: name,
        nickName,
        notes
      }),
      success: function(resultData) {
        console.log(resultData)
      },
      error: handleError,
      beforeSend: setHeader
    });
    $('#studentName').data('edit');
  }
});
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

function watchHelpClick() {
  $('#help').click( (event) => {
    event.preventDefault();
    $('.ui.modal.classroomLinkInstructions').modal('show');
    $('.ui.modal.classroomLinkInstructions').prop('hidden', false);
  })
}

function watchWelcomeMessageClose() {
  $('.message .close').on('click', function() {
    $(this).closest('.message').transition('fade')
  });
}

function watchViewStudentsClick() {
  $('#viewStudentBtn').click((event) => {
    event.preventDefault();
    getSavedStudents();
    $('.ui.modal.viewStudents').modal('show');
    $('.ui.modal.viewStudents').prop('hidden', false);
  })
}

function watchSignOutClick(){
  $('#sign-out').click((event) => {
    event.preventDefault();
    localStorage.removeItem("home");
    sessionStorage.removeItem("authToken");
    window.location.href = "/"
  })
}

function watchEditStudentClick() {
  $('#student-rows').on('click', '.editStudent', (event) => {
    event.preventDefault();
    let studentId= $(event.currentTarget).data('id');
    getStudentInfo(studentId, displayEditStudentModal);
  });
}

function handleFeedback() {
  watchAddFeedbackClick();
  watchSaveFeedbackClick();
  watchSaveStudent();
  watchNewStudentClick();
  watchWelcomeMessageClose();
  watchInfoClick();
  watchSignOutClick();
  watchHelpClick();
  watchViewStudentsClick();
  watchEditStudentClick();
}

$(handleFeedback)

