self.onmessage = (e: MessageEvent) => {
  let bag = [e.data[0],e.data[0],e.data[0],e.data[0],e.data[0],e.data[0],e.data[0],e.data[0]]
  for (let slot1 = 0; slot1 < bag.length; slot1++) {
    bag[slot1] = e.data[1];
    self.postMessage(bag)
  }
  console.log("Done");
  // self.postMessage(newBag)
};
