pub fn quartiles_i64(data: &Vec<i64>) -> Vec<i64> {
    if data.len() > 0 {
        let mut sorted_data = data.clone();
        sorted_data.sort();
        let data_length: f64 = sorted_data.len() as f64;
        let mut quartiles: Vec<i64> = Vec::new();
        // first quartile
        if (data_length * 0.25) % 1.0 == 0.0 {
            quartiles.push((sorted_data[((data_length * 0.25) - 1.0) as usize] + sorted_data[(data_length * 0.25) as usize]) / 2 as i64);
        } else {
            quartiles.push(sorted_data[(data_length * 0.25).floor() as usize]);
        }
        // second quartile (median)
        if (data_length * 0.5) % 1.0 == 0.0 {
            quartiles.push((sorted_data[((data_length * 0.5) - 1.0) as usize] + sorted_data[(data_length * 0.5) as usize]) / 2 as i64);
        } else {
            quartiles.push(sorted_data[(data_length * 0.5).floor() as usize]);
        }
        // third quartile
        if (data_length * 0.75) % 1.0 == 0.0 {
            quartiles.push((sorted_data[((data_length * 0.75) - 1.0) as usize] + sorted_data[(data_length * 0.75) as usize]) / 2 as i64);
        } else {
            quartiles.push(sorted_data[(data_length * 0.75).floor() as usize]);
        }
        return quartiles
    }
    return vec!(0, 0, 0)
}

pub fn means_i64(data: &Vec<i64>, first_wt: f64) -> Vec<i64> {
    if data.len() > 0 {
        let mut means: Vec<i64> = Vec::new();
        means.push(data.iter().sum::<i64>() / data.len() as i64);
        means.push(((data[0] as f64 * first_wt) + (data.iter().sum::<i64>() as f64 * (1.0 - first_wt))) as i64);
        return means
    }
    return vec!(0, 0);
}