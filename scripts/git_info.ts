import fs from 'fs'
import path from 'path'
import { execSync } from 'child_process'

const execSyncWrapper = (command: string) => {
    let stdout = null;
    try {
        stdout = execSync(command).toString().trim();
    } catch (error) {
        console.error(error);
    }
    return stdout;
};

(() => {
    let gitBranch = execSyncWrapper('git rev-parse --abbrev-ref HEAD');
    let gitCommitHash = execSyncWrapper('git rev-parse HEAD');
    const time = execSyncWrapper('git log -1 --format="%cd" --date=format:"%d-%m-%y %H:%M:%S"')

    const obj = {
        gitBranch,
        gitCommitHash,
        time
    };

    const filePath = path.resolve('./', 'generated_git_info.json');
    const fileContents = JSON.stringify(obj, null, 2);

    fs.writeFileSync(filePath, fileContents);
    console.log(`Wrote the following contents to ${filePath}\n${fileContents}`);
})()
