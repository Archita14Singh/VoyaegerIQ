import { Transaction, Destination, Trip } from "./types";

export const INITIAL_TRIPS: Trip[] = [];

export const INITIAL_TRANSACTIONS: Transaction[] = [];

export const INITIAL_DESTINATIONS: Destination[] = [
  {
    id: "dest-tokyo",
    name: "Tokyo",
    country: "Japan",
    description: "A seamless fusion of futuristic infrastructure and traditional efficiency. Tokyo offers unparalleled logistics, world-class dining, and precision-driven hospitality ideal for high-stakes enterprise ventures.",
    tags: ["Financial Hub", "High-End Dining", "Precise Logistics"],
    imgUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuDkx8C64P4i6MQuhSvzS1B0krI5NQ-ELrVJLzTsN-SGzjCaaXC9-8wXcjEQo5OtKbRE93juHa0I5mPcOLK5kHu2m29JGtDW8PbWe1PVqNt52bwP55Ej6qn2jfxIU7Zbs24igZEEiMsDDGGq9gagS2MSRP0TSWRZDnW4OqrI8XcwkbjlETLXhuoQb2C3vNpIaP8cSsWwDp032HWLo1ovVzEPmrnSLrNe47EeGdw2jSHNxYDMzeWCNwz7DWdbzbuDCzq22eu2J6yf7lc",
    isRecommended: true,
    subImgUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuATZe4F-Zvs2oBRQWhEBplAnGU6bLdA7RBxI1orvb6bafUm2cnz7wcqTHf7wzgrJP3n2puraCHggsvg-OL8M5LxtjjGVyCLY9FN-r86TwC-JalSccAe7lG8HzUs-X07cXeP9Ne5VUHHKm3douU6Yn0gCDW8Hp8Hzs6lJC09Dn-kLzkaC6yNpZID7YLZ_IT9mGpbc4vUfyggHVg-KBDrk7BiBQTOldLByC1xyxqK3kQe92wdxwyizmPpw7151NsrTD5D7WYLpxaM8Ic",
    district: "Chiyoda & Otemachi Corporate Zone",
    attractions: ["Imperial Palace Gardens", "Roppongi Hills View", "Ginza District"],
    transport: "JR Yamanote Line & Tokyo Metro",
  },
  {
    id: "dest-singapore",
    name: "Singapore",
    country: "Singapore",
    description: "The global gateway to Southeast Asia. Known for its hyper-efficient Changi Airport, stable regulatory environment, and pristine urban design, Singapore remains a top destination for executive travelers.",
    tags: ["Global Hub", "Tech Nexus", "Strict Safety"],
    imgUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuAV5vB5AFNDxUpepEdVkRdhSh8FHFLCYrRCnyGbIfEnOG_VGYrhcVbaUiNZpTOpWA5UzS8YQYiDNg7QK4wYNPZTCWabkMf-A-8ddmWZ1ndj_w3SX_TpdGmFfym4aGSSiMQHUYkxjVMuCH46bZypfvCtXiMFbR6Md9CZw54VVS0GAEreZ9zEFfXtKlYhOEdB9-eU6XEu4XKkXrQQv9BzZiFmaw6r7F0AV1GX4qq_RcZaLG6BEdtlguMEr1JesUHX9A5pNA3nwTiZ44A",
    isChoice: true,
    subImgUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuCgynfwapXV8igUh0Z6dN1x6UeaIV63DEHnx1rVbwM-UsEpHB7JKct27Nq-RiKTPnVNF1pvAs1GpIVupJMwpMx7C0ZdjrfwfamOStQ6pDXOTiJMnYn1HWvBU5vfEsdMLTb2j-T0piMZ9FWYD2METsBpEjgWMEhEyaDrDBI7TvQcEiD6teWCMF4DwUGIiwCWbbiJt8sQWNyT2NH_mRfUSZq2VyKQgXrfWxugF2mDyUUU-15pAheXl67nBvhvSgspzFn8QlCoFjFsZEY",
    district: "Marina Bay & Downtown Core",
    attractions: ["Gardens by the Bay", "Marina Bay Sands Deck", "Merlion Park"],
    transport: "MRT Downtown Line & Private Towncars",
  },
];

export const OTHER_DESTINATIONS: Destination[] = [
  {
    id: "dest-london",
    name: "London",
    country: "UK",
    description: "The historical heart of global finance, offering premier networking and cultural richness.",
    tags: ["Financial Hub", "High-End Dining"],
    imgUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuBjrGfWcfsq8XfClhAvtBss8krKB10GQ4cGgqlqk471ue7ytkkq6Z788FVU2GVBVF0Hg2uxSdj_zm_s1vs6Y0CmCjtE-66074M8-cgpmno0hh_i4v4UhuHKLNuKAcNwecalgJvIIT1CLrZkIyTetfFsNkhbznj3XRziknhAMie_9mUvU_XEz3dZ4zD5dcwCT79U7vAHA46Yv4_gG-ZGlzoEPzMi1eDGXGsyInQmAIezAPOKRiUywfWwy28C0tZpUCO8cDsh61QDOVs",
  },
  {
    id: "dest-dubai",
    name: "Dubai",
    country: "UAE",
    description: "A hub for international trade and innovation, featuring ultra-modern infrastructure.",
    tags: ["Innovation", "Logistics Hub"],
    imgUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuAvfXj3DczmWT7Lr2BEC4w1RHHrpFOHYLGnlYvFV20qRCR0C3U1lIryvphgIBRkR1i4WZ821QiB5gxOwtdQjfHYvaJc3dm1DqEBGADsDKwtsWkEc48T8_-RUpUbv38PU_WjAvYLUOJE9gGqa0Tah138fwHio1reDCxmEwyBhLeVo67WiGtszKpFjTpObVbFIOcRwuwMHCt-65oO7M8H8ueVx_pEWAV1YfJlliEhVgK5x_bKptHt_Fx5p03P5T1XsGF_vkPSdJ2c0xQ",
  },
  {
    id: "dest-seattle",
    name: "Seattle",
    country: "USA",
    description: "The center of cloud computing and aerospace, blending natural beauty with tech prowess.",
    tags: ["Tech Nexus", "Nature Access"],
    imgUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuD8cniMIrbb5euPzZ07t8OTiB1hwBCOBBGfYtLFIoKgn4cRxRXamavzSPxh7yv_GiIK2J3PY67FVHaYh6mi8l7yOKQGR2EqS_MomdJM2I6XDgeKQVvi1wJzzvFusyT3RHLBdP2T7tfY_0PT9uS9F0QvpSZGeRoZyEkYtd6STZV54uRTYdWnMSkRP4HCOq7QfBlE5Ws58kxFE90Lfem4sipyrVtK5TVMR4dsedRADOoin6SeTOM6YoZTelX4ZtT44AY5STfNNeOKs4g",
  },
];
