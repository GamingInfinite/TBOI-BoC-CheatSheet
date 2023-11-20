<script lang="ts">
  import { ItemPools, Items, Pickups } from "$lib/data";
  import { onMount } from "svelte";

  const pictures = import.meta.glob("/src/lib/images/*/*", {
    query: { enhanced: true },
  });

  let seed: string;
  let convseed: number;

  let craftableItemsGivenPickups: { id: number; bag: number[] }[] = [];

  let testpickups = new Map<number, number>();
    for (let i = 0; i < Object.keys(Pickups).length; i++) {
        const element = Object.keys(Pickups)[i];
        testpickups.set(Pickups[element].id, 8)
    }

  function str2seed(iseed?: string) {
    if (iseed) {
      seed = iseed;
    }

    let dict = [];
    for (let i = 0; i < 32; i++) {
      dict["ABCDEFGHJKLMNPQRSTWXYZ01234V6789".charCodeAt(i)] = i;
    }

    let numseed: number[] = new Array(8);
    for (let i = 0; i < seed.length; i++) {
      if (i == 4) {
        continue;
      }
      let j = i;
      if (i > 4) {
        j--;
      }
      numseed[j] = dict[seed.charCodeAt(i)];
    }
    console.log(numseed);

    let v8 = 0;
    let v10: number;

    for (
      let i =
        (numseed[6] >>> 3) |
        ((4 *
          (numseed[5] |
            (32 *
              (numseed[4] |
                (32 *
                  (numseed[3] |
                    (32 *
                      (numseed[2] |
                        (32 * (numseed[1] | (32 * numseed[0]))))))))))) ^
          0xfef7ffd);
      i != 0;
      v8 = ((v10 >>> 7) + 2 * v10) & 0xff
    ) {
      v10 = ((i & 0xff) + v8) & 0xff;
      i >>>= 5;
    }

    if (v8 == (numseed[7] | (0xff & (32 * numseed[6])))) {
      return (
        (numseed[6] >>> 3) |
        ((4 *
          (numseed[5] |
            (32 *
              (numseed[4] |
                (32 *
                  (numseed[3] |
                    (32 *
                      (numseed[2] |
                        (32 * (numseed[1] | (32 * numseed[0]))))))))))) ^
          0xfef7ffd)
      );
    }
    return 0;
  }

  let rng_offsets = [
    0x00000001, 0x00000005, 0x00000010, 0x00000001, 0x00000005, 0x00000013,
    0x00000001, 0x00000009, 0x0000001d, 0x00000001, 0x0000000b, 0x00000006,
    0x00000001, 0x0000000b, 0x00000010, 0x00000001, 0x00000013, 0x00000003,
    0x00000001, 0x00000015, 0x00000014, 0x00000001, 0x0000001b, 0x0000001b,
    0x00000002, 0x00000005, 0x0000000f, 0x00000002, 0x00000005, 0x00000015,
    0x00000002, 0x00000007, 0x00000007, 0x00000002, 0x00000007, 0x00000009,
    0x00000002, 0x00000007, 0x00000019, 0x00000002, 0x00000009, 0x0000000f,
    0x00000002, 0x0000000f, 0x00000011, 0x00000002, 0x0000000f, 0x00000019,
    0x00000002, 0x00000015, 0x00000009, 0x00000003, 0x00000001, 0x0000000e,
    0x00000003, 0x00000003, 0x0000001a, 0x00000003, 0x00000003, 0x0000001c,
    0x00000003, 0x00000003, 0x0000001d, 0x00000003, 0x00000005, 0x00000014,
    0x00000003, 0x00000005, 0x00000016, 0x00000003, 0x00000005, 0x00000019,
    0x00000003, 0x00000007, 0x0000001d, 0x00000003, 0x0000000d, 0x00000007,
    0x00000003, 0x00000017, 0x00000019, 0x00000003, 0x00000019, 0x00000018,
    0x00000003, 0x0000001b, 0x0000000b, 0x00000004, 0x00000003, 0x00000011,
    0x00000004, 0x00000003, 0x0000001b, 0x00000004, 0x00000005, 0x0000000f,
    0x00000005, 0x00000003, 0x00000015, 0x00000005, 0x00000007, 0x00000016,
    0x00000005, 0x00000009, 0x00000007, 0x00000005, 0x00000009, 0x0000001c,
    0x00000005, 0x00000009, 0x0000001f, 0x00000005, 0x0000000d, 0x00000006,
    0x00000005, 0x0000000f, 0x00000011, 0x00000005, 0x00000011, 0x0000000d,
    0x00000005, 0x00000015, 0x0000000c, 0x00000005, 0x0000001b, 0x00000008,
    0x00000005, 0x0000001b, 0x00000015, 0x00000005, 0x0000001b, 0x00000019,
    0x00000005, 0x0000001b, 0x0000001c, 0x00000006, 0x00000001, 0x0000000b,
    0x00000006, 0x00000003, 0x00000011, 0x00000006, 0x00000011, 0x00000009,
    0x00000006, 0x00000015, 0x00000007, 0x00000006, 0x00000015, 0x0000000d,
    0x00000007, 0x00000001, 0x00000009, 0x00000007, 0x00000001, 0x00000012,
    0x00000007, 0x00000001, 0x00000019, 0x00000007, 0x0000000d, 0x00000019,
    0x00000007, 0x00000011, 0x00000015, 0x00000007, 0x00000019, 0x0000000c,
    0x00000007, 0x00000019, 0x00000014, 0x00000008, 0x00000007, 0x00000017,
    0x00000008, 0x00000009, 0x00000017, 0x00000009, 0x00000005, 0x0000000e,
    0x00000009, 0x00000005, 0x00000019, 0x00000009, 0x0000000b, 0x00000013,
    0x00000009, 0x00000015, 0x00000010, 0x0000000a, 0x00000009, 0x00000015,
    0x0000000a, 0x00000009, 0x00000019, 0x0000000b, 0x00000007, 0x0000000c,
    0x0000000b, 0x00000007, 0x00000010, 0x0000000b, 0x00000011, 0x0000000d,
    0x0000000b, 0x00000015, 0x0000000d, 0x0000000c, 0x00000009, 0x00000017,
    0x0000000d, 0x00000003, 0x00000011, 0x0000000d, 0x00000003, 0x0000001b,
    0x0000000d, 0x00000005, 0x00000013, 0x0000000d, 0x00000011, 0x0000000f,
    0x0000000e, 0x00000001, 0x0000000f, 0x0000000e, 0x0000000d, 0x0000000f,
    0x0000000f, 0x00000001, 0x0000001d, 0x00000011, 0x0000000f, 0x00000014,
    0x00000011, 0x0000000f, 0x00000017, 0x00000011, 0x0000000f, 0x0000001a,
  ];

  function rngNext(num: number, offset_id: number) {
    let a = rng_offsets[offset_id * 3],
      b = rng_offsets[offset_id * 3 + 1],
      c = rng_offsets[offset_id * 3 + 2];
    num = num ^ ((num >>> a) & 0xffffffff);
    num = num ^ ((num << b) & 0xffffffff);
    num = num ^ ((num >>> c) & 0xffffffff);
    return num >>> 0;
  }

  function getItem(bag: number[]) {
    let item_count: number[] = [];
    for (let i = 0; i < 0x1f; i++) {
      item_count[i] = 0;
    }

    let score_matrix = [
      0x00000000, 0x00000001, 0x00000004, 0x00000005, 0x00000005, 0x00000005,
      0x00000005, 0x00000001, 0x00000001, 0x00000003, 0x00000005, 0x00000008,
      0x00000002, 0x00000007, 0x00000005, 0x00000002, 0x00000007, 0x0000000a,
      0x00000002, 0x00000004, 0x00000008, 0x00000002, 0x00000002, 0x00000004,
      0x00000004, 0x00000002, 0x00000007, 0x00000007, 0x00000007, 0x00000000,
      0x00000001,
    ];
    let item_score_sum: number = 0;

    for (let i = 0; i < bag.length; i++) {
      const pickup = bag[i];
      item_count[pickup]++;
      item_score_sum += score_matrix[pickup];
    }

    let weights = [
      { id: 0, weight: 1.0 },
      { id: 1, weight: 2.0 },
      { id: 2, weight: 2.0 },
      { id: 3, weight: item_count[3] * 10 },
      { id: 4, weight: item_count[4] * 10 },
      { id: 5, weight: item_count[6] * 5 },
      { id: 7, weight: item_count[29] * 10 },
      { id: 8, weight: item_count[5] * 10 },
      { id: 9, weight: item_count[25] * 10 },
      { id: 12, weight: item_count[7] * 10 },
    ];
    if (item_count[15] + item_count[12] + item_count[8] + item_count[1] == 0) {
      weights.push({ id: 26, weight: item_count[23] * 10.0 });
    }

    let rngSeed = convseed;
    for (let i = 0; i < 0x1f; i++) {
      for (let j = 0; j < item_count[i]; j++) {
        rngSeed = rngNext(rngSeed, i);
      }
    }

    let collectibles = [];
    for (let i = 0; i < 733; i++) {
      collectibles[i] = 0.0;
    }

    let bag_weight = 0.0;
    for (let i = 0; i < weights.length; i++) {
      const element = weights[i];
      if (element.weight <= 0.0) {
        continue;
      }
      let score = item_score_sum;
      if (element.id == 3 || element.id == 4 || element.id == 5) {
        score -= 5;
      }

      let qualitymin = 0;
      let qualitymax = 1;

      if (score > 34) {
        qualitymax = 4;
        qualitymin = 4;
      } else if (score > 30) {
        qualitymax = 4;
        qualitymin = 3;
      } else if (score > 26) {
        qualitymax = 4;
        qualitymin = 3;
      } else if (score > 22) {
        qualitymax = 4;
        qualitymin = 2;
      } else if (score > 18) {
        qualitymax = 3;
        qualitymin = 2;
      } else if (score > 14) {
        qualitymin = 1;
        qualitymax = 2;
      } else if (score > 8) {
        qualitymin = 0;
        qualitymax = 2;
      }

      let pool = ItemPools[element.id].items;
      for (let i = 0; i < pool.length; i++) {
        const item = Items[pool[i]];
        if (item.quality >= qualitymin && item.quality <= qualitymax) {
          let itemweight = item.pools[element.id] * element.weight;
          bag_weight += itemweight;
          collectibles[pool[i]] += itemweight;
        }
      }
    }

    let selected;
    rngSeed = rngNext(rngSeed, 6);
    let remains = Number(rngSeed) * 2.3283062e-10 * bag_weight;
    for (let i = 0; i < collectibles.length; i++) {
      if (collectibles[i] > remains) {
        selected = i;
        break;
      }
      remains -= collectibles[i];
    }
    return selected;
  }

  async function PickupCombinations(pickups: Map<number, number>) {
    let items = [];
    let itemtypes = 0;
    for (let [key, value] of pickups) {
        if (value != 0) {
            itemtypes++
        }
      for (let i = 0; i < value; i++) {
        items.push(key);
      }
    }

    let combinations = new Map<number, number[]>();
    let combo = itemtypes * (items.length - 8);
    if (combo == 0) {
      combo++;
    }
    while (combinations.size != combo) {
      let itemsTemp = [...items];
      let newBag = [];
      for (let i = 0; i < 8; i++) {
        let randPick = Math.floor(Math.random() * itemsTemp.length);
        newBag.push(itemsTemp[randPick]);
        itemsTemp.splice(randPick, 1);
      }
      if (!combinations.has(bagSum(newBag))) {
        combinations.set(bagSum(newBag), newBag);
      }
    }
    console.log(combinations);

    craftableItemsGivenPickups = [];
    for (let bag of combinations.values()) {
      craftableItemsGivenPickups.push({ id: getItem(bag), bag: bag });
    }
  }

  function bagSum(bag: number[]) {
    let sum = 0;
    for (let i = 0; i < bag.length; i++) {
      sum += bag[i];
    }
    return sum;
  }

  onMount(async () => {
    convseed = str2seed("JKD9 Z0C9");
  });
