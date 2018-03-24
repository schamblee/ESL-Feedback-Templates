// this is mock data, but when we create our API
// we'll have it return data that looks like this
var MOCK_FEEDBACK = {
  "feedbackTemplates": [
    {
      "id": "1111111",
      "lessonId": "aaaaaa",
      "text": "-name- did a great job today learning the new words 'mom' and 'dad'. [pronoun] was able to practice drawing a line on the screen. [pronoun] repeated the sounds after the teacher and [pronoun] can say the word 'mom' and 'dad' after looking at a picture of each person."
    }
  ]
};

let MOCK_STUDENT_NAME = {
  "students": [
    {
      "id": "1111111",
      "userId": "aaaaaa",
      "name": "Annie"
    }
  ]
}

let MOCK_LESSONS = {
  "lessons": [
    {
      "id": "111111",
      "code": "MC-L2-U1-LC2-11",
      "name": "Lesson 11 All About Me 11",
      "templateId": "1111111"
    }
  ]
}


$(document)
    .ready(function() {
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
      ;
    })
  ;
  

  $(document).ready(function() {

      // fix menu when passed
      $('.masthead')
        .visibility({
          once: false,
          onBottomPassed: function() {
            $('.fixed.menu').transition('fade in');
          },
          onBottomPassedReverse: function() {
            $('.fixed.menu').transition('fade out');
          }
        })
      ;

      // create sidebar and attach to menu open
      $('.ui.sidebar')
        .sidebar('attach events', '.toc.item')
      ;

    });

let userClosing = 'Thanks for another great lesson and if you enjoyed the lesson, please leave a rating if you can! - Teacher Stephanie'

// this function's name and argument can stay the
// same after we have a live API, but its internal
// implementation will change. Instead of using a
// timeout function that returns mock data, it will
// use jQuery's AJAX functionality to make a call
// to the server and then run the callbackFn 
function getFeedback(callbackFn) {
  setTimeout(function(){ callbackFn(MOCK_FEEDBACK)}, 1);
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
    for (index in data.feedbackTemplates) {
	   $('.js-output').append(
        `<div class="feedbackTemplate">
          <p class="time">TIME OF CLASS</p>
          <p>Lesson 11 All About Me 11</p>
          <p>${data.feedbackTemplates[index].text.replace(/-name-/i,`${student}`)}</p>
          <p>${userClosing}</p>
          <button class="deleteFeedback">Delete Feedback</button>
         </div>`);
    }
}

function selectDay() {
  $('.dayForm').submit(event => {
    event.preventDefault();
    $('.templateForm').prop('hidden', false);
  })
}

function getAndDisplayFeedback() {
  $('.templateForm').submit(event => {
    event.preventDefault();
    $('.js-output').prop('hidden', false);
    $('.feedbackControls').prop('hidden', false);
	getFeedback(displayFeedback);
  });
}


function handleFeedback() {
  getAndDisplayFeedback();
  selectDay();
}

$(handleFeedback)

