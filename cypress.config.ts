import { defineConfig } from "cypress";


export default defineConfig({
  e2e: {
    "baseUrl": "http://localhost:4000",
    "specPattern": "cypress/e2e/**/*.cy.ts",
    "supportFile": false,
    "projectId": "8da27w"
  }
});
