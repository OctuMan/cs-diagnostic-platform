import {shuffleArray} from './utilities.js';
const IS_PREVIEW = localStorage.getItem("isPreview") === "true";


// catch elements 
const resultArea = document.querySelector('.quiz-container');
let gameControles = document.querySelector('.progress-questions');
let questionNum = document.querySelector('.question-num');
let questionPointArea = document.querySelector('.question-point');
let progressBar = document.querySelector('.progress-fill');
let timerArea = document.querySelector('.controles .time-left');
let questionArea = document.querySelector('.question');
let answersArea = document.querySelector('.answers-area');
let nextBtn = document.getElementById('submit-answer-next');
let backBtn = document.getElementById('submit-answer-back');
let submitArea = document.querySelector('.submit-answer-area');

// Global variables 
let questionData = [];

let totalQuestions = 0;
let questionObj = {};
let TEST_TIME_MINUTES = 45;
let remainingSeconds = TEST_TIME_MINUTES * 60;
let timer = 0;

let quizState = {
  currentQuestionIndex: 0,
  userAnswer: null,
  userAnswers: [],
  isCompleted: false,
};

let testSettings = {
  topic: 'Systèmes Informatiques',
  place: 'Salle Info',
  teacher: 'Abdel lh',
  className: 'Tcsf1',
  subject : 'Informatique'
};

