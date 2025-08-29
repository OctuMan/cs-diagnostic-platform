

function renderAddQuestionForm() {
  const questionEditor = document.getElementById('question-editor');
  questionEditor.innerHTML = '';

  const editorContainer = document.createElement('div');
  editorContainer.className = 'md:col-span-2 bg-white p-2 rounded-lg shadow w-full';
  editorContainer.id = 'editor-form';

  editorContainer.innerHTML = `
    <h2 class="text-xl font-bold mb-4">Add Question</h2>
    <form  id='question-form' class="flex flex-col gap-4">
      <input type="text" name="questionText" placeholder="Question Text" class="border p-3 rounded-lg w-full" required />
      
      <select id="select-types" name="type" class="border p-3 rounded-lg w-full">
      <option disabled selected >Choose a type </option>
        <option value="info">Info (backgraound & Access)</option>
        <option value="qcm">QCM</option>
        <option value="association">Association (Drag N Drop)</option>
        <option value="img">Image</option>
      </select>

      <div class="dynamic-fields"></div>

      <div id="meta-fields" class="flex flex-wrap gap-3">
        <input id="question-points" name="point" type="number" min="0" placeholder="Points" class="border p-2 rounded-lg w-32" />
        <select id="select-topic" name="topic" class="border p-3 rounded-lg w-full">
        <option disabled selected >Choose a topic </option>
          <option value="Computer Systems (Hardware)">Computer Systems (Hardware)</option>
          <option value="Computer Systems (Software)">Computer Systems (Software)</option>
          <option value="Operating Systems">Operating Systems</option>
          <option value="Networks">Networks</option>
          <option value="programming">Programming</option>
      </select>
      </div>

      <div class="flex justify-end gap-3 mt-4">
        <button type="reset" class="bg-gray-200 px-4 py-2 rounded-lg hover:bg-gray-300">Cancel</button>
        <button id="saveBtn" type="submit" class="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600">Save Question</button>
      </div>
    </form>
  `;

  questionEditor.append(editorContainer);

  const form = editorContainer.querySelector('form');
  const selectTypes = form.querySelector('#select-types');
  const dynamicFields = form.querySelector('.dynamic-fields');
  const metaFields = form.querySelector('#meta-fields');

  
  selectTypes.addEventListener('change', (e) => {
    dynamicFields.innerHTML = ''; 
    metaFields.style.display = 'flex'; 

    if (e.target.value === 'qcm') {
      dynamicFields.append(renderQcmFields());
    } else if (e.target.value === 'info') {
      dynamicFields.append(renderInfoFields());
      metaFields.style.display = 'none'; // hide points/topic for info
    } else if (e.target.value === 'img') {
      dynamicFields.append(renderImageFields());
    }else if (e.target.value === 'association') {
      dynamicFields.append(renderAssociationFields());
    }
  });

  // Handle submit
form.addEventListener('submit', (e) => {
  e.preventDefault();

  const formData = new FormData(form);
  const data = Object.fromEntries(formData);
  const existingId = form.dataset.editId;
const id = existingId || "id-" + Date.now();
  // Create clean question object
  const question = {
    id: id,
    type: data.type,
    question: data.questionText.trim(),
    point: Number(data.point) || 0
  };

  // Map UI topic to internal key
  const topicMap = {
    "Computer Systems (Hardware)": "computerSystems",
    "Computer Systems (Software)": "software",
    "Operating Systems": "os",
    "Networks": "networking",
    "Programming": "programming"
  };
  question.topic = topicMap[data.topic] || "general";

  // Handle each type
  if (question.type === 'qcm' || question.type === 'info') {
    const answerInputs = form.querySelectorAll('input[name="answer[]"]');
    question.answers = Array.from(answerInputs)
      .map(inp => inp.value.trim())
      .filter(Boolean);

    if (question.type === 'qcm') {
     
  // Convert letter (A/B/C/D) to zero-based index
  const letters = ['A', 'B', 'C', 'D'];
  const selectedLetter = data.correct; // e.g., "A"
  
  // Find the index of the selected letter
  const index = letters.indexOf(selectedLetter);
  
  // Save the index instead of the letter
  question.correct = index; 


    }
        if (question.type === 'info') {
     

  
  // Save the index instead of the letter
  question.correct = null; 
  question.point = 0;
  question.topic = 'info'


    }
  }

  else if (question.type === 'association') {
  const pairs = form.querySelectorAll('.pair-row');
  question.answers = Array.from(pairs).map(pair => {
    const imgInput = pair.querySelector('input[type="file"]');
    const targetInput = pair.querySelector('input[name="associationTarget"]');
    const file = imgInput.files[0];

    return {
      source: imgInput.dataset.imageData, // ✅ Base64 string
      target: targetInput.value.trim()
    };
  }).filter(a => a.source && a.target); // Only valid pairs

  if (question.answers.length === 0) {
    alert("❌ Association: Add at least one image and target.");
    return;
  }
}

else if (question.type === 'img') {
  const imgInput = form.querySelector('input[name="questionImg"]');
  const correctInput = form.querySelector('input[name="correct"]'); // Get the correct answer input
  const file = imgInput.files[0];
  
  if (!file) {
    alert("⚠ Please upload an image.");
    return;
  }

  const base64Image = imgInput.dataset.imageData;
  if (!base64Image) {
    alert("⚠ Image not loaded. Wait for upload.");
    return;
  }

  // Get the correct answer from the input field
  const correctAnswer = correctInput ? correctInput.value.trim() : '';
  if (!correctAnswer) {
    alert("⚠ Please provide a correct answer.");
    return;
  }

  question.source = base64Image; 
  // ✅ Fix: Properly set correctAnswers with the actual answer
  question.correctAnswers = [correctAnswer];
}
if (existingId) {
  // EDIT MODE: replace
  const index = questions.findIndex(q => q.id === existingId);
  if (index !== -1) {
    questions[index] = question;
  }
} else {
  // ADD MODE: push
  questions.push(question);
}
 
  renderQuestions(questions);
  document.getElementById('editor-form').remove();
  saveToLocalStorage(questions);
  
});


}


