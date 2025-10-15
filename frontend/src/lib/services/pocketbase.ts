import PocketBase from 'pocketbase';

// Initialize PocketBase client with environment variable
const pb = new PocketBase(import.meta.env.VITE_POCKETBASE_URL || 'http://localhost:8091');

// Enable auto-cancellation of pending requests
pb.autoCancellation(false);

export default pb;
