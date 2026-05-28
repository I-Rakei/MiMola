import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Spawn Vite Dev Server
const viteProcess = spawn('npx', ['vite'], {
  shell: true
});

console.log('⚡ Starting Vite development server...');

let electronStarted = false;

viteProcess.stdout.on('data', (data) => {
  const output = data.toString();
  process.stdout.write(output); // Forward Vite logs to console

  // Match Vite local server URL: "http://localhost:5173/" or "http://localhost:5174/" etc.
  const match = output.match(/http:\/\/localhost:(\d+)\//);
  if (match && !electronStarted) {
    electronStarted = true;
    const port = match[1];
    console.log(`\n🚀 Vite is listening on port ${port}. Spawning Electron Shell...`);

    const electronProcess = spawn('npx', ['electron', '.', `--port=${port}`], {
      shell: true,
      env: {
        ...process.env,
        NODE_ENV: 'development'
      },
      stdio: 'inherit'
    });

    electronProcess.on('close', (code) => {
      console.log(`Electron closed with exit code ${code}. Cleaning up Vite server...`);
      viteProcess.kill('SIGINT');
      process.exit(code);
    });
  }
});

viteProcess.stderr.on('data', (data) => {
  process.stderr.write(data.toString());
});
