const STORAGE_KEYS = 'eye-dropper-hamza-tatheer-colors';
const selectorEl = document.querySelector('.color-picker-container');
const colorsEl = document.querySelector('.colors');
const messageEl = document.querySelector('.message');


async function sleep(time_ms){
  await new Promise(r => setTimeout(r, time_ms));
}


async function pickNewColor() {
  let result = null;
  try {
    //api
    const ed = new EyeDropper();
    result = await ed.open();
  } catch (e) {
    document.body.innerHTML = e;
    return;
  }

  if (result) {
    const color = result.sRGBHex;
    addColor(color);
    sendToClipboard(color);
    store(color);
    showMessageAndHide(color);
  }
}

function addColor(color) {

  //create basic element container color
  const el = document.createElement('li');
  el.classList.add('color');
  el.style.backgroundColor = color;
  el.title = `${color} - click to copy to the clipboard`;
  
  //add cross icon on top of it
  const delEl = document.createElement('span');
  delEl.classList.add('del');
  delEl.title = `Click to delete this color`;

  //add del child inside color element
  el.appendChild(delEl);
  colorsEl.appendChild(el);

  el.addEventListener('click', async (e) => {
    const isDel = e.target.classList.contains('del');
    if (isDel) {
      el.remove();
      removeFromStore(color);
    } else {
      await sendToClipboard(color);
      await showMessageAndHide(color);
    }
  });
}

async function showMessageAndHide(color) {
  
  selectorEl.classList.toggle("hidden");
  messageEl.classList.toggle("hidden");
  messageEl.innerHTML = `${color} copied to clipboard`;

  await sleep(1000);
  window.close();

}

async function sendToClipboard(color) {

  const result = await navigator.permissions.query({name:"clipboard-write" });

  if (result.state != "granted" && result.state != "prompt")
      return;

    try {
      await navigator.clipboard.writeText(color);
    } catch (e) {
      document.body.innerHTML = e;
    }
}


function getStored() {
  const stored = localStorage.getItem(STORAGE_KEYS);
  if (!stored) {
    return [];
  } else {
    return JSON.parse(stored);
  }
}

function setStored(colors) {
  localStorage.setItem(STORAGE_KEYS, JSON.stringify(colors));
}

function store(color) {
  let colors = getStored();
  if (!Array.isArray(colors)) {
    colors = [];
  }

  if (!colors.includes(color)) {
    colors.push(color);
  }

  setStored(colors);
}

function removeFromStore(color) {
  let colors = getStored();
  if (!Array.isArray(colors)) {
    return;
  }

  const index = colors.findIndex(c => c === color);
  if (index > -1) {
    colors.splice(index, 1);
  }

  setStored(colors);
}

document.querySelector('button').addEventListener('click', pickNewColor);

for (const color of getStored()) {
  addColor(color);
}