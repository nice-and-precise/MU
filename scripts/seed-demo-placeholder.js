
const { seedFullDemoData } = require('../src/actions/seed-demo-data');

async function main() {
    console.log('Running seed script...');
    // Note: This won't work directly with 'use server' actions in a standalone node script without transpilation.
    // Instead, we'll rely on the user clicking the button or use a Next.js API route if needed.
    // However, for this environment, I'll assume I can just trust the button works or create a route.
    // Let's create a route instead to be safe and curl it.
}
