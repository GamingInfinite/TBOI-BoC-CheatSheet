import * as combinations from "combinations"

self.onmessage = (e) => {
    let array = combinations(e.data, 8, 8)
    for (let i = 0; i < array.length; i++) {
        const element = array[i];
        console.log(element)
    }
}