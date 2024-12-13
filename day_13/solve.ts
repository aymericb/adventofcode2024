// const text = await Deno.readTextFile("input.txt");
// const text = await Deno.readTextFile("sample.txt");

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

function findFactors(machine: Machine): [number, number][] {
    let factors: [number, number][] = [];

    const start = Math.ceil((machine.prize[0] - (machine.prize[1]*machine.buttonB[0]/machine.buttonB[1])) 
        / (machine.buttonA[0] - (machine.buttonA[1]*machine.buttonB[0]/machine.buttonB[1]))) - 1;
    const end = start + 2;
    // console.log(start, end, machine);

    for (let i = start; i <= end; ++i) {
        const remainingX = machine.prize[0] - machine.buttonA[0] * i;
        if (remainingX < 0 || remainingX % machine.buttonB[0] !== 0) {
            continue;
        }
        const j = remainingX / machine.buttonB[0];
        const total = [i * machine.buttonA[0] + j * machine.buttonB[0], i * machine.buttonA[1] + j * machine.buttonB[1]];
        if (total[0] === machine.prize[0] && total[1] === machine.prize[1]) {
            factors.push([i, j]);
        }
    }

    return factors;
}


type Solution = {
    cost: number;
    factors: [number, number];
}

function computePrice(factors: [number,  number][]): Solution | null {
    if (factors.length === 0) {
        return null;
    }
    if (factors.length > 1) {
        throw new Error("More than one solution found");
    }
    const [x, y] = factors[0];
    const cost = x * 3 + y;
    return {
        cost,
        factors: [x, y],
    };
}

measure(async () => {
    const text = await Deno.readTextFile("input.txt");
    const data = parseData(text);
    // console.log(data);

    // console.log(findFactors(data[0]));
    const result = data
        .map(findFactors)
        .map(computePrice)
        .filter(solution => solution !== null)
        .filter(solution => solution.factors[0] + solution.factors[1] <= 100);
    const sum = result.reduce((acc, solution) => acc + solution.cost, 0);
    console.log("Part 1:", sum);


    const DRIFT = 10000000000000;
    const data2: Machine[] = data.map(x => ({
        buttonA: x.buttonA,
        buttonB: x.buttonB,
        prize: [x.prize[0] + DRIFT, x.prize[1] + DRIFT],
    }));

    const result2 = data2
        .map(findFactors)
        .map(computePrice)
        .filter(solution => solution !== null);
    const sum2 = result2.reduce((acc, solution) => acc + solution.cost, 0);
    console.log("Part 2:", sum2);
}, "Day 13");
