
import {generateStudentReport} from './studentReport.js'
import {francophoneSysMarks} from './utilities.js';

let results = [] ;
// get the quizSessions 
export function getSessionsFromLS(){
  const key = 'quizResults';
  const stored = localStorage.getItem(key);
  return stored ? JSON.parse(stored) : [];

}

function summaryResults(){
    let testResults = getSessionsFromLS();
    const totalStudents = testResults.length;

    if (testResults.length === 0) {
        return { message: "No results found" };
    }
    return {
        globalStudents : totalStudents,
        testMetadata : getSafeMetadata(testResults),
        avgTopicScore : getClassScoreAvg(testResults),
    }
}

// francophoneSysMarks(getClassScoreAvg(getSessionsFromLS()))
function getClassScoreAvg(testResults) {
    if(testResults.length === 0) return 0;
    let sumPerscentages = 0;
const totalStudents = testResults.length;
    testResults.forEach((student) => {
        sumPerscentages += student.results.percentage;
        
    });
    return Number(sumPerscentages / totalStudents).toFixed(1);

    
}

function getSafeMetadata(results) {
  if (results.length === 0) {
    return {
      topic: 'No data',
      date: 'N/A',
      teacher: 'N/A',
      className: 'N/A'
    };
  }

  const firstMeta = results[0].meta;

  return {
    topic: firstMeta?.topic || 'Unknown',
    date: firstMeta?.date ? new Date(firstMeta.date).toLocaleDateString() : 'N/A',
    teacher: firstMeta?.teacher || 'Unknown',
    className: firstMeta?.className || 'Unknown'
  };
}


 // get elements from DOM 
  const totalStudents = document.getElementById('total-students');
  const averageScore = document.getElementById('avg-score');
  const totalClasses = document.getElementById('total-classes');
  const testTopic = document.getElementById('test-topic');
  const teacher = document.getElementById('test-teacher');

/* Global stats start section */
function getGlobalStats(results = getSessionsFromLS()){
  let sumPerscentages = 0;
  const totalStd = results.length;

  results.forEach((student) => {
      sumPerscentages += student.results.percentage;
      
  });
  
  const averageScore = (Number(sumPerscentages / totalStd).toFixed(1));
  const classes = getAllClassNames();

  return {
    totalStudents : totalStd,
    average : averageScore,
    totalClasses : classes.length,
    subject : 'Computer Science',
    teacher : results[0]?.meta.teacher || 'Unknown',
  }
}

function renderGlobalStats(results = getSessionsFromLS()) {  
    const stats = getGlobalStats(results);

    totalStudents.textContent = stats.totalStudents;
    averageScore.textContent = stats.average +'%';
    totalClasses.textContent = stats.totalClasses;
    testTopic.textContent = stats.subject;
    teacher.textContent = stats.teacher;

  return stats;
}

/* Global stats end section */

document.addEventListener('DOMContentLoaded', ()=> {
    const storedResults = getSessionsFromLS();
  if (storedResults.length > 0) {
    refreshDashboard(); // show stored data immediately
  }
  renderGlobalStats();
  renderClassesFilter();
  renderAllClassesAvg();
  renderTopicAvgAllByClass();
  backgroundQuestions();
  renderStudentTable(getSessionsFromLS());
  studentsPerformance(getSessionsFromLS());
  
}
);

function getAllClassNames() {
  const classNames = [];
  const allResults = getSessionsFromLS();
  allResults.forEach(res => {
    if(res.student?.className){
      classNames.push(res.student.className);
    }
    
  })
  return [...new Set(classNames)];
}

function renderClassesFilter(){
  const allClasses = getAllClassNames();
  const filters = document.getElementById('classes');
  const tableFilters = document.getElementById('table-filter-classes');
  filters.replaceChildren();
  tableFilters.replaceChildren();
  const allOption = document.createElement('option');
  allOption.value = 'allClasses';
  allOption.textContent = 'Toutes les classes';
  allOption.selected = true;
  filters.appendChild(allOption);
const allOption2 = document.createElement('option');
  allOption2.value = 'allClasses';
  allOption2.textContent = 'Toutes les classes';
  allOption2.selected = true;
  tableFilters.appendChild(allOption2);

  allClasses.forEach((result) => {
    let classNameItem = document.createElement('option');
    classNameItem.value = result;
    classNameItem.textContent = result;
    filters.appendChild(classNameItem);
    
  })
    allClasses.forEach((result) => {
    let classNameItem = document.createElement('option');
    classNameItem.value = result;
    classNameItem.textContent = result;
    tableFilters.appendChild(classNameItem);
    
  })
  renderStudentTable(getSessionsFromLS());
}


