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
// console.log(unmatchUpdates);


function fixUpdate(update: number[]): number[] {
    const matchAllRules = (update: number[]) => rules.every(rule => matchRule(rule, update));
    const candidate = [...update];
    while (!matchAllRules(candidate)) {
        const rule = rules.find(rule => !matchRule(rule, candidate))!;
        const [before, after] = rule;
        const beforeIndex = candidate.indexOf(before);
        const afterIndex = candidate.indexOf(after);
        const temp = candidate[beforeIndex];
        candidate[beforeIndex] = candidate[afterIndex];
        candidate[afterIndex] = temp;
    }
    return candidate;
}

const fixedUpdates = unmatchUpdates.map(fixUpdate);
const sum2 = fixedUpdates.reduce((acc, update) => acc + update![(update!.length - 1) / 2], 0);
console.log("Part 2:", sum2);