function renderQcmFields() {
  const div = document.createElement('div');
  div.className = 'qcm-fields flex flex-col gap-2 my-2';

  const ans = ['A', 'B', 'C', 'D'];  
  const selectAns = document.createElement('select');
  selectAns.className = "border p-2 rounded-lg my-2";
  selectAns.name = "correct";

  const defaultOption = document.createElement('option');
  defaultOption.textContent = 'Correct Answer';
  defaultOption.disabled = true;
  defaultOption.selected = true;
  selectAns.append(defaultOption);

  for (let i = 0; i < ans.length; i++) {
    const input = document.createElement('input');
    input.type = 'text';
    input.name = 'answer[]';
    input.placeholder = `${ans[i]} - Answer ${i+1}`;
    input.className = 'border p-2 rounded-lg';
    input.required = true;

    const option = document.createElement('option');
    option.value = ans[i];
    option.textContent = ans[i];
    
    div.append(input);
    selectAns.append(option);
  }
  
  div.append(selectAns);
  return div;
}


function renderInfoFields() {
  const div = document.createElement('div');
  div.className = 'info-fields flex flex-col gap-2 my-2';

  const ans = ['A', 'B'];
  for (let i = 0; i < ans.length; i++) {
    const input = document.createElement('input');
    input.type = 'text';
    input.name = 'answer[]';
    input.placeholder = `${ans[i]} - Answer ${i+1}`;
    input.className = 'border p-2 rounded-lg';
    input.required = true;
    div.append(input);
  }
  return div;
}
function renderImageFields() {
  const div = document.createElement('div');
  div.className = 'img-fields flex flex-col gap-2 my-2';

  const label = document.createElement('label');
  label.textContent = "Upload image:";
  label.className = "text-sm font-medium";

  const uploadImg = document.createElement('input');
  uploadImg.type = 'file';
  uploadImg.name = "questionImg";
  uploadImg.accept = "image/png, image/jpeg";
  uploadImg.required = true;
  uploadImg.className = "border p-2 rounded";

  // ✅ Read as Base64 and store
  uploadImg.addEventListener('change', function () {
    const file = this.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      uploadImg.dataset.imageData = e.target.result; // ✅ Base64 string
      
    };
    reader.readAsDataURL(file);
  });

  const input = document.createElement('input');
  input.type = 'text';
  input.name = "correct";
  input.placeholder = "Correct answer (e.g. Motherboard)";
  input.className = 'border p-2 rounded-lg';

  div.append(label, uploadImg, input);
  return div;
}
function renderAssociationFields() {
  const container = document.createElement('div');
  container.className = 'association-container flex flex-col gap-4';

  const pairsContainer = document.createElement('div');
  pairsContainer.className = 'pairs-list flex flex-col gap-3';

  // Add first empty pair by default
  addAssociationPair(pairsContainer);

  // Add "Add Pair" button
  const addPairBtn = document.createElement('button');
  addPairBtn.type = 'button';
  addPairBtn.className = 'self-start p-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 text-sm';
  addPairBtn.innerHTML = '<i class="fa-solid fa-plus mr-1"></i> Add Pair';
  addPairBtn.addEventListener('click', () => addAssociationPair(pairsContainer));

  container.append(pairsContainer, addPairBtn);
  return container;
}
function addAssociationPair(container) {
  const pairRow = document.createElement('div');
  pairRow.className = 'pair-row flex flex-col flex-wrap md:flex-row gap-3 p-3 border border-dashed border-gray-300 rounded-lg bg-gray-50 md:items-center';

  // Image upload
  const imgDiv = document.createElement('div');
  imgDiv.className = 'flex flex-col gap-1 flex-1';

  const imgLabel = document.createElement('label');
  imgLabel.textContent = 'Image:';
  imgLabel.className = 'text-xs font-medium text-gray-600';

  const imgInput = document.createElement('input');
  imgInput.type = 'file';
  imgInput.accept = 'image/png, image/jpeg';
  imgInput.required = true;
  imgInput.className = 'border p-2 rounded text-sm';

  // ✅ Add event listener to read Base64
  imgInput.addEventListener('change', function () {
    const file = this.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function (e) {
      // Save Base64 on the input for later access
      imgInput.dataset.imageData = e.target.result;
    };
    reader.readAsDataURL(file);
  });

  imgDiv.append(imgLabel, imgInput);

  // Arrow
  const arrowWrap = document.createElement('div');
  arrowWrap.className = 'flex items-center justify-center h-10 w-10 text-gray-400';
  arrowWrap.innerHTML = '<i class="fa-solid fa-arrow-down md:-rotate-90"></i>';

  // Target input
  const targetDiv = document.createElement('div');
  targetDiv.className = 'flex flex-col gap-1 flex-1';

  const targetLabel = document.createElement('label');
  targetLabel.textContent = 'Target:';
  targetLabel.className = 'text-xs font-medium text-gray-600';

  const targetInput = document.createElement('input');
  targetInput.type = 'text';
  targetInput.name = 'associationTarget';
  targetInput.placeholder = 'e.g. Processeur';
  targetInput.className = 'border p-2 rounded-lg';
  targetInput.required = true;

  targetDiv.append(targetLabel, targetInput);

  // Remove button
  const removeBtn = document.createElement('button');
  removeBtn.type = 'button';
  removeBtn.className = 'p-2 text-red-500 hover:text-red-700 self-end md:self-center';
  removeBtn.innerHTML = '<i class="fa-solid fa-trash"></i>';
  removeBtn.addEventListener('click', () => pairRow.remove());

  pairRow.append(imgDiv, arrowWrap, targetDiv, removeBtn);
  container.appendChild(pairRow);
}

