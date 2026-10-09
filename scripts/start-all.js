import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

console.log('=====================================================');
console.log('   NISHPaksh AI - Fullstack Development Runner       ');
console.log('=====================================================');

console.log('[System] Launching Backend Server on port 5000...');
const backendProc = spawn(/^win/.test(process.platform) ? 'npm.cmd' : 'npm', ['run', 'dev'], {
  cwd: path.join(rootDir, 'backend'),
  stdio: 'inherit',
  shell: true
});

console.log('[System] Launching Frontend Vite Dev Server on port 5173...');
const frontendProc = spawn(/^win/.test(process.platform) ? 'npm.cmd' : 'npm', ['run', 'dev'], {
  cwd: path.join(rootDir, 'frontend'),
  stdio: 'inherit',
  shell: true
});

function cleanup() {
  console.log('\n[System] Shutting down NISHPaksh AI services...');
  backendProc.kill();
  frontendProc.kill();
  process.exit(0);
}

process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);