const text = await Deno.readTextFile("input.txt");
// const text = await Deno.readTextFile("sample.txt");

type Equation = {
    result: number;
    operands: number[];
}

function parseData(text: string): Equation[] {
    return text.split("\n").filter(line => line).map(line => {
        const [result, operands] = line.split(":");
        return { result: Number(result), operands: operands.split(" ").filter(x => x).map(Number) };
    });
}

function solve(equation: Equation, acc: number, pos: number, operators: Array<(a: number, b: number) => number>): boolean {
    // Branch terminations
    if (acc > equation.result) {
        return false;
    }
    if (equation.operands.length === pos) {
        return acc === equation.result;
    }

    // Recursive calls
    const operand = equation.operands[pos];
    for (const op of operators) {
        if (solve(equation, op(acc, operand), pos + 1, operators)) {
            return true;
        }
    }
    return false;
}

const add = (a: number, b: number) => a + b;
const mul = (a: number, b: number) => a * b;
const concat = (a: number, b: number) => (a * Math.pow(10, Math.floor(Math.log10(b)) + 1)) + b;

const part1 = parseData(text)
    .filter(equation => solve(equation, 0, 0, [add, mul]))
    .reduce((acc, equation) => acc + equation.result, 0);
console.log("Part 1:", part1);


const part2 = parseData(text)
    .filter(equation => solve(equation, 0, 0, [add, mul, concat]))
    .reduce((acc, equation) => acc + equation.result, 0);
console.log("Part 2:", part2);