const filters = document.getElementById('classes');
filters.addEventListener('change', (el)=>{
  const clickedClass = el.target.value;
  updateUiByclasses(clickedClass)
}
)

const tableFilters = document.getElementById('table-filter-classes');

tableFilters.addEventListener('change', (el) => {
  const clickedClass = el.target.value;
  // get special calss results 
  const allResults = getSessionsFromLS();
  let classResult = [];
  allResults.forEach(res => {
      if(res.student.className === clickedClass){
        classResult.push(res)
      }
  })
  if(clickedClass.toLowerCase() === 'AllClasses'.toLowerCase()){
    renderStudentTable(getSessionsFromLS());
  }else {
    const filtred = allResults.filter(res => res.student.className === clickedClass);
    renderStudentTable(filtred);
  
  }
})

function updateUiByclasses(clickedClass){
  
  // get special calss results 
  const allResults = getSessionsFromLS();
  let classResult = [];
  allResults.forEach(res => {
      if(res.student.className === clickedClass){
        classResult.push(res)
      }
  })
  
  if(clickedClass.toLowerCase() === 'AllClasses'.toLowerCase()){
    renderGlobalStats(allResults);
    renderAllClassesAvg();
    renderTopicAvgAllByClass();
    backgroundQuestions();
    studentsPerformance(getSessionsFromLS());
      
    
  }else {
    const filtred = allResults.filter(res => res.student.className === clickedClass);
    renderGlobalStats(filtred);
    renderAvgByClass(classResult);
    renderTopicAvgByClass(classResult);
    backgroundClassQuestions(classResult);
    studentsPerformance(classResult);
    
  }
  
}


function renderAvgByClass(classResult){
  if (classResult.length === 0) {
    const progressContainer = document.getElementById('progress-container');
    progressContainer.innerHTML = `<p>No data for this class.</p>`;
    return;
  }
  let sumPerscentages = 0, classAvg = 0, className = classResult[0].student.className;
  const totalStd = classResult.length;
  classResult.forEach((student) => {
      sumPerscentages += student.results.percentage;
      
  });
  classAvg = (sumPerscentages / totalStd).toFixed(1);
  let fillClass = '';
  if (classAvg < 25) fillClass = 'prog-fill-red';
  else if (classAvg < 75) fillClass = 'prog-fill-orange';
  else fillClass = 'prog-fill-green';
  const progressContainer = document.getElementById('progress-container');
  progressContainer.innerHTML = `<div class="class-info d-flex flex-between mb-10 font-14">
                                    <span class="class-name">${className}</span>
                                    <span class="class-score">${classAvg}%</span>
                                </div>
                                <div class="progress-bar">
                                    <div class="progress-fill animate ${fillClass}" style="--target-fill: ${classAvg}%;"></div>
                                </div>`;

                        
}

/* Get All classes Avg section starts */
function getAllClassesAvg() {
  const allResults = getSessionsFromLS();
  const classGroups = {};

  allResults.forEach(res => {
    const className = res.student?.className;
    if (!className) return;

    if (!classGroups[className]) {
      classGroups[className] = [];
    }
    classGroups[className].push(res);
  });

  const classAvgs = Object.keys(classGroups).sort().map(className => {
    const group = classGroups[className];
    const avg = Number(
      group.reduce((sum, r) => sum + r.results.percentage, 0) / group.length
    ).toFixed(1);

    return {
      className,
      avg: Number(avg),
      totalStudents: group.length
    };
  });

  return classAvgs; 
}
 
function renderAllClassesAvg() {
  const allClassAvgs = getAllClassesAvg();

  const progressContainer = document.getElementById('progress-container');
  progressContainer.replaceChildren();

  if (!Array.isArray(allClassAvgs) || allClassAvgs.length === 0) {
    progressContainer.textContent = "No data to show";
    return;
  }

  allClassAvgs.forEach(({ className, avg }) => {
    const fillClass =
      avg < 25
        ? 'prog-fill-red'
        : avg < 75
        ? 'prog-fill-orange'
        : 'prog-fill-green';

    const divEle = document.createElement('div');
    divEle.className = 'class-item mb-15';
    divEle.innerHTML = `
      <div class="class-info d-flex flex-between mb-10 font-14">
        <span class="class-name">${className}</span>
        <span class="class-score">${avg}%</span>
      </div>
      <div class="progress-bar">
        <div class="progress-fill animate ${fillClass}" style="--target-fill: ${avg}%;"></div>
      </div>
    `;
    progressContainer.appendChild(divEle);
  });
}
/* Get All classes Avg section ends */

