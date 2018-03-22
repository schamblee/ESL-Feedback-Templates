// this is mock data, but when we create our API
// we'll have it return data that looks like this
var MOCK_FEEDBACK = {
	"feedbackTemplates": [
        {
            "id": "1111111",
            "lessonId": "aaaaaa",
            "text": "[name] did a great job today learning the new words 'mom' and 'dad'. [gender] was able to practice drawing a line on the screen. [gender] repeated the sounds after the teacher and [gender] can say the word 'mom' and 'dad' after looking at a picture of each person."
        }
    ]
};

let MOCK_STUDENT_NAME = {
    "students": [
        {
            "id": "1111111",
            "userId": "aaaaaa",
            "name": "Alex"
        }
    ]
}

let userClosing = 'Thanks for another great lesson and if you enjoyed the lesson, please leave a rating if you can! - Teacher Stephanie'

// this function's name and argument can stay the
// same after we have a live API, but its internal
// implementation will change. Instead of using a
// timeout function that returns mock data, it will
// use jQuery's AJAX functionality to make a call
// to the server and then run the callbackFn 
function getFeedback(callbackFn) {
    // we use a `setTimeout` to make this asynchronous
    // as it would be with a real AJAX call.
	setTimeout(function(){ callbackFn(MOCK_FEEDBACK)}, 1);
}

// this function stays the same when we connect
// to real API later
function displayFeedback(data) {
    for (index in data.feedbackTemplates) {
	   $('body').append(
        `<p>${data.feedbackTemplates[index].text}</p>
         <p>${userClosing}</p>`);
    }
}

// this function can stay the same even when we
// are connecting to real API
function getAndDisplayFeedback() {
	getFeedback(displayFeedback);
}

//  on page load do this
$(function() {
	getAndDisplayFeedback();
})