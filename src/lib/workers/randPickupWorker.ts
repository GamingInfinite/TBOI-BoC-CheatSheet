let combinations = new Map<number, number[]>();

self.onmessage = (e: MessageEvent) => {
  const pickups = e.data;
  chunk(pickups, 1000);
};

function chunk(pickups, entries) {
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

  let count = 0;
  let combo = itemtypes * (items.length - 8);
  if (combo == 0) {
    combo++;
  }
  let retries = 0;
  wholeEnchilada: {
    while (count != entries) {
      let itemsTemp = [...items];
      let newBag = [];
      for (let i = 0; i < 8; i++) {
        let randPick = Math.floor(Math.random() * itemsTemp.length);
        newBag.push(itemsTemp[randPick]);
        itemsTemp.splice(randPick, 1);
      }
      if (!combinations.has(bagSum(newBag))) {
        combinations.set(bagSum(newBag), newBag);
        self.postMessage(newBag);
        count++;
      } else {
        retries++;
      }

      console.log(count, retries);
      if (retries >= 1000) {
        self.postMessage("Done")
        break wholeEnchilada;
      }
    }
    setTimeout(() => {
      chunk(pickups, entries);
    }, 1000);
  }
}

function bagSum(bag: number[]) {
  let sum = 1;
  for (let i = 0; i < bag.length; i++) {
    sum *= bag[i];
  }
  return sum;
}
