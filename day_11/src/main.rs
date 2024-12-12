use memoize::memoize;
use rayon::prelude::*;
use std::fs;

const POWERS_OF_10: [u64; 20] = [
    1, 10, 100, 1000, 10000, 100000, 1000000, 10000000, 100000000, 1000000000,
    10000000000, 100000000000, 1000000000000, 10000000000000, 100000000000000,
    1000000000000000, 10000000000000000, 100000000000000000, 1000000000000000000,
    10000000000000000000,
];

fn load_data(file_path: &str) -> Vec<u64> {
    let text = fs::read_to_string(file_path).expect("Failed to read file");
    text.lines()
        .flat_map(|line| line.split_whitespace().map(|num| num.parse::<u64>().expect("Failed to parse number")))
        .collect()
}

#[memoize]
fn blink(stone: u64, depth: u32) -> u64 {
    if depth == 0 {
        return 1;
    }
    if stone == 0 {
        return blink(1, depth - 1);
    }
    let digits = get_digits(stone);
    if digits % 2 == 0 {
        let half_digits = digits / 2;
        let divisor = POWERS_OF_10[half_digits];
        let left = stone / divisor;
        let right = stone % divisor;
        blink(left, depth - 1) + blink(right, depth - 1)
    } else {
        blink(stone * 2024, depth - 1)
    }
}

fn get_digits(stone: u64) -> usize {
    if stone == 0 { return 1; }
    (stone as f64).log10().floor() as usize + 1
}

fn measure_time<F, T>(f: F, label: &str) -> T 
where
    F: FnOnce() -> T,
    T: std::fmt::Display,
{
    let start = std::time::Instant::now();
    let result = f();
    let duration = start.elapsed();
    println!("{}: {}", label, result);
    println!("Time taken for {}: {:?}", label, duration);
    result
}


fn blink_all(stones: &[u64], depth: u32) -> u64 {
    stones.par_iter().map(|&stone| blink(stone, depth)).sum()
}

fn main() {
    rayon::ThreadPoolBuilder::new()
        .num_threads(10)  // Set this to your CPU core count
        .build_global()
        .unwrap();
        
    let data = load_data("input.txt");

    measure_time(|| blink_all(&data, 25), "Part 1");
    measure_time(|| blink_all(&data, 75), "Part 2");
}

