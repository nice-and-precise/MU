use std::process::Command;
use std::fs::File;
use std::io::Write;

fn main() {
    println!("Generating Git History Visualization...");

    let output = Command::new("git")
        .args(&["log", "--pretty=format:%h|%s|%an|%ad", "--date=short", "-n", "20"])
        .output()
        .expect("Failed to execute git command");

    let log = String::from_utf8_lossy(&output.stdout);
    
    let mut mermaid = String::from("```mermaid\ngitGraph\n");
    
    // Reverse lines to show oldest first in the graph
    let lines: Vec<&str> = log.lines().rev().collect();
    
    for line in lines {
        let parts: Vec<&str> = line.split('|').collect();
        if parts.len() >= 2 {
            let hash = parts[0];
            let msg = parts[1].replace("\"", "'"); // Escape quotes
            // let author = parts[2];
            
            // Simplified graph: just commit on main branch with tag
            mermaid.push_str(&format!("   commit id: \"{}\" tag: \"{}\"\n", hash, &msg[0..std::cmp::min(msg.len(), 20)]));
        }
    }
    
    mermaid.push_str("```\n");

    let mut file = File::create("git_history.md").expect("Unable to create file");
    file.write_all(mermaid.as_bytes()).expect("Unable to write data");

    println!("Successfully generated git_history.md");
}
