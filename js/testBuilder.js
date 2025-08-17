

function renderAddQuestionForm() {
  const questionEditor = document.getElementById('question-editor');
  questionEditor.innerHTML = '';

  const editorContainer = document.createElement('div');
  editorContainer.className = 'md:col-span-2 bg-white p-6 rounded-lg shadow';
  editorContainer.innerHTML = `
    <h2 class="text-xl font-bold mb-4">Add Question</h2>
    <form class="flex flex-col gap-4">
      <input type="text" name="questionText" placeholder="Question Text" class="border p-3 rounded-lg w-full" required />
      <select id="select-types" name="type" class="border p-3 rounded-lg w-full">
        <option value="info">Info</option>
        <option value="qcm">QCM</option>
        <option value="association">Association</option>
        <option value="img">Image</option>
      </select>
      <div class="dynamic-fields"></div>
     
      <select class="border p-2 rounded-lg">
 <option>Correct Answer</option>
 </select>
    <input type="number" placeholder="Points" class="border p-2 rounded-lg w-32" required/>
        <input type="text" placeholder="Topic" class="border p-2 rounded-lg w-48" required/>
       </div>

      <div class="flex justify-end gap-3 mt-4">
        <button class="bg-gray-200 px-4 py-2 rounded-lg hover:bg-gray-300">Cancel</button>
        <button id="saveBtn" class="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600">Save Question</button>
      </div>
    </form>
  `;

  questionEditor.append(editorContainer);

  const form = editorContainer.querySelector('form');
  const selectTypes = form.querySelector('#select-types');
  const dynamicFields = form.querySelector('.dynamic-fields');

  selectTypes.addEventListener('change', (e) => {
    dynamicFields.innerHTML = ''; // clear old fields
    if (e.target.value === 'qcm') {
      dynamicFields.append(renderQcmFields());
    }
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(form));
    console.log("Form data:", data);
  });
}

function renderQcmFields() {
  const div = document.createElement('div');
  div.className = 'qcm-fields flex flex-col gap-2 my-2';

  for (let i = 1; i <= 4; i++) {
    const input = document.createElement('input');
    input.type = 'text';
    input.name = `answer${i}`;
    input.placeholder = `Answer ${i}`;
    input.className = 'border p-2 rounded-lg';
    input.required = true;
    div.append(input);
  }
  return div;
}

function setupEventListeners() {
  document.getElementById('addBtn')
    .addEventListener('click', renderAddQuestionForm);
}

document.addEventListener('DOMContentLoaded', setupEventListeners);


function handleQcmQuestions(){ 
    const div = document.createElement('div');
    div.innerHTML='';
    div.className = 'qcm-fields flex flex-col gap-2 my-4';
   
    for(let i = 0; i < 4; i++){
        let input = document.createElement('input');
        input.type = 'text';
        input.placeholder = "Answer "+ (i+1);
        input.className = 'border p-2 rounded-lg';
        input.required;
        div.appendChild(input)
    }

    return div;
}

function setupEventLestners() {
    const addButton = document.getElementById('addBtn');
    addButton.addEventListener('click', renderAddQuestionForm);

}

document.addEventListener('DOMContentLoaded', ()=> {
    setupEventLestners();
})

// questionEditor.innerHTML = `
// //       <div class="md:col-span-2 bg-white p-6 rounded-lg shadow">
// //     <h2 class="text-xl font-bold mb-4">Add Question</h2>
// //     <form class="flex flex-col gap-4">
// //       <input type="text" placeholder="Question Text" class="border p-3 rounded-lg w-full" required/>
// //       <select class="border p-3 rounded-lg w-full">
// //         <option value="info">Info</option>
// //         <option value="qcm">QCM</option>
// //         <option value="association">Association</option>
// //         <option value="img">Image</option>
// //       </select>
// //       <!-- QCM Fields -->
// //       <div class="qcm-fields flex flex-col gap-2">
// //         <input type="text" placeholder="Answer 1" class="border p-2 rounded-lg " required/>
// //         <input type="text" placeholder="Answer 2" class="border p-2 rounded-lg" required/>
// //         <input type="text" placeholder="Answer 3" class="border p-2 rounded-lg" required/>
// //         <input type="text" placeholder="Answer 4" class="border p-2 rounded-lg" required/>
// //         <select class="border p-2 rounded-lg">
// //           <option>Correct Answer</option>
// //         </select>
// //         <input type="number" placeholder="Points" class="border p-2 rounded-lg w-32" required/>
// //         <input type="text" placeholder="Topic" class="border p-2 rounded-lg w-48" required/>
// //       </div>

// //       <div class="flex justify-end gap-3 mt-4">
// //         <button class="bg-gray-200 px-4 py-2 rounded-lg hover:bg-gray-300">Cancel</button>
// //         <button id="saveBtn" class="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600">Save Question</button>
// //       </div>
// //     </form>
// //   </div>
// //     `