use dashmap::DashMap;
use std::collections::HashMap;
use rayon::prelude::*;
use std::fs;

fn load_data(file_path: &str) -> Vec<u64> {
    let text = fs::read_to_string(file_path).expect("Failed to read file");
    text.lines()
        .flat_map(|line| line.split_whitespace().map(|num| num.parse::<u64>().expect("Failed to parse number")))
        .collect()
}

fn blink(stone: u64, depth: u32, digits: usize) -> u64 {
    if depth == 0 {
        return 1;
    }
    if stone == 0 {
        return blink(1, depth - 1, 1);
    }

    if digits % 2 == 0 {
        let half_digits = digits / 2;
        let divisor = 10u64.pow(half_digits as u32);
        let left = stone / divisor;
        let right = stone % divisor;
        
        // Count right digits using division (faster than log)
        let mut right_digits = half_digits;
        if right < divisor / 10 {
            let mut temp = right;
            right_digits = 1;
            while temp >= 10 {
                temp /= 10;
                right_digits += 1;
            }
        }

        blink(left, depth - 1, half_digits) 
        + blink(right, depth - 1, right_digits)
    } else {
        let new_stone = stone * 2024;
        // Count digits using division
        let mut new_digits = 1;
        let mut temp = new_stone;
        while temp >= 10 {
            temp /= 10;
            new_digits += 1;
        }

        blink(new_stone, depth - 1, new_digits)
    }
}


// #[allow(dead_code)]
// fn blink_memo(stone: u64, depth: u32, digits: Option<usize>, memo: &mut HashMap<(u64, u32), u64>) -> u64 {
//     let key = (stone, depth);
//     if let Some(&result) = memo.get(&key) {
//         return result;
//     }
    
//     let result = blink(stone, depth, digits);
//     memo.insert(key, result);
//     result
// }

// #[allow(dead_code)]
// fn blink_memo_dashmap(stone: u64, depth: u32, digits: Option<usize>, memo: &DashMap<(u64, u32), u64>) -> u64 {
//     let key = (stone, depth);
//     if let Some(result) = memo.get(&key) {
//         return *result;
//     }
    
//     let result = blink(stone, depth, digits);
//     memo.insert(key, result);
//     result
// }


// #[allow(dead_code)]
// fn blink_all(stones: &[u64], depth: u32) -> u64 {
//     stones.iter()
//         .map(|&stone| blink(stone, depth, None))
//         .sum()
// }

// #[allow(dead_code)]
// fn blink_all_rayon_memo(stones: &[u64], depth: u32) -> u64 {
//     let memo = DashMap::new();
//     stones.par_iter()
//         .map(|&stone| blink_memo_dashmap(stone, depth, None, &memo))
//         .sum()
// }

fn get_digits(stone: u64) -> usize {
    if stone == 0 { return 1; }
    (stone as f64).log10().floor() as usize + 1
}

#[allow(dead_code)]
fn blink_all_rayon(stones: &[u64], depth: u32) -> u64 {
    stones.par_iter()
        .map(|&stone| blink(stone, depth, get_digits(stone)))
        .sum()
}

// #[allow(dead_code)]
// fn blink_all_memo(stones: &[u64], depth: u32) -> u64 {
//     let mut memo = HashMap::new();
//     stones.iter()
//         .map(|&stone| blink_memo(stone, depth, None, &mut memo))
//         .sum()
// }

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

    // println!("Data: {}", data[0]);
    // println!("Blink first: {}", blink(data[0], 4, None));
    // println!("Result 2: {}", blink_all(&data, 25));
    // println!("Result 45: {}", blink_all(&data, 45));
    // println!("Result 45: {}", blink_all_rayon(&data, 52));
    // println!("Result 45: {}", blink_all_rayon(&data, 53));
    // println!("Result 52: {}", blink_all(&data, 52));
    // println!("Result 53: {}", blink_all(&data, 53));
    // println!("Result 54: {}", blink_all(&data, 54));

    // println!("Result 43: {}", blink_all(&data, 43));
    // println!("Result 44: {}", blink_all(&data, 44));
    // println!("Result 43: {}", blink_all_memo(&data, 43));
    // println!("Result 43: {}", blink_all_rayon(&data, 43));

    // println!("Part 1: {}", blink_all(&data, 25));
    // println!("Part 2: {}", blink_all(&data, 75));

    // println!("Part 2: {}", blink_all_rayon(&data, 43));
    // println!("Part 2: {}", blink_all_rayon(&data, 47));
    // measure_time(|| blink_all(&data, 47), "blink_all 47");

    // Part 1: 25 = 185894

    measure_time(|| blink_all_rayon(&data, 25), "blink_all_rayon 25");
    measure_time(|| blink_all_rayon(&data, 47), "blink_all_rayon 47");
    measure_time(|| blink_all_rayon(&data, 48), "blink_all_rayon 48");
    measure_time(|| blink_all_rayon(&data, 49), "blink_all_rayon 49");
    // measure_time(|| blink_all_rayon_memo(&data, 47), "blink_all_rayon_memo 47");

    // measure_time(|| blink_all(&data, 48), "blink_all 48");
    // measure_time(|| blink_all_rayon(&data, 48), "blink_all_rayon 48");
    // measure_time(|| blink_all(&data, 49), "blink_all 49");
    // measure_time(|| blink_all_rayon(&data, 49), "blink_all_rayon 49");

}

