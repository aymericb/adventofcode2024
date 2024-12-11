use dashmap::DashMap;
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

fn blink_memo_dashmap(stone: u64, depth: u32, digits: usize, memo: &DashMap<(u64, u32), u64>) -> u64 {
    let key = (stone, depth);
    if let Some(result) = memo.get(&key) {
        return *result;
    }
    
    if depth == 0 {
        return 1;
    }
    if stone == 0 {
        return blink_memo_dashmap(1, depth - 1, 1, memo);
    }

    let result: u64;
    if (digits & 1) == 0 {
        let half_digits = digits >> 1;
        let divisor = POWERS_OF_10[half_digits];
        let left = stone / divisor;
        let right = stone % divisor;
        
        // Optimize right_digits calculation
        let right_digits = if right < divisor / 10 {
            let mut temp = right;
            let mut count = 1;
            while temp >= 10 {
                temp /= 10;
                count += 1;
            }
            count
        } else {
            half_digits
        };

        result = blink_memo_dashmap(left, depth - 1, half_digits, memo)
        + blink_memo_dashmap(right, depth - 1, right_digits, memo);
    } else {
        let new_stone = stone * 2024;
        // Use log10 for larger numbers, division for smaller ones
        let new_digits = if new_stone < 1_000_000 {
            let mut temp = new_stone;
            let mut count = 1;
            while temp >= 10 {
                temp /= 10;
                count += 1;
            }
            count
        } else {
            (new_stone as f64).log10().floor() as usize + 1
        };

        result = blink_memo_dashmap(new_stone, depth - 1, new_digits, memo);
    }
    

    memo.insert(key, result);
    result
}


fn blink_all_rayon_memo(stones: &[u64], depth: u32) -> u64 {
    let memo: DashMap<(u64, u32), u64> = DashMap::new();
    stones.par_iter()
        .map(|&stone| blink_memo_dashmap(stone, depth, get_digits(stone), &memo))
        .sum()
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

fn main() {
    rayon::ThreadPoolBuilder::new()
        .num_threads(10)  // Set this to your CPU core count
        .build_global()
        .unwrap();
        
    let data = load_data("input.txt");

    measure_time(|| blink_all_rayon_memo(&data, 25), "Part 1");
    measure_time(|| blink_all_rayon_memo(&data, 75), "Part 2");
}

