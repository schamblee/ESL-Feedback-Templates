// this is mock data, but when we create our API
// we'll have it return data that looks like this
var MOCK_FEEDBACK = {
	"feedbackTemplates": [
        {
            "id": "1111111",
            "overview": "did a great job today learning the new words 'mom' and 'dad'. She was able to practice drawing a line on the screen. She repeated the sounds after the teacher and she can say the word 'mom' and 'dad' after looking at a picture of each person.",
            "advice": "can practice their pronunciation of the words 'mom' and 'dad'. She can also practice saying 'My name is...' when she introduces herself to the teacher. She can continue practicing using the mouse in class to draw a line or circle.",
            "lessonId": "aaaaaa",
            "lessonCode": "MC-L1-U1-LC1-1"
        },
        {
            "id": "2222222",
            "overview": "did a great job today repeating after the teacher and listening to the sentences in the lesson. He repeated 'rock, paper, scissors'. He was able to repeat the introduction 'My name is ____'",
            "advice": "can practice drawing on the screen, moving objects, circling, and matching. He can also practice introducing himself: 'My name is...'.",
            "lessonId": "bbbbbbb",
            "lessonCode": "MC-L1-U1-LC1-2"
        }
    ]
};

let studentName = 'Alex'
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
        `<p>${data.feedbackTemplates[index].lessonCode}</p>
         <p>${studentName} ${data.feedbackTemplates[index].overview}</p>
         <p>${studentName} ${data.feedbackTemplates[index].advice}</p>
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