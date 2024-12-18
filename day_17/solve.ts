import { assertEquals } from "jsr:@std/assert";

function measure<T>(fn: () => T, label: string): T {
    const start = performance.now();
    const result = fn();
    const end = performance.now();
    console.log(`Time taken for ${label}:`, end - start, "milliseconds");
    return result;
}


type Machine = {
    ip: number;
    registers: number[];
    program: number[];
    output: number[];
}

enum Opcode {
    adv = 0, 
    bxl = 1,
    bst = 2,
    jnz = 3,
    bxc = 4,
    out = 5, 
    bdv = 6, 
    cdv = 7
}


function parseData(text: string): Machine {
    const machine: Machine = {
        ip: 0,
        registers: [0, 0, 0],
        program: [],
        output: []
    };
    const lines = text.split("\n").filter(line => line.trim().length > 0);
    const match_regex = /^Register (\w+): (\d+)$/;
    const program_regex = /^Program: (.+)+$/;
    for (const line of lines) {
        const match_reg = line.match(match_regex);
        if (match_reg) {
            const reg_name = match_reg[1];
            const reg_value = parseInt(match_reg[2]);
            switch (reg_name) {
                case "A":
                machine.registers[0] = reg_value;
                break;
            case "B":
                machine.registers[1] = reg_value;
                    break;
                case "C":
                    machine.registers[2] = reg_value;
                    break;
                default:
                    throw new Error(`Invalid register name: ${reg_name}`);
            }
        } else {
            const match_program = line.match(program_regex);
            if (!match_program) {
                throw new Error(`Invalid program line: ${line}`);
            }
            machine.program = match_program[1].split(",").map(Number);
        }
    }


    return machine;
}

function getCombo(machine: Machine, operand: number): number {
    switch (operand) {
        case 0:
        case 1:
        case 2:
        case 3:
            return operand;
        case 4:
            return machine.registers[0];
        case 5:
            return machine.registers[1];
        case 6:
            return machine.registers[2];
        default:
            throw new Error(`Invalid operand: ${operand}`);
    }
}

function runOnce(machine: Machine): void {
    const opcode = machine.program[machine.ip];
    const operand = machine.program[machine.ip + 1];
    machine.ip += 2;

    switch (opcode) {
        case Opcode.adv: {
            machine.registers[0] = Math.floor(machine.registers[0] / 2**getCombo(machine, operand));
            break;
        }
        case Opcode.bdv: {
            machine.registers[1] = Math.floor(machine.registers[0] / 2**getCombo(machine, operand));
            break;
        }
        case Opcode.cdv: {
            machine.registers[2] = Math.floor(machine.registers[0] / 2**getCombo(machine, operand));
            break;
        }        
        case Opcode.bxl: {
            machine.registers[1] = machine.registers[1] ^ operand;
            break;
        }
        case Opcode.bst: {
            machine.registers[1] = (getCombo(machine, operand) % 8) & 0b111;
            break;
        }
        case Opcode.jnz: {
            if (machine.registers[0] !== 0) {
                machine.ip = operand;
            }
            break;
        }
        case Opcode.bxc: {
            machine.registers[1] = machine.registers[1] ^ machine.registers[2];
            break;
        }
        case Opcode.out: {
            machine.output.push(getCombo(machine, operand) % 8);
            break;
        }
    }
}

function run(machine: Machine): string {
    while (machine.ip < machine.program.length) {
        runOnce(machine);
        // console.log(machine);
    }
    return machine.output.join(",");
}

function unitTests() {
    console.log("Running unit tests...");
    let machine: Machine = {
        ip: 0,
        registers: [0, 0, 9],
        program: [2, 6],
        output: []
    }
    run(machine);
    assertEquals(machine.registers[1], 1);

    machine = {
        ip: 0,
        registers: [10, 0, 0],
        program: [5,0,5,1,5,4],
        output: []
    }
    run(machine);
    assertEquals(machine.output, [0, 1, 2]);

    machine = {
        ip: 0,
        registers: [2024, 0, 0],
        program: [0,1,5,4,3,0],
        output: []
    }    
    run(machine);
    assertEquals(machine.output, [4,2,5,6,7,7,7,7,3,1,0]);
    assertEquals(machine.registers[0], 0);

    machine = {
        ip: 0,
        registers: [0, 29, 0],
        program: [1,7],
        output: []
    }   
    run(machine);
    assertEquals(machine.registers[1], 26);

    machine = {
        ip: 0,
        registers: [0, 2024, 43690],
        program: [4,0],
        output: []
    }   
    run(machine);
    assertEquals(machine.registers[1], 44354);

    machine = {
        ip: 0,
        registers: [/*2024*/117440, 0, 0],
        program: [0,3,5,4,3,0],
        output: []
    }

    run(machine);
    assertEquals(machine.output, machine.program);


    console.log("Unit tests passed!");
}

// unitTests();

// const text = await Deno.readTextFile("sample.txt");
// const text = await Deno.readTextFile("sample2.txt");
const text = await Deno.readTextFile("input.txt");

const machine_original = Object.freeze(parseData(text));

console.log("Part 1:", run(structuredClone(machine_original)));

const pow = machine_original.program.length - 1;
console.log(pow);
const min = Math.pow(8, pow);                  // 8^15
const max = 7 * Math.pow(8, pow);              // 7 * 8^15


console.log("Range: ", max-min);

function reverseRangeEqual(a: number[], b: number[], depth: number): boolean {
    const len = a.length;
    if (len !== b.length) {
        console.log(a, b);
        throw new Error("Arrays must be of the same length");
    }
    for (let i = 0; i < depth; i++) {
        if (a[len-1-i] !== b[len-1-i]) {
            return false;
        }
    }
    return true;
}

function runWith(value: number): Machine {
    const machine = structuredClone(machine_original);
    machine.registers[0] = value;
    run(machine);
    return machine;
}


console.log(min, max);
// console.log(searchRange(min, max, 1));

// console.log("Part 2:", runWith(202591857814718));

let div = 100_000_000;
const range = max-min;
let last = 0;

for (let i=min; i<=max; i++) {

    let progress = Math.ceil((i-min)/range*div);
    if (progress > last) {
        console.log("Progress: ", (i-min)/range*100.0, "%", i);
        last = progress;
    }

    const machine = runWith(i);
    if (machine.output.length === machine.program.length &&
        machine.output.every((value, index) => value === machine.program[index])) {
        console.log("Found match!");
        console.log(i, machine.output);
        break;
    }
}