function getTopicMastery(results){
  const topics = {};

  results.forEach(res => {
    const topicGroup = res.results?.topicPerformance;
    if(!topicGroup) return;
     for(let topic in topicGroup){
        if(topic === 'info') continue;
        if(!topics[topic]){
          topics[topic] = {correct : 0, total:0};
        }
        
        topics[topic].correct += topicGroup[topic].correct;
        topics[topic].total += topicGroup[topic].total
        
     }});
    const topicsAvg = {};
    for(let topic in topics){
      const data = topics[topic];
      const average = data.total > 0 ? Math.round((data.correct / data.total) * 100) : 0;
      topicsAvg[topic] = {
        average,
        correct : data.correct,
        total : data.total,
        name : formatTopicName(topic)
      };
    }
  
  return topicsAvg;
}



function renderTopicAvgByClass(classResult){

  const topics = {};
  classResult.forEach(res => {
    const topicGroup = res.results.topicPerformance;
     for(let topic in topicGroup){
        if(topic === 'info') continue;
        if(!topics[topic]){
          topics[topic] = {correct : 0, total:0};
        }
        
        topics[topic].correct += topicGroup[topic].correct;
        topics[topic].total += topicGroup[topic].total
     }
  })

const progressContainer = document.getElementById('topic-progress-container');
progressContainer.replaceChildren();
Object.keys(topics).forEach(topic => {
      const topicName = topics[topic];
      const avg = Math.round((topicName.correct / topicName.total) * 100);
      const fillClass = avg < 25? 'prog-fill-red' : avg < 75? 'prog-fill-orange' :'prog-fill-green';
      
    const topicEl = document.createElement('div');
      topicEl.className = 'topic-item mb-15';
      topicEl.innerHTML = `
        <div class="topic-info d-flex flex-between mb-10 font-14">
          <span class="topic-name">${formatTopicName(topic)}</span>
          <span class="topic-score">${avg}% (${topicName.correct}/${topicName.total})</span>
        </div>
        <div class="progress-bar">
          <div class="progress-fill animate ${fillClass}" style="--target-fill: ${avg}%;"></div>
        </div>
      `;
      progressContainer.appendChild(topicEl);
})
       
}

function formatTopicName(topic){
  const names = {
    'computerSystems' : 'Computer Systems',
    'ComputerSystems' : 'Computer Systems',
    'inputOutput' : 'Input & Output',
    'software' : 'Softwares'
  };

  return names[topic] || topic.charAt(0).toUpperCase() + topic.slice(1);

}


function renderTopicAvgAllByClass(){
  const classResult = getSessionsFromLS();
  const topics = {};
  const topicsAvg = {};
  classResult.forEach(res => {
    const topicGroup = res.results.topicPerformance;
     for(let topic in topicGroup){
        if(topic === 'info') continue;
        if(!topics[topic]){
          topics[topic] = {correct : 0, total:0};
        }
        
        topics[topic].correct += topicGroup[topic].correct;
        topics[topic].total += topicGroup[topic].total;
     }
  });

const progressContainer = document.getElementById('topic-progress-container');
progressContainer.replaceChildren();
Object.keys(topics).sort().forEach(topic => {
      const topicName = topics[topic];
      const avg = Math.round((topicName.correct / topicName.total) * 100);
      if(!topicsAvg[topic]){
          topicsAvg[topic] = {avg : 0};
        }
      topicsAvg[topic].avg = avg;
      const fillClass = avg < 25? 'prog-fill-red' : avg < 75? 'prog-fill-orange' :'prog-fill-green';
      
      const topicEl = document.createElement('div');
      topicEl.className = 'topic-item mb-15';
      topicEl.innerHTML = `
        <div class="topic-info d-flex flex-between mb-10 font-14">
          <span class="topic-name">${formatTopicName(topic)}</span>
          <span class="topic-score">${avg}% </span>
        </div>
        <div class="progress-bar">
          <div class="progress-fill animate ${fillClass}" style="--target-fill: ${avg}%;"></div>
        </div>
      `;
      progressContainer.appendChild(topicEl);
})
  return topicsAvg;
}


// get diagnostic all questions