function setupEventListeners() {
  document.querySelectorAll('.addBtn').forEach(btn => {
    btn.addEventListener('click', renderAddQuestionForm);
  });
  document.getElementById('previewBtn').addEventListener('click', () => {
  if (questions.length === 0) {
    alert("No questions to preview.");
    return;
  }

  localStorage.setItem("dynamicQuiz", JSON.stringify(questions));

    // ✅ Set preview flag
  localStorage.setItem("isPreview", "true");
  
  const questionEditor = document.getElementById('question-editor');
  questionEditor.innerHTML = '';
  questionEditor.innerHTML = ` <iframe src="quiz.html" class = "w-full h-screen" title="Iframe Example"></iframe>
`
  // window.location.href = "quiz.html"; 
  });

 // ✅ Event delegation for delete buttons
  document.getElementById('questions-card').addEventListener('click', (e) => {
    if (e.target.classList.contains('delete-btn')) {
      const id = e.target.getAttribute('data-id');
      
      removeQuestion(id);
    }
  });
  document.getElementById('questions-card').addEventListener('click', (e)=> {
        if (e.target.classList.contains('edit-btn')) {
      const id = e.target.getAttribute('data-id');
      
      editQuestion(id);
    }
  })

  //Send Quiz link 
document.getElementById('sendBtn').addEventListener('click', () => {
  if (questions.length === 0) {
    alert("No questions to preview.");
    return;
  }

  // 🧹 Clean up old quiz entries (except current ones you need)
  const keysToRemove = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key.startsWith('quiz-') && key !== 'currentQuizId') {
      keysToRemove.push(key);
    }
  }
  keysToRemove.forEach(key => localStorage.removeItem(key));

  // ✅ Now create new quiz ID
  const quizId = "quiz-" + Date.now();

  try {
    // Try to save
    localStorage.setItem(quizId, JSON.stringify(questions));
    localStorage.setItem("currentQuizId", quizId);

    // Generate shareable link
    const baseUrl = window.location.origin + window.location.pathname.replace(/\/[^/]*$/, '/');
    const link = `${baseUrl}form.html?quiz=${quizId}`;

    // Display link and QR code...
    const questionEditor = document.getElementById('question-editor');
    questionEditor.innerHTML = '';

    const divLink = document.createElement('div');
    divLink.className = 'w-full bg-gray-50 border border-gray-300 p-4 rounded-2xl shadow-sm flex items-center justify-between gap-3';

    const linkBox = document.createElement('input');
    linkBox.type = 'text';
    linkBox.value = link;
    linkBox.readOnly = true;
    linkBox.className = 'flex-1 px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm font-mono text-gray-700 focus:outline-none cursor-text';

    const copyBtn = document.createElement('button');
    copyBtn.textContent = '📋 Copy';
    copyBtn.className = 'px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition';

    copyBtn.addEventListener('click', () => {
      navigator.clipboard.writeText(link);
      copyBtn.textContent = '✅ Copied!';
      setTimeout(() => (copyBtn.textContent = '📋 Copy'), 2000);
    });

    const qrDisc = document.createElement('p');
    qrDisc.textContent = 'Or Scan This QR Code';

    const qrCodeContainer = document.createElement("div");
    qrCodeContainer.className = 'mt-3 flex justify-center';

    new QRCode(qrCodeContainer, {
      text: link,
      width: 180,
      height: 180,
      colorDark: "#000",
      colorLight: "#fff",
      correctLevel: QRCode.CorrectLevel.H
    });

    divLink.append(linkBox, copyBtn);
    questionEditor.append(divLink, qrDisc, qrCodeContainer);

  } catch (err) {
    if (err.name === 'QuotaExceededError') {
      alert("❌ Cannot send test: Browser storage is full. Please clear old quizzes or use fewer images.");
    } else {
      alert("❌ Unknown error saving quiz: " + err.message);
    }
    console.error("localStorage error:", err);
  }
});

  // Download test button 
