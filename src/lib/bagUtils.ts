import { Items } from "./data";

export function sortCollection(a, b) {
    let valueA = Items[a[1].id].quality;
    let valueB = Items[b[1].id].quality;
    return ((valueA - valueB) * -1) || a[1].id - b[1].id;
  }

export async function bagHash(bag: number[]) {
  const bagEncode = new TextEncoder().encode(bag.join(""));
  const buffer = await crypto.subtle.digest("SHA-256", bagEncode);
  const hashArray = Array.from(new Uint8Array(buffer));
  const hash = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
  return hash;
}

export function sortBag(a: number, b: number) {
  return a - b;
}