function backgroundQuestions(){
  const allResults = getSessionsFromLS();
  const infoQuestions = {};
  const infoQuestionsAvg = {};
  allResults.forEach(bgQuestion => {
    const arrayInfoQuestion = bgQuestion.results.infoAnswers;
    for(let question of arrayInfoQuestion){
      const questionName = question.question;
      if(!infoQuestions[questionName]){
          infoQuestions[questionName]= {Yes : 0, No:0};
        }
        question.answer === 'Oui'? infoQuestions[questionName].Yes+=1: infoQuestions[questionName].No+=1;
    }
  })
// get the container 
    const bgQuestionConatainer = document.getElementById('background-questions');
    bgQuestionConatainer.replaceChildren();
  Object.keys(infoQuestions).forEach(question => {

    const total = infoQuestions[question].Yes + infoQuestions[question].No;
    const avgYes = Math.round((infoQuestions[question].Yes / total) * 100);
    const avgNo = Math.round((infoQuestions[question].No / total) * 100);
   const chartId = `chart-${btoa(unescape(encodeURIComponent(question))).replace(/=/g, '')}`;

    
        if(!infoQuestionsAvg[question]){
          infoQuestionsAvg[question]= {avgYes : 0, avgNo:0};
        }
        infoQuestionsAvg[question].avgYes = avgYes;
        infoQuestionsAvg[question].avgNo = avgNo;
    const topicEl = document.createElement('div');
    topicEl.className = "card bg-white brad-8 p-20 d-flex flex-column gap-5";
    topicEl.style.width = '400px';
    topicEl.style.height = '300px';
    topicEl.innerHTML = `<h4 >${question}</h4>
                        <canvas id="${chartId}" class="pb-10" width="400" height="200"></canvas>`

    bgQuestionConatainer.appendChild(topicEl)

 new Chart(document.getElementById(chartId), {
    type: "doughnut",
    data: {
      labels:["Oui", "Non"],
      datasets: [{
        label: "Average Score (%)",
        data: [avgYes, avgNo],
        backgroundColor: [
        "#0784eb",
        "#eee",
        
      ],

      }]
    },
    options: {
      responsive: true,
      scales: {
        y: { beginAtZero: true, max: 100 }
      }
    }
  });
  });
  
}



function backgroundClassQuestions(classResult){
  const allResults = classResult;
  const infoQuestions = {};
  allResults.forEach(bgQuestion => {
    const arrayInfoQuestion = bgQuestion.results.infoAnswers;
    for(let question of arrayInfoQuestion){
      const questionName = question.question;
      if(!infoQuestions[questionName]){
          infoQuestions[questionName]= {Yes : 0, No:0};
        }
        question.answer === 'Oui'? infoQuestions[questionName].Yes+=1: infoQuestions[questionName].No+=1;
    }
  })
// get the container 
    const bgQuestionConatainer = document.getElementById('background-questions');
    bgQuestionConatainer.replaceChildren();
  Object.keys(infoQuestions).forEach(question => {

    const total = infoQuestions[question].Yes + infoQuestions[question].No;
    const avgYes = Math.round((infoQuestions[question].Yes / total) * 100);
    const avgNo = Math.round((infoQuestions[question].No / total) * 100);
const chartId = `chart-${btoa(unescape(encodeURIComponent(question))).replace(/=/g, '')}`;
   
    
    const topicEl = document.createElement('div');
    topicEl.className = "card bg-white brad-8 p-20 d-flex flex-column gap-5";
    topicEl.style.width = '400px';
    topicEl.style.height = '300px';
    topicEl.innerHTML = `<h4 >${question}</h4>
                        <canvas id="${chartId}" class="pb-10" width="400" height="200"></canvas>`

    bgQuestionConatainer.appendChild(topicEl)


 new Chart(document.getElementById(chartId), {
    type: "doughnut",
    data: {
      labels:["Oui", "Non"],
      datasets: [{
        label: "Average Score (%)",
        data: [avgYes, avgNo],
        backgroundColor: [
        "#0784eb",
        "#eee",
        
      ],

      }]
    },
    options: {
      responsive: true,
      scales: {
        y: { beginAtZero: true, max: 100 }
      }
    }
  });
  });
  
} 
const searchInput = document.getElementById('student-search-input');

searchInput.addEventListener('input', ()=> {
    
    showFiltred(searchInput.value);

} )

function showFiltred(value){
    const allResults = getSessionsFromLS();
    const tableBody = document.getElementById('table-body');
    tableBody.innerText = '';
  if(allResults.length === 0){
    tableBody.innerText = 'No data to show ...';
    return;
  }

  
  const filteredResults = allResults.filter(student => {
    const fullName = `${student.student.firstName} ${student.student.lastName}`.toLowerCase();
    return fullName.includes(value);
  });
    if (filteredResults.length === 0) {
    tableBody.innerText = 'No matching students found.';
    return;
  }

  renderStudentTable(filteredResults);
 
}

