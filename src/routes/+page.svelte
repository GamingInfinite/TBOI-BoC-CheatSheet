<script lang="ts">
  import { bagHash, sortBag, sortCollection } from "$lib/bagUtils";
  import { ItemPools, Items, Pickups } from "$lib/data";

  let seed: string;
  let convseed: number;

  let seedChange: boolean = false;

  let randPickupWorker: Worker;

  let settingsModal: HTMLDialogElement;

  //#region Options
  let showQuality = false;
  //#endregion

  let searchBar: string;
  let searchID: number;
  let searchArray: number[] = [];

  let craftableItems = new Map<string, { id: number; bag: number[] }>();
  let sortedItems = new Map<string, { id: number; bag: number[] }>();

  //#region Static Recipes
  let staticRecipes = new Map<string, number>();
  staticRecipes.set("11111111", 45);
  staticRecipes.set("11111177", 639);
  staticRecipes.set("2929292929292929", 36);
  staticRecipes.set("22222222", 686);
  staticRecipes.set("44444444", 182);
  staticRecipes.set("2525252525252525", 580);
  staticRecipes.set("88888888", 177);
  staticRecipes.set("2222222222222222", 75);
  staticRecipes.set("1515151515151515", 37);
  staticRecipes.set("1717171717171717", 483);
  staticRecipes.set("1515151515151616", 483);
  staticRecipes.set("1212121212121212", 343);
  staticRecipes.set("12444445", 331);
  staticRecipes.set("322222222222222", 654);
  staticRecipes.set("2121212121212121", 85);
  staticRecipes.set("66666666", 628);
  staticRecipes.set("1212121212121313", 175);
  staticRecipes.set("2424242424242424", 489);
  staticRecipes.set("33333333", 118);
  //#endregion

  let pickups = {};
  for (let i = 1; i < 30; i++) {
    if (pickups[i] == undefined) {
      pickups[i] = 0;
    }
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
    if (staticRecipes.get(bag.toString().replaceAll(",", ""))) {
      return staticRecipes.get(bag.toString().replaceAll(",", ""));
    }

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

  function resortItems() {
    sortedItems = new Map(
      Array.from(craftableItems)
        .sort(sortCollection)
        .map((obj) => [obj[0], obj[1]])
    );
  }

  function resetWorker() {
    if (randPickupWorker != undefined) {
      randPickupWorker.terminate();
    }
    randPickupWorker = new Worker(
      new URL("../lib/workers/randPickupWorker.ts", import.meta.url),
      { type: "module" }
    );

    randPickupWorker.onmessage = async (e) => {
      let sortedBag = e.data.sort(sortBag);
      let bagObject = { id: getItem(sortedBag), bag: sortedBag };
      let hash = await bagHash(sortedBag);
      let itemCounts = {};
      bagSkip: {
        for (let index = 0; index < sortedBag.length; index++) {
          if (!itemCounts[sortedBag[index]]) {
            itemCounts[sortedBag[index]] = 0;
          }
          itemCounts[sortedBag[index]]++;
        }
        for (let pickup in itemCounts) {
          if (itemCounts[pickup] > pickups[pickup]) {
            break bagSkip;
          }
        }
        if (!craftableItems.has(hash)) {
          craftableItems.set(hash, bagObject);
        }
        resortItems();
      }
    };
  }
</script>

<svelte:head>
  <title>Bag of Crafting Cheat Sheet</title>
</svelte:head>

<div class="flex flex-row justify-center">
  <div class="flex flex-col gap-8">
    <div class="flex flex-row gap-4 m-8 justify-center">
      <input
        type="text"
        placeholder="Input Seed"
        class="input input-bordered w-full max-w-xs"
        bind:value={seed}
        on:input={() => {
          let tempSeed = seed.replaceAll(" ", "");
          console.log(tempSeed, tempSeed.length);
          if (tempSeed.length != 8) {
            seedChange = false;
          } else {
            seedChange = true;
          }
          seed = seed.toUpperCase();
          seed = seed.replaceAll("I", "1");
          seed = seed.replaceAll("O", "0");
          seed = seed.replaceAll("U", "V");
          seed = seed.replaceAll("5", "V");
        }}
      />
      <button
        class="btn btn-accent"
        on:click={() => {
          convseed = str2seed();
          resetWorker();
          craftableItems.clear();

          randPickupWorker.postMessage(pickups);
        }}
        disabled={!seedChange}>Submit Seed</button
      >
    </div>
    <div class="flex flex-row gap-4 justify-center">
      <div class="grid grid-cols-10 place-items-center">
        {#each Object.entries(Pickups) as [_, { name, id }]}
          <div class="flex flex-row items-center customNumber">
            {#if id == 14}
              <div class="tooltip m-4" data-tip={name}>
                <img
                  class="pixelated scale-200"
                  src="/images/pickups/{id}.gif"
                  alt={name}
                />
              </div>
            {:else}
              <div class="tooltip m-4" data-tip={name}>
                <img
                  class="pixelated"
                  class:scale-200={!(id == 17 || id == 29)}
                  src="/images/pickups/{id}.png"
                  alt={name}
                />
              </div>
            {/if}
            <input
              type="number"
              bind:value={pickups[id]}
              on:input={() => {
                if (seed.length == 9) {
                  craftableItems.clear();
                  resetWorker();
                  randPickupWorker.postMessage(pickups);
                }
              }}
              class="input input-bordered w-16"
              placeholder="0"
              min="0"
              max="8"
            />
          </div>
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
    <div class="flex flex-row justify-center relative">
      <div>
        <input
          type="text"
          placeholder="Search Item..."
          class="input input-bordered w-full max-w-xs"
          bind:value={searchBar}
          on:input={() => {
            searchID = -1;
            if (searchBar != "") {
              searchArray = [];
              for (let item in Items) {
                let name = Items[item].name.toLowerCase();
                if (name.search(searchBar.toLowerCase()) != -1) {
                  searchArray.push(parseInt(item));
                }
              }
              searchArray = searchArray;
              console.log(searchArray);
            }
          }}
        />
        {#if searchBar != undefined && searchBar != "" && (searchID == undefined || searchID == -1)}
          <div
            class="absolute flex flex-col bg-base-200 rounded-xl z-50"
          >
            {#each searchArray as item}
              {#if Items[item] != undefined}
                <!-- svelte-ignore a11y-click-events-have-key-events -->
                <div
                  class="flex flex-row gap-8 p-8 hover:bg-base-300 hover:rounded-xl"
                  on:click={() => {
                    searchID = item;
                  }}
                >
                  <img
                    class="scale-200 pixelated"
                    src="/images/collectibles/Collectible_{Items[item].name
                      .replaceAll(' ', '_')
                      .replaceAll('/', '_')
                      .replaceAll('?', 'q')
                      .replaceAll('<', 'l')}_icon.png"
                    alt={Items[item].name.replaceAll(" ", "_")}
                  />
                  <div>{Items[item].name}</div>
                </div>
              {/if}
            {/each}
          </div>
        {/if}
      </div>
    </div>
    <div class="flex flex-row justify-center m-8">
      <div class="grid grid-cols-10 gap-8">
        {#each [...sortedItems.values()] as item}
          {#if item.id == searchID}
            <div class="flex flex-col gap-8">
              <div class="flex flex-row justify-center gap-4">
                <div class="tooltip" data-tip={Items[item.id].name}>
                  <img
                    class="scale-200 pixelated"
                    src="/images/collectibles/Collectible_{Items[item.id].name
                      .replaceAll(' ', '_')
                      .replaceAll('/', '_')
                      .replaceAll('?', 'q')
                      .replaceAll('<', 'l')}_icon.png"
                    alt={Items[item.id].name.replaceAll(" ", "_")}
                  />
                </div>
                {#if showQuality}
                  <img
                    class="w-8 h-8 pixelated"
                    src="/images/qualities/{Items[item.id].quality}.png"
                    alt={Items[item.id].quality}
                  />
                {/if}
              </div>
              <div class="flex flex-row justify-center">
                <div class="grid grid-cols-4 place-items-center gap-4">
                  {#each item.bag as pickup}
                    {#if pickup == 14}
                      <img
                        class="scale-150 pixelated"
                        src="/images/pickups/{pickup}.gif"
                        alt={Pickups[pickup]}
                      />
                    {:else}
                      <img
                        class="scale-150 pixelated"
                        src="/images/pickups/{pickup}.png"
                        alt={Pickups[pickup]}
                      />
                    {/if}
                  {/each}
                </div>
              </div>
            </div>
          {:else if searchID == -1 || searchID == undefined}
            <div class="flex flex-col gap-8">
              <div class="flex flex-row justify-center gap-4">
                <div class="tooltip" data-tip={Items[item.id].name}>
                  <img
                    class="scale-200 pixelated"
                    src="/images/collectibles/Collectible_{Items[item.id].name
                      .replaceAll(' ', '_')
                      .replaceAll('/', '_')
                      .replaceAll('?', 'q')
                      .replaceAll('<', 'l')}_icon.png"
                    alt={Items[item.id].name.replaceAll(" ", "_")}
                  />
                </div>
                {#if showQuality}
                  <img
                    class="w-8 h-8 pixelated"
                    src="/images/qualities/{Items[item.id].quality}.png"
                    alt={Items[item.id].quality}
                  />
                {/if}
              </div>
              <div class="flex flex-row justify-center">
                <div class="grid grid-cols-4 place-items-center gap-4">
                  {#each item.bag as pickup}
                    {#if pickup == 14}
                      <img
                        class="scale-150 pixelated"
                        src="/images/pickups/{pickup}.gif"
                        alt={Pickups[pickup]}
                      />
                    {:else}
                      <img
                        class="scale-150 pixelated"
                        src="/images/pickups/{pickup}.png"
                        alt={Pickups[pickup]}
                      />
                    {/if}
                  {/each}
                </div>
              </div>
            </div>
          {/if}
        {/each}
      </div>
    </div>
  </div>
</div>

<button
  class="absolute top-8 right-8 btn-ghost w-12 h-12 rounded-xl z-50"
  on:click={() => {
    settingsModal.showModal();
  }}
>
  ⚙️
</button>

<dialog bind:this={settingsModal} class="modal">
  <div class="modal-box">
    <h3 class="font-bold text-lg">Options</h3>
    <div class="flex flex-col">
      <div class="flex flex-row gap-2 items-center">
        <div>Show Quality</div>
        <!-- svelte-ignore a11y-click-events-have-key-events -->
        <!-- svelte-ignore a11y-label-has-associated-control -->
        <label
          class="swap swap-flip"
          class:swap-active={showQuality}
          on:click={() => {
            showQuality = !showQuality;
          }}
        >
          <img
            class="swap-on w-8 h-8 pixelated"
            src="/images/qualities/yes.png"
            alt="on"
          />
          <img
            class="swap-off w-8 h-8 pixelated"
            src="/images/qualities/no.png"
            alt="off"
          />
        </label>
      </div>
    </div>
    <div class="modal-action">
      <form method="dialog">
        <!-- if there is a button in form, it will close the modal -->
        <button class="btn">Close</button>
      </form>
    </div>
  </div>
</dialog>

<style>
  .isaac-font {
    font-family: font-souls;
  }

  .pixelated {
    image-rendering: pixelated;
  }
</style>
