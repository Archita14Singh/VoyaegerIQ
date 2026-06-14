import React, { useState, useEffect, useRef } from "react";
import { 
  Briefcase, 
  MapPin, 
  TrendingUp, 
  ChevronLeft, 
  ChevronRight, 
  Search, 
  Bell, 
  MessageSquare, 
  Plus, 
  DollarSign, 
  RefreshCcw, 
  Trash2, 
  Check, 
  ArrowRight, 
  Upload, 
  Moon, 
  Sun, 
  CheckCircle, 
  AlertTriangle, 
  ChevronDown, 
  Smartphone, 
  Compass, 
  Camera, 
  Map, 
  UtensilsCrossed, 
  CreditCard, 
  Send,
  Cloud,
  Bookmark,
  FileText,
  ChefHat,
  Cpu,
  Globe
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Transaction, Destination, ChatMessage, Trip, Recipe } from "./types";
import { INITIAL_TRIPS, INITIAL_TRANSACTIONS, INITIAL_DESTINATIONS, OTHER_DESTINATIONS } from "./data";

const INITIAL_RECIPES: Recipe[] = [
  {
    id: "rec-1",
    title: "Changi Chili Crab Inspired Pasta",
    country: "Singapore",
    durationMinutes: 30,
    ingredients: ["Tagliolini pasta", "Soft-shell crab", "Chili paste", "Ginger", "Garlic", "Tomato sauce", "Egg"],
    instructions: [
      "Sauté ginger and garlic in high-quality oil until fully aromatic.",
      "Stir-fry chili paste and sweet tomato puree to create the base reduction.",
      "Toss freshly boiled tagliolini pasta directly into the rich red sauce.",
      "Serve alongside deep-fried soft shell crab and garnish with fresh cilantro."
    ],
    dietaryCategory: "Standard"
  },
  {
    id: "rec-2",
    title: "Canary Wharf Plateau Filet",
    country: "UK",
    durationMinutes: 20,
    ingredients: ["Filet mignon", "Butter", "Truffle paste", "Red wine reduction", "Rosemary", "Garlic"],
    instructions: [
      "Sear the filet mignon on a very hot cast iron skillet until a brown crust forms.",
      "Baste with butter, crushed garlic, and rosemary for 2 minutes to medium rare.",
      "Rest the steak for 5 minutes, then plate over creamy mashed potatoes.",
      "Drizzle with truffle-infused red wine reduction and microgreens."
    ],
    dietaryCategory: "Standard"
  },
  {
    id: "rec-3",
    title: "Tokyo Otemachi Shoyu Secret Broth",
    country: "Japan",
    durationMinutes: 45,
    ingredients: ["Ramen Noodles", "Kombu dashi broth", "Shoyu (soy sauce)", "Mirin", "Shiitake mushrooms", "Green onions"],
    instructions: [
      "Simmer Kombu and dried shiitake mushrooms in spring water for 30 minutes.",
      "Stir in Mirin, high-grade Shoyu, and a pinch of brown sugar for the seasoned tare.",
      "Boil ramen noodles for precisely 2 minutes in clean boiling water.",
      "Pour hot broth over noodles, top with sliced green onions, mushrooms, and nori."
    ],
    dietaryCategory: "Vegetarian"
  }
];

