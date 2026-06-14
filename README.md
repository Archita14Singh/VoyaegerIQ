<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/0565cc12-76e8-4983-a03a-3a156a25f7d8

## Run Locally


   **Prerequisites:** Node.js (v18+) and Python (v3.10+)

1. **Install dependencies:**
   * For the frontend:
     ```bash
     npm install
     ```
   * For the Python backend:
     ```bash
     cd project
     pip install -r requirements.txt
     ```

2. **Configure your Azure AI Foundry Credentials:**
   * Copy `project/.env.example` to `project/.env`.
   * Open the newly created `project/.env` file and insert your Azure AI parameters:
     ```env
     # Azure AI Foundry Endpoint & Agent configuration
     FOUNDRY_PROJECT_ENDPOINT="https://your-workspace-name.region.projects.azure.ai"
     FOUNDRY_AGENT_ID="your-agent-deployment-id"
     FOUNDRY_AGENT_NAME="your-agent-name"
     FOUNDRY_API_KEY="your-azure-foundry-api-key"
     FOUNDRY_ISOLATION_KEY="your-isolation-key"
     ```

3. **Run the application:**
   * Run the FastAPI backend service:
     ```bash
     cd project
     uvicorn app.main:app --port 8000 --reload
     ```
   * Run the React frontend:
     ```bash
     npm run dev
     ```
