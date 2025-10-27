/** @type {import("jest").Config} **/
module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    roots: ['<rootDir>/src'],
    testMatch: ['**/*.spec.ts'],
    collectCoverageFrom: [
        'src/**/*.(t|j)s',
        '!src/**/*.spec.ts',
        '!src/**/*.interface.ts',
        '!src/**/*.dto.ts',
        '!src/**/*.entity.ts',
        '!src/main.ts',
        '!src/seeders/**',
    ],
    coverageDirectory: 'coverage',
    // Fix TypeORM + Jest conflict
    setupFilesAfterEnv: ['<rootDir>/src/test-setup.ts'],
    // Increase timeout for integration tests
    testTimeout: 30000,
    // Force exit to prevent hanging connections
    forceExit: true,
    // Detect open handles
    detectOpenHandles: true,
    // Clear mocks between tests
    clearMocks: true,
    // Reset modules between tests
    resetMocks: true,
};