</script>

<svelte:head>
  <title>TableTalk</title>
</svelte:head>

<div class="flex flex-row justify-center">
  <div class="flex flex-col gap-8">
    <div class="flex flex-row gap-4 m-8 justify-center">
      <input
        type="text"
        placeholder="Input Seed"
        class="input input-bordered w-full max-w-xs"
        bind:value={seed}
      />
      <button
        class="btn btn-accent"
        on:click={() => {
          convseed = str2seed();
        }}>Submit Seed</button
      >
    </div>
    <div class="flex flex-row gap-4 justify-center">
      <div class="grid grid-cols-10 place-items-center gap-4">
        {#each Object.entries(Pickups) as [_, { name, id }]}
          {#if id == 14}
            <div class="tooltip" data-tip={name}>
              <img
                class="pixelated scale-200"
                src="/src/lib/images/pickups/{id}.gif"
                alt={name}
              />
            </div>
          {:else}
            <div class="tooltip" data-tip={name}>
              <img
                class="pixelated"
                class:scale-200={!(id == 17)}
                src="/src/lib/images/pickups/{id}.png"
                alt={name}
              />
            </div>
          {/if}
        {/each}
      </div>
      {#if seed}
        <div class="flex flex-col">
          <div class="flex flex-row isaac-font text-5xl">
            {seed.substring(0, 4)}<br />{seed.substring(5)}
          </div>
        </div>
      {/if}
    </div>
    <div class="flex flex-row justify-center mx-8">
      <div class="grid grid-cols-10 gap-8">
        {#each craftableItemsGivenPickups as item}
          <div class="flex flex-col gap-8">
            <div class="flex flex-row justify-center">
              <div class="tooltip" data-tip={Items[item.id].name}>
                <img
                  class="scale-200 pixelated"
                  src="/src/lib/images/collectibles/Collectible_{encodeURI(Items[
                    item.id
                  ].name.replace(' ', '_'))}_icon.png"
                  alt={Items[item.id].name.replace(" ", "_")}
                />
              </div>
            </div>
            <div class="flex flex-row justify-center">
              <div class="grid grid-cols-4 place-items-center gap-4">
                {#each item.bag as pickup}
                  {#if pickup == 14}
                    <img
                      class="scale-150 pixelated"
                      src="/src/lib/images/pickups/{pickup}.gif"
                      alt={Pickups[pickup]}
                    />
                  {:else}
                    <img
                      class="scale-150 pixelated"
                      src="/src/lib/images/pickups/{pickup}.png"
                      alt={Pickups[pickup]}
                    />
                  {/if}
                {/each}
              </div>
            </div>
          </div>
        {/each}
      </div>
    </div>
  </div>
</div>

<style>
  .isaac-font {
    font-family: font-souls;
  }

  .pixelated {
    image-rendering: pixelated;
  }
</style>
