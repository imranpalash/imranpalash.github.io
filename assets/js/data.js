/* Site data. Every piece of work, place and talk on the homepage comes from here.
   To add a piece of work, copy one entry in WORKS and fill it in. Put its image in /assets. */

/* Contact form. Messages are delivered by Web3Forms (web3forms.com) to the email address
   registered with this access key, so the address never appears on the site.
   The key is designed to be public. Leave it empty and the form explains it isn't connected yet. */
window.CONTACT_FORM = {
  endpoint: "https://api.web3forms.com/submit",
  accessKey: "762f5f46-7566-481e-b693-128ae36c4279"
};

window.PLACES = {
  dhaka:      { name: "Dhaka",            country: "Bangladesh", lon: 90.41,  lat: 23.81 },
  norman:     { name: "Norman, Oklahoma", country: "United States", short: "Norman", lon: -97.44, lat: 35.22 },
  washington: { name: "Washington, D.C.", country: "United States", short: "Washington", lon: -77.04, lat: 38.91 },
  chengdu:    { name: "Chengdu",          country: "China", lon: 104.07, lat: 30.57 }
};

/* The route, in order. Each stop is one chapter of the career. */
window.ROUTE = [
  { place: "dhaka", years: "2010–2015", title: "Reporter and editor",
    lines: ["Feature writer, The New Age", "Founding editor, Glocal magazine", "MA, International Relations, Jahangirnagar University"] },
  { place: "norman", years: "2015–2022", title: "PhD, then Assistant Professor",
    lines: ["PhD and MA, University of Oklahoma", "Assistant Professor of Digital Media, Gaylord College", "Editor, Gaylord News"] },
  { place: "washington", years: "2017, 2021", title: "Archive research and bureau reporting", also: ["moonmen"],
    lines: ["Based in Norman, and in Washington repeatedly for projects", "2017: a week of microfilm research at the Library of Congress for The Moonmen, a documentary for the U.S. Embassy Dhaka", "2021: directed and produced TV news packages with student reporters at the Gaylord News Washington bureau"] },
  { place: "dhaka", from: "norman", years: "2023", title: "Assistant Professor, ULAB",
    lines: ["Graduate courses in research methodology and health communication"] },
  { place: "chengdu", years: "2024–2025", title: "Senior Lecturer of Media Studies",
    lines: ["Stirling College, Chengdu University", "Joint program with the University of Stirling"] },
  { place: "dhaka", years: "2026–now", title: "Research and program work",
    lines: ["Research consultant, Various NGOs & INGOs", "Transnational doctoral program proposal, ULAB and University of Portsmouth"] }
];