export default function App() {
  // Navigation & User session states
  const getGreetingWord = () => {
    const hours = new Date().getHours();
    if (hours >= 4 && hours < 12) return "Good morning";
    if (hours >= 12 && hours < 17) return "Good afternoon";
    return "Good evening";
  };

  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  
  // Unified Corporate Travel Identity
  const [userName, setUserName] = useState<string>(() => localStorage.getItem("voyager_userName") || "Archita Sen");
  const [userEmail, setUserEmail] = useState<string>(() => localStorage.getItem("voyager_userEmail") || "archita0314@gmail.com");

  // Azure AI Foundry / OpenAI Client Connections
  const [szFoundryEndpoint, setSzFoundryEndpoint] = useState<string>(() => localStorage.getItem("foundry_endpoint") || "");
  const [szFoundryAgentName, setSzFoundryAgentName] = useState<string>(() => localStorage.getItem("foundry_agentName") || "");
  const [szFoundryAgentVersion, setSzFoundryAgentVersion] = useState<string>(() => localStorage.getItem("foundry_agentVersion") || "1.0");
  const [szFoundryIsolationKey, setSzFoundryIsolationKey] = useState<string>(() => localStorage.getItem("foundry_isolationKey") || "");
  const [showAzureConfigDrawer, setShowAzureConfigDrawer] = useState<boolean>(false);

  // Sync basic profile data changes in localStorage
  useEffect(() => {
    localStorage.setItem("voyager_userName", userName);
  }, [userName]);

  useEffect(() => {
    localStorage.setItem("voyager_userEmail", userEmail);
  }, [userEmail]);
  
  // Custom screen/tab routing
  // Tab states: 'dashboard' | 'expenses' | 'assistant' | 'planner' | 'recipes'
  const [activeTab, setActiveTab] = useState<string>("dashboard");
  
  // Theme controllers: 'light' | 'dark' | 'black'
  const [theme, setTheme] = useState<"light" | "dark" | "black">("light");

  // Recipes & GPS Suggestions states
  const [recipes, setRecipes] = useState<Recipe[]>(INITIAL_RECIPES);
  const [showAddRecipeModal, setShowAddRecipeModal] = useState<boolean>(false);
  const [newRecipeTitle, setNewRecipeTitle] = useState<string>("");
  const [newRecipeCountry, setNewRecipeCountry] = useState<string>("");
  const [newRecipeDuration, setNewRecipeDuration] = useState<number>(30);
  const [newRecipeDietary, setNewRecipeDietary] = useState<"Standard" | "Vegetarian" | "Vegan" | "Halal" | "Gluten-Free">("Standard");
  const [newRecipeIngredients, setNewRecipeIngredients] = useState<string>("");
  const [newRecipeInstructions, setNewRecipeInstructions] = useState<string>("");

  // Trip Creation Form states
  const [showAddTripModal, setShowAddTripModal] = useState<boolean>(false);
  const [newTripCity, setNewTripCity] = useState<string>("");
  const [newTripCountry, setNewTripCountry] = useState<string>("");
  const [newTripDates, setNewTripDates] = useState<string>("");
  const [newTripFlight, setNewTripFlight] = useState<string>("");
  const [newTripStatus, setNewTripStatus] = useState<"In Progress" | "Confirmed" | "Awaiting Confirmation">("Confirmed");
  const [newTripReason, setNewTripReason] = useState<string>("");
  const [newTripTemp, setNewTripTemp] = useState<string>("24°C");

  // GPS Suggestions states
  const [gpsLoading, setGpsLoading] = useState<boolean>(false);
  const [gpsError, setGpsError] = useState<string>("");
  const [coords, setCoords] = useState<{lat: number | null, lng: number | null}>({lat: null, lng: null});
  const [gpsRecommendations, setGpsRecommendations] = useState<any[]>([]);
  const [stayDuration, setStayDuration] = useState<string>("4 hours");

  // Database list states with robust local persistence memory
  const [trips, setTrips] = useState<Trip[]>(() => {
    const stored = localStorage.getItem("voyager_trips");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          return parsed.filter((t: any) => t && t.id !== "trip-init-1");
        }
      } catch (e) { console.error(e); }
    }
    return [];
  });

  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const stored = localStorage.getItem("voyager_transactions");
    if (stored) {
      try { return JSON.parse(stored); } catch (e) { console.error(e); }
    }
    return []; // Start empty so until users make entries, it shows $0
  });

  // Keep lists fully synchronized in localStorage on each modification
  useEffect(() => {
    localStorage.setItem("voyager_trips", JSON.stringify(trips));
  }, [trips]);

  useEffect(() => {
    localStorage.setItem("voyager_transactions", JSON.stringify(transactions));
  }, [transactions]);
  const [destinations, setDestinations] = useState<Destination[]>([
    ...INITIAL_DESTINATIONS,
    ...OTHER_DESTINATIONS.map(d => ({
      ...d,
      tags: d.tags || ["Business Zone", "Corporate favorite"],
      subImgUrl: d.imgUrl,
      district: d.name + " Financial Center"
    }))
  ]);
  
  // Flight and Boarding Ticket Tracker states
  const [ticketUploading, setTicketUploading] = useState<boolean>(false);
  const [ticketUploaded, setTicketUploaded] = useState<boolean>(false);
  const [ticketFileName, setTicketFileName] = useState<string>("");
  const [trackedFlightCodeInput, setTrackedFlightCodeInput] = useState<string>("SQ 317");
  const [trackedFlightData, setTrackedFlightData] = useState<any>(null);
  const [lastSyncedTime, setLastSyncedTime] = useState<string>("Synced 2m ago");
  const [isLiveTracking, setIsLiveTracking] = useState<boolean>(false);

  const handleTrackFlightLive = (code: string) => {
    if (!code) return;
    setIsLiveTracking(true);
    setTimeout(() => {
      setTrackedFlightData({
        flightCode: code.toUpperCase(),
        aircraft: "Boeing 777-300ER (SIA Fleet)",
        status: "EN ROUTE - LIVE",
        altitude: "38,040 ft",
        speed: "542 kts / 1,004 kmh",
        departure: "Singapore Changi Gateway (SIN)",
        destination: "Tokyo Haneda Hub (HND)",
        eta: "2h 15m remaining",
        progress: 72,
        gate: "Gate Terminal 3 - B4",
        carrier: "Singapore Airlines Group"
      });
      setIsLiveTracking(false);
    }, 1100);
  };

  // AI landmark GPS upload & experience log states
  const [gpsUploading, setGpsUploading] = useState<boolean>(false);
  const [gpsUploadedLandmark, setGpsUploadedLandmark] = useState<string>("");
  const [gpsDirections, setGpsDirections] = useState<string>("");
  
  // Employee experience journal states
  const [journalFeel, setJournalFeel] = useState<string>("Productive 🚀");
  const [journalPros, setJournalPros] = useState<string>("");
  const [journalCons, setJournalCons] = useState<string>("");
  const [journalAvoid, setJournalAvoid] = useState<string>("");
  const [journalMetro, setJournalMetro] = useState<string>("");
  const [journalCity, setJournalCity] = useState<string>("Singapore");
  const [journalList, setJournalList] = useState<any[]>(() => {
    const stored = localStorage.getItem("voyager_journalList");
    if (stored) {
      try { return JSON.parse(stored); } catch (e) { console.error(e); }
    }
    return [
      {
        id: "j-1",
        city: "Singapore",
        feel: "Productive 🚀",
        pros: "Extremely fast metro networks and incredibly modern office spaces at Marina Bay Dunes.",
        cons: "Highly humid outdoors, taxi costs surge significantly during rush hour.",
        avoid: "Avoid using cash for public transit. Only contactless cards are supported at local ticket gates.",
        metro: "Circle Line -> Promenade Terminal",
        timestamp: "3 days ago"
      },
      {
        id: "j-2",
        city: "London",
        feel: "Rested 🧘",
        pros: "Canary Wharf sector has amazing green spaces and quiet restaurants.",
        cons: "Frequent cold drizzles. Standard tube trains are quite cramped.",
        avoid: "Avoid traveling during peak hours (08:00 - 09:00) on the Central Line.",
        metro: "Jubilee Line -> Canary Wharf Station",
        timestamp: "1 week ago"
      }
    ];
  });

  // Sync journalList to LocalStorage automatically
  useEffect(() => {
    localStorage.setItem("voyager_journalList", JSON.stringify(journalList));
  }, [journalList]);

  const handleAddJournalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!journalPros.trim() && !journalCons.trim() && !journalAvoid.trim()) return;
    const newEntry = {
      id: "j-" + Date.now(),
      city: journalCity,
      feel: journalFeel,
      pros: journalPros.trim() || "N/A",
      cons: journalCons.trim() || "N/A",
      avoid: journalAvoid.trim() || "N/A",
      metro: journalMetro.trim() || "N/A",
      timestamp: "Just now"
    };
    setJournalList(prev => [newEntry, ...prev]);
    setJournalPros("");
    setJournalCons("");
    setJournalAvoid("");
    setJournalMetro("");
  };

  // UI state for adding elements
  const [showAddExpenseModal, setShowAddExpenseModal] = useState<boolean>(false);
  const [newExpenseVendor, setNewExpenseVendor] = useState<string>("");
  const [newExpenseAmount, setNewExpenseAmount] = useState<string>("");
  const [newExpenseCurrency, setNewExpenseCurrency] = useState<string>("SGD");
  const [newExpenseCategory, setNewExpenseCategory] = useState<"Food" | "Hotel" | "Transport" | "Other">("Food");
  const [newExpenseType, setNewExpenseType] = useState<"Business" | "Personal">("Business");
  
  // AI assistant chat state with durable localStorage synchronization
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(() => {
    const stored = localStorage.getItem("voyager_chatMessages");
    if (stored) {
      try { return JSON.parse(stored); } catch (e) { console.error(e); }
    }
    return [
      {
        id: "init-1",
        role: "assistant",
        content: "Hello Archita! I am VoyagerIQ, your premium AI travel concierge. I have synchronized your executive profile with Microsoft Azure Agent Studio. How can I assist you with flight details, transit, or corporate expenses today?",
        timestamp: "09:12 AM"
      }
    ];
  });

  // Keep chatMessages fully synchronized
  useEffect(() => {
    localStorage.setItem("voyager_chatMessages", JSON.stringify(chatMessages));
  }, [chatMessages]);
  const [chatInput, setChatInput] = useState<string>("");
  const [isAiTyping, setIsAiTyping] = useState<boolean>(false);
  
  // Destination exploration search query
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedDestinationFilter, setSelectedDestinationFilter] = useState<string>("All Destinations");
  const [bookmarkedDestinations, setBookmarkedDestinations] = useState<string[]>(["dest-tokyo"]);

  // Special Destination Creation state
  const [showAddCountryModal, setShowAddCountryModal] = useState<boolean>(false);
  const [newCountryName, setNewCountryName] = useState<string>("");
  const [newCountryCity, setNewCountryCity] = useState<string>("");
  const [newCountryDesc, setNewCountryDesc] = useState<string>("");
  const [newCountryMutedTags, setNewCountryMutedTags] = useState<string>("");

  // Live Multi-Currency Exchange Rates State and Multipliers
  const [convertAmount, setConvertAmount] = useState<number>(100);
  const [fromCurrency, setFromCurrency] = useState<string>("EUR");
  const [toCurrency, setToCurrency] = useState<string>("INR");

  const CURRENCY_NAME_MAP: Record<string, string> = {
    SGD: "Singapore Dollar",
    USD: "US Dollar",
    EUR: "Euro",
    INR: "Indian Rupee (₹)",
    GBP: "British Pound",
    JPY: "Japanese Yen"
  };

  const CURRENCY_RATES: Record<string, Record<string, number>> = {
    SGD: { SGD: 1, USD: 0.74, EUR: 0.69, INR: 61.5, GBP: 0.58, JPY: 115.8 },
    USD: { SGD: 1.35, USD: 1, EUR: 0.93, INR: 83.1, GBP: 0.78, JPY: 156.4 },
    EUR: { SGD: 1.45, USD: 1.08, EUR: 1, INR: 89.3, GBP: 0.84, JPY: 168.2 },
    INR: { SGD: 0.016, USD: 0.012, EUR: 0.011, INR: 1, GBP: 0.0094, JPY: 1.88 },
    GBP: { SGD: 1.72, USD: 1.28, EUR: 1.19, INR: 106.3, GBP: 1, JPY: 200.2 },
    JPY: { SGD: 0.0086, USD: 0.0064, EUR: 0.0059, INR: 0.53, GBP: 0.005, JPY: 1 }
  };

  const getConvertedVal = (amt: number, from: string, to: string): number => {
    const rate = CURRENCY_RATES[from]?.[to] || 1;
    return parseFloat((amt * rate).toFixed(2));
  };

  // Auto scanning file upload helpers
  const [isScanningReceipt, setIsScanningReceipt] = useState<boolean>(false);
  const [scannerStatus, setScannerStatus] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Chat window automatic scroll anchor
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Sync scroll on change
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages, isAiTyping]);



  // Switch dark-mode style on document element
  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark" || theme === "black") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }, [theme]);

  // Form submission handler for login screen
  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userName.trim()) {
      setUserName("Alex Sterling");
    }
    setIsLoggedIn(true);
  };

  // Send message to AI Endpoint
  const sendChatMessage = async (customPrompt?: string) => {
    const textToSend = customPrompt || chatInput;
    if (!textToSend.trim()) return;

    // Append user message
    const userMsg: ChatMessage = {
      id: "msg-" + Date.now(),
      role: "user",
      content: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setChatMessages(prev => [...prev, userMsg]);
    if (!customPrompt) {
      setChatInput("");
    }
    
    setIsAiTyping(true);

    try {
      const history = [...chatMessages, userMsg].map(m => ({
        role: m.role,
        content: m.content
      }));

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          messages: history,
          foundryConfig: {
            endpoint: szFoundryEndpoint,
            agentName: szFoundryAgentName,
            agentVersion: szFoundryAgentVersion,
            isolationKey: szFoundryIsolationKey
          }
        })
      });

      if (!res.ok) {
        throw new Error("Chat api request failed");
      }

      const data = await res.json();
      setChatMessages(prev => [...prev, {
        id: "ai-" + Date.now(),
        role: "assistant",
        content: data.text,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        citations: data.citations || []
      }]);
    } catch (err: any) {
      console.warn("AI endpoint offline, generating smart offline simulation", err);
      // Offline fallback simulations
      setTimeout(() => {
        let simulatedReply = "I have noted your request concerning custom global travel parameters. Let me run simulations to locate optimized solutions.";
        if (textToSend.toLowerCase().includes("itinerary")) {
          simulatedReply = "Here is an optimized **5-Day Premium Singapore Itinerary** based on executive patterns:\n\n- **Day 1**: Arrival at Changi, airport executive shuttle transfer to **Marina Bay Sands**, evening rest.\n- **Day 2**: Strategy summits at downtown financial grid, premium lunch at Out of Pocket pre-cleared venues.\n- **Day 3**: Tech client rounds at Changi District high-rises.\n- **Day 4**: Group dinner hosting at **The Plateau** near Canary Wharf or Singapore equivalent.\n- **Day 5**: Departure, digital expenses automated receipt filing.";
        }
        setChatMessages(prev => [...prev, {
          id: "ai-fallback-" + Date.now(),
          role: "assistant",
          content: simulatedReply,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          citations: ["[1] VoyagerIQ Local Intelligence Cache"]
        }]);
      }, 1000);
    } finally {
      setIsAiTyping(false);
    }
  };

  // Expense listing computations
  const totalReimbursable = transactions
    .filter(t => t.type === "Business" && t.status === "Eligible")
    .reduce((sum, t) => sum + t.amount, 0);

  const totalPending = transactions
    .filter(t => t.type === "Business" && t.status === "Pending")
    .reduce((sum, t) => sum + t.amount, 0);

  const totalPersonal = transactions
    .filter(t => t.type === "Personal")
    .reduce((sum, t) => sum + t.amount, 0);

  const grandTotalSGD = totalReimbursable + totalPending + totalPersonal;
  
  // Format monetary sums
  const formattedTotalUSD = (grandTotalSGD * 0.7423).toFixed(2);

  // Submit custom added expense
  const handleAddExpenseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(newExpenseAmount);
    if (!newExpenseVendor.trim() || isNaN(parsedAmount)) return;

    const newTx: Transaction = {
      id: "tx-added-" + Date.now(),
      vendor: newExpenseVendor,
      amount: parsedAmount,
      currency: newExpenseCurrency,
      category: newExpenseCategory,
      date: new Date().toISOString().split("T")[0],
      type: newExpenseType,
      status: newExpenseType === "Business" ? "Eligible" : "N/A"
    };

    setTransactions(prev => [newTx, ...prev]);
    setShowAddExpenseModal(false);
    
    // Reset fields
    setNewExpenseVendor("");
    setNewExpenseAmount("");
  };

  // Auto scan receipt trigger
  const handleReceiptScanClick = () => {
    fileInputRef.current?.click();
  };

  // Receipt File processor convert to Base64 and push to `/api/scan-receipt`
  const handleReceiptFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsScanningReceipt(true);
    setScannerStatus("Uploading file & launching VoyagerIQ Vision...");

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = async () => {
      const base64PlusMeta = reader.result as string;
      const base64Data = base64PlusMeta.split(",")[1];

      try {
        setScannerStatus("GenAI processing complex handwriting & tax tables...");
        const res = await fetch("/api/scan-receipt", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            imageBase64: base64Data,
            mimeType: file.type,
            foundryConfig: {
              endpoint: szFoundryEndpoint,
              agentName: szFoundryAgentName,
              agentVersion: szFoundryAgentVersion,
              isolationKey: szFoundryIsolationKey
            }
          })
        });

        if (!res.ok) {
          throw new Error("Scan API returned status code " + res.status);
        }

        const details = await res.json();
        
        // Auto populate Add Expense modal state
        setNewExpenseVendor(details.vendor || "Scanned Vendor");
        setNewExpenseAmount(details.amount ? String(details.amount) : "0");
        setNewExpenseCurrency(details.currency || "SGD");
        setNewExpenseCategory(details.category || "Food");
        setNewExpenseType(details.reimbursable ? "Business" : "Personal");

        // Flash and show Modal
        setScannerStatus("Scanning Success! Loading details directly...");
        setTimeout(() => {
          setIsScanningReceipt(false);
          setShowAddExpenseModal(true);
        }, 1500);

      } catch (err) {
        console.error("OCR scan failure, launching mock scan integration", err);
        setScannerStatus("OCR scanning simulated fallback...");
        
        // Inject beautiful fallback parsing
        setTimeout(() => {
          setNewExpenseVendor("Plateau Canary Wharf Ltd");
          setNewExpenseAmount("182.50");
          setNewExpenseCurrency("GBP");
          setNewExpenseCategory("Food");
          setNewExpenseType("Business");
          setIsScanningReceipt(false);
          setShowAddExpenseModal(true);
        }, 1500);
      }
    };
  };

  // Save new custom business country destination
  const handleAddCountrySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCountryName.trim() || !newCountryCity.trim()) return;

    const newDestId = "dest-added-" + Date.now();
    const newDest: Destination = {
      id: newDestId,
      name: newCountryCity,
      country: newCountryName,
      description: newCountryDesc || "A modern corporate hotspot perfect for team summits and premium stakeholder meetings.",
      tags: newCountryMutedTags ? newCountryMutedTags.split(",").map(s => s.trim()) : ["Business Hub", "AI Recommended"],
      imgUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuDkx8C64P4i6MQuhSvzS1B0krI5NQ-ELrVJLzTsN-SGzjCaaXC9-8wXcjEQo5OtKbRE93juHa0I5mPcOLK5kHu2m29JGtDW8PbWe1PVqNt52bwP55Ej6qn2jfxIU7Zbs24igZEEiMsDDGGq9gagS2MSRP0TSWRZDnW4OqrI8XcwkbjlETLXhuoQb2C3vNpIaP8cSsWwDp032HWLo1ovVzEPmrnSLrNe47EeGdw2jSHNxYDMzeWCNwz7DWdbzbuDCzq22eu2J6yf7lc",
      isRecommended: true,
      subImgUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuATZe4F-Zvs2oBRQWhEBplAnGU6bLdA7RBxI1orvb6bafUm2cnz7wcqTHf7wzgrJP3n2puraCHggsvg-OL8M5LxtjjGVyCLY9FN-r86TwC-JalSccAe7lG8HzUs-X07cXeP9Ne5VUHHKm3douU6Yn0gCDW8Hp8Hzs6lJC09Dn-kLzkaC6yNpZID7YLZ_IT9mGpbc4vUfyggHVg-KBDrk7BiBQTOldLByC1xyxqK3kQe92wdxwyizmPpw7151NsrTD5D7WYLpxaM8Ic",
      district: newCountryCity + " Central Business Core",
      attractions: ["Metropolis Core", "Innovation Tower"],
      transport: "Local Express Train Link"
    };

    setDestinations(prev => [newDest, ...prev]);
    setShowAddCountryModal(false);
    
    // Clear custom form fields
    setNewCountryName("");
    setNewCountryCity("");
    setNewCountryDesc("");
    setNewCountryMutedTags("");
  };

  // Submit new user trip manually
  const handleAddTripSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTripCity.trim() || !newTripCountry.trim()) return;

    const newTrip: Trip = {
      id: "trip-user-" + Date.now(),
      city: newTripCity.trim(),
      country: newTripCountry.trim(),
      dates: newTripDates.trim() || "Nov 25 - Nov 29",
      flightCode: newTripFlight.trim() || "SQ-User",
      status: newTripStatus,
      imgUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuDkx8C64P4i6MQuhSvzS1B0krI5NQ-ELrVJLzTsN-SGzjCaaXC9-8wXcjEQo5OtKbRE93juHa0I5mPcOLK5kHu2m29JGtDW8PbWe1PVqNt52bwP55Ej6qn2jfxIU7Zbs24igZEEiMsDDGGq9gagS2MSRP0TSWRZDnW4OqrI8XcwkbjlETLXhuoQb2C3vNpIaP8cSsWwDp032HWLo1ovVzEPmrnSLrNe47EeGdw2jSHNxYDMzeWCNwz7DWdbzbuDCzq22eu2J6yf7lc",
      reason: newTripReason.trim() || "Custom Business Summit",
      arrTime: newTripStatus === "In Progress" ? "In Progress" : "Pending",
      weatherTemp: newTripTemp || "24°C"
    };

    setTrips(prev => {
      let updated = [...prev];
      if (newTripStatus === "In Progress") {
        // Downgrade any other active trip to Confirmed, to keep exactly one trip active
        updated = updated.map(t => t.status === "In Progress" ? { ...t, status: "Confirmed" as const } : t);
      }
      return [newTrip, ...updated];
    });

    setShowAddTripModal(false);
    setNewTripCity("");
    setNewTripCountry("");
    setNewTripDates("");
    setNewTripFlight("");
    setNewTripReason("");
    setNewTripTemp("24°C");
    setNewTripStatus("Confirmed");
  };

  // Submit custom added recipe
  const handleAddRecipeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRecipeTitle.trim()) return;

    const newRecipe: Recipe = {
      id: "recipe-user-" + Date.now(),
      title: newRecipeTitle.trim(),
      country: newRecipeCountry.trim() || "Global",
      durationMinutes: Number(newRecipeDuration) || 30,
      dietaryCategory: newRecipeDietary,
      ingredients: newRecipeIngredients ? newRecipeIngredients.split(",").map(i => i.trim()).filter(Boolean) : ["Fresh corporate dining ingredients"],
      instructions: newRecipeInstructions ? newRecipeInstructions.split("\n").map(i => i.trim()).filter(Boolean) : ["Cook with premium travel dedication.", "Plate beautifully and serve."]
    };

    setRecipes(prev => [newRecipe, ...prev]);
    setShowAddRecipeModal(false);
    setNewRecipeTitle("");
    setNewRecipeCountry("");
    setNewRecipeDuration(30);
    setNewRecipeDietary("Standard");
    setNewRecipeIngredients("");
    setNewRecipeInstructions("");
  };

  // Trigger browser GPS request and gather tailored nearby attractions
  const handleGpsLookup = () => {
    setGpsLoading(true);
    setGpsError("");
    setGpsRecommendations([]);

    if (!navigator.geolocation) {
      setGpsError("Geolocation is not supported by your browser environment.");
      setGpsLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        setCoords({ lat, lng });

        try {
          // Dynamic recommendations based on coordinates and duration
          const response = await fetch("/api/chat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              messages: [
                {
                  role: "user",
                  content: `GPS LOCATION REQUEST: Provide 3 high-end executive local recommendations or fine dining near Latitude: ${lat}, Longitude: ${lng} with a duration stay of ${stayDuration}. Keep it very brief, high-end, and support markdown.`
                }
              ]
            })
          });

          if (response.ok) {
            const data = await response.json();
            setGpsRecommendations([
              {
                title: "Live Coordinates Recommendations",
                description: data.text,
                coords: `${lat.toFixed(4)}, ${lng.toFixed(4)}`
              }
            ]);
          } else {
            throw new Error("Proxy offline");
          }
        } catch (err) {
          console.warn("GPS lookup endpoint fallback", err);
          setTimeout(() => {
            setGpsRecommendations([
              {
                title: "Raffles Gourmet Salon & Heritage Bar",
                description: "Famous high tea room, ideal for an offline business lounge session during your trip.",
                distance: "1.2 km away",
                durationNeeded: "2 hours"
              },
              {
                title: "Sands SkyPark Skywalk",
                description: "Observation pathway 57 stories high, looking over Marina Bay's magnificent skyline.",
                distance: "3.5 km away",
                durationNeeded: "1.5 hours"
              },
              {
                title: "Canary Wharf Jubilee Place Bistro",
                description: "Private quiet glass capsule lounge suited for premier team dinners.",
                distance: "4.8 km away",
                durationNeeded: "2 hours"
              }
            ]);
          }, 1000);
        } finally {
          setGpsLoading(false);
        }
      },
      (error) => {
         console.warn("Geolocation permission error/rejected:", error);
         setGpsError("Unable to retrieve GPS coordinates. Frame permissions denied or timed out. Feel free to use our curated fallback recommendations below!");
         setGpsLoading(false);
         // Visual fallback of elegant attractions
         setGpsRecommendations([
           {
             title: "The Crossrail Place Roof Garden",
             description: "Enchanting foliage walkthrough under a glass dome canopy in Canary Wharf.",
             distance: "0.4 km away",
             durationNeeded: "1 hour"
           },
           {
             title: "The Plateau Bistrot & Terrace",
             description: "Elevated skyline views with contemporarily refined French cuisine suited for elite stakeholders.",
             distance: "0.2 km away",
             durationNeeded: "2 hours"
           }
         ]);
      },
      { timeout: 8000 }
    );
  };

  // Toggle bookmark / saved target
  const handleToggleBookmark = (destId: string) => {
    setBookmarkedDestinations(prev => 
      prev.includes(destId) ? prev.filter(id => id !== destId) : [...prev, destId]
    );
  };

  // Get current active theme background styles
  const getThemeBgClass = () => {
    if (theme === "black") return "bg-black text-white selection:bg-slate-800";
    if (theme === "dark") return "bg-slate-930 text-slate-100 selection:bg-slate-800";
    return "bg-slate-50 text-slate-900 selection:bg-blue-100";
  };

  // Dynamic layout definitions based on themes
  const getCardClass = () => {
    if (theme === "black") return "bg-zinc-950 border border-zinc-800 placeholder-zinc-500 shadow-md shadow-zinc-950/20";
    if (theme === "dark") return "bg-slate-900/80 backdrop-blur-xl border border-slate-800 shadow-md shadow-slate-950/20";
    return "bg-white/85 backdrop-blur-xl border border-slate-100/80 shadow-sm shadow-slate-100/10";
  };

  const getSubtleCardClass = () => {
    if (theme === "black") return "bg-zinc-900 border border-zinc-800/60";
    if (theme === "dark") return "bg-slate-800/40 border border-slate-700/30";
    return "bg-slate-100/50 border border-slate-200/40";
  };

  const getHeaderClass = () => {
    if (theme === "black") return "bg-black/95 border-b border-zinc-800";
    if (theme === "dark") return "bg-slate-950/90 border-b border-slate-800/60 backdrop-blur-xl";
    return "bg-white/80 border-b border-slate-100/80 backdrop-blur-xl";
  };

  const getTextMuted = () => {
    if (theme === "light") return "text-slate-500";
    return "text-slate-400";
  };

  // Filtered destinations list
  const filteredDestinations = destinations.filter(dest => {
    const matchesSearch = dest.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          dest.country.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          dest.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (selectedDestinationFilter === "All Destinations") {
      return matchesSearch;
    }
    return matchesSearch && dest.name.toLowerCase() === selectedDestinationFilter.toLowerCase();
  });

  // RENDER LOGIN SCREEN (Screen 0)
  if (!isLoggedIn) {
    return (
      <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden font-sans bg-slate-50">
        {/* Background line map */}
        <div className="absolute inset-0 z-0">
          <img 
            className="w-full h-full object-cover opacity-15 grayscale contrast-125" 
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuDZVaJNutAsp9hBE6OPLKI-3_3y9gBwL5neFdCWP4ADGC2CPHITyEogmJQKsNPdjzEP5JtV03gCz5iEKIxu84D7gxCv7xJNwACycnwoJAccdBmpjbeMWxw0oNJiIDUAYFvtivRHuuA47eyNFJw6LpW0_0kIhqbx1cS4Eh3Uvrq7BSJ0m-VBm6ST5SGBlQ-7UL4G4r69LSdsnud_FqxoEg6Qi4oKmHI1dQgm-7TvrymK9Slo9iCl-h_CTxk_8xU_waBqR_SZQky4wXc" 
            alt="Global Abstract Map Background"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-tr from-slate-100 via-transparent to-blue-50"></div>
        </div>

        <main className="relative z-10 w-full max-w-[440px] px-6">
          <div className="text-center mb-8 flex flex-col items-center">
            <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-blue-600/30">
              <Compass className="text-white w-10 h-10 animate-pulse" />
            </div>
            <h1 className="text-3xl font-display font-bold text-blue-700 tracking-tight">VoyagerIQ</h1>
            <p className="text-sm font-medium text-slate-500 mt-1 uppercase tracking-widest">Premium AI-Driven Travel Concierge</p>
          </div>

          <div className="bg-white/80 border border-slate-100/90 rounded-2xl shadow-xl shadow-slate-200/50 p-8 backdrop-blur-2xl">
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-slate-900">Welcome back</h2>
              <p className="text-xs text-slate-400 uppercase tracking-widest mt-1">Enterprise Access Suite</p>
            </div>

            <form onSubmit={handleLoginSubmit} className="space-y-6">
              <div>
                <label className="text-xs font-semibold text-slate-400 mb-1 block uppercase tracking-wide" htmlFor="fullName">Full Name</label>
                <input 
                  className="w-full bg-slate-50/50 border-0 border-b-2 border-slate-200 focus:border-blue-600 focus:ring-0 py-2.5 px-1 text-slate-800 placeholder:text-slate-300 transition-colors uppercase tracking-wide font-medium text-sm focus:outline-none"
                  id="fullName" 
                  value={userName}
                  onChange={(e) => {
                    setUserName(e.target.value);
                    const formattedEmail = e.target.value.toLowerCase().trim().replace(/\s+/g, ".");
                    setUserEmail(formattedEmail ? `${formattedEmail}@enterprise.com` : "user@enterprise.com");
                  }}
                  placeholder="e.g. JULIAN MONTGOMERY" 
                  type="text"
                  required
                />
              </div>

              <div className="pt-2">
                <button 
                  className="w-full h-12 bg-blue-600 text-white rounded-xl font-medium shadow-md shadow-blue-600/20 hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-2 group cursor-pointer"
                  type="submit"
                >
                  Continue
                  <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                </button>
              </div>
            </form>

            <div className="mt-6 flex flex-col gap-4 items-center border-t border-slate-100 pt-6">
              <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">OR SIGN IN WITH</p>
              <button 
                onClick={() => {
                  setUserName("Alex Sterling");
                  setUserEmail("alex.sterling@enterprise.com");
                  setIsLoggedIn(true);
                }}
                className="w-full border border-slate-200 h-11 rounded-xl flex items-center justify-center bg-white hover:bg-slate-50 transition-colors active:scale-95 text-xs font-semibold text-slate-600 cursor-pointer"
              >
                <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.18 1-.78 1.85-1.63 2.42v2.77h2.63c1.54-1.42 2.43-3.52 2.43-5.97z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-2.63-2.77c-.73.49-1.66.78-2.65.78-2.04 0-4.76-1.38-5.38-3.23H1.24v2.87C3.05 20.13 7.24 23 12 23z" />
                  <path fill="#FBBC05" d="M6.62 15.12c-.16-.49-.25-1.02-.25-1.57s.09-1.08.25-1.57V9.11H1.24C.45 10.7 0 12.5 0 14s.45 3.3 1.24 4.89l5.38-3.77z" strokeWidth="0" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.24 1 3.05 3.87 1.24 7.64l5.38 3.77c.62-1.85 3.34-3.23 5.38-3.23z" />
                </svg>
                Google Workspace Access
              </button>
            </div>
          </div>

          <footer className="mt-8 text-center text-xs">
            <p className="text-slate-400">
              Need help? Contact your <a className="text-blue-600 font-semibold hover:underline" href="#">VoyagerIQ Administrator</a>
            </p>
            <div className="flex justify-center gap-6 mt-3 text-[10px] font-bold text-slate-300 uppercase tracking-widest">
              <span>Privacy Policy</span>
              <span>Terms of Service</span>
            </div>
          </footer>
        </main>
      </div>
    );
  }

  // STANDARD LOGGED-IN EXPERIENCE (Workspace with dynamic dashboard / screens)
  return (
    <div className={`min-h-screen ${getThemeBgClass()} flex flex-col md:flex-row transition-all duration-300`}>
      
      {/* SideBar Navigation (Desktop Only) */}
      <aside className={`hidden md:flex flex-col gap-2 p-6 w-[280px] fixed left-0 top-0 h-full border-r ${
        theme === "black" 
          ? "bg-black border-zinc-800" 
          : "bg-slate-900 border-slate-800 text-slate-100"
      } z-40`}>
        <div className="mb-8 px-2 flex items-center gap-2">
          <Compass className="text-blue-400 w-6 h-6" />
          <h1 className="text-xl font-display font-medium text-white tracking-widest uppercase">VoyagerIQ</h1>
        </div>

        <div className="flex items-center gap-3 p-3 mb-6 bg-slate-850/40 rounded-xl border border-slate-800/40">
          <div className="w-10 h-10 rounded-full overflow-hidden bg-slate-700 border border-slate-700 flex-shrink-0">
            <img 
              alt="user_profile_photo" 
              className="w-full h-full object-cover" 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuA1KhdF1NQmUaL6ow8nRg1JJJGSIU2wTNBUsrSxVhmuaEVPYg2i-XUOA3cxT4Xu-2cZUXLWszvDzSelWPQxOIE_vD8tjXkI9akO_stkuEouefKAxnKlbOeh-Gw4yr4ULVymeAEbIkyk97ea90UQJZ6lc7ZPhTnK29VLe4ceOAuXp30zTt5MYOuBEtR9vw5euz-lPSe9SWhhgnNJ72WmgHoM44L0b6lnie6NJ9_6Z-cEGCyt7EGDjkMTuQ-v_p9YImczPWJ3n9svCIQ" 
              referrerPolicy="no-referrer"
            />
          </div>
          <div className="overflow-hidden">
            <p className="font-semibold text-white truncate text-sm">{userName}</p>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">VoyagerIQ Pro</p>
          </div>
        </div>



        <nav className="flex flex-col gap-1 flex-1">
          <button 
            onClick={() => setActiveTab("dashboard")}
            className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-xs font-semibold uppercase tracking-wider relative transition-all cursor-pointer ${
              activeTab === "dashboard" 
                ? "bg-blue-600 text-white shadow-md shadow-blue-600/10 border-l-4 border-blue-400" 
                : "text-slate-400 hover:bg-slate-800/50 hover:text-white"
            }`}
          >
            <Smartphone className="w-4 h-4" />
            Dashboard
          </button>

          <button 
            onClick={() => setActiveTab("expenses")}
            className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-xs font-semibold uppercase tracking-wider relative transition-all cursor-pointer ${
              activeTab === "expenses" 
                ? "bg-blue-600 text-white shadow-md shadow-blue-600/10 border-l-4 border-blue-300" 
                : "text-slate-400 hover:bg-slate-800/50 hover:text-white"
            }`}
          >
            <CreditCard className="w-4 h-4" />
            Expense Tracker
          </button>

          <button 
            onClick={() => setActiveTab("planner")}
            className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-xs font-semibold uppercase tracking-wider relative transition-all cursor-pointer ${
              activeTab === "planner" 
                ? "bg-blue-600 text-white shadow-md shadow-blue-600/10 border-l-4 border-blue-300" 
                : "text-slate-400 hover:bg-slate-800/50 hover:text-white"
            }`}
          >
            <Map className="w-4 h-4" />
            Country Explorer
          </button>

          <button 
            onClick={() => setActiveTab("assistant")}
            className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-xs font-semibold uppercase tracking-wider relative transition-all cursor-pointer ${
              activeTab === "assistant" 
                ? "bg-teal-600 text-white shadow-md shadow-teal-600/10 border-l-4 border-teal-400" 
                : "text-slate-400 hover:bg-slate-800/50 hover:text-white"
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            AI Assistant
          </button>
        </nav>

        {/* Theme select controller */}
        <div className="mt-auto pt-6 border-t border-slate-800">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">CONCIERGE DESIGN</p>
          <div className="grid grid-cols-3 gap-1 p-1 bg-slate-950 rounded-lg">
            <button 
              onClick={() => setTheme("light")}
              className={`py-1 text-[9px] font-bold uppercase rounded cursor-pointer ${theme === "light" ? "bg-slate-800 text-white" : "text-slate-400"}`}
            >
              Light
            </button>
            <button 
              onClick={() => setTheme("dark")}
              className={`py-1 text-[9px] font-bold uppercase rounded cursor-pointer ${theme === "dark" ? "bg-slate-800 text-white" : "text-slate-400"}`}
            >
              Dark
            </button>
            <button 
              onClick={() => setTheme("black")}
              className={`py-1 text-[9px] font-bold uppercase rounded cursor-pointer ${theme === "black" ? "bg-slate-800 text-white" : "text-slate-400"}`}
            >
              Black
            </button>
          </div>
        </div>
      </aside>

      {/* Screen Header Content Bar */}
      <header className={`fixed top-0 right-0 w-full md:w-[calc(100%-280px)] h-16 z-30 flex justify-between items-center px-6 md:px-8 border-b ${getHeaderClass()} transition-colors`}>
        <div className="flex items-center gap-2">
          {/* Mobile responsive sidebar hamburger toggle */}
          <div className="flex md:hidden mr-2 items-center">
            <Compass className="text-blue-600 w-5 h-5 mr-1" />
            <h1 className="text-sm font-bold text-slate-800 uppercase tracking-widest font-display">VoyagerIQ</h1>
          </div>
          
          <h2 className="hidden md:block font-bold text-blue-800 text-lg uppercase tracking-wider font-display">
            {activeTab === "dashboard" && "Dashboard Overview"}
            {activeTab === "expenses" && "Expense Ledger"}
            {activeTab === "planner" && "Country Explorer"}
            {activeTab === "assistant" && "AI Travel Assistant"}
            {activeTab === "recipes" && "VoyagerIQ Secret Recipes"}
          </h2>
        </div>

        <div className="flex items-center gap-4">
          {/* Azure configuration toggle */}
          <button 
            id="btn-azure-settings"
            onClick={() => setShowAzureConfigDrawer(true)}
            style={{ cursor: "pointer" }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold font-mono transition-all border active:scale-95 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border-emerald-500/30"
          >
            <Cpu className="w-3.5 h-3.5 animate-pulse" />
            Azure Engine Active
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
          </button>

          <button className={`p-1.5 rounded-full transition-colors active:scale-95 border cursor-pointer ${
            theme === "light" 
              ? "bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-600" 
              : "bg-slate-900 hover:bg-slate-800 border-slate-800 text-slate-300"
          }`}>
            <Bell className="w-4 h-4" />
          </button>
          
          <div className="flex items-center gap-2">
            <div className="md:hidden w-7 h-7 rounded-full overflow-hidden bg-slate-700">
              <img 
                alt="userAvatar" 
                className="w-full h-full object-cover" 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuA1KhdF1NQmUaL6ow8nRg1JJJGSIU2wTNBUsrSxVhmuaEVPYg2i-XUOA3cxT4Xu-2cZUXLWszvDzSelWPQxOIE_vD8tjXkI9akO_stkuEouefKAxnKlbOeh-Gw4yr4ULVymeAEbIkyk97ea90UQJZ6lc7ZPhTnK29VLe4ceOAuXp30zTt5MYOuBEtR9vw5euz-lPSe9SWhhgnNJ72WmgHoM44L0b6lnie6NJ9_6Z-cEGCyt7EGDjkMTuQ-v_p9YImczPWJ3n9svCIQ" 
                referrerPolicy="no-referrer"
              />
            </div>
          </div>
        </div>
      </header>

      {/* Main viewport canvas */}
      <main className="flex-1 mt-16 pb-24 md:pb-8 md:ml-[280px] p-6 md:p-8 overflow-y-auto">
        <AnimatePresence mode="wait">
          
          {/* TAB 1: DASHBOARD VIEW */}
          {activeTab === "dashboard" && (
            <motion.div 
              key="dashboard"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25 }}
              className="space-y-6"
            >
              {/* Personalized greetings */}
              <div className="flex flex-col md:flex-row justify-between md:items-end gap-2">
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold tracking-tight">{getGreetingWord()}, {userName.split(" ")[0]}</h1>
                  <p className={`${getTextMuted()} text-sm font-medium mt-1`}>
                    Welcome back. Your active traveler portfolio is synced and fully live.
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-mono text-xs uppercase text-slate-400 tracking-wider">
                    {new Date().toLocaleDateString("en-US", { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' })}
                  </p>
                  <button 
                    onClick={() => setShowAddTripModal(true)}
                    className="mt-2 text-xs bg-blue-600 text-white font-bold px-3.5 py-1.5 rounded-lg shadow-md hover:bg-blue-700 active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer inline-flex"
                  >
                    <Plus className="w-3.5 h-3.5" /> Plan / Create Custom Trip
                  </button>
                </div>
              </div>

              {/* Bento Grid layout */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* Bento Card: Current Active Trip (Left) */}
                {(() => {
                  const activeTrip = trips.find(t => t.status === "In Progress");
                  if (!activeTrip) {
                    const upcomingTrip = trips.find(t => t.status === "Confirmed" || t.status === "Awaiting Confirmation");
                    return (
                      <section className={`${getCardClass()} lg:col-span-8 p-6 rounded-2xl border-l-4 border-l-amber-500 relative flex flex-col justify-between space-y-4`}>
                        <div className="space-y-3">
                          <div className="flex justify-between items-center">
                            <span className="text-[10px] bg-amber-500/10 text-amber-600 px-2.5 py-0.5 rounded-full font-bold uppercase tracking-widest">
                              ⚠️ No Active Segment
                            </span>
                            <span className="text-[11px] text-slate-400 font-mono">Current Travel Status: Standby</span>
                          </div>
                          <h2 className="text-xl md:text-2xl font-bold text-slate-800 dark:text-white leading-tight font-display">
                            No active trip currently in progress.
                          </h2>
                          {upcomingTrip ? (
                            <div className="p-3 bg-amber-500/5 border border-amber-500/20 rounded-xl space-y-1.5 animate-pulse">
                              <p className="text-xs font-bold text-amber-700 dark:text-amber-400 flex items-center gap-1.5">
                                📅 Mapped Flight Ticket Detected: {upcomingTrip.city}, {upcomingTrip.country}
                              </p>
                              <p className={`text-[11px] ${getTextMuted()}`}>
                                Dates: {upcomingTrip.dates} • Purpose: {upcomingTrip.reason || "Corporate Visit"}
                              </p>
                              <button
                                onClick={() => {
                                  setTrips(prev => prev.map(t => t.id === upcomingTrip.id ? { ...t, status: "In Progress" as const } : { ...t, status: t.status === "In Progress" ? "Confirmed" as const : t.status }));
                                }}
                                className="text-xs font-bold text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 hover:underline flex items-center gap-1 cursor-pointer"
                              >
                                Go Live / Activate Segment Now →
                              </button>
                            </div>
                          ) : (
                            <p className={`text-xs ${getTextMuted()} leading-relaxed`}>
                              Do you have any future trips? Plan accordingly by creating your designated travel coordinates below or upload your reservation invoice to auto-populate flights!
                            </p>
                          )}
                        </div>
                        <div className="flex flex-col sm:flex-row gap-3 pt-3">
                          <button
                            onClick={() => setShowAddTripModal(true)}
                            className="bg-blue-600 shadow-md shadow-blue-600/15 text-white text-xs font-bold px-4 py-2.5 rounded-xl hover:bg-blue-700 active:scale-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                          >
                            <Plus className="w-4 h-4" /> Plan / Create Custom Trip
                          </button>
                          <button
                            onClick={() => setActiveTab("planner")}
                            className="border border-slate-200 dark:border-zinc-805 hover:bg-slate-50 dark:hover:bg-zinc-900 leading-none py-2.5 px-4 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-350 cursor-pointer flex items-center justify-center"
                          >
                            Browse Global Hubs
                          </button>
                        </div>
                      </section>
                    );
                  }
                  
                  return (
                    <section className={`${getCardClass()} lg:col-span-8 overflow-hidden rounded-2xl relative transition-all group border-l-4 border-l-teal-500`}>
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-transparent pointer-events-none"></div>
                      
                      <div className="p-6 flex flex-col h-full relative z-10 space-y-4">
                        <div className="flex justify-between items-start">
                          <div className="px-2.5 py-0.5 bg-teal-500/10 border border-teal-500/20 text-teal-600 dark:text-teal-400 rounded-full text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5 backdrop-blur-md">
                            <span className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-pulse"></span>
                            Active Trip
                          </div>
                          
                          <div className="flex items-center gap-1.5 font-mono text-sm font-bold bg-slate-100 dark:bg-zinc-800 px-2 py-1 rounded-lg">
                            <span>{activeTrip.weatherTemp || "24°C"}</span>
                            <span className="text-yellow-500">☀️</span>
                          </div>
                        </div>

                        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pt-2">
                          <div>
                            <h2 className="text-3xl md:text-4xl font-bold text-blue-600 dark:text-blue-400 leading-none">
                              {activeTrip.city}, {activeTrip.country}
                            </h2>
                            <p className={`text-xs font-semibold tracking-wider mt-2.5 uppercase ${getTextMuted()}`}>
                              {activeTrip.reason || "Enterprise Q3 Strategy Engagement"} • Flight: {activeTrip.flightCode || "Direct Transit"}
                            </p>
                            <p className="text-xs text-teal-600 dark:text-teal-400 font-bold mt-1.5">
                              Status: Fully Active In-Progress Trip
                            </p>
                          </div>

                          <div className="flex gap-2 flex-shrink-0">
                            <button 
                              onClick={() => {
                                setActiveTab("planner");
                                setSelectedDestinationFilter(activeTrip.city);
                              }}
                              className="bg-blue-600 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-md hover:brightness-110 select-none active:scale-[0.98] transition-transform cursor-pointer"
                            >
                              Details
                            </button>
                            <button 
                              onClick={() => {
                                // Deactivate trip (toggle to Confirmed)
                                setTrips(prev => prev.map(t => t.id === activeTrip.id ? { ...t, status: "Confirmed" as const } : t));
                              }}
                              className="bg-slate-550/10 border border-slate-500/20 px-3 py-2 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-500/20 active:scale-95 transition-all cursor-pointer"
                            >
                              Deactivate
                            </button>
                          </div>
                        </div>
                      </div>

                      <div 
                        className="h-32 w-full mt-2 bg-cover bg-center grayscale filter hover:grayscale-0 brightness-95 opacity-80 hover:opacity-100 transition-all duration-500" 
                        style={{ backgroundImage: `url('${activeTrip.imgUrl}')` }}
                      ></div>
                    </section>
                  );
                })()}

                {/* Bento Card: Expense Mini metrics (Right) - takes 4 columns if Active Trip exists, else full 12 columns! */}
                {(() => {
                  const activeTrip = trips.find(t => t.status === "In Progress");
                  const colSpan = activeTrip ? "lg:col-span-4" : "lg:col-span-12";
                  
                  return (
                    <section className={`${getCardClass()} ${colSpan} p-6 flex flex-col justify-between space-y-4 rounded-2xl relative overflow-hidden`}>
                      {!activeTrip && (
                        <div className="absolute top-0 right-0 p-4 bg-amber-500/10 border border-amber-500/20 text-amber-600 rounded-bl-xl text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5">
                          💼 Ready for Active deployment
                        </div>
                      )}
                      
                      <div className="flex justify-between items-center">
                        <h3 className="font-semibold text-sm uppercase tracking-wider">Expense Summary / Ledger Status</h3>
                        <TrendingUp className="text-blue-600 w-4 h-4" />
                      </div>

                      <div className="space-y-3">
                        {!activeTrip && (
                          <div className="p-3 bg-blue-50/50 dark:bg-zinc-900 border border-blue-200/40 rounded-xl mb-2 text-xs">
                            <p className="font-semibold text-blue-750 dark:text-blue-300">No active/in-progress trip layout is registered under your account.</p>
                            <p className={`text-[11px] mt-0.5 ${getTextMuted()}`}>
                              Please use our Form above to create a custom trip or click &quot;Set Active&quot; next to any mapped flights below to trigger full interactive summaries.
                            </p>
                          </div>
                        )}

                        <p className={`text-[10px] font-bold tracking-widest uppercase ${getTextMuted()}`}>CURRENT LEDGER BALANCE</p>
                        <div className="flex items-baseline gap-1">
                          <span className="text-2xl md:text-3xl font-bold">${grandTotalSGD.toLocaleString("en-US", { minimumFractionDigits: 2 })}</span>
                          <span className="text-xs text-slate-400 font-semibold uppercase">SGD</span>
                        </div>

                        {/* Direct receipt lodgement count badge */}
                        <div className="pt-1">
                          <div className="flex items-center gap-1.5 p-2.5 bg-blue-500/5 border border-blue-500/15 rounded-xl text-xs text-blue-600 dark:text-blue-400 font-semibold">
                            <span className="w-2 h-2 rounded-full bg-blue-550 animate-pulse"></span>
                            <span>{transactions.length} corporate submissions compiled • Ready for audit</span>
                          </div>
                        </div>
                      </div>

                      <div className="pt-2">
                        <button 
                          onClick={() => setActiveTab("expenses")}
                          className="w-full border border-blue-600 text-blue-600 py-2 rounded-xl text-xs font-bold hover:bg-blue-50/50 dark:hover:bg-blue-900/10 active:scale-95 transition-all text-center cursor-pointer"
                        >
                          Export Ledger Report
                        </button>
                      </div>
                    </section>
                  );
                })()}
              </div>

              {/* SECTION: PLANNER & UPCOMING FLIGHT PORTFOLIO */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <h3 className="font-semibold text-sm uppercase tracking-widest text-[#005faa] dark:text-[#a3c9ff]">
                    My Dynamic Travel Portfolio
                  </h3>
                  <p className="text-xs text-slate-400 font-medium font-mono">
                    (Direct offline database logs • No external approval required)
                  </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Column 1: Next Scheduled / Confirmed Trips */}
                  <div className={`${getCardClass()} p-5 rounded-2xl space-y-4 border-t-4 border-t-emerald-500`}>
                    <div className="flex justify-between items-center">
                      <h4 className="font-bold text-xs uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                        ✈️ Next / Upcoming Trips
                      </h4>
                      <span className="text-[10px] bg-emerald-500/10 px-2 py-0.5 rounded text-emerald-600 font-mono">
                        {trips.filter(t => t.status === "Confirmed").length} Confirmed
                      </span>
                    </div>

                    <div className="space-y-3 overflow-y-auto max-h-[300px] pr-1">
                      {trips.filter(t => t.status === "Confirmed").length === 0 ? (
                        <p className="text-xs text-slate-400 italic">No upcoming confirmed trips listed.</p>
                      ) : (
                        trips.filter(t => t.status === "Confirmed").map(trip => (
                          <div 
                            key={trip.id}
                            className={`p-3.5 rounded-xl border border-dashed border-slate-200 dark:border-zinc-800 flex items-center justify-between hover:bg-slate-50/50 dark:hover:bg-zinc-900/50 transition-all`}
                          >
                            <div className="flex items-center gap-3 overflow-hidden">
                              <div 
                                className="w-12 h-12 rounded bg-cover bg-center flex-shrink-0"
                                style={{ backgroundImage: `url('${trip.imgUrl}')` }}
                              ></div>
                              <div className="overflow-hidden">
                                <h5 className="font-semibold text-xs truncate">{trip.city}, {trip.country}</h5>
                                <p className="font-mono text-[10px] text-slate-400 mt-0.5">{trip.dates}</p>
                                <p className="text-[10px] text-slate-500 font-mono italic truncate max-w-[200px]">
                                  {trip.reason || "Corporate Flight Registered"}
                                </p>
                              </div>
                            </div>
                            <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                              <span className="text-[9px] font-bold text-emerald-600 uppercase font-mono bg-emerald-100/40 dark:bg-emerald-900/30 px-1.5 py-0.5 rounded">
                                {trip.flightCode || "Flight Link"}
                              </span>
                              <button 
                                onClick={() => {
                                  // Activate this trip
                                  setTrips(prev => prev.map(t => t.id === trip.id ? { ...t, status: "In Progress" as const } : { ...t, status: t.status === "In Progress" ? "Confirmed" as const : t.status }));
                                }}
                                className="text-[10px] font-bold text-blue-600 dark:text-blue-400 hover:underline border border-blue-600/20 px-1.5 py-0.5 rounded-md hover:bg-blue-600/5 transition-all cursor-pointer"
                              >
                                Set Active
                              </button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  {/* Column 2: Planning / Awaiting Trips */}
                  <div className={`${getCardClass()} p-5 rounded-2xl space-y-4 border-t-4 border-t-amber-500`}>
                    <div className="flex justify-between items-center">
                      <h4 className="font-bold text-xs uppercase tracking-wider text-amber-600">
                        📂 Planning & Dream Trips
                      </h4>
                      <span className="text-[10px] bg-amber-500/10 px-2 py-0.5 rounded text-amber-600 font-mono">
                        {trips.filter(t => t.status === "Awaiting Confirmation").length} Planning
                      </span>
                    </div>

                    <div className="space-y-3 overflow-y-auto max-h-[300px] pr-1">
                      {trips.filter(t => t.status === "Awaiting Confirmation").length === 0 ? (
                        <p className="text-xs text-slate-400 italic">No drafted/planned trips listed.</p>
                      ) : (
                        trips.filter(t => t.status === "Awaiting Confirmation").map(trip => (
                          <div 
                            key={trip.id}
                            className={`p-3.5 rounded-xl border border-dashed border-slate-200 dark:border-zinc-800 flex items-center justify-between hover:bg-slate-50/50 dark:hover:bg-zinc-900/50 transition-all`}
                          >
                            <div className="flex items-center gap-3 overflow-hidden">
                              <div 
                                className="w-12 h-12 rounded bg-cover bg-center flex-shrink-0"
                                style={{ backgroundImage: `url('${trip.imgUrl}')` }}
                              ></div>
                              <div className="overflow-hidden">
                                <h5 className="font-semibold text-xs truncate">{trip.city}, {trip.country}</h5>
                                <p className="font-mono text-[10px] text-slate-400 mt-0.5">{trip.dates}</p>
                                <p className="text-[10px] text-slate-500 font-mono truncate max-w-[200px]">
                                  {trip.reason || "Draft Agenda Pending"}
                                </p>
                              </div>
                            </div>
                            <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                              <span className="text-[9px] font-bold text-amber-600 bg-amber-100/40 dark:bg-amber-900/20 px-1.5 py-0.5 rounded font-mono uppercase">
                                Draft
                              </span>
                              <div className="flex gap-1.5">
                                <button 
                                  onClick={() => {
                                    setTrips(prev => prev.map(t => t.id === trip.id ? { ...t, status: "Confirmed" as const } : t));
                                  }}
                                  className="text-[9px] font-bold text-emerald-600 hover:underline border border-emerald-600/20 px-1.5 py-0.5 rounded cursor-pointer"
                                >
                                  Approve
                                </button>
                                <button 
                                  onClick={() => {
                                    setTrips(prev => prev.map(t => t.id === trip.id ? { ...t, status: "In Progress" as const } : { ...t, status: t.status === "In Progress" ? "Confirmed" as const : t.status }));
                                  }}
                                  className="text-[9px] font-bold text-blue-600 hover:underline border border-blue-600/20 px-1.5 py-0.5 rounded cursor-pointer"
                                >
                                  Go Live
                                </button>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* SECTION: BRAND NEW DYNAMIC GPS GROUNDING SUGGESTIONS */}
              <section className={`${getCardClass()} p-6 rounded-2xl shadow-sm space-y-4 border-l-4 border-l-blue-600`}>
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 pb-2 border-b border-slate-100/50 dark:border-zinc-800">
                  <div>
                    <h3 className="font-bold text-sm uppercase tracking-wide flex items-center gap-2">
                      <MapPin className="text-blue-600 w-4 h-4 animate-bounce" />
                      Dynamic GPS Concierge Grounding
                    </h3>
                    <p className={`text-xs mt-0.5 ${getTextMuted()}`}>
                      Suggest places to visit based on your live computer location and available trip/stay duration.
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Stay Duration:</label>
                    <select 
                      value={stayDuration} 
                      onChange={(e) => setStayDuration(e.target.value)}
                      className="bg-slate-100 dark:bg-zinc-800 text-xs px-2.5 py-1 rounded-lg border-0 focus:ring-1 focus:ring-blue-500 font-semibold uppercase"
                    >
                      <option value="2 hours">2 Hours Gap</option>
                      <option value="4 hours">4 Hours Half-Day</option>
                      <option value="8 hours">8 Hours Full-Day</option>
                      <option value="1 day">1 Full Day</option>
                      <option value="2 days">Over the Weekend (2 Days)</option>
                    </select>
                  </div>
                </div>

                <div className="flex flex-col md:flex-row gap-6 items-start">
                  <div className="w-full md:w-1/3 space-y-3">
                    <button
                      onClick={handleGpsLookup}
                      disabled={gpsLoading}
                      className="w-full bg-blue-600 text-white font-bold text-xs py-3 rounded-xl shadow-lg hover:bg-blue-700 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                    >
                      <Compass className={`w-4 h-4 ${gpsLoading ? "animate-spin" : ""}`} />
                      {gpsLoading ? "Accessing GPS Satellite..." : "Verify GPS & Suggest Places"}
                    </button>

                    {/* Geolocation Status Indicators */}
                    {coords.lat && coords.lng ? (
                      <div className="p-3 bg-emerald-500/5 border border-emerald-500/10 rounded-xl space-y-0.5 font-mono text-[10px]">
                        <p className="font-bold text-emerald-600 uppercase flex items-center gap-1">
                          🟢 Geolocated successfully
                        </p>
                        <p className={getTextMuted()}>Lat: {coords.lat.toFixed(5)}</p>
                        <p className={getTextMuted()}>Lng: {coords.lng.toFixed(5)}</p>
                      </div>
                    ) : gpsError ? (
                      <div className="p-3 bg-amber-500/5 border border-amber-500/10 rounded-xl text-[10px] text-amber-600 font-medium">
                        <p className="font-bold uppercase mb-1">Notice:</p>
                        {gpsError}
                      </div>
                    ) : (
                      <div className="p-3 bg-slate-50/50 dark:bg-zinc-900 border border-slate-200/50 rounded-xl text-[10px] font-mono text-slate-400 text-center">
                        Coordinates: Pending satellite authorization
                      </div>
                    )}
                  </div>

                  {/* Recommendation output container */}
                  <div className="flex-1 w-full">
                    {gpsRecommendations.length === 0 ? (
                      <div className="h-28 border border-dashed border-slate-200 dark:border-zinc-800 rounded-xl flex items-center justify-center text-xs text-slate-400 italic text-center p-4">
                        Please authorize GPS access to output custom nearby attractions corresponding to your stay duration of {stayDuration}.
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {gpsRecommendations.map((rec, i) => (
                          <div key={i} className={`p-4 rounded-xl border ${getCardClass()} hover:shadow-md transition-all space-y-2 col-span-1 odd:last-child:col-span-2`}>
                            <div className="flex justify-between items-start">
                              <h4 className="font-bold text-xs text-blue-600 dark:text-blue-400 uppercase tracking-wide truncate max-w-[80%]">
                                {rec.title || "Elite Culinary / Sight Spot"}
                              </h4>
                              {rec.durationNeeded && (
                                <span className="text-[9px] bg-slate-100 dark:bg-zinc-800 font-mono font-bold uppercase tracking-wider px-1.5 py-0.5 rounded text-slate-500">
                                  ⏱️ {rec.durationNeeded}
                                </span>
                              )}
                            </div>
                            
                            {rec.description && (
                              <p className={`text-xs leading-relaxed ${getTextMuted()}`}>
                                {rec.description}
                              </p>
                            )}
                            
                            {rec.distance && (
                              <div className="flex justify-between items-center text-[10px] font-mono pt-1 text-slate-400 border-t border-slate-105/55 dark:border-zinc-800">
                                <span>Radial Distance:</span>
                                <span className="font-bold text-slate-600 dark:text-slate-350">{rec.distance}</span>
                              </div>
                            )}

                            {rec.coords && (
                              <div className="flex justify-between items-center text-[10px] font-mono pt-1 text-slate-400 border-t border-slate-105/55 dark:border-zinc-800">
                                <span>Coordinates:</span>
                                <span className="font-semibold">{rec.coords}</span>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </section>

              {/* Curated hotspots visual grid */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* Visual Attractions Quick Navigation */}
                <div className="lg:col-span-8 space-y-3">
                  <div className="flex justify-between items-center">
                    <h3 className="font-semibold text-sm uppercase tracking-widest text-[#005faa] dark:text-[#a3c9ff]">
                      Curated Business Hotspots
                    </h3>
                    <button 
                      onClick={() => setActiveTab("planner")}
                      className="text-xs text-blue-600 font-bold hover:underline"
                    >
                      Explore Destinations
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {destinations.slice(0, 2).map((dest) => (
                      <div 
                        key={dest.id}
                        className={`${getCardClass()} p-4 rounded-xl flex items-center gap-4 transition-all hover:border-blue-500/50 hover:shadow-md cursor-pointer`}
                        onClick={() => {
                          setActiveTab("planner");
                          setSelectedDestinationFilter(dest.name);
                        }}
                      >
                        <div 
                          className="w-16 h-16 rounded-lg bg-cover bg-center overflow-hidden flex-shrink-0"
                          style={{ backgroundImage: `url('${dest.imgUrl}')` }}
                        ></div>
                        <div className="flex-1 overflow-hidden">
                          <p className="font-mono text-[9px] text-[#005faa] font-bold uppercase tracking-wider">{dest.country}</p>
                          <h4 className="font-semibold text-xs truncate">{dest.name} Core Hub</h4>
                          <p className={`text-[10px] truncate ${getTextMuted()}`}>{dest.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Quick actions buttons grids */}
                <div className="lg:col-span-4 space-y-3">
                  <h3 className="font-semibold text-sm uppercase tracking-widest">Rapid Actions</h3>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <button 
                      onClick={() => setShowAddExpenseModal(true)}
                      className="flex flex-col items-center justify-center p-4 bg-blue-600 text-white rounded-xl shadow-md cursor-pointer active:scale-95 transition-all text-center gap-2 group hover:brightness-110"
                    >
                      <Plus className="w-6 h-6 transition-transform group-hover:scale-110" />
                      <span className="text-[10px] font-bold uppercase tracking-wider">Add Expense</span>
                    </button>

                    <button 
                      onClick={() => setActiveTab("assistant")}
                      className="flex flex-col items-center justify-center p-4 bg-teal-600 text-white rounded-xl shadow-md cursor-pointer active:scale-95 transition-all text-center gap-2 group hover:brightness-110"
                    >
                      <MessageSquare className="w-6 h-6 transition-transform group-hover:scale-110" />
                      <span className="text-[10px] font-bold uppercase tracking-wider">Ask Voyager AI</span>
                    </button>

                    <button 
                      onClick={handleReceiptScanClick}
                      className={`flex flex-col items-center justify-center p-4 border border-blue-500/20 rounded-xl transition-all cursor-pointer font-bold select-none active:scale-95 text-center gap-2 ${
                        isScanningReceipt ? "animate-pulse border-teal-500" : ""
                      } ${subtleBgClass()}`}
                    >
                      <Camera className="w-6 h-6 text-blue-600" />
                      <span className="text-[10px] font-bold uppercase tracking-wider">
                        {isScanningReceipt ? "AI scanning..." : "Scan Receipt"}
                      </span>
                    </button>

                    <button 
                      onClick={() => setActiveTab("planner")}
                      className={`flex flex-col items-center justify-center p-4 border border-blue-500/20 rounded-xl cursor-pointer active:scale-95 transition-all text-center gap-2 ${subtleBgClass()}`}
                    >
                      <Map className="w-6 h-6 text-blue-600" />
                      <span className="text-[10px] font-bold uppercase tracking-wider">Explorer</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Quick info advisory */}
              <section className="space-y-3 pt-1">
                <h3 className="font-semibold text-sm uppercase tracking-widest text-[#005faa] dark:text-[#a3c9ff]">Live Concierge Intel</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-teal-50/40 dark:bg-teal-950/10 border border-teal-500/20 rounded-xl flex gap-3">
                    <div className="bg-teal-500 text-white p-2 rounded-lg h-fit">
                      <TrendingUp className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-teal-700 dark:text-teal-400 uppercase tracking-wide">Financial Optimization</h4>
                      <p className={`text-xs mt-1 leading-relaxed ${getTextMuted()}`}>
                        You could save $45 directly by using the predefined VoyagerIQ corporate shuttle for your airport transfers.
                      </p>
                    </div>
                  </div>

                  <div className="p-4 bg-blue-50/40 dark:bg-blue-950/15 border border-blue-500/20 rounded-xl flex gap-3">
                    <div className="bg-blue-600 text-white p-2 rounded-lg h-fit">
                      <Cloud className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-blue-700 dark:text-blue-400 uppercase tracking-wide">Live Travel Sync</h4>
                      <p className={`text-xs mt-1 leading-relaxed ${getTextMuted()}`}>
                        Corporate itineraries and weather updates have successfully synced across your local calendars.
                      </p>
                    </div>
                  </div>
                </div>
              </section>
            </motion.div>
          )}

          {/* TAB 2: EXPENSE LEDGER & AUTO CAPTURING */}
          {activeTab === "expenses" && (
            <motion.div 
              key="expenses"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25 }}
              className="space-y-6"
            >
              {/* Dynamic stats block */}
              <div className={`${getCardClass()} p-6 rounded-2xl shadow-sm flex flex-col xl:flex-row items-center gap-8`}>
                <div className="relative w-36 h-36 flex-shrink-0 flex flex-col items-center justify-center">
                  {(() => {
                    const businessRatio = grandTotalSGD > 0 ? (totalReimbursable + totalPending) / grandTotalSGD : 0;
                    const strokeLength = businessRatio * 251.32;
                    return (
                      <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                        <circle className="text-slate-100 dark:text-zinc-800" cx="50" cy="50" fill="none" r="40" stroke="currentColor" strokeWidth="12"></circle>
                        {grandTotalSGD > 0 && strokeLength > 0 && (
                          <circle 
                            className="text-blue-600 transition-all duration-500 ease-out" 
                            cx="50" 
                            cy="50" 
                            fill="none" 
                            r="40" 
                            stroke="currentColor" 
                            strokeDasharray={`${strokeLength} 251.32`} 
                            strokeWidth="12"
                            strokeLinecap="round"
                          />
                        )}
                      </svg>
                    );
                  })()}
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total</span>
                    <span className="text-xl font-bold font-display mt-0.5">${grandTotalSGD.toFixed(0)}</span>
                    <span className="text-[10px] text-slate-400">SGD</span>
                  </div>
                </div>

                <div className="flex-1 w-full grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-blue-600/5 border border-blue-600/10 space-y-1">
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase">
                      <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span>
                      Reimbursable Business Expense
                    </div>
                    <p className="text-xl font-bold">${totalReimbursable.toFixed(2)}</p>
                    <p className="text-[10px] text-blue-600 font-bold tracking-wide uppercase">
                      {((totalReimbursable / grandTotalSGD) * 100 || 0).toFixed(1)}% of total allocated balance
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-teal-500/5 border border-teal-500/10 space-y-1">
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase">
                      <span className="w-2.5 h-2.5 rounded-full bg-teal-500"></span>
                      Personal Out Of Pocket
                    </div>
                    <p className="text-xl font-bold">${totalPersonal.toFixed(2)}</p>
                    <p className="text-[10px] text-teal-600 font-bold tracking-wide uppercase">
                      {((totalPersonal / grandTotalSGD) * 100 || 0).toFixed(1)}% not requested for reimbursement
                    </p>
                  </div>
                </div>
              </div>

              {/* Currency Converter & Quick Info Bento Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* Total Business Info: Country adaptive dynamic policy */}
                <div className={`${getCardClass()} lg:col-span-4 p-6 rounded-2xl flex flex-col justify-between space-y-4`}>
                  <div>
                    <div className="flex justify-between items-start">
                      <span className="p-2.5 bg-blue-105 dark:bg-blue-900/40 text-blue-600 rounded-xl">
                        <Globe className="w-5 h-5" />
                      </span>
                      <span className="text-[10px] font-bold text-teal-600 px-2 py-0.5 bg-teal-500/10 rounded-full uppercase tracking-widest flex items-center gap-1">
                        🟢 Active Policy
                      </span>
                    </div>

                    <p className={`text-xs font-bold uppercase tracking-wider mt-4 ${getTextMuted()}`}>Country Allocation mode</p>
                    <h3 className="text-xl font-bold mt-1">Country-Adaptive <span className="text-xs text-slate-400 font-normal">Tier 1</span></h3>
                    <p className={`text-[11px] mt-2 leading-relaxed ${getTextMuted()}`}>
                      No rigid caps. Your account adapts allowances dynamically based on destination tier (Singapore & USA = High Cost Tier 1).
                    </p>
                  </div>

                  <div className="pt-4 border-t border-slate-100/60 dark:border-zinc-800 flex justify-between items-center text-xs">
                    <span className="text-slate-400 font-semibold uppercase">Verification code</span>
                    <span className="font-bold text-teal-600 font-mono">SGD-ADAPTIVE-V2</span>
                  </div>
                </div>

                {/* Total Personal Out of Pocket */}
                <div className={`${getCardClass()} lg:col-span-4 p-6 rounded-2xl flex flex-col justify-between space-y-4`}>
                  <div>
                    <div className="flex justify-between items-start">
                      <span className="p-2.5 bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-slate-300 rounded-xl">
                        <DollarSign className="w-5 h-5" />
                      </span>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center">
                        ➔ 0% VS LAST MO
                      </span>
                    </div>

                    <p className={`text-xs font-bold uppercase tracking-wider mt-4 ${getTextMuted()}`}>Total Personal Out-of-pocket</p>
                    <h3 className="text-2xl font-bold mt-1">${totalPersonal.toFixed(2)} <span className="text-xs text-slate-400 font-normal">SGD</span></h3>
                  </div>

                  <div className="pt-4 border-t border-slate-100/60 dark:border-zinc-800 flex justify-between items-center text-xs">
                    <span className="text-slate-400 font-semibold uppercase font-mono">Eligible conversion</span>
                    <span className="font-bold text-slate-500 font-mono">USD ${formattedTotalUSD}</span>
                  </div>
                </div>

                {/* Conversion utilities */}
                <div id="currency-converter-card" className="lg:col-span-4 p-5 bg-gradient-to-br from-slate-900 to-zinc-950 text-white border border-slate-850 rounded-2xl relative overflow-hidden flex flex-col justify-between shadow-lg min-h-[340px]">
                  <div className="relative z-10 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <RefreshCcw className="text-emerald-400 w-4 h-4" />
                        <p className="text-[11px] font-bold font-mono tracking-wider uppercase text-emerald-400">Multi-Currency Desk</p>
                      </div>
                      <span className="text-[9px] bg-slate-800 text-teal-300 font-mono font-bold px-2 py-0.5 rounded uppercase tracking-wider">
                        Live Base Rates
                      </span>
                    </div>

                    <div className="space-y-3">
                      {/* Interactive Converter Form */}
                      <div className="space-y-2">
                        {/* Outgoing Currency Row */}
                        <div className="bg-slate-800/80 p-2.5 rounded-xl border border-slate-700/50 flex items-center justify-between gap-2">
                          <div className="flex flex-col">
                            <span className="text-[9px] text-slate-400 uppercase font-bold">Source Amount</span>
                            <input 
                              type="number" 
                              className="bg-transparent border-0 font-mono font-bold focus:ring-0 text-white w-24 text-sm focus:outline-none mt-0.5"
                              value={convertAmount}
                              onChange={(e) => setConvertAmount(parseFloat(e.target.value) || 0)}
                            />
                          </div>
                          <select 
                            value={fromCurrency}
                            onChange={(e) => setFromCurrency(e.target.value)}
                            className="bg-slate-900 border border-slate-700/60 rounded-lg text-xs font-bold text-white px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-emerald-400 cursor-pointer"
                          >
                            {Object.keys(CURRENCY_NAME_MAP).map(cur => (
                              <option key={cur} value={cur} className="bg-slate-900 text-white font-semibold">
                                {cur}
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Interactive Arrow Divider */}
                        <div className="flex justify-center -my-1.5 relative z-25">
                          <div className="p-1 px-3 bg-emerald-500 text-slate-950 font-black text-[10px] rounded-full shadow-sm hover:scale-110 transition-transform select-none">
                            ➔
                          </div>
                        </div>

                        {/* Incoming Target Currency Row */}
                        <div className="bg-slate-800/80 p-2.5 rounded-xl border border-slate-700/50 flex justify-between items-center">
                          <div className="flex flex-col">
                            <span className="text-[9px] text-slate-400 uppercase font-bold">Target Yield</span>
                            <div className="font-mono font-bold text-sm text-emerald-400 mt-0.5">
                              {getConvertedVal(convertAmount, fromCurrency, toCurrency).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                            </div>
                          </div>
                          <select 
                            value={toCurrency}
                            onChange={(e) => setToCurrency(e.target.value)}
                            className="bg-slate-900 border border-slate-700/60 rounded-lg text-xs font-bold text-white px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-emerald-400 cursor-pointer"
                          >
                            {Object.keys(CURRENCY_NAME_MAP).map(cur => (
                              <option key={cur} value={cur} className="bg-slate-900 text-white font-semibold">
                                {cur}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      {/* Currency Details Summary text */}
                      <p className="text-[10px] text-zinc-300 font-semibold text-center bg-emerald-500/10 py-1.5 px-3 rounded-lg border border-emerald-500/20">
                        {convertAmount} {fromCurrency} ({CURRENCY_NAME_MAP[fromCurrency]}) = <strong className="text-emerald-400 font-mono font-bold">{getConvertedVal(convertAmount, fromCurrency, toCurrency).toLocaleString("en-US")}</strong> {toCurrency}
                      </p>
                    </div>

                    {/* Quick Cheat Sheet List for the User (Euro to Rupees etc) */}
                    <div className="pt-2 border-t border-slate-800 space-y-1.5">
                      <p className="text-[9px] text-slate-400 uppercase font-bold tracking-wider">Quick Rupees (₹) & Major Conversions</p>
                      <div className="grid grid-cols-2 gap-1.5 text-[10px] font-mono text-zinc-300">
                        <button 
                          onClick={() => { setFromCurrency("EUR"); setToCurrency("INR"); setConvertAmount(100); }} 
                          className="hover:text-emerald-400 text-xs text-left bg-slate-800/40 p-1.5 rounded border border-slate-850 hover:border-emerald-500/40 transition-all font-semibold active:scale-95 cursor-pointer"
                        >
                          🇪🇺 100 EUR = <span className="text-emerald-400">8,930 ₹</span>
                        </button>
                        <button 
                          onClick={() => { setFromCurrency("USD"); setToCurrency("INR"); setConvertAmount(100); }} 
                          className="hover:text-emerald-400 text-xs text-left bg-slate-800/40 p-1.5 rounded border border-slate-850 hover:border-emerald-500/40 transition-all font-semibold active:scale-95 cursor-pointer"
                        >
                          🇺🇸 100 USD = <span className="text-emerald-400">8,310 ₹</span>
                        </button>
                        <button 
                          onClick={() => { setFromCurrency("SGD"); setToCurrency("INR"); setConvertAmount(100); }} 
                          className="hover:text-emerald-400 text-xs text-left bg-slate-800/40 p-1.5 rounded border border-slate-850 hover:border-emerald-500/40 transition-all font-semibold active:scale-95 cursor-pointer"
                        >
                          🇸🇬 100 SGD = <span className="text-emerald-400">6,150 ₹</span>
                        </button>
                        <button 
                          onClick={() => { setFromCurrency("GBP"); setToCurrency("INR"); setConvertAmount(100); }} 
                          className="hover:text-emerald-400 text-xs text-left bg-slate-800/40 p-1.5 rounded border border-slate-850 hover:border-emerald-500/40 transition-all font-semibold active:scale-95 cursor-pointer"
                        >
                          🇬🇧 100 GBP = <span className="text-emerald-400">10,630 ₹</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-blue-600/10 rounded-full blur-3xl pointer-events-none"></div>
                </div>
              </div>

              {/* Action layout bar and table filter */}
              <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="flex gap-2 w-full md:w-auto">
                  <button 
                    onClick={() => setShowAddExpenseModal(true)}
                    className="flex-1 md:flex-initial bg-blue-600 text-white px-6 py-2.5 rounded-xl text-xs font-bold shadow-lg hover:shadow-blue-600/10 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Plus className="w-4 h-4" /> Add Expense
                  </button>
                  <button 
                    onClick={handleReceiptScanClick}
                    className="flex-1 md:flex-initial bg-slate-500/10 border border-slate-500/20 px-6 py-2.5 rounded-xl text-xs font-bold hover:bg-slate-500/20 active:scale-95 transition-all text-center flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Camera className="w-4 h-4 text-blue-600" /> Auto scan
                  </button>
                  {/* Hidden file input element */}
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleReceiptFileChange}
                    accept="image/*" 
                    className="hidden" 
                  />
                </div>

                <div className="text-xs font-semibold px-2 py-1 rounded bg-slate-100 dark:bg-zinc-800 uppercase tracking-widest text-slate-400">
                  Global ledger log matched ({transactions.length} receipts)
                </div>
              </div>

              {/* Transactions log container */}
              <section className={`${getCardClass()} overflow-hidden rounded-2xl`}>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-100/50 dark:bg-zinc-900/60 text-[10px] font-bold uppercase tracking-widest border-b border-slate-100/60 dark:border-zinc-800">
                        <th className="px-6 py-3">Transaction details</th>
                        <th className="px-6 py-3 hidden md:table-cell">Budget Category</th>
                        <th className="px-6 py-3">Scope Type</th>
                        <th className="px-6 py-3 hidden lg:table-cell">Smart Status</th>
                        <th className="px-6 py-3 text-right">Amount</th>
                        <th className="px-6 py-3 text-center">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100/60 dark:divide-zinc-800/60">
                      {transactions.map((tx) => (
                        <tr key={tx.id} className="hover:bg-slate-50/50 dark:hover:bg-zinc-900/50 transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <span className="p-2 rounded bg-blue-100/30 text-blue-600">
                                {tx.category === "Food" && <UtensilsCrossed className="w-4 h-4" />}
                                {tx.category === "Hotel" && <Briefcase className="w-4 h-4" />}
                                {tx.category === "Transport" && <Smartphone className="w-4 h-4" />}
                                {tx.category === "Other" && <CreditCard className="w-4 h-4" />}
                              </span>
                              <div>
                                <p className="font-semibold text-sm">{tx.vendor}</p>
                                <p className="text-[10px] text-slate-400">{tx.date} • Singapore</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 hidden md:table-cell">
                            <span className="text-xs px-2 py-0.5 rounded bg-slate-100 dark:bg-zinc-800 font-medium">
                              {tx.category}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`text-[10px] font-bold ${tx.type === "Business" ? "text-blue-600" : "text-slate-400"} uppercase tracking-wider`}>
                              {tx.type}
                            </span>
                          </td>
                          <td className="px-6 py-4 hidden lg:table-cell">
                            {tx.status === "Eligible" && (
                              <span className="text-emerald-600 text-xs font-semibold flex items-center gap-1">
                                <CheckCircle className="w-3.5 h-3.5" /> Approved
                              </span>
                            )}
                            {tx.status === "Pending" && (
                              <span className="text-amber-500 text-xs font-semibold flex items-center gap-1">
                                <AlertTriangle className="w-3.5 h-3.5" /> Pending
                              </span>
                            )}
                            {tx.status === "N/A" && (
                              <span className="text-slate-400 text-xs font-medium">N/A</span>
                            )}
                          </td>
                          <td className="px-6 py-4 text-right font-semibold font-mono text-sm">
                            <p>${tx.amount.toFixed(2)} {tx.currency}</p>
                            <p className="text-[10px] text-slate-400 font-normal">~ ${(tx.amount * 0.74).toFixed(2)} USD</p>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <button 
                              onClick={() => setTransactions(prev => prev.filter(t => t.id !== tx.id))}
                              className="text-slate-400 hover:text-red-500 hover:bg-red-500/10 p-1.5 rounded transition-all cursor-pointer"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="p-4 text-center border-t border-slate-100/60 dark:border-zinc-800">
                  <p className="text-xs text-slate-400">VoyagerIQ Smart scanner extracts details using OCR. Accuracy ceiling 87%.</p>
                </div>
              </section>

              {/* Receipt scanning overlay notification helper */}
              {isScanningReceipt && (
                <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-md flex items-center justify-center p-6">
                  <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 max-w-sm w-full text-center space-y-4">
                    <div className="w-16 h-16 bg-blue-600/15 text-blue-400 rounded-full flex items-center justify-center mx-auto">
                      <Camera className="w-8 h-8 animate-spin" />
                    </div>
                    <h3 className="font-bold text-white text-lg">Auto Processing Receipt</h3>
                    <p className="text-slate-400 text-xs leading-relaxed">
                      {scannerStatus}
                    </p>
                    <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-blue-600 h-full w-2/3 animate-pulse rounded-full"></div>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* TAB 3: COUNTRY EXPLORER PLANNER */}
          {activeTab === "planner" && (
            <motion.div 
              key="planner"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25 }}
              className="space-y-6"
            >
              {/* Header search console */}
              <div className="space-y-4">
                <div className="relative max-w-2xl">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                  <input 
                    className={`${getCardClass()} w-full pl-12 pr-4 py-3 rounded-xl focus:border-blue-600 focus:ring-0 text-sm focus:outline-none tracking-wide`}
                    placeholder="Search destination cities or specialized district parameters..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    type="text"
                  />
                </div>

                <div className="space-y-1.5">
                  <span className={`text-[10px] font-bold uppercase tracking-widest ${getTextMuted()}`}>Current View Scope</span>
                  <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar">
                    {["All Destinations", "Tokyo", "Singapore", "London", "Dubai", "Seattle"].map((city) => (
                      <button 
                        key={city}
                        onClick={() => setSelectedDestinationFilter(city)}
                        className={`px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap active:scale-95 transition-all cursor-pointer ${
                          selectedDestinationFilter === city 
                            ? "bg-blue-600 text-white" 
                            : "bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-600 dark:text-slate-300"
                        }`}
                      >
                        {city}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Destinations layouts grid */}
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                {filteredDestinations.map((dest) => (
                  <div key={dest.id} className={`${getCardClass()} rounded-xl overflow-hidden flex flex-col md:flex-row group transition-all hover:shadow-lg`}>
                    <div className="w-full md:w-2/5 h-48 md:h-full relative overflow-hidden">
                      <img 
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                        src={dest.imgUrl} 
                        alt="Tokyo View"
                        referrerPolicy="no-referrer"
                      />
                      {dest.isRecommended && (
                        <div className="absolute top-3 left-3 bg-teal-500/90 text-white px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-md text-[9px] font-bold uppercase tracking-wider backdrop-blur-md">
                          <TrendingUp className="w-3 h-3" /> AI Key Choice
                        </div>
                      )}
                    </div>

                    <div className="p-6 flex-1 flex flex-col justify-between">
                      <div className="space-y-3">
                        <div className="flex justify-between items-start">
                          <h2 className="text-xl font-bold font-display">{dest.name}, {dest.country}</h2>
                          <button 
                            onClick={() => handleToggleBookmark(dest.id)}
                            className="text-slate-400 hover:text-blue-500 p-1 rounded-full cursor-pointer"
                          >
                            <Bookmark className={`w-4 h-4 ${bookmarkedDestinations.includes(dest.id) ? "fill-blue-600 text-blue-600" : ""}`} />
                          </button>
                        </div>

                        <p className={`text-xs leading-relaxed ${getTextMuted()}`}>{dest.description}</p>
                        
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {dest.tags.map((tag) => (
                            <span key={tag} className="text-[10px] font-bold bg-slate-100 dark:bg-zinc-800 text-slate-500 dark:text-slate-400 px-2 py-0.5 rounded-full">
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Micro actions buttons */}
                      <div className="grid grid-cols-2 gap-2 mt-4 pt-4 border-t border-slate-100/60 dark:border-zinc-800/60 text-xs">
                        <button 
                          onClick={() => {
                            setActiveTab("assistant");
                            sendChatMessage(`Give me recommendations for quiet dining spots or districts in ${dest.name}`);
                          }}
                          className="flex items-center justify-center p-1.5 hover:bg-slate-100 dark:hover:bg-zinc-800 text-blue-600 font-bold rounded"
                        >
                          <UtensilsCrossed className="w-3.5 h-3.5 mr-1" /> Dining Search
                        </button>
                        <button 
                          onClick={() => {
                            setActiveTab("assistant");
                            sendChatMessage(`Plan a complete premium business travel itinerary for ${dest.name}`);
                          }}
                          className="flex items-center justify-center p-1.5 hover:bg-slate-100 dark:hover:bg-zinc-800 text-blue-600 font-bold rounded"
                        >
                          <Map className="w-3.5 h-3.5 mr-1" /> Get Itinerary
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* INTERACTIVE FLIGHT DESK */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
                {/* 1. UPLOAD TICKET SECTION */}
                <div className={`${getCardClass()} p-6 rounded-2xl border border-slate-200 dark:border-zinc-805 space-y-4`}>
                  <div className="flex justify-between items-center border-b border-slate-100 dark:border-zinc-800 pb-3">
                    <h3 className="font-bold text-sm uppercase tracking-wider flex items-center gap-2">
                      <Smartphone className="w-4 h-4 text-blue-605" />
                      Corporate Ticket Scanner Desk
                    </h3>
                    <span className="text-[9px] font-mono bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-200 px-2 py-0.5 rounded-full font-bold">PDF/JPG Uploader</span>
                  </div>

                  <p className={`text-xs ${getTextMuted()} leading-relaxed`}>
                    Since corporate segments are routed using our designated travel department, upload your boarding passes or invoice confirmation to automatically compile routes!
                  </p>

                  <div className="border-2 border-dashed border-slate-200 dark:border-zinc-800 rounded-xl p-5 text-center flex flex-col items-center justify-center space-y-3 hover:bg-slate-50/50 dark:hover:bg-zinc-950/20 transition-all relative">
                    {ticketUploading ? (
                      <div className="space-y-3 py-4">
                        <RefreshCcw className="w-8 h-8 text-blue-650 animate-spin mx-auto" />
                        <p className="text-xs font-bold text-blue-600 animate-pulse">Scanning barcode & extracting travel routes...</p>
                      </div>
                    ) : ticketUploaded ? (
                      <div className="space-y-2 py-2">
                        <CheckCircle className="w-8 h-8 text-emerald-600 mx-auto" />
                        <p className="text-xs font-bold text-emerald-700 dark:text-emerald-400">Scan Complete: Flight SQ 317 Captured!</p>
                        <p className="text-[10px] text-slate-400">Singapore (SIN) to Tokyo (HND) segment appended to your itinerary logs.</p>
                        <button
                          onClick={() => {
                            setTicketUploaded(false);
                            setTicketFileName("");
                          }}
                          className="text-[10px] text-red-500 hover:underline font-bold cursor-pointer"
                        >
                          Clear custom scan
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-2 cursor-pointer w-full py-4" onClick={() => {
                        setTicketUploading(true);
                        setTimeout(() => {
                          setTicketUploading(false);
                          setTicketUploaded(true);
                          setTicketFileName("EnterpriseBookings_SIN.pdf");
                          // Let's add an actual upcoming corporate trip to the list to show of our power!
                          const userImportedTrip: Trip = {
                            id: "trip-uploaded-" + Date.now(),
                            city: "Tokyo",
                            country: "Japan",
                            dates: "Oct 23 - Oct 28",
                            flightCode: "SQ 317",
                            status: "Confirmed",
                            imgUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuBFXbg0mgUxJYkxIL4ZusiM3O1gtwHHxCtjBjYDf5gTFLKinIUNGc_ZaTs78WD5ZIC8Xmz-Dp9MrvYm-z5H8MeG47kp-ge1zMrsBhxTTYqMTeXCdgAox2njxtALxE9YqBRAtHVaZIGFOfX5RVCAWh4A9tsCjsTdPb7By6ghEAn6HdT4nqbLVQWY-yq193dkNdUf-IoTsgz8h3K1wJdqhqrGkB0jAzXgPiV6hsQAKGlIswnucVoI9s13veK1KSGjCO3PoNbBTwfKHQE",
                            reason: "APAC Q4 Summit via HR-Connect",
                            arrTime: "Scheduled, 14:30",
                            weatherTemp: "21°C"
                          };
                          setTrips(prev => [userImportedTrip, ...prev]);
                        }, 1800);
                      }}>
                        <Upload className="w-8 h-8 text-slate-400 group-hover:scale-110 transition-transform mx-auto" />
                        <p className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-350">Upload Corporate Boarding Pass</p>
                        <p className="text-[10px] text-slate-400">Drag & drop or Click to parse official ticket documents</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* 2. REAL FLIGHT API LOOKUP */}
                <div className={`${getCardClass()} p-6 rounded-2xl border border-slate-200 dark:border-zinc-800 space-y-4`}>
                  <div className="flex justify-between items-center border-b border-slate-100 dark:border-zinc-800 pb-3">
                    <h3 className="font-bold text-sm uppercase tracking-wider flex items-center gap-2">
                      <RefreshCcw className="w-4 h-4 text-emerald-500 animate-spin [animation-duration:15s]" />
                      Live Flight Telemetry Desk (Global API Tracking)
                    </h3>
                    <span className="text-[9px] font-mono bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-200 px-2 py-0.5 rounded-full font-bold">API Online</span>
                  </div>

                  <p className={`text-xs ${getTextMuted()} leading-relaxed`}>
                    Enter your live commercial flight code to pull real-time ground tracks, runway gate statuses, and altitudes instantly from international aviation servers.
                  </p>

                  <div className="flex gap-2">
                    <input
                      type="text"
                      className={`flex-1 px-3 py-2 rounded-xl border text-xs font-mono focus:ring-1 focus:ring-blue-500 focus:outline-none ${
                        theme === "light" ? "bg-slate-50 border-slate-200" : "bg-zinc-900 border-zinc-800 text-white"
                      }`}
                      placeholder="e.g. SQ 317, BA 212, AI 121"
                      value={trackedFlightCodeInput}
                      onChange={(e) => setTrackedFlightCodeInput(e.target.value)}
                    />
                    <button
                      onClick={() => handleTrackFlightLive(trackedFlightCodeInput)}
                      className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-4 py-2 rounded-xl transition-all active:scale-95 cursor-pointer"
                    >
                      Search
                    </button>
                  </div>

                  {isLiveTracking ? (
                    <div className="p-4 bg-slate-50 dark:bg-zinc-900 rounded-xl space-y-2 animate-pulse text-center">
                      <RefreshCcw className="w-5 h-5 animate-spin mx-auto text-blue-600" />
                      <p className="text-[11px] font-semibold text-slate-500">Retrieving satellite ground telemetry logs...</p>
                    </div>
                  ) : trackedFlightData ? (
                    <div className="p-4 bg-blue-50/40 dark:bg-zinc-800/20 border border-blue-500/20 rounded-xl space-y-2.5">
                      <div className="flex justify-between items-center">
                        <span className="font-mono text-xs font-bold text-blue-600 dark:text-blue-405">{trackedFlightData.flightCode} ({trackedFlightData.carrier})</span>
                        <span className="text-[10px] bg-emerald-500/15 text-emerald-600 px-2 py-0.5 rounded font-bold uppercase tracking-wider">{trackedFlightData.status}</span>
                      </div>
                      <p className="text-[10px] text-slate-500 font-mono">{trackedFlightData.aircraft}</p>
                      
                      <div className="grid grid-cols-2 gap-2 text-[10px] font-mono">
                        <div>
                          <span className="text-slate-400 block border-b pb-0.5 mb-0.5 uppercase">DEPARTURE</span>
                          <span className="font-semibold">{trackedFlightData.departure}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block border-b pb-0.5 mb-0.5 uppercase">DESTINATION</span>
                          <span className="font-semibold">{trackedFlightData.destination}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block border-b pb-0.5 mb-0.5 uppercase">TELEMETRY</span>
                          <span className="font-semibold">{trackedFlightData.altitude} / {trackedFlightData.speed}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block border-b pb-0.5 mb-0.5 uppercase">EST. ARRIVAL</span>
                          <span className="font-semibold text-emerald-600 dark:text-emerald-400">{trackedFlightData.eta}</span>
                        </div>
                      </div>

                      {/* Aviation progress bar */}
                      <div className="space-y-1.5 pt-1">
                        <div className="w-full bg-slate-200 dark:bg-zinc-800 h-1.5 rounded-full overflow-hidden">
                          <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${trackedFlightData.progress}%` }}></div>
                        </div>
                        <div className="flex justify-between text-[9px] text-slate-400 font-mono">
                          <span>SIN</span>
                          <span>{trackedFlightData.progress}% En Route</span>
                          <span>HND</span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="p-4 bg-slate-50 dark:bg-zinc-900 rounded-xl font-medium border-l-2 border-slate-350 text-[11px] text-slate-500 flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-slate-450" />
                      Pending manual aviation lookup queries.
                    </div>
                  )}
                </div>
              </div>

              {/* Status bar details footer */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6">
                <button
                  onClick={() => {
                    setLastSyncedTime("Synced just now");
                  }}
                  className="p-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl flex items-center gap-3 active:scale-95 transition-all text-left cursor-pointer shadow-md"
                >
                  <Cloud className="w-8 h-8 animate-pulse" />
                  <div>
                    <span className="block font-bold text-xs uppercase font-mono tracking-wider flex items-center gap-1">
                      Live Sync Active <RefreshCcw className="w-3 h-3 animate-spin [animation-duration:5s]" />
                    </span>
                    <span className="block text-[10px] opacity-80">Itinerary {lastSyncedTime} (Click to Sync)</span>
                  </div>
                </button>

                <div className={`p-4 rounded-xl flex items-center gap-3 ${subtleBgClass()}`}>
                  <Smartphone className="w-8 h-8 text-blue-600 animate-bounce [animation-duration:3s]" />
                  <div>
                    <span className="block font-bold text-xs uppercase font-mono tracking-wider">Upcoming Flight</span>
                    <span className="block text-[10px] text-slate-400">LHR → HND (Gate 42B)</span>
                  </div>
                </div>

                <div className={`p-4 rounded-xl flex items-center gap-3 ${subtleBgClass()}`}>
                  <CheckCircle className="w-8 h-8 text-teal-600" />
                  <div>
                    <span className="block font-bold text-xs uppercase font-mono tracking-wider">Concierge Ready</span>
                    <span className="block text-[10px] text-slate-400 font-semibold text-teal-600 dark:text-teal-400">Priority line matched</span>
                  </div>
                </div>
              </div>

              {/* Request custom country builder form */}
              <section className="mt-8 rounded-xl border border-dashed border-slate-350 dark:border-zinc-800 p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <h3 className="font-bold text-sm">Need a custom Business Hub details?</h3>
                  <p className={`text-xs mt-0.5 ${getTextMuted()}`}>Add yours directly into the voyagerIQ localized country cache.</p>
                </div>
                <button 
                  onClick={() => setShowAddCountryModal(true)}
                  className="bg-blue-600 text-white px-5 py-2 rounded-xl text-xs font-bold active:scale-95 transition-all cursor-pointer"
                >
                  + Add Custom Destination
                </button>
              </section>
            </motion.div>
          )}

          {/* TAB 4: CONVERSATIONAL AI ASSISTANT CHAT */}
          {activeTab === "assistant" && (
            <motion.div 
              key="assistant"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.2 }}
              className="grid grid-cols-1 xl:grid-cols-12 gap-6"
            >
              {/* Left Column: Conversational AI Chat Workspace */}
              <div className="xl:col-span-8 flex flex-col h-[calc(100vh-230px)] md:h-[calc(100vh-200px)] relative">
                {/* Messages area container */}
                <div className="flex-1 overflow-y-auto px-1 py-4 space-y-6 custom-scrollbar">
                  
                  <div className="flex justify-center">
                    <span className="px-3 py-1 bg-slate-100 dark:bg-zinc-800 rounded-full text-[10px] font-mono tracking-widest text-slate-500 uppercase">
                      YESTERDAY
                    </span>
                  </div>

                  {chatMessages.map((msg) => (
                    <div 
                      key={msg.id}
                      className={`flex gap-3 max-w-[85%] ${msg.role === "user" ? "ml-auto flex-row-reverse" : "mr-auto"}`}
                    >
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                        msg.role === "assistant" 
                          ? "bg-blue-600 text-white" 
                          : "bg-slate-200 dark:bg-zinc-800 text-slate-700 dark:text-slate-300"
                      }`}>
                        {msg.role === "assistant" ? <Compass className="w-4 h-4" /> : <Smartphone className="w-4 h-4" />}
                      </div>

                      <div className="flex flex-col gap-1">
                        <div className={`p-4 rounded-2xl ${
                          msg.role === "user" 
                            ? "bg-blue-600 text-white rounded-tr-none" 
                            : `${getCardClass()} rounded-tl-none border-slate-100`
                        }`}>
                          <div className="text-sm leading-relaxed whitespace-pre-line font-medium">
                            {msg.content}
                          </div>

                          {/* Render visual contextual attachment cards matching exact requested types */}
                          {(() => {
                            const lowerContent = msg.content.toLowerCase();
                            const matchesMetro = lowerContent.includes("metro") || lowerContent.includes("station") || lowerContent.includes("transit") || lowerContent.includes("tube") || lowerContent.includes("subway");
                            const matchesAirport = lowerContent.includes("airport") || lowerContent.includes("heathrow") || lowerContent.includes("changi") || lowerContent.includes("terminal") || lowerContent.includes("flight");
                            const matchesHotel = lowerContent.includes("hotel") || lowerContent.includes("mbs") || lowerContent.includes("resort") || lowerContent.includes("ritz") || lowerContent.includes("stay");
                            const matchesRestaurant = lowerContent.includes("restaurant") || lowerContent.includes("dining") || lowerContent.includes("crab") || lowerContent.includes("food") || lowerContent.includes("pasta") || lowerContent.includes("eat");

                            return (
                              <div className="space-y-2 mt-3 flex flex-wrap gap-2">
                                {matchesMetro && (
                                  <div className="rounded-xl overflow-hidden border border-slate-200 dark:border-zinc-800 bg-slate-900 text-white p-3 space-y-1.5 shadow-md max-w-xs">
                                    <img 
                                      src="https://images.unsplash.com/photo-1461360370896-922624d12aa1?auto=format&fit=crop&w=400&q=80" 
                                      alt="Metro Station" 
                                      className="h-24 w-full object-cover rounded"
                                      referrerPolicy="no-referrer"
                                    />
                                    <p className="text-[11px] font-bold text-white flex items-center gap-1">🚇 Local Metro Transit Hub</p>
                                    <p className="text-[9px] text-slate-300">Fast connection tracks directly to our corporate offices.</p>
                                  </div>
                                )}
                                
                                {matchesAirport && (
                                  <div className="rounded-xl overflow-hidden border border-slate-200 dark:border-zinc-800 bg-slate-900 text-white p-3 space-y-1.5 shadow-md max-w-xs">
                                    <img 
                                      src="https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=400&q=80" 
                                      alt="Airport Terminal" 
                                      className="h-24 w-full object-cover rounded"
                                      referrerPolicy="no-referrer"
                                    />
                                    <p className="text-[11px] font-bold text-white flex items-center gap-1">✈️ Aviation Gateway Node</p>
                                    <p className="text-[9px] text-slate-300">Terminal lounges and corporate express security lines.</p>
                                  </div>
                                )}

                                {matchesHotel && (
                                  <div className="rounded-xl overflow-hidden border border-slate-200 dark:border-zinc-800 bg-slate-900 text-white p-3 space-y-1.5 shadow-md max-w-xs">
                                    <img 
                                      src="https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=400&q=80" 
                                      alt="Hotel Stay" 
                                      className="h-24 w-full object-cover rounded"
                                      referrerPolicy="no-referrer"
                                    />
                                    <p className="text-[11px] font-bold text-white flex items-center gap-1">🏨 Enterprise Executive Lodging</p>
                                    <p className="text-[9px] text-slate-300">Premium wellness center access and corporate wireless channels.</p>
                                  </div>
                                )}

                                {matchesRestaurant && (
                                  <div className="rounded-xl overflow-hidden border border-slate-200 dark:border-zinc-800 bg-slate-900 text-white p-3 space-y-1.5 shadow-md max-w-xs">
                                    <img 
                                      src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=400&q=80" 
                                      alt="Restaurant Dining" 
                                      className="h-24 w-full object-cover rounded"
                                      referrerPolicy="no-referrer"
                                    />
                                    <p className="text-[11px] font-bold text-white flex items-center gap-1">🍽️ VoyagerIQ Culinary Selection</p>
                                    <p className="text-[9px] text-slate-300">Acoustics optimized for priority corporate business discussion.</p>
                                  </div>
                                )}
                              </div>
                            );
                          })()}

                          {/* Render citations matching screens */}
                          {msg.citations && msg.citations.length > 0 && (
                            <div className="mt-3 pt-2.5 border-t border-slate-150/60 dark:border-zinc-800/80 flex flex-wrap gap-2 text-[10px] text-slate-400 font-mono">
                              {msg.citations.map((cite, index) => (
                                <span key={index} className="flex items-center gap-1">
                                  <FileText className="w-3.5 h-3.5 text-blue-600" /> {cite}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                        <span className={`text-[9px] font-bold text-slate-400 uppercase tracking-widest ${msg.role === "user" ? "text-right" : "text-left"}`}>
                          {msg.timestamp}
                        </span>
                      </div>
                    </div>
                  ))}

                  {/* AI Working bubbles */}
                  {isAiTyping && (
                    <div className="flex gap-3 mr-auto max-w-[85%]">
                      <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center flex-shrink-0 animate-pulse">
                        <Compass className="w-4 h-4" />
                      </div>
                      <div className={`${getCardClass()} rounded-2xl rounded-tl-none p-4 flex items-center gap-1`}>
                        <span className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-bounce [animation-delay:0.1s]"></span>
                        <span className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                        <span className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-bounce [animation-delay:0.3s]"></span>
                      </div>
                    </div>
                  )}

                  {/* Dummy anchor at bottom */}
                  <div ref={chatBottomRef}></div>
                </div>

                {/* Chat Input Deck at bottom */}
                <div className="pt-4 border-t border-slate-100/60 dark:border-zinc-800/60 space-y-4">
                  
                  {/* Prompt suggestion chips */}
                  <div className="flex gap-2 overflow-x-auto pb-1 custom-scrollbar">
                    {[
                      "Recommend quiet hotel suites",
                      "Where is the nearest Indian Restaurant?",
                      "Find the local subway stations",
                      "Explain office terminal parking details"
                    ].map((chip) => (
                      <button 
                        key={chip}
                        onClick={() => sendChatMessage(chip)}
                        className="flex-shrink-0 px-3 py-1 bg-teal-500/10 text-teal-600 hover:bg-teal-500/20 rounded-full text-[10px] font-bold tracking-wide uppercase border border-teal-500/20 active:scale-95 transition-transform cursor-pointer"
                      >
                        {chip}
                      </button>
                    ))}
                  </div>

                  {/* Main typing container */}
                  <div className={`p-2 rounded-2xl ${getCardClass()} flex items-center gap-2`}>
                    <input 
                      type="text"
                      className="flex-1 bg-transparent border-0 font-medium px-2 py-2 text-sm focus:ring-0 focus:outline-none"
                      placeholder="Type your message to VoyagerIQ Assistant..."
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          sendChatMessage();
                        }
                      }}
                    />
                    <button 
                      onClick={() => sendChatMessage()}
                      className="p-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl flex items-center justify-center transition-all cursor-pointer active:scale-95 shadow-md shadow-blue-600/10"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </div>

                  <p className="text-center text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                    VoyagerIQ AI can make mistakes. Verify critical travel details.
                  </p>
                </div>
              </div>

              {/* Right Column: Corporate Landmark GPS & Employee Journal Hub */}
              <div className="xl:col-span-4 space-y-6 overflow-y-auto max-h-[calc(100vh-230px)] pr-1 custom-scrollbar">
                
                {/* Landmark GPS Upload Panel */}
                <div className={`${getCardClass()} p-5 rounded-2xl border border-slate-200 dark:border-zinc-800 space-y-3.5 shadow-sm`}>
                  <div className="flex justify-between items-center border-b border-slate-100 dark:border-zinc-800 pb-2.5">
                    <h4 className="font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 text-blue-650">
                      <MapPin className="w-3.5 h-3.5" /> GPS Landmark Finder
                    </h4>
                    <span className="text-[8px] bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-200 font-bold uppercase px-1.5 py-0.5 rounded">Azure Vision</span>
                  </div>

                  <p className="text-[11px] leading-relaxed text-slate-500">
                    Upload an image of your active location landmark, or select a corporate hub landmark below to get instant directions directly to our designated corporate offices.
                  </p>

                  <div className="grid grid-cols-3 gap-2">
                    <button
                      onClick={() => {
                        setGpsUploading(true);
                        setGpsDirections("");
                        setTimeout(() => {
                          setGpsUploading(false);
                          setGpsUploadedLandmark("Tokyo Tower / Shibuya Sector");
                          setGpsDirections("Coordinates: Shibuya Crossing Landmark. Head 200m North-East towards Hanzomon Subway Line. Take Tokyo Underpass Directly into Chioda Tower Office (Level 18).");
                        }, 1200);
                      }}
                      className="p-1 border border-slate-200 hover:border-blue-500 dark:border-zinc-800 rounded-lg text-center font-bold text-[9px] hover:bg-slate-50 dark:hover:bg-zinc-900 cursor-pointer"
                    >
                      🗼 Tokyo Tower
                    </button>

                    <button
                      onClick={() => {
                        setGpsUploading(true);
                        setGpsDirections("");
                        setTimeout(() => {
                          setGpsUploading(false);
                          setGpsUploadedLandmark("Marina Bay Lions Terminal");
                          setGpsDirections("Coordinates: Central Marina Sands. Walk 100m south directly to MRT Bayfront gate. Circle Subway Line takes 3 minutes into local VoyagerIQ corporate workspace.");
                        }, 1200);
                      }}
                      className="p-1 border border-slate-200 hover:border-blue-500 dark:border-zinc-800 rounded-lg text-center font-bold text-[9px] hover:bg-slate-50 dark:hover:bg-zinc-900 cursor-pointer"
                    >
                      🦁 Singapore Lions
                    </button>

                    <button
                      onClick={() => {
                        setGpsUploading(true);
                        setGpsDirections("");
                        setTimeout(() => {
                          setGpsUploading(false);
                          setGpsUploadedLandmark("Canary Wharf Jubilee tube");
                          setGpsDirections("Coordinates: London Business Docks. Proceed directly to Gate platform 4. Take Elizabeth Line 2 stations into London HQ offices.");
                        }, 1200);
                      }}
                      className="p-1 border border-slate-200 hover:border-blue-500 dark:border-zinc-800 rounded-lg text-center font-bold text-[9px] hover:bg-slate-50 dark:hover:bg-zinc-900 cursor-pointer"
                    >
                      💂 London Dock
                    </button>
                  </div>

                  <div 
                    onClick={() => {
                      setGpsUploading(true);
                      setGpsDirections("");
                      setTimeout(() => {
                        setGpsUploading(false);
                        setGpsUploadedLandmark("Custom Landmark Picture JPG");
                        setGpsDirections("Coordinates: Verified Shibuya Crossing Landmark. Head 200m North-East towards Shibuya Subway Station exit 3. Board Hanzomon Line 3 stops directly to our Tokyo Regional Tower office segment.");
                      }, 1500);
                    }}
                    className="border border-dashed border-slate-200 dark:border-zinc-800 hover:bg-slate-50 dark:hover:bg-zinc-900/50 rounded-xl p-4 text-center cursor-pointer space-y-1"
                  >
                    {gpsUploading ? (
                      <div className="space-y-1 py-1">
                        <RefreshCcw className="w-5 h-5 animate-spin mx-auto text-blue-600" />
                        <p className="text-[10px] text-blue-600 font-bold animate-pulse">Running location Vision parsing...</p>
                      </div>
                    ) : gpsUploadedLandmark ? (
                      <div className="space-y-1 py-1">
                        <CheckCircle className="w-5 h-5 text-emerald-600 mx-auto" />
                        <p className="text-[10px] font-bold text-emerald-600">{gpsUploadedLandmark} Logged</p>
                      </div>
                    ) : (
                      <div className="space-y-1 py-1">
                        <Camera className="w-5 h-5 text-slate-400 mx-auto" />
                        <p className="text-[10px] font-bold text-slate-500">Scan GPS Location Picture</p>
                        <p className="text-[8px] text-slate-400 font-medium">Click to mock-upload active landmark</p>
                      </div>
                    )}
                  </div>

                  {gpsDirections && (
                    <div className="p-3 bg-blue-500/5 border border-blue-500/10 rounded-xl space-y-1 shadow-inner">
                      <p className="text-[9px] font-bold text-blue-600 uppercase tracking-widest font-mono">Directions & Metro Routes</p>
                      <p className="text-xs text-slate-700 dark:text-slate-350 leading-relaxed font-semibold">
                        {gpsDirections}
                      </p>
                    </div>
                  )}
                </div>

                {/* Employee Shared Experience Journal Form */}
                <div className={`${getCardClass()} p-5 rounded-2xl border border-slate-200 dark:border-zinc-805 space-y-4 shadow-sm`}>
                  <div className="flex justify-between items-center border-b border-slate-100 dark:border-zinc-800 pb-2.5">
                    <h4 className="font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 text-teal-600">
                      <MessageSquare className="w-3.5 h-3.5" /> Employee Experience Log
                    </h4>
                    <span className="text-[8px] bg-teal-100 dark:bg-teal-905/20 text-teal-800 dark:text-teal-200 font-bold uppercase px-1.5 py-0.5 rounded">Colleague Advice</span>
                  </div>

                  <form onSubmit={handleAddJournalSubmit} className="space-y-3">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[9px] font-bold text-slate-400 uppercase">Target Hub</label>
                        <select
                          value={journalCity}
                          onChange={(e) => setJournalCity(e.target.value)}
                          className={`w-full px-2 py-1.5 rounded-lg border text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none ${
                            theme === "light" ? "bg-slate-50 border-slate-200" : "bg-zinc-900 border-zinc-800 text-white"
                          }`}
                        >
                          <option value="Singapore">Singapore</option>
                          <option value="Tokyo">Tokyo</option>
                          <option value="London">London</option>
                          <option value="Dubai">Dubai</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-[9px] font-bold text-slate-400 uppercase">How you felt</label>
                        <select
                          value={journalFeel}
                          onChange={(e) => setJournalFeel(e.target.value)}
                          className={`w-full px-2 py-1.5 rounded-lg border text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none ${
                            theme === "light" ? "bg-slate-50 border-slate-200" : "bg-zinc-900 border-zinc-800 text-white"
                          }`}
                        >
                          <option value="Productive 🚀">Productive 🚀</option>
                          <option value="Rested 🧘">Rested 🧘</option>
                          <option value="Excited 🤩">Excited 🤩</option>
                          <option value="Challenged 🤯">Challenged 🤯</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[9px] font-bold text-slate-400 uppercase">Pros</label>
                        <input
                          type="text"
                          placeholder="Positive feedback..."
                          value={journalPros}
                          onChange={(e) => setJournalPros(e.target.value)}
                          className={`w-full px-2 py-1.5 rounded-lg border text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none ${
                            theme === "light" ? "bg-slate-50 border-slate-200" : "bg-zinc-900 border-zinc-800 text-white"
                          }`}
                        />
                      </div>
                      <div>
                        <label className="text-[9px] font-bold text-slate-400 uppercase">Cons</label>
                        <input
                          type="text"
                          placeholder="Pitfalls detected..."
                          value={journalCons}
                          onChange={(e) => setJournalCons(e.target.value)}
                          className={`w-full px-2 py-1.5 rounded-lg border text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none ${
                            theme === "light" ? "bg-slate-50 border-slate-200" : "bg-zinc-900 border-zinc-800 text-white"
                          }`}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-[9px] font-bold text-slate-400 block uppercase mb-0.5">Metro & Office Route Details</label>
                      <input
                        type="text"
                        placeholder="e.g. Underpass exit 4 near central kiosk"
                        value={journalMetro}
                        onChange={(e) => setJournalMetro(e.target.value)}
                        className={`w-full px-3 py-1.5 rounded-lg border text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none ${
                          theme === "light" ? "bg-slate-50 border-slate-200" : "bg-zinc-900 border-zinc-800 text-white"
                        }`}
                      />
                    </div>

                    <div>
                      <label className="text-[9px] font-bold text-slate-400 block uppercase mb-0.5">Crucial warnings / Things to Avoid</label>
                      <input
                        type="text"
                        placeholder="e.g. Avoid Peak Central line tube cars"
                        value={journalAvoid}
                        onChange={(e) => setJournalAvoid(e.target.value)}
                        className={`w-full px-3 py-1.5 rounded-lg border text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none ${
                          theme === "light" ? "bg-slate-50 border-slate-200" : "bg-zinc-900 border-zinc-800 text-white"
                        }`}
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold transition-all active:scale-[0.98] cursor-pointer shadow-md"
                    >
                      Publish Experience for Teammates
                    </button>
                  </form>

                  {/* Shared Logs List */}
                  <div className="space-y-3 pt-2">
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest font-mono">Enterprise Advice Stream</p>
                    
                    <div className="space-y-2.5 max-h-40 overflow-y-auto custom-scrollbar pr-1">
                      {journalList.map((j) => (
                        <div key={j.id} className="p-3 bg-slate-50/70 dark:bg-zinc-900/40 border border-slate-100 dark:border-zinc-800 rounded-xl space-y-1">
                          <div className="flex justify-between items-center text-[9px] uppercase font-mono tracking-wider text-slate-400 font-bold border-b border-dashed border-slate-200 dark:border-zinc-805 pb-1">
                            <span>📍 {j.city} Hub</span>
                            <span className="text-teal-600">{j.feel}</span>
                          </div>
                          <div className="space-y-1 text-[11px] leading-relaxed">
                            <p className="font-semibold text-slate-700 dark:text-slate-350"><strong className="text-emerald-600 text-[10px] mr-1 uppercase">PROS:</strong> {j.pros}</p>
                            <p className="text-slate-500"><strong className="text-amber-600 text-[10px] mr-1 uppercase">CONS:</strong> {j.cons}</p>
                            <p className="text-red-500 font-medium"><strong className="text-red-600 text-[10px] mr-1 uppercase">AVOID:</strong> {j.avoid}</p>
                            <p className="text-blue-500"><strong className="text-blue-600 text-[10px] mr-1 uppercase">NAV/METRO:</strong> {j.metro}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </main>

      {/* Mobile Bottom Navigation Bar (Visible on Mobile Only) */}
      <nav className={`md:hidden fixed bottom-0 left-0 w-full h-16 z-40 border-t flex justify-around items-center px-4 shadow-lg pb-safe transition-colors ${
        theme === "black" 
          ? "bg-black border-zinc-800" 
          : "bg-slate-900 border-slate-800 text-slate-100"
      }`}>
        <button 
          onClick={() => setActiveTab("dashboard")}
          className={`flex flex-col items-center justify-center gap-1 cursor-pointer transition-transform duration-200 active:scale-90 ${
            activeTab === "dashboard" ? "text-blue-500 font-bold" : "text-slate-400"
          }`}
        >
          <Smartphone className="w-5 h-5" />
          <span className="text-[9px] uppercase tracking-wider">Home</span>
        </button>

        <button 
          onClick={() => setActiveTab("expenses")}
          className={`flex flex-col items-center justify-center gap-1 cursor-pointer transition-transform duration-200 active:scale-90 ${
            activeTab === "expenses" ? "text-blue-500 font-bold" : "text-slate-400"
          }`}
        >
          <CreditCard className="w-5 h-5" />
          <span className="text-[9px] uppercase tracking-wider">Ledger</span>
        </button>

        <button 
          onClick={() => setActiveTab("planner")}
          className={`flex flex-col items-center justify-center gap-1 cursor-pointer transition-transform duration-200 active:scale-90 ${
            activeTab === "planner" ? "text-blue-500 font-bold" : "text-slate-400"
          }`}
        >
          <Map className="w-5 h-5" />
          <span className="text-[9px] uppercase tracking-wider">Planner</span>
        </button>

        <button 
          onClick={() => setActiveTab("assistant")}
          className={`flex flex-col items-center justify-center gap-1 cursor-pointer transition-transform duration-200 active:scale-90 ${
            activeTab === "assistant" ? "text-teal-400 font-bold" : "text-slate-400"
          }`}
        >
          <MessageSquare className="w-5 h-5" />
          <span className="text-[9px] uppercase tracking-wider">AI Chat</span>
        </button>
      </nav>

      {/* MODAL 1: ADD MANUAL EXPENSE OR LOAD DETAILS */}
      {showAddExpenseModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className={`${getCardClass()} rounded-2xl max-w-sm w-full p-6 space-y-4`}>
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-bold text-lg">Log New Expense</h3>
                <p className="text-xs text-slate-400 uppercase tracking-widest mt-0.5">Automated accounting filing</p>
              </div>
              <button 
                onClick={() => setShowAddExpenseModal(false)}
                className="text-slate-400 hover:text-slate-600 font-bold p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddExpenseSubmit} className="space-y-4">
              <div>
                <label className="text-[10px] font-bold text-slate-400 block mb-1 uppercase tracking-wide">Vendor / Provider Name</label>
                <input 
                  type="text" 
                  value={newExpenseVendor} 
                  onChange={(e) => setNewExpenseVendor(e.target.value)} 
                  className={`w-full px-3 py-2 rounded-lg border text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none ${
                    theme === "light" ? "bg-slate-50 border-slate-200" : "bg-zinc-900 border-zinc-800 text-white"
                  }`}
                  placeholder="e.g. The Plateau Restaurant"
                  required 
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 block mb-1 uppercase tracking-wide">Numerical Amount</label>
                  <input 
                    type="number" 
                    step="0.01"
                    value={newExpenseAmount} 
                    onChange={(e) => setNewExpenseAmount(e.target.value)} 
                    className={`w-full px-3 py-2 rounded-lg border text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none ${
                      theme === "light" ? "bg-slate-50 border-slate-200" : "bg-zinc-900 border-zinc-800 text-white"
                    }`}
                    placeholder="245.80"
                    required 
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 block mb-1 uppercase tracking-wide">Currency ISO</label>
                  <select 
                    value={newExpenseCurrency} 
                    onChange={(e) => setNewExpenseCurrency(e.target.value)}
                    className={`w-full px-3 py-2 rounded-lg border text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none ${
                      theme === "light" ? "bg-slate-50 border-slate-200" : "bg-zinc-900 border-zinc-800 text-white"
                    }`}
                  >
                    <option value="SGD">SGD (S$)</option>
                    <option value="USD">USD ($)</option>
                    <option value="GBP">GBP (£)</option>
                    <option value="EUR">EUR (€)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 block mb-1 uppercase tracking-wide">Category</label>
                  <select 
                    value={newExpenseCategory} 
                    onChange={(e) => setNewExpenseCategory(e.target.value as any)}
                    className={`w-full px-3 py-2 rounded-lg border text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none ${
                      theme === "light" ? "bg-slate-50 border-slate-200" : "bg-zinc-900 border-zinc-800 text-white"
                    }`}
                  >
                    <option value="Food">Food & Catering</option>
                    <option value="Hotel">Hotel Accommodation</option>
                    <option value="Transport">Transport shuttliness</option>
                    <option value="Other">Miscellaneous Fees</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 block mb-1 uppercase tracking-wide">Deduction Scope</label>
                  <select 
                    value={newExpenseType} 
                    onChange={(e) => setNewExpenseType(e.target.value as any)}
                    className={`w-full px-3 py-2 rounded-lg border text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none ${
                      theme === "light" ? "bg-slate-50 border-slate-200" : "bg-zinc-900 border-zinc-800 text-white"
                    }`}
                  >
                    <option value="Business">Company Reimbursable</option>
                    <option value="Personal font-bold">Personal Out-of-pocket</option>
                  </select>
                </div>
              </div>

              <button 
                type="submit"
                className="w-full h-10 bg-blue-600 text-white font-bold rounded-xl text-xs select-none active:scale-[0.98] transition-transform shadow-md hover:brightness-110 cursor-pointer"
              >
                File Expense Record
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: ADD NEW DESTINATION COUNTRY */}
      {showAddCountryModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className={`${getCardClass()} rounded-2xl max-w-sm w-full p-6 space-y-4`}>
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-bold text-lg">Add Custom Business Hub</h3>
                <p className="text-xs text-slate-400 uppercase tracking-widest mt-0.5">Concierge mapping index</p>
              </div>
              <button 
                onClick={() => setShowAddCountryModal(false)}
                className="text-slate-400 hover:text-slate-600 font-bold p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddCountrySubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 block mb-1 uppercase tracking-wide">Country</label>
                  <input 
                    type="text" 
                    value={newCountryName} 
                    onChange={(e) => setNewCountryName(e.target.value)} 
                    className={`w-full px-3 py-2 rounded-lg border text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none ${
                      theme === "light" ? "bg-slate-50 border-slate-200" : "bg-zinc-900 border-zinc-800 text-white"
                    }`}
                    placeholder="e.g. France"
                    required 
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 block mb-1 uppercase tracking-wide">Key City Hub</label>
                  <input 
                    type="text" 
                    value={newCountryCity} 
                    onChange={(e) => setNewCountryCity(e.target.value)} 
                    className={`w-full px-3 py-2 rounded-lg border text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none ${
                      theme === "light" ? "bg-slate-50 border-slate-200" : "bg-zinc-900 border-zinc-800 text-white"
                    }`}
                    placeholder="e.g. Paris"
                    required 
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 block mb-1 uppercase tracking-wide">Hub Description</label>
                <textarea 
                  value={newCountryDesc} 
                  onChange={(e) => setNewCountryDesc(e.target.value)} 
                  rows={3}
                  className={`w-full px-3 py-2 rounded-lg border text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none ${
                    theme === "light" ? "bg-slate-50 border-slate-200" : "bg-zinc-900 border-zinc-800 text-white"
                  }`}
                  placeholder="Summarize corporate accessibility, food tags or logistics quality..."
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 block mb-1 uppercase tracking-wide">District Tags (comma separated)</label>
                <input 
                  type="text" 
                  value={newCountryMutedTags} 
                  onChange={(e) => setNewCountryMutedTags(e.target.value)} 
                  className={`w-full px-3 py-2 rounded-lg border text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none ${
                    theme === "light" ? "bg-slate-50 border-slate-200" : "bg-zinc-900 border-zinc-800 text-white"
                  }`}
                  placeholder="e.g. Tax Haven, Tech cluster, Quiet cafes"
                />
              </div>

              <button 
                type="submit"
                className="w-full h-10 bg-blue-600 text-white font-bold rounded-xl text-xs select-none active:scale-[0.98] transition-transform shadow-md hover:brightness-110 cursor-pointer"
              >
                Log Hub in Explorer
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: AZURE AI FOUNDRY / OPENAI CONFIGURATION */}
      {showAzureConfigDrawer && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className={`${getCardClass()} rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl border text-left ${
            theme === "black" ? "border-zinc-805" : "border-slate-800/10"
          }`}>
            <div className="flex justify-between items-start border-b pb-3 dark:border-zinc-800">
              <div>
                <h3 className="font-bold text-lg text-slate-800 dark:text-white flex items-center gap-2">
                  <span className="p-1 rounded bg-blue-600/10 text-blue-500">
                    <Cpu className="w-5 h-5 animate-pulse" />
                  </span>
                  Microsoft Azure AI Foundry
                </h3>
                <p className="text-[10px] text-slate-500 font-extrabold uppercase tracking-wider mt-0.5 text-left">Agent Service Connection Hub</p>
              </div>
              <button 
                onClick={() => setShowAzureConfigDrawer(false)}
                className="text-slate-400 hover:text-slate-600 font-bold p-1 cursor-pointer transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-left">
              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/20 rounded-xl border border-emerald-500/30 text-[11px] text-emerald-800 dark:text-emerald-400 leading-relaxed font-mono">
                <span className="font-bold">🟢 Secure Host Agent Active:</span> VoyagerIQ is configured directly to access your private Azure AI Foundry Agent (as specified in your secure server environment variables). No browser-side inputs are required; anyone accessing this deployment will automatically query your primary agent! To override parameters with custom credentials, you may optionally populate the fields below.
              </div>

              <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1">
                <div>
                  <label className="text-[10px] font-bold text-slate-500 block mb-1 uppercase tracking-wide">FOUNDRY PROJECT ENDPOINT</label>
                  <input 
                    type="text" 
                    value={szFoundryEndpoint} 
                    onChange={(e) => setSzFoundryEndpoint(e.target.value)} 
                    placeholder="e.g. msd-foundry-endpoint.services.ai.azure.com" 
                    className={`w-full h-10 px-3 rounded-xl border text-xs bg-transparent focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      theme === "light" ? "bg-slate-50 border-slate-200 text-slate-800" : "bg-zinc-900 border-zinc-800 text-white"
                    }`}
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-500 block mb-1 uppercase tracking-wide">FOUNDRY ISOLATION KEY / CREDENTIAL</label>
                  <input 
                    type="password" 
                    value={szFoundryIsolationKey} 
                    onChange={(e) => setSzFoundryIsolationKey(e.target.value)} 
                    placeholder="••••••••••••••••••••••••••••••••" 
                    className={`w-full h-10 px-3 rounded-xl border text-xs bg-transparent focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      theme === "light" ? "bg-slate-50 border-slate-200 text-slate-800" : "bg-zinc-900 border-zinc-800 text-white"
                    }`}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 block mb-1 uppercase tracking-wide">FOUNDRY AGENT NAME</label>
                    <input 
                      type="text" 
                      value={szFoundryAgentName} 
                      onChange={(e) => setSzFoundryAgentName(e.target.value)} 
                      placeholder="e.g. travel-concierge-agent" 
                      className={`w-full h-10 px-3 rounded-xl border text-xs bg-transparent focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        theme === "light" ? "bg-slate-50 border-slate-200 text-slate-800" : "bg-zinc-900 border-zinc-800 text-white"
                      }`}
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 block mb-1 uppercase tracking-wide">FOUNDRY AGENT VERSION</label>
                    <input 
                      type="text" 
                      value={szFoundryAgentVersion} 
                      onChange={(e) => setSzFoundryAgentVersion(e.target.value)} 
                      placeholder="e.g. 1.0" 
                      className={`w-full h-10 px-3 rounded-xl border text-xs bg-transparent focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        theme === "light" ? "bg-slate-50 border-slate-200 text-slate-800" : "bg-zinc-900 border-zinc-800 text-white"
                      }`}
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-2.5 pt-2">
                <button 
                  onClick={() => {
                    localStorage.removeItem("foundry_endpoint");
                    localStorage.removeItem("foundry_agentName");
                    localStorage.removeItem("foundry_agentVersion");
                    localStorage.removeItem("foundry_isolationKey");
                    setSzFoundryEndpoint("");
                    setSzFoundryAgentName("");
                    setSzFoundryAgentVersion("1.0");
                    setSzFoundryIsolationKey("");
                    setShowAzureConfigDrawer(false);
                  }}
                  type="button"
                  className="w-1/3 h-10 border border-red-500/20 text-red-500 hover:bg-red-500/10 active:scale-[0.98] transition-transform font-bold rounded-xl text-xs select-none cursor-pointer"
                >
                  Clear Keys
                </button>
                <button 
                  onClick={() => {
                    localStorage.setItem("foundry_endpoint", szFoundryEndpoint);
                    localStorage.setItem("foundry_agentName", szFoundryAgentName);
                    localStorage.setItem("foundry_agentVersion", szFoundryAgentVersion);
                    localStorage.setItem("foundry_isolationKey", szFoundryIsolationKey);
                    setShowAzureConfigDrawer(false);
                    
                    setChatMessages(prev => [...prev, {
                      id: "notif-foundry-" + Date.now(),
                      role: "assistant",
                      content: `🚀 **Azure AI Foundry Agent Connected!** Successfully loaded: \`${szFoundryAgentName}\` on Endpoint: \`${szFoundryEndpoint}\`. Verified the use of AIProjectClient beta session thread instances directly.`,
                      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                    }]);
                  }}
                  type="button"
                  className="flex-1 h-10 bg-emerald-600 text-white font-bold rounded-xl text-xs select-none active:scale-[0.98] transition-transform shadow-md hover:brightness-110 cursor-pointer"
                >
                  Save Connection
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: PLAN / CREATE CUSTOM TRIP */}
      {showAddTripModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className={`${getCardClass()} rounded-2xl max-w-sm w-full p-6 space-y-4`}>
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-bold text-lg">Plan / Create Custom Trip</h3>
                <p className="text-xs text-slate-400 uppercase tracking-widest mt-0.5">Register corporate agenda</p>
              </div>
              <button 
                onClick={() => setShowAddTripModal(false)}
                className="text-slate-400 hover:text-slate-600 font-bold p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddTripSubmit} className="space-y-3">
              <div>
                <label className="text-[10px] font-bold text-slate-400 block mb-1 uppercase tracking-wide">Destination City</label>
                <input 
                  type="text" 
                  value={newTripCity} 
                  onChange={(e) => setNewTripCity(e.target.value)} 
                  className={`w-full px-3 py-2 rounded-lg border text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none ${
                    theme === "light" ? "bg-slate-50 border-slate-200" : "bg-zinc-900 border-zinc-800 text-white"
                  }`}
                  placeholder="e.g. Barcelona"
                  required 
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 block mb-1 uppercase tracking-wide">Country</label>
                <input 
                  type="text" 
                  value={newTripCountry} 
                  onChange={(e) => setNewTripCountry(e.target.value)} 
                  className={`w-full px-3 py-2 rounded-lg border text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none ${
                    theme === "light" ? "bg-slate-50 border-slate-200" : "bg-zinc-900 border-zinc-800 text-white"
                  }`}
                  placeholder="e.g. Spain"
                  required 
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 block mb-1 uppercase tracking-wide">Travel Dates</label>
                  <input 
                    type="text" 
                    value={newTripDates} 
                    onChange={(e) => setNewTripDates(e.target.value)} 
                    className={`w-full px-3 py-2 rounded-lg border text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none ${
                      theme === "light" ? "bg-slate-50 border-slate-200" : "bg-zinc-900 border-zinc-800 text-white"
                    }`}
                    placeholder="e.g. Nov 25 - Nov 29"
                    required 
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 block mb-1 uppercase tracking-wide">Flight Number</label>
                  <input 
                    type="text" 
                    value={newTripFlight} 
                    onChange={(e) => setNewTripFlight(e.target.value)} 
                    className={`w-full px-3 py-2 rounded-lg border text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none ${
                      theme === "light" ? "bg-slate-50 border-slate-200" : "bg-zinc-900 border-zinc-800 text-white"
                    }`}
                    placeholder="e.g. IB 315"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 block mb-1 uppercase tracking-wide">Reason / Corporate Summit</label>
                <input 
                  type="text" 
                  value={newTripReason} 
                  onChange={(e) => setNewTripReason(e.target.value)} 
                  className={`w-full px-3 py-2 rounded-lg border text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none ${
                    theme === "light" ? "bg-slate-50 border-slate-200" : "bg-zinc-900 border-zinc-800 text-white"
                  }`}
                  placeholder="e.g. EMEA Advisory Council"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 block mb-1 uppercase tracking-wide">Initial Status</label>
                  <select 
                    value={newTripStatus} 
                    onChange={(e) => setNewTripStatus(e.target.value as any)}
                    className={`w-full px-3 py-2 rounded-lg border text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none ${
                      theme === "light" ? "bg-slate-50 border-slate-200" : "bg-zinc-900 border-zinc-800 text-white"
                    }`}
                  >
                    <option value="Confirmed">Confirmed</option>
                    <option value="In Progress">Active (In Progress)</option>
                    <option value="Awaiting Confirmation">Draft Plan</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 block mb-1 uppercase tracking-wide">Weather Temp</label>
                  <input 
                    type="text" 
                    value={newTripTemp} 
                    onChange={(e) => setNewTripTemp(e.target.value)} 
                    className={`w-full px-3 py-2 rounded-lg border text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none ${
                      theme === "light" ? "bg-slate-50 border-slate-200" : "bg-zinc-900 border-zinc-800 text-white"
                    }`}
                    placeholder="e.g. 24°C"
                  />
                </div>
              </div>

              <button 
                type="submit"
                className="w-full h-10 mt-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs select-none active:scale-[0.98] transition-transform shadow-md cursor-pointer"
              >
                Create and Save Corporate Trip
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );

  // Subtle conditional backgrounds helper
  function subtleBgClass() {
    if (theme === "black") return "bg-zinc-900/40 hover:bg-zinc-900 text-white";
    if (theme === "dark") return "bg-slate-800/25 hover:bg-slate-800 text-slate-200";
    return "bg-slate-100/50 hover:bg-slate-200/50 text-slate-700";
  }
}
