let combinations = new Map<string, number[]>();

self.onmessage = async (e: MessageEvent) => {
  const pickups = e.data;
  let items = [];
  let itemtypes = 0;
  for (let [key, value] of pickups) {
    if (value != 0) {
      itemtypes++;
    }
    for (let i = 0; i < value; i++) {
      items.push(key);
    }
  }

  let combo =
    factorial(itemtypes + 8 - 1) /
    (factorial(8) * factorial(itemtypes + 8 - 1 - 8));
    
  if (combo == 0) {
    combo++;
  }
  let retries = 0;
  while (combinations.size < combo) {
    let itemsTemp = [...items];
    let newBag = [];
    for (let i = 0; i < 8; i++) {
      let randPick = Math.floor(Math.random() * itemsTemp.length);
      newBag.push(itemsTemp[randPick]);
      itemsTemp.splice(randPick, 1);
    }
    newBag.sort(sortBag);
    if (!combinations.has(await bagHash(newBag))) {
      combinations.set(await bagHash(newBag), newBag);
      self.postMessage(newBag);
    } else {
      retries++;
    }
  }
  console.log(combinations.size, retries);
  console.log([...combinations.values()]);
};

function factorial(num: number) {
  if (num == 1) {
    return num;
  }
  return num * factorial(num - 1);
}

async function bagHash(bag: number[]) {
  const bagEncode = new TextEncoder().encode(bag.join(""));
  const buffer = await crypto.subtle.digest("SHA-256", bagEncode);
  const hashArray = Array.from(new Uint8Array(buffer));
  const hash = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
  return hash;
}

function sortBag(a, b) {
  return a - b;
}
