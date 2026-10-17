import {defineConfig,devices} from '@playwright/test';
export default defineConfig({
    testDir:'./tests/staging',outputDir:'test-results/staging',workers:1,timeout:45000,
    use:{baseURL:'http://127.0.0.1:4181',trace:'retain-on-failure',serviceWorkers:'block'},
    projects:[{name:'chromium',use:{...devices['Desktop Chrome'],launchOptions:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH?{executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH,args:['--no-sandbox','--disable-dev-shm-usage']}: {}}},
        {name:'webkit-ipad',use:{...devices['iPad (gen 7)'],browserName:'webkit'}}],
    webServer:{command:'npm run preview -- --mode staging --host 127.0.0.1 --port 4181',url:'http://127.0.0.1:4181',reuseExistingServer:false},
});