function renderStudentTable(results) {
  const tableBody = document.getElementById('table-body');
  
  if (!results || results.length === 0) {
    tableBody.innerHTML = '<tr><td colspan="5">No data to show...</td></tr>';
    return;
  }

  const studentStat = {};

  results.forEach(student => {
    const studentName = `${student.student.firstName} ${student.student.lastName}`;
    const studentScore = student.results.percentage;
    const studentClass = student.student.className;
    const studentStatus = studentScore < 45 ? "Besoin de soutien" :
                         studentScore < 75 ? '	Intermédiaire' : 'Avancé(e)';

    studentStat[studentName] = { score: studentScore, className: studentClass, status: studentStatus };
  });


  tableBody.innerHTML = '';

  Object.keys(studentStat).sort().forEach(studentName => {
    const data = studentStat[studentName];
    const fillClass = data.status === "Besoin de soutien" ? 'prog-fill-red' :
                     data.status === '	Intermédiaire' ? 'prog-fill-orange' : 'prog-fill-green';
    const statusClass = data.status === 'Avancé(e)' ? 'advanced-fill' :
                       data.status === '	Intermédiaire' ? 'advanced-fill' : 'needs-support-fill';

    const row = document.createElement('tr');

    row.innerHTML = `
      <td>${studentName}</td>
      <td>
        <div class="topic-info d-flex flex-between flex-align-items gap-10 font-14" style="width: 8rem">
          <span class="topic-score">${francophoneSysMarks(data.score)}/20</span>
          <div class="progress-bar">
            <div class="progress-fill animate ${fillClass}" style="--target-fill: ${data.score}%;"></div>
          </div>
        </div>
      </td>
      <td><span class="${statusClass}">${data.status}</span></td>
      <td>${data.className}</td>
      <td>
        <button class="btn-student d-flex gap-10 flex-align-items brad-8" data-student="${studentName}">
          <i class="fa-solid fa-eye"></i>
          <span>View Report</span>
        </button>
      </td>
    `;

    tableBody.appendChild(row);


  });

}
 let studentChartInstance = null;

function studentsPerformance(classResult){
  let advanced = 0, intermediate = 0, needSupport = 0;
  const studentsData = [];
  const studentsDataObject = {};
  classResult.forEach(student => {
    const data = student.results.percentage;

    if (data < 25) {
      needSupport++;
    } else if (data < 75) {
      intermediate++;
    } else {
      advanced++;
    }
  
   
  })
  studentsDataObject.advanced = advanced;
  studentsDataObject.intermediate = intermediate;
  studentsDataObject.needSupport = needSupport;

  studentsData.push(advanced, intermediate, needSupport);
 
  const chart = document.getElementById('students-stats-chart');
    if (studentChartInstance) {
    studentChartInstance.destroy();
  }
  studentChartInstance = new Chart(chart, {
    type: "bar",
    data: {
      labels:["Advanced", "Intermidiate", "Needs Support"],
      datasets: [{
        label: "Student Performance Count",
        data: studentsData,
         backgroundColor: ["#28a745", "#f0ad4e", "#d9534f"],

      }],
    },
    options: {
      responsive: true,
      scales: {
        y: { beginAtZero: true, max: 100 }
      }
    }
  });
  return studentsDataObject;
}

const fileInput = document.getElementById('fileInput');
const fileList = document.getElementById('fileList');



fileInput.addEventListener("change",async (e) => {
  const files = e.target.files; // Get the first (only) file

  if (files.length === 0) return;
  const allResults = [];
  fileList.innerHTML = '<h4>Uploading files...</h4>';
  const fileItem = document.createElement('div');
    fileItem.innerHTML =`<span  style = "color :green"> ✔${files.length} Successfully loaded  </span>`;
    fileList.appendChild(fileItem); 
    setTimeout(() => {
      fileList.replaceChildren();
    }, 1000);
  for(let file of files){
    try {
    const text = await file.text();
    const data = JSON.parse(text);
    allResults.push(data);
   
    
  
  } catch (err) {
    console.error(`Failed to read ${file.name}:`, err);
    const fileItem = document.createElement('div');
    fileItem.innerHTML =`<h4 style = "color :red"> ❌Failed to load <h4>`;
    fileList.appendChild(fileItem);
  }
}
 saveResult(allResults.flat());  // flatten in case multiple arrays
refreshDashboard();

}
);

function refreshDashboard(){
  const results = getSessionsFromLS();

  if (results.length === 0) {
    document.getElementById('report').innerHTML = '<p>No valid data loaded.</p>';
    return;
  }
  saveResult(results)
  // Re-run all your dashboard functions
  renderGlobalStats(results);
  renderClassesFilter(); // This uses getAllClassNames() → uses getSessionsFromLS()
  renderAllClassesAvg(results);
  renderTopicAvgAllByClass(results);
  backgroundQuestions(results);
  renderStudentTable(results);
  studentsPerformance(results);

  
}
export function saveResult(resultArray) {
  const key = 'quizResults';
  localStorage.setItem(key, JSON.stringify(resultArray));
}

