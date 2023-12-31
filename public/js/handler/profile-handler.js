// Get the settings icon and content divs
const settingsIcon = document.getElementById('settings-icon');
const questionnaireDiv = document.getElementById('questionnaire');
const questionnaireIcon = document.getElementById('questionnaire-icon');
const settingsDiv = document.getElementById('settings');
const navButtonDiv = document.querySelector('.nav-buttons')
const questionnaireSubmitButton = document.querySelector('.sub-quest')

const progressBar = document.querySelector('.progress-bar')
const progress = document.querySelector('.progress');
const prevButton = document.querySelector('.prev');
const nextButton = document.querySelector('.next');
const submitButton = document.querySelector('.submit')

// const icon = document.getElementById('add-report');
// icon.onclick = function() {
//     settingsDiv.style.display = 'none';
//     questionnaireDiv.style.display = 'flex';
//     questionnaireDiv.style.justifyContent = 'center';
//     questionnaireDiv.style.alignItems = 'center';
//     questionnaireIcon.style.color = '#FFFFFF';
//     settingsIcon.style.color = "#fae8e8df"
//     progressBar.style.display = 'block';
// };

let currentQuestion = 0;
const totalQuestions = 25;

const answers = {}

const questionsList = [
    "What's your first and last name?",
    "What is your UoW student number?",
    "What is your UoW email ( If we need to contact you in the future )?",
    "What is your age?",
    "What is your sex?",
    "Which country are you from? ",
    "What is your type of degree?",
    "What is your current year of study?",
    "What is your current mode of study? (Full-time / Part-Time)",
    "How do you consume lectures? (In-person / Online / Both )",
    "What is the name of your course? ( Enter the full name of your course eg. Computer Science , Information Technology etc. )",
    "Could you please provide us with your current WAM, rounded to two decimal places?",
    "What is your current marital status?",
    "Do you feel like you have anxiety?",
    "Are you currently feeling stressed in the current semester? ",
    "Have you had panic attacks during the course of your study?",
    "How many days of the week do you exercise?",
    "Do you have high / low blood pressure?",
    "How many hours of sleep you catch each day?",
    "Have you any difficulties concentrating during this semester? ",
    "Have you lost or gained a significant amount of weight during this semester? ",
    "Do you often feel tired or feel like you have a sudden drop in energy levels during any part of your day?",
    "Have you lost interest in activities you used to enjoy?",
    "If you have been staying away from family, have you been feeling homesick or lonely during this semester? ",
    "Do you feel like your grades have declined due to one or more of the responses above where you stated yes? ",
    "In a short paragraph, please give us a brief response as to why you chose the options you chose. If you feel like the above questions did not capture your current state of mind properly, please feel free to give us details which you might think will be useful."
]


// Add an event listener to the settings icon
settingsIcon.addEventListener('click', function() {
    // Toggle the display of the questionnaire and settings divs
    if (settingsDiv.style.display === 'none') {
        settingsDiv.style.display = 'flex';
        settingsDiv.style.justifyContent = 'center';
        settingsDiv.style.alignItems = 'center';
        questionnaireDiv.style.display = 'none';
        questionnaireIcon.style.color = '#fae8e8df';
        settingsIcon.style.color = "#FFFFFF"
        progressBar.style.display = 'none';
    }    
});

// Add an event listener to the questionnaire icon
questionnaireIcon.addEventListener('click', function() {
    // Toggle the display of the questionnaire and settings divs
    if (questionnaireDiv.style.display === 'none') {
        settingsDiv.style.display = 'none';
        questionnaireDiv.style.display = 'flex';
        questionnaireDiv.style.justifyContent = 'center';
        questionnaireDiv.style.alignItems = 'center';
        questionnaireIcon.style.color = '#FFFFFF';
        settingsIcon.style.color = "#fae8e8df"
        progressBar.style.display = 'block';
    }    
});

nextButton.addEventListener('click', () => {
    if (currentQuestion < totalQuestions) {
        const answerfield = document.querySelector('.answer');
        answers[questionsList[currentQuestion]] = answerfield.value
        answerfield.value = ''
        console.log(answers)
        currentQuestion++;
        updateProgress();
        updateQuestion(currentQuestion);
    } else if (currentQuestion === totalQuestions) {
        // Display the submit button on the last question
        document.querySelector('.nav-buttons').appendChild(submitButton);
        nextButton.style.display = 'none';
    }
    if (currentQuestion == -1) {
        prevButton.disabled = false;
    }
});

prevButton.addEventListener('click', () => {
    if (currentQuestion > 0) {
        const keys = Object.keys(answers);
        const lastKey = keys[keys.length - 1];
        delete answers[lastKey];
        console.log(answers)
        currentQuestion--;
        updateProgress();
        updateQuestion(currentQuestion);
    }
    if (currentQuestion === 0) {
        prevButton.disabled = true;
    }
});

questionnaireSubmitButton.addEventListener('click', () => {
    const answerfield = document.querySelector('.answer');
    answers[questionsList[currentQuestion]] = answerfield.value
    answerfield.value = ''
    console.log(answers)
    questionnaireSubmitButton.textContent = 'Loading....'
    document.getElementById('loading-button').classList.add('loading-text');
    fetch('/answers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(answers)
      })
    .then(async response => {

        if (response.ok) {
            const data = await response.json(); // Convert the response to JSON
         
            const queryParams = new URLSearchParams();
            queryParams.append('score', data.body.score);
            queryParams.append('diagnosis', data.body.diagnosis);
      
            window.location.href = '/reports?' + queryParams.toString();
          } else {
            throw new Error('Failed to post data');
          }

        
    })
    .catch(error => {
        console.error(error);
    }); 
});

// Function to update the progress bar
function updateProgress() {
    const progressWidth = ((currentQuestion ) / (totalQuestions)) * 100;
    progress.style.width = progressWidth + '%';
}

// Function to update the question and buttons
function updateQuestion(questionNumber) {
    const questionElement = document.querySelector('.question h2');
    questionElement.textContent = questionsList[questionNumber];
    
    console.log(questionNumber)

    if (questionNumber === 0) {
        prevButton.disabled = true;
        submitButton.style.display = 'none';
        navButtonDiv.style.justifyContent = 'space-around'
    } else if (questionNumber === totalQuestions) {
        nextButton.style.display = 'none';
        submitButton.style.display = 'block';
        navButtonDiv.style.justifyContent = 'space-between'
    } else {
        prevButton.disabled = false;
        nextButton.style.display = 'inline-block';
        submitButton.style.display = 'none';
        navButtonDiv.style.justifyContent = 'space-around'
    }
}
