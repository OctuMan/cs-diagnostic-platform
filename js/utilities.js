

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