// Fetch Questions 
async function loadQuestions() {
  // Check if there's a dynamic test in localStorage
  const dynamicTest = localStorage.getItem("dynamicQuiz");
  if (dynamicTest) {
    try {
      questionData = JSON.parse(dynamicTest);
      totalQuestions = questionData.length;

      // Optional: clear after use (one-time preview)
      // localStorage.removeItem("dynamicQuiz");

      startTest();
      return;
    } catch (err) {
      console.error("Erreur de parsing du test dynamique:", err);
      alert("Test dynamique invalide. Chargement du fichier par défaut.");
    }
  }

  //  Fallback: load from static JSON
  const url = "../data/testQuestions.json";
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Échec du chargement : ${response.status}`);
    }
    questionData = await response.json();
    totalQuestions = questionData.length;
    startTest();
  } catch (error) {
    console.error("Erreur lors du chargement des questions:", error.message);
    alert("Impossible de charger les questions. Vérifiez le fichier testQuestions.json.");
  }
}
document.addEventListener('DOMContentLoaded', () => {
  loadQuestions();
});

function showQuestion() {
  
  if (quizState.currentQuestionIndex >= totalQuestions) {
    const isConfirmed = confirm("Souhaites-tu envoyer toutes tes réponses ?");
    if (isConfirmed) {
      testDone();
    } else {
      quizState.currentQuestionIndex = totalQuestions - 1;
      renderQuestion(questionData[quizState.currentQuestionIndex]);
    }
    return;
  }
  
  questionObj = questionData[quizState.currentQuestionIndex];
  renderQuestion(questionObj);
  updateQuestionNum();
  updateProgressBar();
  updateNextButtonText();

  backBtn.disabled = quizState.currentQuestionIndex === 0;
}

function startTest() {
  startTimer();
  showQuestion();
}

function generateTestMetadata() {
  return {
    topic: testSettings.topic,
    subject : testSettings.subject,
    date: new Date().toISOString(),
    place: testSettings.place,
    className: testSettings.className,
    teacher: testSettings.teacher,
    totalQuestions: questionData.length,
  };
}

function renderQuestion(questionObject) {
  let question = questionObject.question;
  const questionType = questionObj.type;
  
 
  let QuestionPoint = questionObject.point;
  if(questionType === 'association'){
    renderAssociationQuestion(questionObj);
    return;
  }
  const restartBtn = document.getElementById('restart');
  restartBtn.style.display = 'none';
  if(questionType === 'img'){
  renderImgQuestion(questionObj);
  return;
  } let answers = shuffleArray(questionObject.answers);
  questionArea.textContent = question;
  answersArea.replaceChildren();
  questionPointArea.textContent = QuestionPoint ? QuestionPoint + " pts" : "";

  for (let ans = 0; ans < answers.length; ans++) {
    let ansLabel = document.createElement('label');
    let ansLabelInput = document.createElement('input');
    let inputSpan = document.createElement('span');
    let ansValue = document.createTextNode(answers[ans]);

    ansLabel.setAttribute("for", `answer-${ans}`);
    ansLabelInput.type = "radio";
    ansLabelInput.id = `answer-${ans}`;
    ansLabelInput.name = "answer";
    ansLabelInput.value = answers[ans];
    inputSpan.classList.add('radio-mark');
    ansLabel.append(ansLabelInput, inputSpan, ansValue);
    answersArea.appendChild(ansLabel);
  }

  const selectedAnswer = quizState.userAnswers[quizState.currentQuestionIndex];
  if (selectedAnswer) {
    const selectedInput = answersArea.querySelector(`input[value='${selectedAnswer}']`);
    if (selectedInput) {
      selectedInput.checked = true;
      nextBtn.disabled = false;
    }
  } else {
    nextBtn.disabled = true;
  }
}

answersArea.addEventListener('change', (e) => {
  if (e.target.type === 'radio' && e.target.name === 'answer') {
    nextBtn.disabled = false;
    quizState.userAnswer = e.target.value;
  }
});

nextBtn.addEventListener('click', () => {
  if (!quizState.userAnswer) {
    alert("Choisis une réponse avant de continuer.");
    return null;
  }

  quizState.userAnswers[quizState.currentQuestionIndex] = quizState.userAnswer;
  quizState.currentQuestionIndex++;
  // quizState.userAnswer = null;
  showQuestion();
});

backBtn.addEventListener('click', () => {
  backBtn.disabled = false;
  quizState.currentQuestionIndex--;
  showQuestion();
});

function updateQuestionNum() {
  questionNum.textContent = `Question ${quizState.currentQuestionIndex + 1} sur ${totalQuestions}`;
}

function updateProgressBar() {
  let progress = ((quizState.currentQuestionIndex + 1) * (100 / totalQuestions));
  progressBar.style.width = `${progress}%`;
}

timerArea.textContent = formatTime(remainingSeconds);
function startTimer() {
  clearInterval(timer);
  timer = setInterval(() => {
    remainingSeconds--;
    timerArea.textContent = formatTime(remainingSeconds);
    if (remainingSeconds === 0) {
      clearInterval(timer);
      testDone();
    }
  }, 1000);
}

function testDone() {
  clearInterval(timer);
  quizState.isCompleted = true;

  const testMetadata = generateTestMetadata();
  const results = analyzeResults(quizState.userAnswers, questionData);

  const currentSession = {
    id: 'session_' + Date.now(),
    student: activeStudent,
    meta: testMetadata,
    results: results,
    exportedAt: new Date().toISOString()
  };
if (!isPreviewMode) {
    const key = 'quizResults';
    let resultsList = JSON.parse(localStorage.getItem(key)) || [];
    resultsList.push(currentSession);
    localStorage.setItem(key, JSON.stringify(resultsList));
  }
 
  studentResultsScreen();
  exportResultsAsFile(currentSession);
}

function formatTime(seconds) {
  let hours = Math.floor(seconds / 3600);
  let min = Math.floor((seconds % 3600) / 60);
  let sec = seconds % 60;
  return hours > 0 ?
    `${String(hours).padStart(2, '0')}:${String(min).padStart(2, '0')}:${String(sec).padStart(2, '0')}` :
    `${String(min).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
}

function updateNextButtonText() {
  if (quizState.currentQuestionIndex === totalQuestions - 1) {
    nextBtn.classList.add('finish');
    nextBtn.textContent = "Terminer";
  } else {
    nextBtn.classList.remove('finish');
    nextBtn.textContent = "Suivant";
  }
}
const ST_KEY = 'students';
let studentSessions = JSON.parse(localStorage.getItem(ST_KEY)) || [];

// ✅ Check if we're in preview mode
const isPreviewMode = localStorage.getItem("isPreview") === "true";

let activeStudent = null;

if (isPreviewMode) {
  
  activeStudent = {
    firstName: "Professeur",
    lastName: "Preview",
    className: "Test",
    date: new Date().toISOString()
  };
} else {
  // 🧑‍🎓 Normal mode: get last student
  activeStudent = studentSessions[studentSessions.length - 1];

  if (!activeStudent) {
    alert("Aucune information sur l'élève trouvée. Retourne au formulaire.");
    window.location.href = "form.html"; // or index.html
    throw new Error("No student data");
  }
}

function generateStudentId() {
  return 'student_' + Math.floor(Math.random() * 1000000);
}

let studentInfoArea = document.querySelector('.info-table tbody');

function studentInfoRow() {
  studentInfoArea.replaceChildren();
  studentInfoArea.innerHTML = `<tr>
                    <td>${generateStudentId()}</td>
                    <td>${activeStudent.firstName} ${activeStudent.lastName}</td>
                    <td>${activeStudent.className}</td>
                    <td>${testSettings.subject}</td>
                    <td>${formatISODateToDisplay(activeStudent.date)}</td>
                </tr>`;
}

studentInfoRow();

function formatISODateToDisplay(isoString) {
  const date = new Date(isoString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${year}-${month}-${day} ${hours}:${minutes}`;
}

function studentResultsScreen() {
  resultArea.replaceChildren();
  let resutlHeader = document.createElement('h2');
  resutlHeader.textContent = 'Test terminé';
  let resultAllAns = document.createElement('p');
  resultAllAns.textContent = `Tu as répondu à ${quizState.userAnswers.length} questions.`;
  resultArea.append(resutlHeader, resultAllAns);

  for (let q = 0; q < questionData.length; q++) {
    let qSpan = document.createElement('h4');
    qSpan.textContent = `Q${q + 1} : ${questionData[q].question}`;
    let userAns = document.createElement('span');
    if(typeof(quizState.userAnswers[q]) === 'object'){
      const div = document.createElement('div');
      for(let i = 0; i < quizState.userAnswers[q].length; i++ ){
        
        const elem = document.createElement('span');
        elem.innerHTML = `${quizState.userAnswers[q][i].source} =>  ${quizState.userAnswers[q][i].target} <br>`;
        div.appendChild(elem);
       
      } 
      resultArea.append(qSpan, div)
     
    }else{
      userAns.textContent = ` Ta réponse : ${quizState.userAnswers[q]}`;
    resultArea.append(qSpan, userAns);
    }
    
    
  }
}

function analyzeResults(userAnswers, questionData) {
  const results = {
    infoAnswers: [],
    knowledgeAnswers: [],
    correctCount: 0,
    wrongCount: 0,
    finalScore: 0,
    totalPoints: 0,
    percentage: 0
  };

  for (let i = 0; i < userAnswers.length; i++) {
    const userAnswer = userAnswers[i];
    const question = questionData[i];
    

    if (question.topic === 'info') {
      results.infoAnswers.push({
        question: question.question,
        answer: userAnswer
      });
      
    } else {
        if(question.type === 'qcm'){
          const correctAnswer = question.answers[question.correct];
          const point = question.point ? question.point : 1;
          results.totalPoints += point;

          const isCorrect = userAnswer === correctAnswer;
          if (isCorrect) {
            results.correctCount++;
            results.finalScore += point;
          } else {
            results.wrongCount++;
          }

          results.knowledgeAnswers.push({
            question: question.question,
            userAnswer: userAnswer,
            correctAnswer: correctAnswer,
            isCorrect: isCorrect
          });
        }else if(question.type === 'association'){
       
        const answers = userAnswer; // should be the submitted pairs
  const point = question.point || 1; 
  results.totalPoints += point; 

  let score = 0; 
  for (let ans of answers) { 
    // normalize to avoid case/space issues
    if (normalize(ans.source) === normalize(ans.target)) { 
      score++;   
    } 
  } 

  // Update counts
  results.correctCount += score; 
  results.wrongCount += question.answers.length - score; 
  results.finalScore += score * (point / question.answers.length); 

  // "isCorrect" means: all pairs correct
  const isCorrect = score === question.answers.length; 

  results.knowledgeAnswers.push({ 
    question: question.question, 
    userAnswer: userAnswer, 
    isCorrect
  }); 
 
        
      }else if(question.type === 'img'){
const correctAnswers = Array.isArray(question.validAnswers) ? question.validAnswers : [];
  const point = question.point || 1;
  results.totalPoints += point;

  // Normalize both user answer and valid answers for fair comparison
  const normalizedUserAnswer = String(userAnswer).trim().toLowerCase();
  const normalizedCorrects = correctAnswers.map(ans => String(ans).trim().toLowerCase());

  const isCorrect = normalizedCorrects.includes(normalizedUserAnswer);

  if (isCorrect) {
    results.correctCount++;
    results.finalScore += point;
  } else {
    results.wrongCount++;
  }

  results.knowledgeAnswers.push({
    question: question.question,
    userAnswer: userAnswer,
    correctAnswers: correctAnswers, // keep for review
    isCorrect: isCorrect
  });
        
      }
      
  }}

  results.percentage = Math.round((results.finalScore / results.totalPoints) * 100);
  results.topicPerformance = {};

  results.knowledgeAnswers.forEach((answer, i) => {
    const topic = questionData[i].topic;
    if (!results.topicPerformance[topic]) {
      results.topicPerformance[topic] = { correct: 0, total: 0 };
    }
    results.topicPerformance[topic].total++;
    if (answer.isCorrect) {
      results.topicPerformance[topic].correct++;
    }
  });

  for (const topic in results.topicPerformance) {
    const data = results.topicPerformance[topic];
    data.percent = Math.round((data.correct / data.total) * 100);
  }

  return results;
}
function normalize(str) {
  return String(str)
    .normalize('NFD') // separate accents
    .replace(/[\u0300-\u036f]/g, '') // remove accents
    .trim()
    .toLowerCase();
}

function saveResult(result) {
  const key = 'quizResults';
  let results = JSON.parse(localStorage.getItem(key)) || [];
  results.push(result);
  localStorage.setItem(key, JSON.stringify(results));
}

function exportResultsAsFile(session) {
  if (session.length === 0) {
    alert("Aucun résultat à exporter.");
    return;
  }

  const filename = `resultats_diagnostic_${activeStudent.firstName}_${activeStudent.lastName}_${testSettings.className}.json`;
  const jsonString = JSON.stringify(session, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function renderAssociationQuestion(qObj){
  const pairs = qObj.answers;
  questionArea.textContent = qObj.question;
  answersArea.replaceChildren();
  const dragElementsDiv = document.createElement('div');
  shuffleArray(pairs).forEach(pair => {
    dragElementsDiv.classList.add('drag-elements');
    const oneElement = document.createElement('div');
    oneElement.classList.add('dragElement');
    const img = document.createElement('img');
    img.id= pair.target;
    img.src = `../images/${pair.source}`;
    img.setAttribute("data-source", pair.target);
    img.setAttribute("draggable", "true");
    img.style.width = "80px";
    img.style.height = "80px";
    oneElement.appendChild(img);
    dragElementsDiv.appendChild(oneElement);
    
  });
answersArea.appendChild(dragElementsDiv);
  const line = document.createElement('hr');
  answersArea.appendChild(line);

  const dropZones = document.createElement('div');
  dropZones.classList.add('drop-zones');
  shuffleArray(pairs).forEach(pair => {
    const oneZone = document.createElement('div');
    oneZone.classList.add('zone');
    const dropItem = document.createElement('div');
    dropItem.classList.add('dropZone');
    dropItem.setAttribute("data-target", pair.target);
    const zoneTitle = document.createElement('span');
    zoneTitle.textContent = pair.target;
    oneZone.append(dropItem, zoneTitle);
    dropZones.appendChild(oneZone);
    
  });
  answersArea.appendChild(dropZones)
  setupDnDListeners();
  
}

  
function setupDnDListeners() {
  const restartBtn = document.getElementById('restart');
  restartBtn.style.display = 'block';
  let responce = [];
  const all = document.querySelectorAll('.dragElement img');
  const targets = document.querySelectorAll('.dropZone');

  all.forEach(source => {
    source.addEventListener("dragstart", ev => {
      ev.dataTransfer.setData("application/my-app", ev.target.id);
      ev.dataTransfer.effectAllowed = "move";
    });
  });

  targets.forEach(target => {
    target.addEventListener("dragover", ev => ev.preventDefault());
    target.addEventListener("drop", ev => {
      ev.preventDefault(); 
      if (target.children.length > 0) return;

      const data = ev.dataTransfer.getData("application/my-app");
      const draggedEl = document.getElementById(data);
      const targetItem = target.dataset.target;
      const sourceItem = draggedEl.dataset.source;

      target.textContent = '';
      target.classList.add('hoverOver');
      target.appendChild(draggedEl);
      setTimeout(()=> {
        target.classList.remove('hoverOver');
      }, 100)
      
      responce = responce.filter(r => r.target !== targetItem);
      responce.push({ target: targetItem, source: sourceItem });
      quizState.userAnswer = responce;
    });
  });


const originalDragContainer = document.querySelectorAll('.drag-elements .dragElement img');
const droppedElements = {};
originalDragContainer.forEach(img => {
    droppedElements[img.id] = img.parentElement;
})
document.getElementById('restart').addEventListener('click',()=> {
    
    const droppedItems = document.querySelectorAll('.drop-zones .zone .dropZone');
   
    droppedItems.forEach(item => {
        const img = item.querySelector('img');
        if(img){
            const originalConatianer = droppedElements[img.id];
            originalConatianer.appendChild(img) 
           
            // droppedElements.push(img)
        }
        
    })
    
    responce.length = 0;
})
  
}
function renderImgQuestion(qObj) {
  const imgName = qObj.source; 
  const img = document.createElement('img');
  img.src = `../images/${imgName}`; // Adjust path
  img.style.width = "200px";

  questionArea.textContent = qObj.question;
  answersArea.replaceChildren();

  const imgDiv = document.createElement('div');
  imgDiv.classList.add('imgContainer');
  imgDiv.appendChild(img);

  const inputTest = document.createElement('input');
  inputTest.type = 'text';
  inputTest.id = 'input-image';
  inputTest.placeholder = 'Votre réponse ici ...';

  answersArea.append(imgDiv, inputTest);
  inputTest.focus();
  setupInputImgLestner();
}

function setupInputImgLestner(){
  const inputImg = document.getElementById('input-image');
  inputImg.addEventListener('input', ()=> {
    const userAnsw = inputImg.value.trim();
    quizState.userAnswer = userAnsw;
    nextBtn.disabled = false;
  })
   quizState.userAnswer = null;
}