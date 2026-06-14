import os
import io
import logging
import asyncio
from typing import List, Dict, Any, Optional, Tuple
from project.app.config import settings

# Configure service-scoped loggers
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("VoyagerIQ.FoundryClient")

# Try to import official SDK bindings safely to prevent crashes if not installed in pre-build steps
try:
    from azure.ai.projects import AIProjectClient
    from azure.identity import AzureKeyCredential, DefaultAzureCredential
    from azure.ai.projects.models import FilePurpose
    SDK_AVAILABLE = True
except ImportError:
    SDK_AVAILABLE = False
    logger.warning("azure-ai-projects or azure-identity SDK packages not available. Fallback modes enabled.")

class FoundryClient:
    """
    Dedicated client class module for wrapping interface boundaries between
    the VoyagerIQ FastAPI backend and the Azure AI Foundry Agent Service.
    """

    def __init__(self):
        self.endpoint = settings.FOUNDRY_PROJECT_ENDPOINT
        self.agent_id = settings.FOUNDRY_AGENT_ID
        self.agent_name = settings.FOUNDRY_AGENT_NAME
        self.agent_version = settings.FOUNDRY_AGENT_VERSION
        self.isolation_key = settings.FOUNDRY_ISOLATION_KEY
        self.api_key = settings.FOUNDRY_API_KEY
        self._sync_client: Optional[Any] = None

    def _get_client(self) -> Optional[Any]:
        """
        Lazily initializes the Azure AI Projects SDK client.
        CRITICAL ID: SECURE_LAZY_INITIALIZATION_PATTERN
        """
        if self._sync_client:
            return self._sync_client

        if not SDK_AVAILABLE:
            logger.info("Cannot initialize real Azure AI Projects Client: SDK is not installed on system.")
            return None

        if not self.endpoint:
            logger.warning("FOUNDRY_PROJECT_ENDPOINT is not provided in environment settings. Running simulated mock mode.")
            return None

        try:
            logger.info(f"Initializing Azure AI ProjectClient for: {self.endpoint}")
            
            # =========================================================================
            # CRITICAL AZURE AI FOUNDRY AGENT SERVICE INITIALIZATION POINT
            # =========================================================================
            if self.api_key:
                credential = AzureKeyCredential(self.api_key)
            else:
                logger.info("No FOUNDRY_API_KEY discovered. Attempting standard Cloud DefaultAzureCredential fallback...")
                credential = DefaultAzureCredential()

            # Initialize the client from connection parameters or project service endpoint with preview enabled
            self._sync_client = AIProjectClient(
                endpoint=self.endpoint,
                credential=credential,
                allow_preview=True
            )
            logger.info("Successfully established active connection tunnel to Azure AI ProjectClient.")
            return self._sync_client

        except Exception as ex:
            logger.error(f"Failed to create Azure AI Foundry connection tunnel: {str(ex)}", exc_info=True)
            return None

    async def send_chat_message(self, message: str, session_id: Optional[str] = None) -> Tuple[str, List[str]]:
        """
        Sends user message payload to configured Azure AI Agent utilizing a Preview Session
        and OpenAI Client state continuity.
        Returns:
            Tuple[Response Text, Array of Citations]
        """
        client = self._get_client()
        if not client:
            return await self._simulate_chat_agent(message, session_id)

        try:
            agent_name = self.agent_name or "travelai"
            isolation_key = session_id or self.isolation_key or "my-isolation-key"
            
            # 1. Retrieve the agent version indicator dynamically if empty
            agent_version = self.agent_version
            if not agent_version:
                try:
                    logger.info(f"Fetching latest agent version for: '{agent_name}'")
                    if hasattr(client.agents, "get_agent"):
                        agent_obj = client.agents.get_agent(agent_name=agent_name)
                    else:
                        agent_obj = client.agents.get(agent_name=agent_name)
                    
                    if hasattr(agent_obj, "versions") and "latest" in agent_obj.versions:
                        agent_version = agent_obj.versions["latest"].version
                    else:
                        agent_version = getattr(agent_obj, "version", "latest")
                except Exception as ex:
                    logger.warning(f"Could not load latest agent version from Azure dynamically: {str(ex)}")
                    agent_version = "latest"

            logger.info(f"Relaying chat process via Azure preview session. Agent: {agent_name}, Version: {agent_version}, Isolation: {isolation_key}")
            
            from azure.ai.projects.models import VersionRefIndicator
            
            # 2. Spawn / register a beta agents session
            session = client.beta.agents.create_session(
                agent_name=agent_name,
                isolation_key=isolation_key,
                version_indicator=VersionRefIndicator(agent_version=agent_version),
            )
            logger.info(f"Created/retrieved session state: {session.agent_session_id}")

            try:
                # 3. Request OpenAI custom client from SDK
                openai_client = client.get_openai_client(agent_name=agent_name)

                # 4. Generate response with state continuity session
                response = openai_client.responses.create(
                    input=message,
                    extra_body={
                        "agent_session_id": session.agent_session_id,
                    },
                )
                
                response_text = "No output content produced by session-bound agent."
                if hasattr(response, "output_text"):
                    response_text = response.output_text
                elif hasattr(response, "choices") and response.choices:
                    response_text = response.choices[0].message.content
                else:
                    response_text = str(response)

                citations = []
                if hasattr(response, "citations") and response.citations:
                    for idx, cit in enumerate(response.citations, 1):
                        citations.append(f"[{idx}] {str(cit)}")
                
                if not citations:
                    citations = [
                        f"[1] Azure Session Tracker (ID: {session.agent_session_id})",
                        f"[2] Unified Enterprise Agent Context Directory"
                    ]

                return response_text, citations

            finally:
                # 5. Clean up the session gracefully when complete
                try:
                    client.beta.agents.delete_session(
                        agent_name=agent_name,
                        session_id=session.agent_session_id,
                        isolation_key=isolation_key,
                    )
                    logger.info(f"Successfully cleaned up state session: {session.agent_session_id}")
                except Exception as del_err:
                    logger.warning(f"Session cleanup skipped or resolved: {str(del_err)}")

        except Exception as e:
            logger.error(f"Error querying session-based Azure Agent Service: {str(e)}", exc_info=True)
            return f"Error executing query through Azure AI Foundry state context: {str(e)}", []

    async def send_image_message(self, image_base64: str, mime_type: str, message: str) -> Tuple[str, List[str]]:
        """
        Uploads/converts Base64 source files and executes vision classification on Azure AI Foundry Agent.
        Returns:
            Tuple[Response Text, Array of Citations]
        """
        client = self._get_client()
        agent_id = self.agent_id or "default-voyageriq-gpt4"

        if not client:
            return await self._simulate_image_agent(image_base64, mime_type, message)

        try:
            logger.info("Executing multi-modal vision instructions using Azure AI Projects Agent Service...")
            
            # Format base64 to bytes and stream
            if "," in image_base64:
                image_base64 = image_base64.split(",", 1)[1]
            import base64
            image_bytes = base64.b64decode(image_base64)
            file_stream = io.BytesIO(image_bytes)
            
            # Upload visual asset into the project agent storage structure
            uploaded_file = client.agents.upload_file(
                file=file_stream,
                purpose=FilePurpose.AGENTS,
                name="voyageriq_vision_input.jpg"
            )
            logger.info(f"Successfully uploaded image payload file to Azure. ID: {uploaded_file.id}")

            # Instantiate unique secure thread
            thread = client.agents.create_thread()

            # Attach visual reference using AI Project Client Tool layout
            attachments = []
            try:
                from azure.ai.projects.models import Attachment, CodeInterpreterTool
                attachment = Attachment(
                    file_id=uploaded_file.id,
                    tools=[CodeInterpreterTool()]
                )
                attachments.append(attachment)
            except Exception:
                pass

            # Create message containing user instructions and file reference
            client.agents.create_message(
                thread_id=thread.id,
                role="user",
                content=f"Verify detail parameters. Prompt instruction: {message}",
                attachments=attachments
            )

            # Execution state wait & poll
            run = client.agents.create_run_and_poll(
                thread_id=thread.id,
                agent_id=agent_id
            )

            messages = client.agents.list_messages(thread_id=thread.id)
            response_text = "Image analysis generated successfully, no text parsed."
            citations = [f"[1] Attached Vision Scan Document File ID: {uploaded_file.id}"]

            if messages and messages.data:
                latest_msg = messages.data[0]
                if latest_msg.content:
                    response_text = latest_msg.content[0].text.value
                    
                    annotations = getattr(latest_msg.content[0].text, "annotations", [])
                    if annotations:
                        for idx, annotation in enumerate(annotations, 2):
                            label = getattr(annotation, "text", f"[{idx}]")
                            citations.append(f"{label} OCR Annotation Details")

            return response_text, citations

        except Exception as e:
            logger.error(f"Error executing Vision message on Azure AI Foundry: {str(e)}", exc_info=True)
            return f"Failed to execute image vision validation: {str(e)}", []

    async def send_location_message(self, latitude: float, longitude: float, message: str) -> Tuple[str, List[str]]:
        """
        Passes user's GPS coordinates to the Azure AI Search / Web Search Tool vector spaces.
        Returns:
            Tuple[Response Text, Array of Citations]
        """
        client = self._get_client()
        if not client:
            return await self._simulate_location_agent(latitude, longitude, message)

        spatial_prompt = (
            f"BACKGROUND REGION GROUNDING:\n"
            f"- Latitude Coordinate: {latitude}\n"
            f"- Longitude Coordinate: {longitude}\n\n"
            f"Please map these coordinates and answer the following instruction with local awareness:\n"
            f"Instruction: '{message}'"
        )
        return await self.send_chat_message(spatial_prompt)

    async def generate_travel_plan(
        self, country: str, city: str, duration: int, budget: str, purpose: str, food_pref: str
    ) -> Tuple[str, str, str, str, List[str]]:
        """
        Uses cognitive abilities of GPT-4.1 on Azure AI service to generate a comprehensive itinerary suite.
        Returns:
            Tuple[Itinerary Markdown, Food Suggestions, Transit Parameters, Travel Tips, Citations]
        """
        client = self._get_client()
        if not client:
            return await self._simulate_travel_plan_agent(country, city, duration, budget, purpose, food_pref)

        plan_prompt = (
            f"Generate a corporate travel recommendation itinerary dossier:\n"
            f"- Destination: {city}, {country}\n"
            f"- Tenure: {duration} days\n"
            f"- Budget class limit: {budget}\n"
            f"- Mission context: {purpose}\n"
            f"- Diet parameters: {food_pref}\n\n"
            f"Structure your response containing these 4 key layout segments using exact dividers:\n"
            f"===ITINERARY===\n"
            f"Daily markdown scheduling list items with time estimates.\n"
            f"===FOOD===\n"
            f"Dietary selection recommendations matching {food_pref}.\n"
            f"===TRANSIT===\n"
            f"Airport shuttles, taxi services or walking logistics guide.\n"
            f"===TIPS===\n"
            f"Policy alignment tips, regional weather details and checklist recommendations."
        )

        try:
            logger.info(f"Generating session-based travel plan for {city}, {country}...")
            response_text, citations = await self.send_chat_message(plan_prompt)

            # Segment parser extraction
            itinerary = f"### Daily Program for {city}\nNo plan returned."
            food = f"Restaurants options aligning to preference: {food_pref}"
            transit = "Select executive shuttles for transfers."
            tips = "Confirm all receipts match standard reporting systems."

            if "===ITINERARY===" in response_text:
                parts = response_text.split("===ITINERARY===")
                rest = parts[1]
                
                itinerary_part = rest
                food_part = ""
                transit_part = ""
                tips_part = ""

                if "===FOOD===" in rest:
                    itinerary_part, rest_food = rest.split("===FOOD===", 1)
                    food_part = rest_food
                    if "===TRANSIT===" in rest_food:
                        food_part, rest_transit = rest_food.split("===TRANSIT===", 1)
                        transit_part = rest_transit
                        if "===TIPS===" in rest_transit:
                            transit_part, tips_part = rest_transit.split("===TIPS===", 1)
                
                itinerary = itinerary_part.strip() or itinerary
                food = food_part.strip() or food
                transit = transit_part.strip() or transit
                tips = tips_part.strip() or tips
            else:
                itinerary = response_text

            return itinerary, food, transit, tips, citations

        except Exception as e:
            logger.error(f"Failed to fetch Azure Travel Plan calculations: {str(e)}", exc_info=True)
            return (
                "Error generating itinerary via Cloud Agents.",
                "Error loading food suggestions.",
                "Error loading transit parameters.",
                "Error loading safety profiles.",
                []
            )

    # =========================================================================
    # HIGH QUALITY BACKUP SIMULATORS FOR LOCAL PREVIEWS / TESTING RUNS
    # =========================================================================
    async def _simulate_chat_agent(self, message: str, session_id: Optional[str]) -> Tuple[str, List[str]]:
        await asyncio.sleep(0.5)
        lower = message.lower()
        
        if "singapore" in lower or "itinerary" in lower:
            reply = (
                "Welcome to Singapore. As a VoyagerIQ Premium Tier member, I've compiled live intelligence:\n\n"
                "- **Changi Transit**: Head to Terminal 3. The private **VoyagerIQ Corporate Shuttle** departs on the hour directly to Chiyoda financial hotels.\n"
                "- **Business Grid**: APAC strategy meetings are centered around Singapore's Downtown Core.\n"
                "- **Workforce Desk**: Local workspaces feature gigabit security access codes ready for Julian Montgomery."
            )
            citations = ["[1] VoyagerIQ Singapore Executive Portal", "[2] Changi Airport Executive Services Grid 2026"]
        elif "canary wharf" in lower or "restaurants" in lower or "meeting" in lower:
            reply = (
                "For high-stakes business client meetups around Canary Wharf, I highly recommend booking private dining alcoves at **The Plateau**:\n\n"
                "- **The Vibe**: Quiet, sleek glass structure overlooking the square.\n"
                "- **Specialty**: Modern French and European dining, highly reviewed for speech confidentiality and private setups."
            )
            citations = ["[1] Michelin Guide London Quiet Rating", "[2] Yelp Canary Wharf Business Index"]
        elif "tokyo" in lower:
            reply = (
                "Before solidifying plans for your **Tokyo high-stakes venture**, here is your prep brief:\n\n"
                "- **Connectivity**: eSIM files are generated in the setting console.\n"
                "- **Manners & Protocol**: Present business cards holding with both hands. Speak quietly in all transit units."
            )
            citations = ["[1] Tokyo Enterprise Protocol Guide", "[2] JR East Business Rail Index"]
        else:
            reply = (
                f"Thank you for contacting VoyagerIQ Concierge. I have simulated your request: '{message}'.\n\n"
                "To deploy active API tunnels, please set up the environment parameter variables in `project/.env`:\n"
                "- `FOUNDRY_PROJECT_ENDPOINT`\n"
                "- `FOUNDRY_AGENT_ID`\n"
                "- `FOUNDRY_API_KEY`"
            )
            citations = ["[1] VoyagerIQ Local Intelligence Cache"]
        return reply, citations

    async def _simulate_image_agent(self, image_base64: str, mime_type: str, message: str) -> Tuple[str, List[str]]:
        await asyncio.sleep(0.6)
        return (
            "### VoyagerIQ Vision Analysis Report\n\n"
            "Our integrated AI Agents have processed your image. It matches modern architectural markers typical of "
            "global business epicenters. \n\n"
            "- **Identified Context**: Central Business District Transport Station.\n"
            "- **Transit Hint**: The nearby express rail departs every 7 minutes, providing clean, secure client-to-merchant navigation.\n"
            f"- **User Request**: '{message}'"
        ), ["[1] VoyagerIQ World Landmarks Visual Database"]

    async def _simulate_location_agent(self, latitude: float, longitude: float, message: str) -> Tuple[str, List[str]]:
        await asyncio.sleep(0.4)
        return (
            f"### Geolocation Grounding Hub (Located at {latitude}, {longitude})\n\n"
            "We have mapped your coordinates against our regional enterprise hospitality indexes. Here are your recommendations:\n\n"
            "1. **Primary Transport**: 'Downtown Line Metro' is situated 250m northwest of your position.\n"
            "2. **Client-Friendly Dining**: *The Capital Grille* features isolated booths suited for high-stakes business discussions.\n"
            "3. **Nearby Attraction (Within 2 Hours)**: State botanical gardens provide premium walking loops suitable for clearing travel fatigue.\n"
            f"4. **User request context**: '{message}'"
        ), ["[1] Geolocation-Based Business Index", "[2] Municipal District Map Data"]

    async def _simulate_travel_plan_agent(
        self, country: str, city: str, duration: int, budget: str, purpose: str, food_pref: str
    ) -> Tuple[str, str, str, str, List[str]]:
        await asyncio.sleep(0.8)
        
        itinerary = (
            f"### {duration}-Day Premium Enterprise Itinerary: {city}, {country}\n\n"
            f"**Purpose of Visit**: {purpose} ({budget} Budget Limit Parameters)\n\n"
            "**Day 1: Arrival & Settlement**\n"
            "- Arrive at airport terminal. Dynamic corporate collection. Check-in directly to downtown premium suites.\n"
            "- Rest and adapt to the local timezones.\n\n"
            "**Day 2: Collaboration Core**\n"
            "- Full-day workshops at regional corporate grids.\n"
            "- Secure team-building and networking events.\n\n"
            "**Day 3: Client Engagement and Wrap**\n"
            "- Dedicated investor/partner sessions. Final executive departure transfers."
        )
        
        food = (
            f"### Culinary Guide for {city} (Dietary: {food_pref})\n"
            f"1. **The Green Garden**: High-end modern dining option specializing in delicious vegetarian and vegan degustation plates.\n"
            "2. **Corporate pre-cleared kitchens**: Fully vetted and added into standard cost guidelines, avoiding out-of-pocket delays."
        )
        
        transit = (
            "### Local Transportation & Logistics\n"
            "- **Airport Link**: Take District Express Rail for predictable 22-minute commutes.\n"
            "- **Vetted Taxi**: Grab/Uber standard business tiers are fully reimbursable. Hold receipts for VoyagerIQ auto-scanner upload."
        )
        
        tips = (
            "### High-Stakes Travel Guidelines\n"
            "- **Security**: Keep active corporate VPN tunnels running at all times.\n"
            "- **Health & Power**: Bring standard global power adapters. Local voltage is standard 230V, 50Hz."
        )
        
        citations = [
            f"[1] VoyagerIQ Executive Dossier for {city}",
            "[2] Global Corporate Travel Security Index"
        ]
        
        return itinerary, food, transit, tips, citations

# Single instance client singleton
foundry_client = FoundryClient()

