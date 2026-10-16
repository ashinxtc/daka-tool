import { defineConfig, devices } from '@playwright/test';
export default defineConfig({
  testDir: './tests/e2e', fullyParallel: false, workers: 1, timeout: 30000,
  use: { baseURL: 'http://127.0.0.1:4178', timezoneId: 'Asia/Shanghai', trace: 'retain-on-failure' },
  projects: [ { name: 'chromium', use: { ...devices['Desktop Chrome'], launchOptions: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH ? { executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH, args: ['--no-sandbox', '--disable-dev-shm-usage', '--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] } : {} } },
    { name: 'webkit-ipad', use: { ...devices['iPad (gen 7)'], browserName: 'webkit' } } ],
  webServer: { command: 'npm run dev -- --host 127.0.0.1 --port 4178', url: 'http://127.0.0.1:4178', reuseExistingServer: !process.env.CI },
});