document.getElementById('downloadBtn').addEventListener('click', async () => {
  if (questions.length === 0) {
    alert("No questions to preview.");
    return;
  }

  const zip = new JSZip();

  const dataFolder = zip.folder("data");
  const imgFolder = zip.folder("images");
  const cssFolder = zip.folder("css");
  const jsFolder = zip.folder('js');
  // Clone questions so we can rewrite paths
  const packagedQuestions = JSON.parse(JSON.stringify(questions));

  // Handle images (same as before)
  for (let q of packagedQuestions) {
    if (q.type === "img" && q.source) {
      const imgData = q.source.split(",")[1];
      const imgExt = q.source.includes("png") ? "png" : "jpg";
      const imgName = `img-${q.id}.${imgExt}`;
      q.source = `images/${imgName}`;
      imgFolder.file(imgName, imgData, { base64: true });
    }

    if (q.type === "association" && q.answers) {
      q.answers.forEach((pair, i) => {
        if (pair.source) {
          const imgData = pair.source.split(",")[1];
          const imgExt = pair.source.includes("png") ? "png" : "jpg";
          const imgName = `assoc-${q.id}-${i}.${imgExt}`;
          pair.source = `images/${imgName}`;
          imgFolder.file(imgName, imgData, { base64: true });
        }
      });
    }
  }

  // Add testQuestions.json
  dataFolder.file("testQuestions.json", JSON.stringify(packagedQuestions, null, 2));

  // Add HTML files
  const formHtml = await fetch("form.html").then(res => res.text());
  zip.file("form.html", formHtml);

  const quizHtml = await fetch("quiz.html").then(res => res.text());
  zip.file("quiz.html", quizHtml);

  // Add ALL CSS files dynamically
  const cssFiles = [
    "formStyles.css",
    "framework.css",
    "main.css",
    "normalize.css",
    "quizStyle.css"
  ];

  for (let cssFile of cssFiles) {
    const cssContent = await fetch(`css/${cssFile}`).then(res => res.text());
    cssFolder.file(cssFile, cssContent);
  }

    // Add ALL JS files dynamically
  const jsFiles = [
    "student.js",
    "quiz.js",
    "utilities.js",

  ];
 for (let jsFile of jsFiles) {
    const jsContent = await fetch(`js/${jsFile}`).then(res => res.text());
    jsFolder.file(jsFile, jsContent);
  }
  // Build and download ZIP
  zip.generateAsync({ type: "blob" }).then(content => {
    saveAs(content, "testPackage.zip");
  });
});



}