function getDiagnosticInsights(results){

  const infoQuestions = {};
  const infoQuestionsAvg = {};
  results.forEach(bgQuestion => {
    const arrayInfoQuestion = bgQuestion.results.infoAnswers;
    for(let question of arrayInfoQuestion){
      const questionName = question.question;
      if(!infoQuestions[questionName]){
          infoQuestions[questionName]= {Yes : 0, No:0};
        }
        question.answer === 'Oui'? infoQuestions[questionName].Yes+=1: infoQuestions[questionName].No+=1;
    }
  })
  for(let question in infoQuestions){
    const data = infoQuestions[question];
    const avgYes = Math.round(data.Yes / (data.Yes + data.No) * 100);
    const avgNo = Math.round(data.No / (data.Yes + data.No) * 100);

    infoQuestionsAvg[question] = {
      question,
      avgYes,
      avgNo
    };

  }
  
  return infoQuestionsAvg;
}


function getStudentPerformanceSummary(results){
  let advanced = 0, intermediate = 0, needSupport = 0;
  const studentsData = [];
  const studentsDataObject = {};
  results.forEach(student => {
    const data = student.results.percentage;

    if (data < 25) {
      needSupport++;
    } else if (data < 75) {
      intermediate++;
    } else {
      advanced++;
    }
  
   
  })
  studentsDataObject.advanced = advanced;
  studentsDataObject.intermediate = intermediate;
  studentsDataObject.needSupport = needSupport;

  studentsData.push(advanced, intermediate, needSupport);
  return studentsData;
}


function getStudentTableData(results){

  if (!results || results.length === 0) {
    return;
  }

  const studentStat = {};

  results.forEach(student => {
    const studentName = `${student.student.firstName} ${student.student.lastName}`;
    const studentScore = student.results.percentage;
    const studentClass = student.student.className;
    const studentStatus = studentScore < 45 ? 'Needs support' :
                         studentScore < 75 ? 'Intermediate' : 'Advanced';

    studentStat[studentName] = { score: studentScore, className: studentClass, status: studentStatus };
  });

  return studentStat;
}
function generateAllClassesReport() {
  const allResults = getSessionsFromLS();
  const report = {
    type: "All Classes Report",
    generatedAt: new Date().toLocaleString(),
    summary : getGlobalStats(allResults),
    classAverages: getAllClassesAvg(allResults),
    topicBreakdown: getTopicMastery(allResults),
    backgroundData: getDiagnosticInsights(allResults),
    performances : getStudentPerformanceSummary(allResults),
    studentsPerformanceDetails : getStudentTableData(allResults),
  };

  return report;
}

function generateClassReport(className){
  const results = getSessionsFromLS().filter(res => 
    res.student.className === className);
  
  return {
      type : `Class Report`,
      class: className,
      summary : getGlobalStats(results),
      backgroundData : getDiagnosticInsights(results),
      topicMastery: getTopicMastery(results),
      studentList: getStudentTableData(results)
    };
}

  
document.addEventListener('DOMContentLoaded', () => {
  const tableBody = document.querySelector('.main-table tbody');

  // Use event delegation: listen on tbody, check if button was clicked
  tableBody.addEventListener('click', (e) => {
    const btn = e.target.closest('button.btn-student');
    if (btn) {
      const studentName = btn.dataset.student;
      const report = generateStudentReport(studentName);
      displayReport(report);
    }
  });
});

