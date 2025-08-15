

export function francophoneSysMarks(percent){

    return (percent * 0.2).toFixed(1);
}

export function renderFrancophoneMarks(avg){

}

export function shuffleArray(arr) {
  // Make a copy of the array so we don't change the original
  const array = [...arr];

  // Loop from the end to the beginning
  for (let i = array.length - 1; i > 0; i--) {
    // Get a random index from 0 to i
    let j = Math.floor(Math.random() * (i + 1));

    // Swap array[i] and array[j]
    let temp = array[i];
    array[i] = array[j];
    array[j] = temp;
  }

  return array;
}


const menu = document.getElementById('menu-icon');
const navbar = document.getElementById('navbar');

menu.addEventListener('click', () => {
const isHidden = navbar.classList.toggle('hidden');

if (isHidden) {
    menu.classList.remove('fa-xmark');
    menu.classList.add('fa-bars');
} else {
    menu.classList.remove('fa-bars');
    menu.classList.add('fa-xmark');
}
});

// Get & Store Date
var today = new Date();
today = today.getFullYear();


// Display Date
document.getElementById('year').textContent = today;