function removeQuestion(id){
      questions = questions.filter(q => q.id !== id);
      saveToLocalStorage(questions);
      renderQuestions(questions);
}
function editQuestion(id) {
  renderAddQuestionForm();

  const qToEdit = questions.find(q => q.id === id);
  const form = document.getElementById('question-form');

  // ✅ reverse map first
  const reverseTopicMap = {
    computerSystems: "Computer Systems (Hardware)",
    software: "Computer Systems (Software)",
    os: "Operating Systems",
    networking: "Networks",
    programming: "Programming",
    info: "Choose a topic"
  };

  // Prefill
  form.questionText.value = qToEdit.question;
  form.point.value = qToEdit.point;
  form.type.value = qToEdit.type;
  form.topic.value = reverseTopicMap[qToEdit.topic] || "Choose a topic";

  // ✅ set editId before submit handler
  form.setAttribute("data-edit-id", qToEdit.id);

  // Trigger field rendering *after* type set
  form.type.dispatchEvent(new Event("change"));

  // Fill answers depending on type
  if (qToEdit.type === "qcm" || qToEdit.type === "info") {
    const answerInputs = form.querySelectorAll('input[name="answer[]"]');
    qToEdit.answers.forEach((ans, i) => {
      if (answerInputs[i]) answerInputs[i].value = ans;
    });

    if (qToEdit.type === "qcm") {
      const correctSelect = form.querySelector('select[name="correct"]');
      const letters = ['A', 'B', 'C', 'D'];
      correctSelect.value = letters[qToEdit.correct];
    }
  } else if (qToEdit.type === "img") {
    const correctInput = form.querySelector('input[name="correct"]');
    if (correctInput) correctInput.value = qToEdit.correct || "";
  } else if (qToEdit.type === "association") {
    const pairsContainer = form.querySelector(".pairs-list");
    pairsContainer.innerHTML = "";
    qToEdit.answers.forEach(pair => {
      addAssociationPair(pairsContainer);
      const lastRow = pairsContainer.lastElementChild;
      const targetInput = lastRow.querySelector('input[name="associationTarget"]');
      if (targetInput) targetInput.value = pair.target;
    });
  }

  // Change button text
  const saveBtn = document.getElementById("saveBtn");
  saveBtn.textContent = "Update Question";
}