/* medium: "interactive" | "video" | "audio" */
window.WORKS = [
  { id: "race-to-refuge", title: "Race to Refuge", year: 2019, medium: "interactive", place: "norman",
    format: "Interactive story", context: "Best Solo Project, OU Creaties Awards",
    img: "assets/race-to-refuge.jpg", alt: "Race to Refuge: a resettlement officer asks the player to choose a response",
    blurb: "A choose-your-path simulation of the U.S. refugee entry process. Players take the role of an applicant and choose a response at each step.",
    role: "Wrote, designed and produced", link: "race-to-refuge/index.html", action: "Play in the browser", featured: true },

  { id: "shootings", title: "Shooting Fatalities in the U.S.", year: 2021, medium: "interactive", place: "norman",
    format: "Interactive data map", context: "Digital Storytelling",
    img: "assets/shootings-map.jpg", alt: "Map of the United States with red markers at the sites of fatal mass shootings",
    blurb: "Fatal mass shootings in the United States, from schools and universities to workplaces and malls. Marker colour shows the death toll in six bands from 3 to 70.",
    link: "https://www.google.com/maps/d/viewer?mid=14QKs3mdOodq_gsnDuJqUs6IVwKLrUHoM",
    embed: "https://www.google.com/maps/d/embed?mid=14QKs3mdOodq_gsnDuJqUs6IVwKLrUHoM&ehbc=2E312F", action: "Explore the map" },

  { id: "diaspora", title: "OU Diaspora Map", year: 2017, medium: "interactive", place: "norman",
    format: "Interactive Tableau map", context: "Diplomacy Lab, U.S. Department of State",
    img: "assets/diaspora-map.jpg", alt: "World map with markers at the headquarters of diaspora organizations",
    blurb: "A world map of diaspora organizations, designed and built solo, filterable by headquarters country, diaspora affiliation, organization type, and whether an organization hosts events.",
    link: "https://public.tableau.com/shared/RTFXB4638?:display_count=n&:origin=viz_share_link", action: "Explore the map" },

  { id: "moonmen", title: "The Moonmen", year: 2017, medium: "video", place: "dhaka",
    format: "Short documentary, 3 min", context: "Public Affairs Section, U.S. Embassy Dhaka",
    img: "assets/moonmen.jpg", alt: "Title card: The Moonmen, over a view of Earth from space",
    blurb: "The Apollo 11 astronauts' goodwill visit to Dhaka on 27 October 1969, part of their 23-country tour after the moon landing, told through archival footage and photographs.",
    role: "Researched, wrote and produced, including a week in the Library of Congress microfilm collections",
    youtube: "eRAeD8lRDkw", featured: true },

  { id: "real-enough", title: "Real Enough", year: 2026, medium: "video", place: "dhaka", ai: true, youtube: "pVPaolNa4Dc",
    format: "AI-generated film, 1:13", context: "ExpVideoFest, IAMCR 2026, Galway",
    blurb: "An AI-generated film about the collapse of visual certainty. Photographs of protests, disasters and everyday life repeat and mutate across screens, and the audience is never told which images are real.",
    role: "Written, directed and produced solo with Claude, Gemini, OpenAI, Meta AI and Cartesia" },

  { id: "tulsa", title: "Tulsa Race Massacre Education Around the Country", year: 2021, medium: "video", place: "washington",
    format: "TV news package, 1:41", context: "Gaylord News, Washington bureau",
    img: "assets/tulsa-massacre-education.jpg", alt: "The National Museum of African American History and Culture in Washington, D.C.",
    blurb: "At the massacre's centennial, the package finds the Tulsa exhibit behind an unmarked door on the third floor of the national museum and asks visitors what they know.",
    youtube: "pLUpgZ9gLBI", students: true },

  { id: "girls-nation", title: "Girls Nation", year: 2021, medium: "video", place: "washington",
    format: "TV news package, 1:29", context: "Gaylord News, Washington bureau",
    img: "assets/girls-nation.jpg", alt: "An Oklahoma delegate smiles in front of a Girls Nation backdrop",
    blurb: "Oklahoma's delegates at the American Legion Auxiliary's mock Senate for high school girls explain what they learned about passing bills across party lines.",
    youtube: "l7UX_MIb-wY", students: true },

  { id: "red-river", title: "Red River Bridge", year: 2021, medium: "video", place: "washington",
    format: "TV news package, 1:22", context: "Gaylord News, Washington bureau",
    img: "assets/red-river-bridge.jpg", alt: "Orange Road Work Ahead sign against a blue sky",
    blurb: "The I-35 bridge between Oklahoma and Texas nears 60 years old, with crash rates above both states' averages. The plan to widen it to six lanes.",
    youtube: "f3WKH1NP-Bg", students: true },

  { id: "okc-airport", title: "OKC Airport Expansion", year: 2021, medium: "video", place: "norman",
    format: "TV news package, 1:52", context: "OU Nightly, Gaylord News",
    img: "assets/okc-airport.jpg", alt: "A student reporter does a stand-up outside Will Rogers airport",
    blurb: "How new gates at Will Rogers airport brought new airlines and direct routes for out-of-state students, with a stand-up, interviews and airport data.",
    youtube: "H49zunP5UPw", students: true },

  { id: "cross-roads", title: "America's Cross-Roads", year: 2022, medium: "audio", place: "norman",
    format: "Podcast series, episodes 2 to 6", context: "Gaylord News, JMC 4303 Advanced Multimedia Journalism",
    blurb: "A Gaylord News series on the 2020 election and Oklahoma politics, focused on Christian nationalism and its role in the state's politics.",
    link: "#audio", action: "Listen", students: true }
];

/* Public talks and media appearances. kind: "TV" | "Online lecture" | "Online Q&A" ...
   Thumbnails come from YouTube. */
window.APPEARANCES = [
  { youtube: "wz8v45WK9o0", kind: "Online lecture", outlet: "IR Insights Bangla", date: "March 2022", length: "1:36:20",
    title: "The idea of constructivism in international relations as a foundation of world order" },
  { youtube: "A7xe_Vj1MXo", kind: "Online Q&A", outlet: "QCPA: Questions, Counter Questions & Perhaps Answers", date: "November 2021", length: "46:50",
    title: "Public diplomacy in the digital age" },
  { youtube: "wRMmedhsHas", kind: "TV", outlet: "ATN News, Young Nite", date: "5 June 2016", length: "16:08",
    title: "Technology, the internet and social media trends for young people" }
];

window.EPISODES = [
  { n: 2, dur: "34:46", track: "2421692217", token: "s-LrQH7fNht6P" },
  { n: 3, dur: "20:01", track: "2421694359", token: "s-gZ4Q6xfcAQc" },
  { n: 4, dur: "24:17", track: "2421694365", token: "s-OW5fOcTiFPf" },
  { n: 5, dur: "26:20", track: "2421694362", token: "s-xt2OsypRLN2" },
  { n: 6, dur: "25:51", track: "2421694368", token: "s-R17LP1W2a2Y" }
];

