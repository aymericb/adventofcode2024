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

function solveEquation(equation: Equation, acc: number, pos: number): boolean {

    // Branch terminations
    if (acc > equation.result) {
        return false;
    }
    if (equation.operands.length === pos) {
        return acc === equation.result;
    }

    // Recursive calls
    const operand = equation.operands[pos];
    return solveEquation(equation, acc + operand, pos + 1) || solveEquation(equation, acc * operand, pos + 1);
}

const part1 = parseData(text)
    .filter(equation => solveEquation(equation, 0, 0))
    .reduce((acc, equation) => acc + equation.result, 0);
console.log("Part 1:", part1);


function solveEquation2(equation: Equation, acc: number, pos: number): boolean {

    // Branch terminations
    if (acc > equation.result) {
        return false;
    }
    if (equation.operands.length === pos) {
        return acc === equation.result;
    }

    // Recursive calls
    const operand = equation.operands[pos];
    return solveEquation2(equation, acc + operand, pos + 1)
        || solveEquation2(equation, acc * operand, pos + 1)
        || solveEquation2(equation, (acc * Math.pow(10, Math.floor(Math.log10(operand)) + 1)) + operand, pos + 1);
}

const part2 = parseData(text)
    .filter(equation => solveEquation2(equation, 0, 0))
    .reduce((acc, equation) => acc + equation.result, 0);
console.log("Part 2:", part2);
