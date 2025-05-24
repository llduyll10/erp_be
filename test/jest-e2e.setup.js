// Set the test environment
process.env.NODE_ENV = 'test';

// Increase timeout for tests
jest.setTimeout(30000);

// Add event listener to handle application teardown
process.on('unhandledRejection', (reason) => {
  console.error('Unhandled Rejection:', reason);
  process.exit(1);
});

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  process.exit(1);
});

// Set a timeout after all tests to ensure proper cleanup
afterAll(async () => {
  // Sleep for a moment to allow resources to be released
  await new Promise(resolve => setTimeout(resolve, 500));
}); 