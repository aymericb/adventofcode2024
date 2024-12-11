use dashmap::DashMap;
use rayon::prelude::*;
use std::fs;
use std::collections::HashMap;

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

fn blink2(stone: u64, depth: u32, digits: usize) -> u64 {
    if depth == 0 {
        return 1;
    }
    if stone == 0 {
        return blink2(1, depth - 1, 1);
    }

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

        blink2(left, depth - 1, half_digits) 
        + blink2(right, depth - 1, right_digits)
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

        blink2(new_stone, depth - 1, new_digits)
    }
}

fn blink(stone: u64, depth: u32, digits: usize) -> u64 {
    if depth == 0 {
        return 1;
    }
    if stone == 0 {
        return blink(1, depth - 1, 1);
    }

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

        blink(left, depth - 1, half_digits) 
        + blink(right, depth - 1, right_digits)
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

#[allow(dead_code)]
fn blink_memo_dashmap(stone: u64, depth: u32, digits: usize, memo: &DashMap<(u64, u32), u64>) -> u64 {
    let key = (stone, depth);
    if let Some(result) = memo.get(&key) {
        return *result;
    }
    
    if depth == 0 {
        return 1;
    }
    if stone == 0 {
        return blink(1, depth - 1, 1);
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


// #[allow(dead_code)]
// fn blink_all(stones: &[u64], depth: u32) -> u64 {
//     stones.iter()    
//         .map(|&stone| blink(stone, depth, None))
//         .sum()
// }

#[allow(dead_code)]
fn blink_all_rayon_memo(stones: &[u64], depth: u32) -> u64 {
    let memo = DashMap::new();
    stones.par_iter()
        .map(|&stone| blink_memo_dashmap(stone, depth, get_digits(stone), &memo))
        .sum()
}

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

#[allow(dead_code)]
fn blink2_all_rayon(stones: &[u64], depth: u32) -> u64 {
    stones.par_iter()
        .map(|&stone| blink2(stone, depth, get_digits(stone)))
        .sum()
}

// fn blink_with_cycle_detection(stone: u64, depth: u32, digits: usize, seen: &DashMap<u64, (u32, u64)>) -> u64 {
//     if depth == 0 {
//         return 1;
//     }
    
//     let mut current = stone;
//     let mut current_depth = depth;
    
//     while current_depth > 0 && (digits & 1) == 1 {
//         if let Some(entry) = seen.get(&current) {
//             let (prev_depth, prev_result) = *entry;
//             // Found a cycle!
//             let cycle_length = prev_depth - current_depth;
//             if cycle_length == 0 {
//                 // If cycle_length is 0, fall back to regular blink
//                 return blink(stone, depth, digits);
//             }
//             let remaining_cycles = current_depth / cycle_length;
//             let remainder = current_depth % cycle_length;
            
//             let base_result = blink(current, cycle_length, digits);
//             let mut result = base_result * (remaining_cycles as u64);
            
//             if remainder > 0 {
//                 result += blink(current, remainder, digits);
//             }
            
//             return result;
//         }
        
//         seen.insert(current, (current_depth, 0));
//         current = current * 2024;
//         current_depth -= 1;
//     }
    
//     blink(stone, depth, digits)
// }

// And modify the calling function:
// fn blink_all_rayon_with_cycle_detection(stones: &[u64], depth: u32) -> u64 {
//     let seen = DashMap::new();
//     stones.par_iter()
//         .map(|&stone| blink_with_cycle_detection(stone, depth, get_digits(stone), &seen))
//         .sum()
// }

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
    // measure_time(|| blink_all_rayon_with_cycle_detection(&data, 25), "blink_all_rayon_with_cycle_detection 25");
    // measure_time(|| blink_all_rayon(&data, 47), "blink_all_rayon 47");
    // measure_time(|| blink_all_rayon(&data, 48), "blink_all_rayon 48");
    // measure_time(|| blink_all_rayon(&data, 49), "blink_all_rayon 49");
    // measure_time(|| blink_all_rayon_with_cycle_detection(&data, 49), "blink_all_rayon_with_cycle_detection 49");
    measure_time(|| blink_all_rayon_memo(&data, 25), "blink_memo_dashmap 25");


    // measure_time(|| blink_all_rayon(&data, 49), "blink_all_rayon 49");
    // measure_time(|| blink_all_rayon_memo(&data, 49), "blink_memo_dashmap 49");
    // measure_time(|| blink_all_rayon_memo(&data, 50), "blink_memo_dashmap 50");
    measure_time(|| blink_all_rayon_memo(&data, 51), "blink_memo_dashmap 51");
    measure_time(|| blink_all_rayon_memo(&data, 52), "blink_memo_dashmap 52");


}