function displayReport(report) {
  if (!report) return;

  // 1. Get the modal
  const modal = document.getElementById('report-modal');
  const content = document.getElementById('modal-content');

    if (report.type.includes("All Classes")) {
    content.innerHTML = renderGlobalDiagnostic(report);
  } else if (report.type.includes("Class")) {
    // content.innerHTML= renderClassSummary(report);
  } else if (report.type.includes("Student")) {
    content.innerHTML= renderStudentSummary(report);
  }

  
  // 3. Show modal
  modal.style.display = 'block';
}
function renderGlobalDiagnostic(report) {
  const allClassAvgs = report.classAverages;
  const allClassesInfo = report.backgroundData;
  const allClassesPerformences = report.topicBreakdown;
  const studentsList = report.studentsPerformanceDetails;
 
 function renderStudentsList(studentList) {
  return Object.entries(studentList).map(([name, cls]) => `
    <tr>
      <td>${name}</td>
      <td>
        <div class="topic-info d-flex flex-between flex-align-items gap-10 font-14" style="width: 8rem">
          <span class="topic-score">${cls.score}% (${francophoneSysMarks(cls.score)} / 20)</span>
        </div>
      </td>
      <td>
        <span class="${
          cls.status === 'Advanced' ? 'advanced-fill' :
          cls.status === 'Intermediate' ? 'advanced-fill' :
          'needs-support-fill'
        }">${cls.status}</span>
      </td>
      <td>${cls.className}</td>
    </tr>
  `).join('');
}

  function renderAllClassAvgs(classAvgs) {
      let fillClass = '';

    return classAvgs.map(cls => `
      <div class="class-average d-flex gap-10 flex-center">
        <span class="class-name"><strong>${cls.className}</strong></span>
        <div class="progress-bar">
            <div class="progress-fill animate prog-fill-blue" style="--target-fill: ${cls.avg}%;"> </div>
        </div>
        <span> ${cls.avg}% </span>
      </div>
    `).join('');
  }
  function renderInfoChartTable() {
  const data = getInfoQuestionsByClass(); // structure: { questionText: { className: {avgYes, avgNo} } }
  
  // Get all unique class names
  const allClassNames = new Set();
  Object.values(data).forEach(classStats =>
    Object.keys(classStats).forEach(cls => allClassNames.add(cls))
  );

  const classList = Array.from(allClassNames);

  // Generate table headers
  const tableHeader = `
    <thead>
      <tr>
        <th>Question</th>
        ${classList.map(cls => `<th>${cls}</th>`).join('')}
      </tr>
    </thead>
  `;

  // Generate table rows
  const tableBody = `
    <tbody>
      ${Object.entries(data).map(([questionText, classStats]) => `
        <tr>
          <td>${questionText}</td>
          ${classList.map(cls => {
            const stat = classStats[cls];
            return stat
              ? `<td>Oui: ${stat.avgYes}%<br>Non: ${stat.avgNo}%</td>`
              : `<td>-</td>`;
          }).join('')}
        </tr>
      `).join('')}
    </tbody>
  `;

  return `
    <div class="printable-chart">
      <h3>📝 Résultats par question et par classe</h3>
      <table class="info-table">
        ${tableHeader}
        ${tableBody}
      </table>
    </div>
  `;
}


 function renderAllClassTopic(classTopic) {
    return Object.values(classTopic).map(cls => `
      <div class="class-average">
        <span class="class-name"><strong>${cls.name}</strong></span> : 
        <span class="class-avg">${cls.average}%</span>
      </div>
    `).join('');
  }
  return `
    <div class="summary-content" id="report-page"> 
      <h2 class="txt-c">Rapport d'Évaluation Diagnostique</h2>
      <p class="font-14 txt-c">Fait le : ${report.generatedAt || new Date().toLocaleDateString("fr-FR")} | Toutes les classes</p>

      <h4>Introduction</h4>
      <p>Dans le cadre de l'amélioration du processus d'apprentissage, une évaluation diagnostique a été réalisée le ${report.generatedAt} dans la salle d'informatique, afin d'analyser les prérequis et les savoirs des apprenants en informatique.</p>
      
      <hr>
      
      <ul>
        <li><strong>Matière :</strong> Informatique</li>
        <li><strong>Prof :</strong> ${report.summary.teacher || "Abdel el"}</li>
        <li><strong>Nombre d'apprenants :</strong> ${report.summary.totalStudents}</li>
        <li><strong>Moyenne des classes :</strong> ${report.summary.average}%</li>
        <li><strong>Nombre de classes :</strong> ${allClassAvgs.length}</li>
      </ul>
      
      <hr>
      
      <div id="charts-insight">
        <p><em>Aperçu des moyennes par classe</em></p>
        ${renderAllClassAvgs(allClassAvgs)}
        </div>
      <hr>
      <div id="background-insight">
        <p><em>Aperçu des accesibilité par classe</em></p>
        ${renderInfoChartTable()}
      </div>
      <hr>
       <div id="topics-insight">
        <p><em>Aperçu des performence par classe</em></p>
        ${renderAllClassTopic(allClassesPerformences)}
      </div>
      <hr>
        <div id="students-list">
        <p><em>List des performence des apprennants</em></p>
        <div class="main-table p-15">
                                    <table class="" style="width: 100%;"> 

                                    <thead>
                                        <tr>
                                        <th scope="col">Name</th>
                                        <th scope="col">Score</th>
                                        <th scope="col">Status</th>
                                        <th scope="col">Class</th>
                                        
                                        </tr>
                                    </thead>
                                    <tbody id="table-body" >
                                        
                                    ${renderStudentsList(studentsList)}
                                    </tbody>

                                    </table>
                            </div>
      </div>
    </div>`;
}


function renderStudentSummary(report) { 
  return `
    <div class="student-report">
      <h2>${report.student.name}</h2>
      <p><strong>Classe:</strong> ${report.student.className}</p>
      <p><strong>Note:</strong> ${francophoneSysMarks(report.score.percentage)} / 20</p>
      <p><strong>Status:</strong> <span class="${getStatusClass(report.status)}">${report.status}</span></p>
      
      <h3>Points forts</h3>
      <ul>
        ${report.strengths.map(t => `<li>${t}</li>`).join('')}
      </ul>
      
      <h3>Points à améliorer</h3>
      <ul>
        ${report.weaknesses.map(t => `<li>${t}</li>`).join('')}
      </ul>
    </div>
  `;
}

