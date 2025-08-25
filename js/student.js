
const ST_KEY = 'students';
let studentSessions = JSON.parse(localStorage.getItem(ST_KEY)) || [];

function getStudentInfo(){
    const fname = document.getElementById('firstName').value.trim();
    const lname = document.getElementById('lastName').value.trim();
    const studentClass = document.getElementById('studentClass').value.trim();

    if(!fname || !lname || !studentClass){
        alert('Remplir les vides');
        return null;
    }

    return {
    firstName : fname,
    lastName :lname,
    className : studentClass,
    date :new Date().toISOString(),};
    
}

document.getElementById('submit-btn').addEventListener('click', (e)=> {
    e.preventDefault();
    const studentInfo = getStudentInfo();
    if(studentInfo) {
        studentSessions.push(studentInfo);
        saveToLocalStorage();

        // ✅ Ensure quiz uses real questions, not preview
        localStorage.setItem("isPreview", "false");

        window.location.href = 'quiz.html';
        clearFields();
    }
});


function saveToLocalStorage() {
    localStorage.setItem(ST_KEY, JSON.stringify(studentSessions));
}

function clearFields(){
        document.getElementById('firstName').value ="";
        document.getElementById('lastName').value ="";
        document.getElementById('studentClass').value ="";
}

// Check if quiz data is in URL
const urlParams = new URLSearchParams(window.location.search);
const quizParam = urlParams.get("quiz");

if (quizParam) {
  try {
    const quizData = JSON.parse(atob(quizParam));
    localStorage.setItem("dynamicQuiz", JSON.stringify(quizData));
    localStorage.setItem("isPreview", "false");
  } catch (e) {
    console.error("Invalid quiz data in link", e);
  }
}
