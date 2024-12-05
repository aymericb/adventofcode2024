const text = await Deno.readTextFile("input.txt");
// const text = await Deno.readTextFile("sample.txt");

function parseData(text: string): [[number, number][], number[][]] {

    const rules: [number, number][] = [];
    const updates: number[][] = [];
    let inPageRule = true;

    text.split("\n").forEach(line => {
        if (line === "") {
            inPageRule = false;
        } else {
            if (inPageRule) {
                const [before, after] = line.split("|").map(Number);
                rules.push([before, after]);
            } else {
                const update = line.split(",").map(Number);
                updates.push(update);
            }
        }
    });
    return [rules, updates];
}

const [rules, updates] = parseData(text);
// console.log(rules);
// console.log(updates);

function matchRule(rule: [number, number], update: number[]) {
    const [before, after] = rule;
    const beforeIndex = update.indexOf(before);
    const afterIndex = update.indexOf(after);
    return beforeIndex === -1 || afterIndex === -1 || beforeIndex < afterIndex;
}

const matchUpdates = updates.filter(update => rules.every(rule => matchRule(rule, update)));
// console.log(matchUpdates);

const sum = matchUpdates.reduce((acc, update) => acc + update[(update.length - 1) / 2], 0);
console.log("Part 1:", sum);

// Part 2
const unmatchUpdates = updates.filter(update => !matchUpdates.includes(update));
console.log(unmatchUpdates);

const indices = unmatchUpdates.map(update => {
    const rule = rules.find(rule => !matchRule(rule, update))!;
    const [before, after] = rule;
    const beforeIndex = update.indexOf(before);
    const afterIndex = update.indexOf(after);
    return [beforeIndex, afterIndex];
});
// console.log(indices);

function stripUpdate(update: number[], indices: number[]) {
    const newupdate: (number | null)[] = [...update];
    for (const index of indices) {
        newupdate[index] = null;
    }
    return newupdate.filter(x => x !== null) as number[];
}

const fixedUpdates = unmatchUpdates.map((update, i) => {
    const a = update[indices[i][0]];
    const b = update[indices[i][1]];

    update = stripUpdate(update, [indices[i][0], indices[i][1]]);
    const show = i === 0;

    
    // Brute force search for the correct order (ugly but works… there must be a better way)
    for (let x = 0; x < update.length+1; x++) {
        for (let y = 0; y < update.length+2; y++) {
            const newUpdate = [...update];
            newUpdate.splice(x, 0, a);
            newUpdate.splice(y, 0, b);
            if (show) {
                console.log(newUpdate);
            }
            if (rules.every(rule => matchRule(rule, newUpdate))) {
                return newUpdate;
            }
        }
    }

    // Non reachable
    return null;
});
console.log(fixedUpdates);

// const sum2 = fixedUpdates.reduce((acc, update) => acc + update[(update.length - 1) / 2], 0);
// console.log("Part 2:", sum2);
console.log(indices[0]);
console.log(unmatchUpdates[0]);

// [
//     26, 11, 53, 72, 61,
//     92, 17, 77, 37
//   ],