function getStatusClass(status) {
  return status === 'Avancé(e)' || status === 'Intermédiaire' ? 'advanced-fill' : 'needs-support-fill';
}

// Print button
document.getElementById('print-report').addEventListener('click', () => {
  const report = generateAllClassesReport();
  
  // Open new popup window
  const printWindow = window.open('', '_blank');
  
  // Build the HTML content
  const content = `
    <html>
      <head>
        <title>Rapport d'Évaluation</title>
        <link rel="stylesheet" href="css/dashboard.css" type="text/css" />
        <link rel="stylesheet" href="css/framework.css" type="text/css" />
        <style>
          @media print {
            body {
              margin: 1cm;
            }
            .page-break {
              page-break-before: always;
            }
          }
        </style>
      </head>
      <body>
        ${renderGlobalDiagnostic(report)}
      </body>
    </html>
  `;

  printWindow.document.open();
  printWindow.document.write(content);
  printWindow.document.close();
  
  // Wait a bit for styles to load before printing
  printWindow.onload = () => {
    printWindow.focus();
    printWindow.print();
    // Optionally close after print
    // printWindow.close();
  };
});function getInfoQuestionsByClass() {
  const allResults = getSessionsFromLS();
  const infQuestions = {};

  // Regrouper les réponses info par classe
  allResults.forEach(res => {
    const className = res.student.className;
    const questions = res.results.infoAnswers;

    if (!infQuestions[className]) {
      infQuestions[className] = [];
    }

    infQuestions[className].push(questions);
  });

  const resultByClass = {};

  // Étape 1 : Calculer les pourcentages par classe
  for (const [cls, answersList] of Object.entries(infQuestions)) {
    const questionStats = {};
    const questionTextMap = {};

    answersList.forEach(answerObj => {
      for (const [qKey, response] of Object.entries(answerObj)) {
        const answer = response.answer.toLowerCase();
        const questionText = response.question;

        if (!questionStats[questionText]) {
          questionStats[questionText] = { yes: 0, no: 0 };
        }

        if (answer === "oui") {
          questionStats[questionText].yes += 1;
        } else if (answer === "non") {
          questionStats[questionText].no += 1;
        }
      }
    });

    resultByClass[cls] = {};

    for (const [questionText, counts] of Object.entries(questionStats)) {
      const total = counts.yes + counts.no;

      resultByClass[cls][questionText] = {
        avgYes: total ? (counts.yes / total * 100).toFixed(1) : "0.0",
        avgNo: total ? (counts.no / total * 100).toFixed(1) : "0.0"
      };
    }
  }

  // Étape 2 : Transformer le résultat par classe en résultat par question
  const resultByQuestion = {};

  for (const [className, questions] of Object.entries(resultByClass)) {
    for (const [question, stats] of Object.entries(questions)) {
      if (!resultByQuestion[question]) {
        resultByQuestion[question] = {};
      }

      resultByQuestion[question][className] = stats;
    }
  }

  return resultByQuestion;
}
document.getElementById('download-pdf').addEventListener('click', () => {
  const report = generateAllClassesReport();
  const reportHTML = renderGlobalDiagnostic(report);

const pdfContainer = document.getElementById('pdf-container');
pdfContainer.innerHTML = reportHTML;
pdfContainer.style.display = 'block'; // 👈 rends-le visible

setTimeout(() => {
  html2pdf()
    .from(pdfContainer)
    .set({
      margin: 0.5,
      filename: 'rapport-diagnostic.pdf',
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' }
    })
    .save()
    .then(() => {
      pdfContainer.style.display = 'none'; // 👈 le cacher à nouveau après génération
    });
}, 500);
});



// Close modal
document.getElementById('close-modal').onclick = () => {
  document.getElementById('report-modal').style.display = 'none';
};


function exportToCSV(data, filename) {
  if (!data.length) return;

  const headers = Object.keys(data[0]);
  const rows = data.map(row => headers.map(h => `"${row[h]}"`).join(','));
  const csv = [headers.join(','), ...rows].join('\n');

  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
}

function prepareStudentData() {
  const allData = getStudentTableData(getSessionsFromLS());
  const studentData = [];
  for (const [name, record] of Object.entries(allData)) {
    studentData.push({
      Name: name,
      Class: record.className || "Unknown",
      Score: record.score || 0
    });
  }

  return studentData;
}

document.getElementById('csv-export').addEventListener('click', () => {
  const data = prepareStudentData();
  exportToCSV(data, 'student-results.csv');
});



