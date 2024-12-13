// const text = await Deno.readTextFile("input.txt");
const text = await Deno.readTextFile("sample.txt");

function measure<T>(fn: () => T, label: string): T {
    const start = performance.now();
    const result = fn();
    const end = performance.now();
    console.log(`Time taken for ${label}:`, end - start, "milliseconds");
    return result;
}

type Machine = {
    prize: [number, number];
    buttonA: [number, number];
    buttonB: [number, number];
}

enum ParseState {
    ButtonA, 
    ButtonB,
    Prize,
}

function parseData(text: string): Machine[] {
    const lines = text.split("\n").filter(line => line.length > 0);
    const data: Machine[] = [];
    let machine: Partial<Machine> = {};
    let state = ParseState.ButtonA;

    const buttonRegex = /Button (A|B): X\+(\d+), Y\+(\d+)/;
    const prizeRegex = /Prize: X=(\d+), Y=(\d+)/;
    for (const line of lines) {
        switch (state) {
            case ParseState.ButtonA: {
                const match = buttonRegex.exec(line);
                machine.buttonA = [parseInt(match![2]), parseInt(match![3])];
                state = ParseState.ButtonB;
                break;
            }
            case ParseState.ButtonB: {
                const match = buttonRegex.exec(line);
                machine.buttonB = [parseInt(match![2]), parseInt(match![3])];
                state = ParseState.Prize;
                break;
            }
            case ParseState.Prize: {
                const match = prizeRegex.exec(line);
                machine.prize = [parseInt(match![1]), parseInt(match![2])];
                state = ParseState.ButtonA;
                data.push(machine as Machine);
                machine = {};
                break;
            }
        }
    }
    return data;
}


function findFactors(machine: Machine): [number, number][]  {
    let factors: [number, number][] = [];


    for (let i = 1; i <= 100; ++i) {
        const remainingX = machine.prize[0] - machine.buttonA[0] * i;
        if (remainingX < 0 || remainingX % machine.buttonB[0] !== 0) {
            continue;
        }
        const j = remainingX / machine.buttonB[0];
        const total = [i * machine.buttonA[0] + j * machine.buttonB[0], i * machine.buttonA[1] + j * machine.buttonB[1]];
        if (total[0] === machine.prize[0] && total[1] === machine.prize[1]) {
            // console.log(i, j);
            factors.push([i, j]);
        }
    }

    return factors;
}

function findFactors2(machine: Machine): [number, number][]  {
    let factors: [number, number][] = [];

    const bounds = [
        Math.ceil(machine.prize[0] / machine.buttonA[0]),
        Math.floor(machine.prize[0] / machine.buttonB[0]),
    ];
    const maxBound = Math.max(...bounds);
    const lowBound = Math.min(...bounds);
    
    console.log(maxBound, lowBound, maxBound - lowBound);

    let percent = 0;

    let i = lowBound;
    let lastPositiveI = i;
    // let lastNegativeI = i;
    let increment = 1;

    for (let k = 0; k < 1000; ++k) {

        // if (i > maxBound) {
        //     break;
        // }

        // console.log(i);
        // const newPercent = Math.floor((i - lowBound) / (maxBound - lowBound) * 100);
        // if (newPercent > percent) {
        //     percent = newPercent;
        //     console.log(percent);
        // }

        const remainingX = machine.prize[0] - machine.buttonA[0] * i;
        console.log(i, increment, remainingX, machine.buttonB[0]);
        if (remainingX < 0 && i > maxBound) {
            if (i === lastPositiveI || lastPositiveI > maxBound) {
                break;
            }
            i = lastPositiveI + 1;
            increment = 1;
            continue;
        }
        increment *= 2;
        lastPositiveI = i;
        if (remainingX % machine.buttonB[0] !== 0) {
            i += increment;
            continue;
        }

        const j = remainingX / machine.buttonB[0];
        const total = [i * machine.buttonA[0] + j * machine.buttonB[0], i * machine.buttonA[1] + j * machine.buttonB[1]];
        if (total[0] === machine.prize[0] && total[1] === machine.prize[1]) {
            // console.log(i, j);
            factors.push([i, j]);
        }

        i += increment;
    }

    return factors;
}

type Solution = {
    cost: number;
    factors: [number, number];
}

function findCheapest(factors: [number,  number][]): Solution | null {
    if (factors.length === 0) {
        return null;
    }
    const prices = factors.map(([x, y], index) => ({ cost: x * 3 + y, index }));
    prices.sort((a, b) => a.cost - b.cost);
    return {
        cost: prices[0].cost,
        factors: factors[prices[0].index],
    };
}


const data = parseData(text);
// console.log(data);

// console.log(findFactors(data[0]));
const result = data.map(findFactors).map(findCheapest).filter(solution => solution !== null);
const sum = result.reduce((acc, solution) => acc + solution.cost, 0);
console.log("Part 1:", sum);

const DRIFT = 10000000000000;
const data2: Machine[] = data.map(x => ({
    buttonA: x.buttonA,
    buttonB: x.buttonB,
    prize: [x.prize[0] + DRIFT, x.prize[1] + DRIFT],
}));

// console.log(data2);
// console.log(findFactors2(data2[0]));
console.log(findFactors2(data2[1]));
// console.log(data2.map(findFactors2));