/* Conference presentations, one entry per talk. */
window.TALK_CITIES = {
  galway: ["Galway", -9.05, 53.27], dhaka: ["Dhaka", 90.41, 23.81], neworleans: ["New Orleans", -90.07, 29.95],
  indianapolis: ["Indianapolis", -86.16, 39.77], paris: ["Paris", 2.35, 48.86], norman: ["Norman", -97.44, 35.22],
  orlando: ["Orlando", -81.38, 28.54], denver: ["Denver", -104.99, 39.74], phoenix: ["Phoenix", -112.07, 33.45],
  chicago: ["Chicago", -87.63, 41.88], houston: ["Houston", -95.37, 29.76], minneapolis: ["Minneapolis", -93.27, 44.98],
  aspen: ["Aspen", -106.82, 39.19], newyork: ["New York", -74.01, 40.71], auckland: ["Auckland", 174.76, -36.85], edmond: ["Edmond", -97.48, 35.65],
  sanfrancisco: ["San Francisco", -122.42, 37.77], hartford: ["Hartford", -72.68, 41.76]
};

window.TALKS = [
  [2026, "galway", "AI vs. real: Image origin, color, and perceived credibility", "IAMCR 2026"],
  [2025, "dhaka", "AI vs camera captured photos in media: Image origin, color, and perceived credibility", "CJEN 10th Annual Conference"],
  [2021, "newyork", "Where's Waldo? A geospatial audience analysis of foreign embassies in the U.S.", "BAASANA International Conference"],
  [2021, "neworleans", "Social media in public diplomacy: A content analysis of foreign embassy tweets", "AEJMC 104th Annual Conference"],
  [2020, "indianapolis", "To tweet or not to tweet: Embassies' public diplomacy efforts in the digital age", "NCA 106th Annual Convention"],
  [2019, "neworleans", "Media consumption and political interests: A test of media mobilization vs. media malice", "SWECJMC Symposium"],
  [2019, "neworleans", "You can be what you can see", "SWECJMC Symposium"],
  [2019, "paris", "A win-win situation: How everyone benefits from educational collaboration: The case of the Diplomacy Lab", "World Journalism Education Congress"],
  [2019, "paris", "“My radio, my voice”: Community radio in Bangladesh educating and empowering local communities", "World Journalism Education Congress"],
  [2019, "paris", "Teens take to the street on road safety in Bangladesh", "World Journalism Education Congress"],
  [2019, "norman", "Communication inequality: A time series analysis of access to information across countries", "AEJMC Midwinter Conference"],
  [2019, "norman", "Framing of law enforcement in political advertisements: A content analysis of the 2014 U.S. Senate campaign", "AEJMC Midwinter Conference"],
  [2019, "orlando", "Golden goals: How a new NHL franchise responded to tragedy", "International Public Relations Research Conference"],
  [2018, "denver", "Course-sourcing for collaboration: The Diplomacy Lab Initiative", "SWECJMC Symposium"],
  [2018, "norman", "Community radio in Bangladesh: Low-power technology with high-power capabilities?", "AEJMC Midwinter Conference"],
  [2017, "phoenix", "“Bottomless Basket” to “Beautiful Bangladesh”: A test of bleed-over effect of tourism advertising", "SWECJMC Symposium"],
  [2017, "chicago", "Changing their minds? How tourism advertising affects the international country image of Bangladesh", "AEJMC Annual Conference"],
  [2017, "houston", "Information processing and persuasion: Terrorist groups' effort at radicalization via the Internet", "International Communication Conference"],
  [2017, "houston", "Public diplomacy through social media: The case of U.S. diplomatic missions in Latin America", "International Communication Conference"],
  [2017, "houston", "Social media are failing to successfully bring about social change: A case study of the “Stop Kony” campaign", "International Communication Conference"],
  [2017, "norman", "Online porn and the cultivation of sexual behavior", "AEJMC Midwinter Conference"],
  [2017, "norman", "Using text analytics to understand public opinion. The 2015 Nepal earthquake: A case study", "AEJMC Midwinter Conference"],
  [2017, "norman", "Listening and engaging: Interacting with audiences through social media", "AEJMC Midwinter Conference"],
  [2016, "minneapolis", "A different kind of restriction on press freedom in Bangladesh: “Show me the money” (panel)", "AEJMC Annual Convention"],
  [2016, "aspen", "Engaged partnerships as pathways to transformation in Bangladesh", "Aspen Conference on Engaged Communication Scholarship"],
  [2016, "auckland", "Journalism education in Bangladesh: Struggling to keep up with an ever-expanding media industry", "World Journalism Education Congress"],
  [2016, "norman", "Empowering emerging leaders in South Asia through non-traditional leadership communication", "AEJMC Midwinter Conference"],
  [2015, "edmond", "Influencing voter behavior?", "Oklahoma Political Science Association Conference"],
  [2015, "sanfrancisco", "From “bottomless basket” to “beautiful Bangladesh”: A case study of nation branding through public diplomacy", "AEJMC Annual Conference"],
  [2015, "hartford", "Messaging for change: Empowering communities through purpose-based communication (panel)", "Student Communication Research Conference"],
  [2015, "norman", "Coming to America: Trials and tribulations of international faculty and students in the United States (panel)", "AEJMC Midwinter Conference"],
  [2014, "norman", "The use of media in conflict prevention and peace building", "AEJMC Midwinter Conference"]
];
