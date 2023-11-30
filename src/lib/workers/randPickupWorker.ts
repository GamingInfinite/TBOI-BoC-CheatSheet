import { bagHash, sortBag } from "$lib/bagUtils";

let combinations = new Map<string, number[]>();

self.onmessage = async (e: MessageEvent) => {
  const pickups = e.data;
  let items = [];
  let itemtypes = 0;
  for (let pickup in pickups) {
    if (pickups[pickup] != 0) {
      itemtypes++;
      for (let i = 0; i < 8; i++) {
        items.push(pickup);
      }
    }
  }

  let combo;
  if (itemtypes == 1) {
    combo = 1;
  } else {
    combo =
      factorial(itemtypes + 8 - 1) /
      (factorial(8) * factorial(itemtypes + 8 - 1 - 8));
  }

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
  console.log("Done")
};

function factorial(num: number) {
  if (num == 1) {
    return num;
  }
  return num * factorial(num - 1);
}
