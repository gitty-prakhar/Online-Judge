import fs from 'fs';
import { exec } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

// Helper to get the current directory path (since we use ES modules)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const executeCodeInDocker = async (language, code, input) => {
    return new Promise((resolve, reject) => {
        // 1. Create a temporary filename
        const filename = `temp_${Date.now()}`;
        let fileExtension = '';
        let dockerImage = '';
        let executeCommand = '';

        // 2. Configure language specifics
        const lang = language.toLowerCase();
        if (lang === 'python') {
            fileExtension = '.py';
            dockerImage = 'python:3.9-slim';
            executeCommand = `python /app/${filename}${fileExtension}`;
        } else if (lang === 'c++' || lang === 'cpp') {
            fileExtension = '.cpp';
            dockerImage = 'gcc:latest';
            // Compile and then run
            executeCommand = `g++ /app/${filename}${fileExtension} -o /app/out && /app/out`;
        } else if (lang === 'javascript' || lang === 'js') {
            fileExtension = '.js';
            dockerImage = 'node:18-slim';
            executeCommand = `node /app/${filename}${fileExtension}`;
        } else if (lang === 'java') {
            fileExtension = '.java';
            dockerImage = 'openjdk:17-slim';
            // Java 11+ can run single-file programs directly without javac
            executeCommand = `java /app/${filename}${fileExtension}`; 
        } else {
            return reject(new Error("Unsupported language"));
        }

        const codePath = path.join(__dirname, `${filename}${fileExtension}`);
        const inputPath = path.join(__dirname, `${filename}_input.txt`);

        // 3. Write code and input to temporary files on your actual hard drive
        fs.writeFileSync(codePath, code);
        fs.writeFileSync(inputPath, input || "");

        // 4. Construct the secure Docker command
        // -v mounts the current folder into the container at /app
        // -m sets a RAM limit (e.g., 256mb)
        // --network none disables internet access
        const dockerCmd = `docker run --rm --network none -m 256m -v "${__dirname}:/app" -i ${dockerImage} /bin/bash -c "${executeCommand}" < "${inputPath}"`;

        // 5. Execute the Docker command
        exec(dockerCmd, { timeout: 3000 }, (error, stdout, stderr) => {
            // Clean up: delete the temporary files after execution
            if (fs.existsSync(codePath)) fs.unlinkSync(codePath);
            if (fs.existsSync(inputPath)) fs.unlinkSync(inputPath);

            if (error) {
                // If it killed the process due to our 3000ms timeout
                if (error.killed) {
                    return resolve({ verdict: "Time Limit Exceeded", output: "" });
                }
                return resolve({ verdict: "Runtime Error", output: stderr || error.message });
            }

            // Success! Return the output
            return resolve({ verdict: "Success", output: stdout.trim() });
        });
    });
};
