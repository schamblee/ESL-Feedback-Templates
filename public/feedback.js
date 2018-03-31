$(document).ready(function(){
                $('.ui.accordion').accordion();
             });


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
  $.getJSON(`http://localhost:8080/api/feedbackTemplates/5abd5bcbc835fa1568861076`, callbackFn);
}



/*function renderTemplate(name, pronoun, lesson) {
  return `${name} did a great job today learning the new words 'mom' and 'dad'. 
  ${pronoun} was able to practice drawing a line on the screen. ${pronoun} repeated 
  the sounds after the teacher and ${pronoun} can say the word 'mom' and 'dad' after 
  looking at a picture of each person.`
}*/

// this function stays the same when we connect
// to real API later
let student = 'Jerry'
let pronoun = 'he'
function displayFeedback(data) {
	   $('.js-output').append(
        `<form class="ui form feedbackTemplate">
          <div class="field">
            <label>${student} ${data.id}</label>
            <textarea id="feedback-input" class="ui action input feedback-input">${data.text.replace(/-name-/i,`${student}`)}
            ${userClosing}</textarea><br>
          </div>
          <button class="ui green right labeled icon button copyFeedback" onclick="copyFeedback()">
           <i class="copy icon"></i>
           Copy Feedback
          </button>
          <button class="ui blue button saveFeedback">Save Feedback</button>
          <button class="ui red button deleteFeedback">Delete Feedback</button>
         </form>`);
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
    $('.js-output').prop('hidden', false);
    $('.feedbackControls').prop('hidden', false);
	getFeedback(displayFeedback);
  });
}

function watchSaveFeedbackClick() {
  $('js-output').on('click', '.saveFeedback', function(event) {
    event.preventDefault();
    console.log("save feedback");
    $.post("http://localhost:8080/api/feedback",
    {
        lessonId: 'abc', //$('#classroom-url').val(),
        userId: '123abc',
        studentId: 'cat', //$('#student').val(),
        text: 'test test'//$('.feedback-input').val()
    },
    console.log('it worked'));
  });
}

function watchDeleteFeedbackClick() {
  $('.js-output').on('click', '.deleteFeedback', function(event) {
    $(this).closest('.feedbackTemplate').remove();
  })
}


function handleFeedback() {
  getAndDisplayFeedback();
  watchDeleteFeedbackClick();
  watchSaveFeedbackClick();
}

$(handleFeedback)

