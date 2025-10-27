// Jest setup for TypeORM integration tests
// This file runs before each test file

// Increase timeout for integration tests
jest.setTimeout(30000);

// Cleanup after all tests
afterAll(async () => {
  // Wait for any pending async operations
  await new Promise(resolve => setTimeout(resolve, 1000));
});