document.addEventListener('DOMContentLoaded',()=>{
  setupEventListeners();
  questions = loadFromLocalStorage();
  renderQuestions(questions);
}
   

);


// Data + rendering
let questions = [];

function renderQuestions(questionData) {
  const qCards = document.getElementById('questions-card');
  qCards.innerHTML = '';
  
  questionData.forEach((question) => {
    const card = document.createElement('div');
    card.className = "question-card flex flex-col gap-3 p-5 border rounded-lg shadow-sm bg-white hover:shadow-md transition";

    const topRow = document.createElement('div');
    topRow.className = "flex justify-between items-start";

    const qTitle = document.createElement('h4');
    qTitle.className = "text-base font-semibold text-gray-800";
    qTitle.textContent = question.question;

    const controls = document.createElement('div');
    controls.className = 'controles flex gap-3 text-gray-500';

    const editBtn = document.createElement('i');
    editBtn.className = "edit-btn fa-solid fa-pen-to-square cursor-pointer hover:text-blue-600 transition";
    editBtn.setAttribute('data-id', question.id);

    const deleteBtn = document.createElement('i');
    deleteBtn.className = "delete-btn  fa-solid fa-trash cursor-pointer hover:text-red-500 text-red-500-important transition";
    deleteBtn.style.color = '#ef4444';
    deleteBtn.setAttribute('data-id', question.id);
   

    controls.append(editBtn, deleteBtn);
    topRow.append(qTitle, controls);

    const meta = document.createElement('div');
    meta.className = "flex flex-wrap gap-2 text-sm";

    const type = document.createElement('span');
    type.className = "px-2 py-1 rounded-full bg-blue-50 text-blue-700 font-medium";
    type.textContent = question.type;

    const points = document.createElement('span');
    points.className = "px-2 py-1 rounded-full bg-green-50 text-green-700 font-medium";
    points.textContent = `${question.point} pts`;

    const correct = document.createElement('span');
    correct.className = "px-2 py-1 rounded-full bg-gray-100 text-gray-700";
    
    if (question.type === 'qcm') {
      const answers = ['A', 'B', 'C', 'D'];
      correct.textContent = `✔ ${answers[question.correct]}`;
    } else if (question.type === 'img') {
      const correctAnswer = question.validAnswers?.[0] || "—";
  correct.textContent = `Answer: ${correctAnswer}`;
    } else if (question.type === 'association') {
      correct.textContent = `Pairs: ${question.answers.length}`;
    } else {
      correct.textContent = "—";
    }

    meta.append(type, points, correct);
    card.append(topRow, meta);
    qCards.appendChild(card);
  });
}



function saveToLocalStorage(test) {
  const TEST_KEY = "test";
  localStorage.setItem(TEST_KEY, JSON.stringify(test));
}


function loadFromLocalStorage() {
  const TEST_KEY = "test";
  const saved = localStorage.getItem(TEST_KEY);
  return saved ? JSON.parse(saved) : [];
}