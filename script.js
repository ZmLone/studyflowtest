window.onerror = function(msg, url, line) {
    console.error("Global Error:", msg);
    const el = document.getElementById('global-error');
    const txt = document.getElementById('global-error-msg');
    if(el && txt) {
        el.classList.remove('hidden');
        txt.textContent = `${msg}`;
    }
};
window.showToast = function(message) {
    // 1. Create Wrapper for POSITIONING (Fixed, Centered, No Animation)
    // This ensures the element stays perfectly centered regardless of inner animations
    const wrapper = document.createElement('div');
    wrapper.className = "fixed bottom-24 left-1/2 -translate-x-1/2 z-[100] pointer-events-none";

    // 2. Create Toast for STYLING & ANIMATION
    // We removed the positioning classes from here to avoid conflicts
    const toast = document.createElement('div');
    toast.className = "bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-6 py-3 rounded-2xl font-bold text-sm shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-bottom-4 duration-300 pointer-events-auto";
    toast.innerHTML = `<i data-lucide="sparkles" class="w-4 h-4 text-brand-500"></i> ${message}`;
    
    // 3. Assemble
    wrapper.appendChild(toast);
    document.body.appendChild(wrapper);

    // Initialize icons
    if(window.lucide) lucide.createIcons({ root: toast });

    // 4. Remove after 4 seconds (Animate out inner toast, then remove wrapper)
    setTimeout(() => {
        toast.classList.add('animate-out', 'fade-out', 'slide-out-to-bottom-4');
        setTimeout(() => wrapper.remove(), 300);
    }, 4000);
};

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
        import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged, signInAnonymously, signInWithCustomToken } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
 import { getFirestore, doc, setDoc, getDoc, onSnapshot, collection, getDocs, query, orderBy, limit } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";       

        // --- PASTE YOUR FIREBASE CONFIG HERE ---
        const YOUR_FIREBASE_CONFIG = {
            apiKey: "AIzaSyDcQsD4kPTl4KpU4wphfkNjizPsUMQO64M",
            authDomain: "mystudyplan-74b62.firebaseapp.com",
            projectId: "mystudyplan-74b62",
            storageBucket: "mystudyplan-74b62.firebasestorage.app",
            messagingSenderId: "196958661158",
            appId: "1:196958661158:web:e553fa59e4f21f205e14e7"
        };
        // ----------------------------------------

        let app, auth, db;
        let isFirebaseActive = false;
        let currentUser = null;
        let unsubscribeDoc = null;
        
        // Use global app_id variable if available
        const globalAppId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';

        // Premium Sound with Error Handling
        const successSound = new Audio('https://assets.mixkit.co/active_storage/sfx/2000/2000-preview.mp3');
        successSound.volume = 0.5;

        // Determine Environment
        const isCanvasEnv = typeof __firebase_config !== 'undefined';
        const hasUserConfig = YOUR_FIREBASE_CONFIG.apiKey !== "";

        if (isCanvasEnv) {
            const canvasConfig = JSON.parse(__firebase_config);
            app = initializeApp(canvasConfig);
            auth = getAuth(app);
            db = getFirestore(app);
            isFirebaseActive = true;
            if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
                signInWithCustomToken(auth, __initial_auth_token);
            } else {
                signInAnonymously(auth);
            }
        } else if (hasUserConfig) {
            app = initializeApp(YOUR_FIREBASE_CONFIG);
            auth = getAuth(app);
            db = getFirestore(app);
            isFirebaseActive = true;
        }
        
        // Helper to safely get document reference based on environment rules
        function getSafeDocRef(uid) {
            const collectionName = "studyData";
            const docName = "main";
            
            if (isCanvasEnv) {
                // Rule: artifacts/{appId}/users/{userId}/{collectionName}
                return doc(db, 'artifacts', globalAppId, 'users', uid, collectionName, docName);
            } else {
                // Default fallback for external hosting
                return doc(db, 'users', uid, collectionName, docName);
            }
        }

 // ==========================================
 // ==========================================
    // 🔐 VIP AUTHENTICATION (Final Fixed Version)
    // ==========================================

    // 1. VIP GUEST LIST
    const allowedEmails = [
        "neo719076@gmail.com"  // <--- REPLACE WITH YOUR EMAIL
            ];

    window.handleAuth = async (mode) => {
        const emailField = document.getElementById('auth-email');
        const passField = document.getElementById('auth-pass');
        const loader = document.getElementById('auth-loader');
        const btnText = document.getElementById('auth-btn-text');

        const email = emailField.value.toLowerCase().trim();
        const pass = passField.value;

        // START SPINNER: Show loader, hide text
        if(loader) loader.classList.remove('hidden');
        if(btnText) btnText.classList.add('opacity-0');

        try {
            // 🛑 BOUNCER CHECK (Only runs if mode is 'signup')
            if (mode === 'signup' || mode === 'register') {
                const isAllowed = allowedEmails.some(allowed => allowed.toLowerCase() === email);
                
                if (!isAllowed) {
                    throw new Error("VIP_ONLY"); 
                }
                
                // Create User
                await createUserWithEmailAndPassword(auth, email, pass);
                
                showPopup('success', 'Welcome Aboard! 🚀', 'Your account has been created successfully!');
            } 
            else {
                // Login User
                await signInWithEmailAndPassword(auth, email, pass);
            }

        } catch (error) {
            console.error("Auth Error:", error);

            // 🚨 HANDLE ERRORS WITH POPUPS
            if (error.message === "VIP_ONLY") {
                showPopup('error', 'Invite Only', 'Sorry! This app is currently exclusively for VIP members.\n\nPlease contact the developer to get access.');
            } else if (error.code === 'auth/invalid-credential' || error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
                showPopup('error', 'Account Not Found', 'It looks like you are a new user or the password is wrong.\n\nIf you are new, please create an account first!');
            } else if (error.code === 'auth/email-already-in-use') {
                showPopup('info', 'Already Registered', 'This email is already registered.\nPlease Log In instead.');
            } else if (error.code === 'auth/weak-password') {
                showPopup('error', 'Weak Password', 'Password must be at least 6 characters.');
            } else if (error.code === 'auth/too-many-requests') {
                showPopup('error', 'Too Many Attempts', 'Access blocked due to many failed attempts. Try again later.');
            } else {
                showPopup('error', 'Authentication Failed', error.message);
            }
        } finally {
            // ✅ STOP SPINNER (This runs no matter what!)
            if(loader) loader.classList.add('hidden');
            if(btnText) btnText.classList.remove('opacity-0');
        }
    };  


        // FIXED: Added unsubscribeDoc() call to prevent memory leak
        window.handleLogout = async () => {
            if(isFirebaseActive) {
                if (unsubscribeDoc) {
                    unsubscribeDoc();
                    unsubscribeDoc = null;
                }
                await signOut(auth);
                state.tasks = {};
                state.dailyTestsAttempted = {};
                state.mistakes = []; // Reset mistakes on logout
                state.expandedFocusGroups = {};
                state.expandedTests = {};
                renderAll();
                document.getElementById('auth-modal').classList.remove('hidden');
            } else {
                if(confirm("Exit Demo Mode? This will revert to the login screen.")) {
                    localStorage.removeItem('studyflow_demo_mode');
                    location.reload();
                }
            }
        };

        window.startDemoMode = () => {
            localStorage.setItem('studyflow_demo_mode', 'true');
            document.getElementById('auth-modal').classList.add('hidden');
            initLocalMode();
        };

// --- DARK MODE LOGIC ---
window.toggleTheme = function() {
    const html = document.documentElement;
    if (html.classList.contains('dark')) {
        html.classList.remove('dark');
        localStorage.setItem('theme', 'light');
        // Removed 'theme-text' update since the element doesn't exist
    } else {
        html.classList.add('dark');
        localStorage.setItem('theme', 'dark');
        // Removed 'theme-text' update
    }
};

// Initialize Theme (Default to Dark)
if (localStorage.theme === 'light') {
    document.documentElement.classList.remove('dark');
} else {
    document.documentElement.classList.add('dark');
}


        // --- DATA ---
const mainSchedule = [
   // --- CURRENT ACTIVE TARGET: AIATS-4 (JAN 18) ---
   {
       name: "AIATS-4",
       date: new Date('2026-01-18T00:00:00'),
       syllabus: [
           // --- PHYSICS ---
           { 
               subject: "Physics", 
               topic: "Thermal Properties of Matter", 
               dailyTests: [
                   {name:"DT-38 (Phy-XI)", subs:["Temperature", "Ideal Gas Equation", "Thermal Expansion"]},
                   {name:"DT-39 (Phy-XI)", subs:["Calorimetry", "Change of State"]},
                   {name:"DT-40 (Phy-XI)", subs:["Heat Transfer: Conduction", "Heat Transfer: Convection"]},
                   {name:"DT-41 (Phy-XI)", subs:["Heat Transfer: Radiation", "Stefan's Law", "Wien's Law"]}
               ] 
           },
           { 
               subject: "Physics", 
               topic: "Thermodynamics", 
               dailyTests: [
                   {name:"DT-42 (Phy-XI)", subs:["First Law of Thermodynamics", "Internal Energy"]},
                   {name:"DT-43 (Phy-XI)", subs:["Thermodynamic Processes"]},
                   {name:"DT-44 (Phy-XI)", subs:["Heat Engines", "Carnot Engine", "Second Law of Thermodynamics"]}
               ] 
           },
           { 
               subject: "Physics", 
               topic: "Kinetic Theory", 
               dailyTests: [
                   {name:"DT-45 (Phy-XI)", subs:["Kinetic Theory Postulates", "Law of Equipartition of Energy", "Mean Free Path"]}
               ] 
           },
           { 
               subject: "Physics", 
               topic: "Oscillations", 
               dailyTests: [
                   {name:"DT-46 (Phy-XI)", subs:["SHM Equation", "Uniform Circular Motion"]},
                   {name:"DT-47 (Phy-XI)", subs:["Energy in SHM", "Force Law"]},
                   {name:"DT-48 (Phy-XI)", subs:["Simple Pendulum", "Spring Systems"]}
               ] 
           },
           { 
               subject: "Physics", 
               topic: "Waves", 
               dailyTests: [
                   {name:"DT-49 (Phy-XI)", subs:["Transverse Waves", "Longitudinal Waves"]},
                   {name:"DT-50 (Phy-XI)", subs:["Speed of Travelling Wave"]},
                   {name:"DT-51 (Phy-XI)", subs:["Superposition Principle", "Reflection of Waves", "Beats"]}
               ] 
           },

           // --- CHEMISTRY ---
           { 
               subject: "Chemistry", 
               topic: "Solutions", 
               dailyTests: [
                   {name:"DT-1 (Chem-XII)", subs:["Henry's Law", "Raoult's Law"]},
                   {name:"DT-2 (Chem-XII)", subs:["Colligative Properties", "Van't Hoff Factor"]}
               ] 
           },
           { 
               subject: "Chemistry", 
               topic: "Chemical Kinetics", 
               dailyTests: [
                   {name:"DT-7 (Chem-XII)", subs:["Rate Laws", "Order of Reaction", "Integrated Rate Equation"]},
                   {name:"DT-8 (Chem-XII)", subs:["Pseudo 1st Order Reaction", "Arrhenius Equation"]},
                   {name:"DT-9 (Chem-XII)", subs:["Effect of Catalyst", "Collision Theory"]}
               ] 
           },
           { 
               subject: "Chemistry", 
               topic: "GOC: Organic Basics", 
               dailyTests: [
                   {name:"DT-23 (Chem-XI)", subs:["IUPAC Nomenclature"]},
                   {name:"DT-24 (Chem-XI)", subs:["Isomerism", "Nucleophiles & Electrophiles"]},
                   {name:"DT-25 (Chem-XI)", subs:["Inductive Effect", "Resonance", "Hyperconjugation"]},
                   {name:"DT-26 (Chem-XI)", subs:["Carbocation", "Carbanion", "Free Radicals"]},
                   {name:"DT-27 (Chem-XI)", subs:["Purification Methods", "Qualitative Analysis", "Quantitative Analysis"]}
               ] 
           },

           // --- BOTANY ---
           { 
               subject: "Botany", 
               topic: "Photosynthesis in Higher Plants", 
               dailyTests: [
                   {name:"DT-26 (Bot-XI)", subs:["Light Reaction", "Electron Transport System (ETS)"]},
                   {name:"DT-27 (Bot-XI)", subs:["C3 Cycle", "C4 Cycle", "Photorespiration"]}
               ] 
           },
           { 
               subject: "Botany", 
               topic: "Respiration in Plants", 
               dailyTests: [
                   {name:"DT-28 (Bot-XI)", subs:["Glycolysis", "Fermentation", "Krebs Cycle"]},
                   {name:"DT-29 (Bot-XI)", subs:["ETS", "Oxidative Phosphorylation", "Respiratory Quotient"]}
               ] 
           },
           { 
               subject: "Botany", 
               topic: "Plant Growth & Development", 
               dailyTests: [
                   {name:"DT-30 (Bot-XI)", subs:["Growth Phases", "Growth Rates", "Differentiation"]},
                   {name:"DT-31 (Bot-XI)", subs:["Auxins", "Gibberellins", "Cytokinins"]},
                   {name:"DT-32 (Bot-XI)", subs:["Ethylene", "Abscisic Acid (ABA)", "Seed Germination"]}
               ] 
           },

           // --- ZOOLOGY ---
           { 
               subject: "Zoology", 
               topic: "Chemical Coordination", 
               dailyTests: [
                   {name:"DT-25 (Zoo-XI)", subs:["Hypothalamus", "Pituitary Gland"]},
                   {name:"DT-26 (Zoo-XI)", subs:["Thyroid Gland", "Parathyroid Gland", "Adrenal Gland"]},
                   {name:"DT-27 (Zoo-XI)", subs:["Pineal Gland", "Thymus", "Pancreas"]},
                   {name:"DT-28 (Zoo-XI)", subs:["Gonads", "Mechanism of Hormone Action"]}
               ] 
           },
           { 
               subject: "Zoology", 
               topic: "Animal Kingdom", 
               dailyTests: [
                   {name:"DT-29 (Zoo-XI)", subs:["Basis of Classification"]},
                   {name:"DT-30 (Zoo-XI)", subs:["Porifera (Sponges)"]},
                   {name:"DT-31 (Zoo-XI)", subs:["Cnidaria (Coelenterata)"]},
                   {name:"DT-32 (Zoo-XI)", subs:["Ctenophora", "Platyhelminthes"]},
                   {name:"DT-33 (Zoo-XI)", subs:["Aschelminthes", "Annelida"]},
                   {name:"DT-34 (Zoo-XI)", subs:["Arthropoda", "Mollusca"]},
                   {name:"DT-35 (Zoo-XI)", subs:["Echinodermata", "Hemichordata"]},
                   {name:"DT-36 (Zoo-XI)", subs:["Chordata Basics", "Cyclostomata", "Pisces"]},
                   {name:"DT-37 (Zoo-XI)", subs:["Amphibia"]},
                   {name:"DT-38 (Zoo-XI)", subs:["Reptilia"]},
                   {name:"DT-39 (Zoo-XI)", subs:["Aves (Birds)"]},
                   {name:"DT-40 (Zoo-XI)", subs:["Mammalia"]}
               ] 
           },
           { 
               subject: "Zoology", 
               topic: "Structural Org (Animals)", 
               dailyTests: [
                   {name:"DT-41 (Zoo-XI)", subs:["Cockroach: Morphology"]},
                   {name:"DT-42 (Zoo-XI)", subs:["Cockroach: Digestive System", "Cockroach: Respiratory System", "Cockroach: Circulatory System"]},
                   {name:"DT-43 (Zoo-XI)", subs:["Cockroach: Nervous System", "Cockroach: Reproductive System", "Cockroach: Excretory System"]},
                   {name:"DT-44 (Zoo-XI)", subs:["Frog: Morphology", "Frog: Anatomy (All Systems)"]}
               ] 
           }
       ]
   },

   // --- AIATS-5 (FEB 8) ---
   {
       name: "AIATS-5",
       date: new Date('2026-02-08T00:00:00'),
       syllabus: [
           {
               subject: "Physics",
               topic: "Electrostatics",
               dailyTests: [
                   {name:"DT-1 (Phy-XII)", subs:["Electric Charges"]},
                   {name:"DT-2 (Phy-XII)", subs:["Coulomb's Law"]},
                   {name:"DT-3 (Phy-XII)", subs:["Electric Field"]},
                   {name:"DT-4 (Phy-XII)", subs:["Field Lines", "Electric Dipole"]},
                   {name:"DT-5 (Phy-XII)", subs:["Electric Flux", "Gauss's Law"]},
                   {name:"DT-6 (Phy-XII)", subs:["Electrostatic Potential"]},
                   {name:"DT-7 (Phy-XII)", subs:["Equipotential Surfaces"]},
                   {name:"DT-8 (Phy-XII)", subs:["Conductors", "Dielectrics", "Polarization"]},
                   {name:"DT-9 (Phy-XII)", subs:["Capacitors"]},
                   {name:"DT-10 (Phy-XII)", subs:["Combination of Capacitors", "Van de Graff Generator"]}
               ]
           },
           {
               subject: "Physics",
               topic: "Current Electricity",
               dailyTests: [
                   {name:"DT-11 (Phy-XII)", subs:["Ohm's Law", "Drift Velocity"]},
                   {name:"DT-12 (Phy-XII)", subs:["Resistors Combination"]},
                   {name:"DT-13 (Phy-XII)", subs:["Cells", "EMF", "Internal Resistance"]},
                   {name:"DT-14 (Phy-XII)", subs:["Kirchhoff's Laws"]},
                   {name:"DT-15 (Phy-XII)", subs:["Wheatstone Bridge", "Potentiometer"]}
               ]
           },
           {
               subject: "Chemistry",
               topic: "Hydrocarbons (XI)",
               dailyTests: [
                   {name:"DT-28 (Chem-XI)", subs:["Alkanes: Prep & Properties"]},
                   {name:"DT-29 (Chem-XI)", subs:["Alkenes: Prep & Properties"]},
                   {name:"DT-30 (Chem-XI)", subs:["Alkynes", "Aromatic Hydrocarbons"]}
               ]
           },
           {
               subject: "Chemistry",
               topic: "Haloalkanes & Haloarenes",
               dailyTests: [
                   {name:"DT-16 (Chem-XII)", subs:["Haloalkanes: Prep", "Physical Properties"]},
                   {name:"DT-17 (Chem-XII)", subs:["SN1 Mechanism", "SN2 Mechanism"]},
                   {name:"DT-18 (Chem-XII)", subs:["Elimination Reactions", "Reaction with Metals"]},
                   {name:"DT-19 (Chem-XII)", subs:["Haloarenes"]}
               ]
           },
           {
               subject: "Chemistry",
               topic: "Alcohols, Phenols & Ethers",
               dailyTests: [
                   {name:"DT-20 (Chem-XII)", subs:["Alcohols Prep", "Nomenclature"]},
                   {name:"DT-21 (Chem-XII)", subs:["Phenols Prep", "Phenols Reactions"]},
                   {name:"DT-22 (Chem-XII)", subs:["Ethers Prep", "Ethers Properties"]}
               ]
           },
           {
               subject: "Chemistry",
               topic: "Aldehydes, Ketones & Carboxylic",
               dailyTests: [
                   {name:"DT-23 (Chem-XII)", subs:["Aldehydes Prep", "Ketones Prep", "Nucleophilic Addition"]},
                   {name:"DT-24 (Chem-XII)", subs:["Carboxylic Acids", "Aldehyde Oxidation"]}
               ]
           },
           {
               subject: "Botany",
               topic: "Sexual Reproduction in Plants",
               dailyTests: [
                   {name:"DT-1 (Bot-XII)", subs:["Flower Structure", "Microsporogenesis"]},
                   {name:"DT-2 (Bot-XII)", subs:["Pistil", "Megasporangium (Ovule)"]},
                   {name:"DT-3 (Bot-XII)", subs:["Pollination"]},
                   {name:"DT-4 (Bot-XII)", subs:["Outbreeding Devices", "Double Fertilization"]},
                   {name:"DT-5 (Bot-XII)", subs:["Seed", "Fruit", "Apomixis"]}
               ]
           },
           {
               subject: "Botany",
               topic: "Principles of Inheritance",
               dailyTests: [
                   {name:"DT-6 (Bot-XII)", subs:["Mendelian Genetics", "Incomplete Dominance"]},
                   {name:"DT-7 (Bot-XII)", subs:["Co-dominance", "Epistasis"]},
                   {name:"DT-8 (Bot-XII)", subs:["Linkage", "Mutation"]},
                   {name:"DT-9 (Bot-XII)", subs:["Genetic Disorders", "Pedigree Analysis"]}
               ]
           },
           {
               subject: "Zoology",
               topic: "Human Reproduction",
               dailyTests: [
                   {name:"DT-1 (Zoo-XII)", subs:["Male Reproductive System"]},
                   {name:"DT-2 (Zoo-XII)", subs:["Female Reproductive System"]},
                   {name:"DT-3 (Zoo-XII)", subs:["Spermatogenesis"]},
                   {name:"DT-4 (Zoo-XII)", subs:["Oogenesis"]},
                   {name:"DT-5 (Zoo-XII)", subs:["Menstrual Cycle"]},
                   {name:"DT-6 (Zoo-XII)", subs:["Pregnancy", "Parturition"]}
               ]
           },
           {
               subject: "Zoology",
               topic: "Reproductive Health",
               dailyTests: [
                   {name:"DT-7 (Zoo-XII)", subs:["Population Stabilization"]},
                   {name:"DT-8 (Zoo-XII)", subs:["Contraception Methods"]},
                   {name:"DT-9 (Zoo-XII)", subs:["Infertility", "STIs", "ART"]}
               ]
           }
       ]
   },

   // --- UT-11 (FEB 22) ---
   {
       name: "UT-11",
       date: new Date('2026-02-22T00:00:00'),
       syllabus: [
           {
               subject: "Physics",
               topic: "Nuclei",
               dailyTests: [
                   {name:"DT-36 (Phy-XII)", subs:["Binding Energy", "Radioactivity"]}
               ]
           },
           {
               subject: "Physics",
               topic: "Semiconductors",
               dailyTests: [
                   {name:"DT-37 (Phy-XII)", subs:["Diode Basics", "PN Junction"]},
                   {name:"DT-38 (Phy-XII)", subs:["Rectifiers", "Transistors (Intro)"]}
               ]
           },
           {
               subject: "Chemistry",
               topic: "Equilibrium (XI)",
               dailyTests: [
                   {name:"DT-17 (Chem-XI)", subs:["Chemical Equilibrium"]},
                   {name:"DT-18 (Chem-XI)", subs:["Ionic Equilibrium", "pH Scale"]},
                   {name:"DT-19 (Chem-XI)", subs:["Buffer Solutions", "Solubility Product"]}
               ]
           },
           {
               subject: "Chemistry",
               topic: "p-Block Elements (XII Rev)",
               dailyTests: [
                   {name:"Rev (Chem-XII)", subs:["Group 15 Revision", "Group 16 Revision", "Group 17 Revision", "Group 18 Revision"]}
               ]
           },
           {
               subject: "Chemistry",
               topic: "Organic Revision",
               dailyTests: [
                   {name:"Rev (Chem-XII)", subs:["Aldehydes Revision", "Ketones Revision", "Carboxylic Acids Revision"]}
               ]
           },
           {
               subject: "Botany",
               topic: "Organisms & Populations",
               dailyTests: [
                   {name:"DT-17 (Bot-XII)", subs:["Abiotic Factors"]},
                   {name:"DT-18 (Bot-XII)", subs:["Population Interactions", "Growth Models"]}
               ]
           },
           {
               subject: "Botany",
               topic: "Ecosystem",
               dailyTests: [
                   {name:"DT-19 (Bot-XII)", subs:["Structure", "Productivity"]},
                   {name:"DT-20 (Bot-XII)", subs:["Energy Flow", "Ecological Pyramids"]}
               ]
           },
           {
               subject: "Botany",
               topic: "Biodiversity (Rev)",
               dailyTests: [
                   {name:"Rev (Bot-XII)", subs:["Biodiversity Revision", "Conservation Revision"]}
               ]
           },
           {
               subject: "Zoology",
               topic: "Biotech: Principles",
               dailyTests: [
                   {name:"DT-21 (Zoo-XII)", subs:["Tools (Enzymes)", "Vectors"]},
                   {name:"DT-22 (Zoo-XII)", subs:["Processes (PCR)", "Downstream Processing"]}
               ]
           },
           {
               subject: "Zoology",
               topic: "Biotech Apps (Rev)",
               dailyTests: [
                   {name:"Rev (Zoo-XII)", subs:["Biotech Applications Revision"]}
               ]
           },
           {
               subject: "Zoology",
               topic: "Human Repro (Rev)",
               dailyTests: [
                   {name:"Rev (Zoo-XII)", subs:["Human Reproduction Revision"]}
               ]
           }
       ]
   },

   // --- AIATS-6 (MAR 8) ---
   {
       name: "AIATS-6",
       date: new Date('2026-03-08T00:00:00'),
       syllabus: [
           {
               subject: "Physics",
               topic: "Moving Charges & Magnetism",
               dailyTests: [
                   {name:"DT-16 (Phy-XII)", subs:["Magnetic Force"]},
                   {name:"DT-17 (Phy-XII)", subs:["Biot-Savart Law"]},
                   {name:"DT-18 (Phy-XII)", subs:["Ampere's Law"]},
                   {name:"DT-19 (Phy-XII)", subs:["Torque on Loop", "Galvanometer"]}
               ]
           },
           {
               subject: "Physics",
               topic: "Magnetism & Matter",
               dailyTests: [
                   {name:"DT-20 (Phy-XII)", subs:["Magnetic Dipole", "Magnetic Flux"]},
                   {name:"DT-21 (Phy-XII)", subs:["Earth's Magnetism", "Magnetic Properties"]}
               ]
           },
           {
               subject: "Physics",
               topic: "EMI",
               dailyTests: [
                   {name:"DT-22 (Phy-XII)", subs:["Faraday's Law", "Lenz's Law"]},
                   {name:"DT-23 (Phy-XII)", subs:["Inductance", "Eddy Currents"]}
               ]
           },
           {
               subject: "Physics",
               topic: "Alternating Current",
               dailyTests: [
                   {name:"DT-24 (Phy-XII)", subs:["LCR Circuit", "Phasors"]},
                   {name:"DT-25 (Phy-XII)", subs:["Power in AC", "Transformers"]}
               ]
           },
           {
               subject: "Physics",
               topic: "EM Waves",
               dailyTests: [
                   {name:"DT-26 (Phy-XII)", subs:["EM Spectrum", "Properties of EM Waves"]}
               ]
           },
           {
               subject: "Chemistry",
               topic: "d & f Block Elements",
               dailyTests: [
                   {name:"DT-13 (Chem-XII)", subs:["d-Block Properties", "KMnO4 / K2Cr2O7"]},
                   {name:"DT-14 (Chem-XII)", subs:["f-Block (Lanthanoids)", "Actinoids"]}
               ]
           },
           {
               subject: "Chemistry",
               topic: "Coordination Compounds",
               dailyTests: [
                   {name:"DT-15 (Chem-XII)", subs:["Nomenclature", "Isomerism"]},
                   {name:"DT-16 (Chem-XII)", subs:["Bonding (VBT)", "Crystal Field Theory (CFT)"]}
               ]
           },
           {
               subject: "Chemistry",
               topic: "Amines",
               dailyTests: [
                   {name:"DT-25 (Chem-XII)", subs:["Amines Preparation", "Physical Properties"]},
                   {name:"DT-26 (Chem-XII)", subs:["Chemical Reactions", "Diazonium Salts"]}
               ]
           },
           {
               subject: "Botany",
               topic: "Molecular Basis of Inheritance",
               dailyTests: [
                   {name:"DT-10 (Bot-XII)", subs:["DNA Structure", "Packaging"]},
                   {name:"DT-11 (Bot-XII)", subs:["Replication", "RNA World"]},
                   {name:"DT-12 (Bot-XII)", subs:["Transcription"]},
                   {name:"DT-13 (Bot-XII)", subs:["Translation", "Genetic Code"]},
                   {name:"DT-14 (Bot-XII)", subs:["Regulation (Lac Operon)", "DNA Fingerprinting"]}
               ]
           },
           {
               subject: "Botany",
               topic: "Microbes in Human Welfare",
               dailyTests: [
                   {name:"DT-15 (Bot-XII)", subs:["Household Products", "Industrial Products"]},
                   {name:"DT-16 (Bot-XII)", subs:["Sewage Treatment", "Biogas Production"]}
               ]
           },
           {
               subject: "Zoology",
               topic: "Human Health & Disease",
               dailyTests: [
                   {name:"DT-15 (Zoo-XII)", subs:["Pathogens (Bacteria/Virus/Fungi)"]},
                   {name:"DT-16 (Zoo-XII)", subs:["Immunity", "Malaria Life Cycle"]},
                   {name:"DT-17 (Zoo-XII)", subs:["Vaccination", "Allergy"]},
                   {name:"DT-18 (Zoo-XII)", subs:["AIDS"]},
                   {name:"DT-19 (Zoo-XII)", subs:["Cancer"]},
                   {name:"DT-20 (Zoo-XII)", subs:["Drugs", "Alcohol Abuse"]}
               ]
           }
       ]
   },

   // --- AIATS-7 (MAR 22) ---
   {
       name: "AIATS-7",
       date: new Date('2026-03-22T00:00:00'),
       syllabus: [
           {
               subject: "Physics",
               topic: "Ray Optics",
               dailyTests: [
                   {name:"DT-27 (Phy-XII)", subs:["Reflection (Mirrors)"]},
                   {name:"DT-28 (Phy-XII)", subs:["Refraction (Lenses)"]},
                   {name:"DT-29 (Phy-XII)", subs:["Prism", "Dispersion"]},
                   {name:"DT-30 (Phy-XII)", subs:["Optical Instruments"]}
               ]
           },
           {
               subject: "Physics",
               topic: "Modern Physics (Rev)",
               dailyTests: [
                   {name:"Rev (Phy-XII)", subs:["Dual Nature Revision", "Atoms Revision", "Nuclei Revision"]}
               ]
           },
           {
               subject: "Chemistry",
               topic: "Biomolecules",
               dailyTests: [
                   {name:"DT-27 (Chem-XII)", subs:["Carbohydrates", "Proteins", "Nucleic Acids"]}
               ]
           },
           {
               subject: "Chemistry",
               topic: "p-Block (Rev)",
               dailyTests: [
                   {name:"Rev (Chem-XII)", subs:["p-Block Revision"]}
               ]
           },
           {
               subject: "Botany",
               topic: "Ecology (Rev)",
               dailyTests: [
                   {name:"Rev (Bot-XII)", subs:["Ecology Revision"]}
               ]
           },
           {
               subject: "Zoology",
               topic: "Biotech (Rev)",
               dailyTests: [
                   {name:"DT-25 (Zoo-XII)", subs:["Transgenic Animals", "Biopiracy"]},
                   {name:"Rev (Zoo-XII)", subs:["Biotech Revision"]}
               ]
           }
       ]
   },

   // --- FULL SYLLABUS MOCK TESTS ---
   {
       name: "FST-1",
       date: new Date('2026-03-27T00:00:00'),
       syllabus: [ { subject: "General", topic: "Full Syllabus (XI + XII)", dailyTests: [{name:"Mock-1", subs:["Complete Physics", "Complete Chemistry", "Complete Biology"]}] } ]
   },
   {
       name: "AIATS-8",
       date: new Date('2026-04-05T00:00:00'),
       syllabus: [ { subject: "General", topic: "Full Syllabus NEET Pattern", dailyTests: [{name:"Mock-2", subs:["Complete Physics", "Complete Chemistry", "Complete Biology"]}] } ]
   },
   {
       name: "FST-2",
       date: new Date('2026-04-10T00:00:00'),
       syllabus: [ { subject: "General", topic: "Full Syllabus (XI + XII)", dailyTests: [{name:"Mock-3", subs:["Complete Physics", "Complete Chemistry", "Complete Biology"]}] } ]
   },
   {
       name: "AIATS-9",
       date: new Date('2026-04-12T00:00:00'),
       syllabus: [ { subject: "General", topic: "Full Syllabus NEET Pattern", dailyTests: [{name:"Mock-4", subs:["Complete Physics", "Complete Chemistry", "Complete Biology"]}] } ]
   },
   {
       name: "FST-3",
       date: new Date('2026-04-17T00:00:00'),
       syllabus: [ { subject: "General", topic: "Full Syllabus (XI + XII)", dailyTests: [{name:"Mock-5", subs:["Complete Physics", "Complete Chemistry", "Complete Biology"]}] } ]
   },
   {
       name: "AIATS-10",
       date: new Date('2026-04-19T00:00:00'),
       syllabus: [ { subject: "General", topic: "Full Syllabus NEET Pattern", dailyTests: [{name:"Mock-6", subs:["Complete Physics", "Complete Chemistry", "Complete Biology"]}] } ]
   },
   {
       name: "FST-4",
       date: new Date('2026-04-24T00:00:00'),
       syllabus: [ { subject: "General", topic: "Full Syllabus (XI + XII)", dailyTests: [{name:"Mock-7", subs:["Complete Physics", "Complete Chemistry", "Complete Biology"]}] } ]
   },
   {
       name: "AIATS-11",
       date: new Date('2026-04-26T00:00:00'),
       syllabus: [ { subject: "General", topic: "Full Syllabus NEET Pattern", dailyTests: [{name:"Mock-8", subs:["Complete Physics", "Complete Chemistry", "Complete Biology"]}] } ]
   }
];
// --- REPLACED BACKLOG PLAN (Detailed & Complete Class 11 Syllabus) ---
const backlogPlan = {
   name: "60-Day Recovery",
   startDate: new Date('2026-01-29T00:00:00'), // Starts Jan 29
   date: new Date('2026-03-30T00:00:00'), 
   syllabus: [
       // ============================================================
       // PHASE 1: Jan 29 - Feb 12 (15 Days)
       // Focus: Oscillations, Waves, Cell Biology, Atomic Structure
       // ============================================================
       
       // --- PHYSICS: Unit 10 (Oscillations & Waves) ---
       {
           phase: 1, unit: "Oscillations & Waves", subject: "Physics", topic: "Oscillations",
           dailyTests: [
               {name:"DT-46 (Phy-XI)", subs:["Periodic Motion & SHM Equation", "Phase & Phase Difference"]},
               {name:"DT-47 (Phy-XI)", subs:["Velocity & Acceleration in SHM", "Graphs of SHM"]},
               {name:"DT-48 (Phy-XI)", subs:["Energy in SHM (KE, PE, Total)", "Spring-Mass Systems (Series/Parallel)"]},
               {name:"DT-49 (Phy-XI)", subs:["Simple Pendulum", "Damped & Forced Oscillations"]}
           ]
       },
       {
           phase: 1, unit: "Oscillations & Waves", subject: "Physics", topic: "Waves",
           dailyTests: [
               {name:"DT-50 (Phy-XI)", subs:["Transverse & Longitudinal Waves", "Equation of Travelling Wave"]},
               {name:"DT-51 (Phy-XI)", subs:["Speed of Wave (String/Sound)", "Newton's Formula & Laplace Correction"]},
               {name:"DT-52 (Phy-XI)", subs:["Superposition Principle", "Reflection of Waves"]},
               {name:"DT-53 (Phy-XI)", subs:["Standing Waves (Organ Pipes)", "Beats & Doppler Effect"]}
           ]
       },

       // --- BIOLOGY: Unit 3 (Cell Structure & Function) ---
       {
           phase: 1, unit: "Cell Structure", subject: "Biology", topic: "Cell: The Unit of Life",
           dailyTests: [
               {name:"DT-1 (Bot-XI)", subs:["Cell Theory", "Prokaryotic Cell Structure"]},
               {name:"DT-2 (Bot-XI)", subs:["Eukaryotic Cell Membrane", "Cell Wall & Endomembrane System"]},
               {name:"DT-3 (Bot-XI)", subs:["Mitochondria & Plastids", "Ribosomes & Cytoskeleton"]},
               {name:"DT-4 (Bot-XI)", subs:["Cilia, Flagella & Centrosomes", "Nucleus & Chromosomes"]}
           ]
       },
       {
           phase: 1, unit: "Cell Structure", subject: "Biology", topic: "Biomolecules",
           dailyTests: [
               {name:"DT-10 (Zoo-XI)", subs:["Carbohydrates (Mono/Di/Poly)", "Lipids & Fatty Acids"]},
               {name:"DT-11 (Zoo-XI)", subs:["Amino Acids & Proteins (Structure)", "Nucleic Acids (DNA/RNA)"]},
               {name:"DT-12 (Zoo-XI)", subs:["Enzymes: Mechanism of Action", "Factors Affecting Enzymes"]}
           ]
       },
       {
           phase: 1, unit: "Cell Structure", subject: "Biology", topic: "Cell Cycle & Division",
           dailyTests: [
               {name:"DT-5 (Bot-XI)", subs:["Cell Cycle Phases (G1, S, G2, G0)", "Mitosis & Cytokinesis"]},
               {name:"DT-6 (Bot-XI)", subs:["Meiosis I (Prophase I details)", "Meiosis II & Significance"]}
           ]
       },

       // --- CHEMISTRY: Unit 2 & Redox ---
       {
           phase: 1, unit: "Atomic Structure", subject: "Chemistry", topic: "Structure of Atom",
           dailyTests: [
               {name:"DT-4 (Chem-XI)", subs:["Sub-atomic particles", "Bohr's Atomic Model"]},
               {name:"DT-5 (Chem-XI)", subs:["Dual Nature of Matter", "Heisenberg's Uncertainty Principle"]},
               {name:"DT-6 (Chem-XI)", subs:["Quantum Numbers (n,l,m,s)", "Shapes of Orbitals"]},
               {name:"DT-7 (Chem-XI)", subs:["Electronic Configuration Rules", "Stability of Half/Full Filled"]}
           ]
       },
       {
           phase: 1, unit: "Physical Chem", subject: "Chemistry", topic: "Redox Reactions",
           dailyTests: [
               {name:"DT-18 (Chem-XI)", subs:["Oxidation Number Concept", "Types of Redox Reactions"]},
               {name:"DT-19 (Chem-XI)", subs:["Balancing Redox Reactions", "Electrochemical Cell Basics"]}
           ]
       },

       // ============================================================
       // PHASE 2: Feb 13 - Feb 27 (15 Days)
       // Focus: Bulk Matter, Diversity, Periodic Table, Morphology
       // ============================================================
       
       // --- PHYSICS: Unit 7 & 8 (Properties of Matter) ---
       {
           phase: 2, unit: "Bulk Matter", subject: "Physics", topic: "Mechanical Properties of Solids",
           dailyTests: [
               {name:"DT-33 (Phy-XI)", subs:["Elasticity & Plasticity", "Stress-Strain Curve"]},
               {name:"DT-34 (Phy-XI)", subs:["Hooke's Law & Moduli of Elasticity", "Elastic Potential Energy"]}
           ]
       },
       {
           phase: 2, unit: "Bulk Matter", subject: "Physics", topic: "Mechanical Properties of Fluids",
           dailyTests: [
               {name:"DT-35 (Phy-XI)", subs:["Pressure & Pascal's Law", "Archimedes Principle"]},
               {name:"DT-36 (Phy-XI)", subs:["Streamline Flow & Continuity Eq", "Bernoulli's Principle"]},
               {name:"DT-37 (Phy-XI)", subs:["Viscosity & Stokes Law", "Surface Tension & Capillarity"]}
           ]
       },
       {
           phase: 2, unit: "Bulk Matter", subject: "Physics", topic: "Thermal Properties of Matter",
           dailyTests: [
               {name:"DT-38 (Phy-XI)", subs:["Temperature & Scales", "Thermal Expansion (Solids/Liquids)"]},
               {name:"DT-39 (Phy-XI)", subs:["Calorimetry & Phase Change", "Heat Transfer (Conduction/Convection)"]},
               {name:"DT-40 (Phy-XI)", subs:["Radiation & Newton's Law of Cooling", "Wien's Displacement Law"]}
           ]
       },

       // --- BIOLOGY: Unit 1 & 2 (Diversity & Structural Org) ---
       {
           phase: 2, unit: "Diversity", subject: "Biology", topic: "The Living World",
           dailyTests: [
               {name:"DT-1 (Bot-XI-Rev)", subs:["What is Living?", "Taxonomic Categories & Aids"]}
           ]
       },
       {
           phase: 2, unit: "Diversity", subject: "Biology", topic: "Biological Classification",
           dailyTests: [
               {name:"DT-2 (Bot-XI-Rev)", subs:["Kingdom Monera (Bacteria)", "Kingdom Protista"]},
               {name:"DT-3 (Bot-XI-Rev)", subs:["Kingdom Fungi", "Viruses, Viroids & Lichens"]}
           ]
       },
       {
           phase: 2, unit: "Diversity", subject: "Biology", topic: "Plant Kingdom",
           dailyTests: [
               {name:"DT-4 (Bot-XI-Rev)", subs:["Algae (Green, Brown, Red)", "Bryophytes (Mosses, Liverworts)"]},
               {name:"DT-5 (Bot-XI-Rev)", subs:["Pteridophytes", "Gymnosperms & Angiosperms Cycle"]}
           ]
       },
       {
           phase: 2, unit: "Diversity", subject: "Biology", topic: "Animal Kingdom",
           dailyTests: [
               {name:"DT-1 (Zoo-XI)", subs:["Basis of Classification", "Porifera, Cnidaria, Ctenophora"]},
               {name:"DT-2 (Zoo-XI)", subs:["Platyhelminthes to Annelida", "Arthropoda to Hemichordata"]},
               {name:"DT-3 (Zoo-XI)", subs:["Chordata: Cyclostomata to Pisces", "Amphibia & Reptilia"]},
               {name:"DT-4 (Zoo-XI)", subs:["Aves & Mammalia"]}
           ]
       },
       {
           phase: 2, unit: "Structural Org", subject: "Biology", topic: "Morphology of Flowering Plants",
           dailyTests: [
               {name:"DT-6 (Bot-XI-Rev)", subs:["Root & Stem Modifications", "Leaf Structure & Venation"]},
               {name:"DT-7 (Bot-XI-Rev)", subs:["Inflorescence & Flower Parts", "Fruits & Seeds"]},
               {name:"DT-8 (Bot-XI-Rev)", subs:["Families: Solanaceae, Fabaceae", "New Families: Malvaceae, Compositae"]}
           ]
       },
       {
           phase: 2, unit: "Structural Org", subject: "Biology", topic: "Anatomy of Flowering Plants",
           dailyTests: [
               {name:"DT-9 (Bot-XI-Rev)", subs:["Meristematic & Permanent Tissues", "Tissue Systems"]},
               {name:"DT-10 (Bot-XI-Rev)", subs:["Dicot vs Monocot Root/Stem/Leaf", "Secondary Growth"]}
           ]
       },
       {
           phase: 2, unit: "Structural Org", subject: "Biology", topic: "Structural Org. in Animals",
           dailyTests: [
               {name:"DT-5 (Zoo-XI)", subs:["Animal Tissues (Epithelial/Connective)", "Muscle & Neural Tissue"]},
               {name:"DT-6 (Zoo-XI)", subs:["Frog: Morphology & Anatomy"]}
           ]
       },

       // --- CHEMISTRY: Unit 3 (Periodic Table) ---
       {
           phase: 2, unit: "Inorganic", subject: "Chemistry", topic: "Classification of Elements",
           dailyTests: [
               {name:"DT-8 (Chem-XI)", subs:["Modern Periodic Law", "IUPAC Nomenclature >100"]},
               {name:"DT-9 (Chem-XI)", subs:["Periodic Trends: Atomic Radius", "Ionization Enthalpy Trends"]},
               {name:"DT-10 (Chem-XI)", subs:["Electron Gain Enthalpy", "Electronegativity & Valency"]}
           ]
       },

       // ============================================================
       // PHASE 3: Feb 28 - Mar 14 (15 Days)
       // Focus: Mechanics Core, Chemical Bonding, Plant Phys, GOC
       // ============================================================

       // --- PHYSICS: Unit 2, 3, 4 (Mechanics Part 1) ---
       {
           phase: 3, unit: "Mechanics I", subject: "Physics", topic: "Units & Measurements",
           dailyTests: [
               {name:"DT-1 (Phy-XI)", subs:["Units & Dimensions", "Dimensional Analysis Applications"]},
               {name:"DT-2 (Phy-XI)", subs:["Errors in Measurement", "Significant Figures & Vernier Calipers"]}
           ]
       },
       {
           phase: 3, unit: "Mechanics I", subject: "Physics", topic: "Motion in a Straight Line",
           dailyTests: [
               {name:"DT-3 (Phy-XI)", subs:["Distance, Displacement, Speed", "Velocity-Time Graphs"]},
               {name:"DT-4 (Phy-XI)", subs:["Equations of Motion", "Motion Under Gravity & Relative Velocity"]}
           ]
       },
       {
           phase: 3, unit: "Mechanics I", subject: "Physics", topic: "Motion in a Plane",
           dailyTests: [
               {name:"DT-5 (Phy-XI)", subs:["Vectors: Addition & Resolution", "Dot & Cross Product"]},
               {name:"DT-6 (Phy-XI)", subs:["Projectile Motion (Ground-to-Ground)", "Horizontal Projectile"]},
               {name:"DT-7 (Phy-XI)", subs:["Uniform Circular Motion (Kinematics)"]}
           ]
       },
       {
           phase: 3, unit: "Mechanics I", subject: "Physics", topic: "Laws of Motion",
           dailyTests: [
               {name:"DT-13 (Phy-XI)", subs:["Newton's Laws & Impulse", "Conservation of Momentum"]},
               {name:"DT-14 (Phy-XI)", subs:["Equilibrium of Forces & Lami's", "Friction (Static/Kinetic)"]},
               {name:"DT-15 (Phy-XI)", subs:["Dynamics of Circular Motion (Banking)", "Connected Bodies"]}
           ]
       },
       {
           phase: 3, unit: "Mechanics I", subject: "Physics", topic: "Work, Energy & Power",
           dailyTests: [
               {name:"DT-16 (Phy-XI)", subs:["Work by Constant/Variable Force", "Work-Energy Theorem"]},
               {name:"DT-17 (Phy-XI)", subs:["Potential Energy & Springs", "Power"]},
               {name:"DT-18 (Phy-XI)", subs:["Collisions (1D & 2D)", "Vertical Circular Motion"]}
           ]
       },

       // --- CHEMISTRY: Unit 4 & GOC ---
       {
           phase: 3, unit: "Inorganic/Physical", subject: "Chemistry", topic: "Chemical Bonding",
           dailyTests: [
               {name:"DT-11 (Chem-XI)", subs:["Ionic Bond & Lattice Energy", "Covalent Bond & Lewis Structures"]},
               {name:"DT-12 (Chem-XI)", subs:["VSEPR Theory & Geometry", "Valence Bond Theory"]},
               {name:"DT-13 (Chem-XI)", subs:["Hybridisation (sp, sp2, sp3, etc)", "Dipole Moment"]},
               {name:"DT-14 (Chem-XI)", subs:["Molecular Orbital Theory (MOT)", "Hydrogen Bonding"]}
           ]
       },
       {
           phase: 3, unit: "Organic", subject: "Chemistry", topic: "GOC (General Organic Chem)",
           dailyTests: [
               {name:"DT-23 (Chem-XI)", subs:["IUPAC Nomenclature (Aliphatic/Cyclic)", "Functional Groups"]},
               {name:"DT-24 (Chem-XI)", subs:["Isomerism: Structural", "Isomerism: Stereoisomerism"]},
               {name:"DT-25 (Chem-XI)", subs:["Inductive & Electromeric Effects", "Resonance & Mesomeric Effect"]},
               {name:"DT-26 (Chem-XI)", subs:["Hyperconjugation", "Reaction Intermediates (Carbocations etc)"]},
               {name:"DT-27 (Chem-XI)", subs:["Purification Methods", "Quantitative Analysis (Dumas/Kjeldahl)"]}
           ]
       },
       {
           phase: 3, unit: "Organic", subject: "Chemistry", topic: "Hydrocarbons",
           dailyTests: [
               {name:"DT-28 (Chem-XI)", subs:["Alkanes: Prep & Properties", "Conformations of Ethane"]},
               {name:"DT-29 (Chem-XI)", subs:["Alkenes: Prep & Properties", "Markonikov's Rule"]},
               {name:"DT-30 (Chem-XI)", subs:["Alkynes: Prep & Properties", "Aromatic Hydrocarbons (Benzene)"]}
           ]
       },

       // --- BIOLOGY: Unit 4 (Plant Physiology) ---
       {
           phase: 3, unit: "Plant Phys", subject: "Biology", topic: "Photosynthesis",
           dailyTests: [
               {name:"DT-11 (Bot-XI)", subs:["Pigments & Light Reaction", "Electron Transport Chain"]},
               {name:"DT-12 (Bot-XI)", subs:["C3 Cycle (Calvin Cycle)", "C4 Cycle & Photorespiration"]}
           ]
       },
       {
           phase: 3, unit: "Plant Phys", subject: "Biology", topic: "Respiration in Plants",
           dailyTests: [
               {name:"DT-13 (Bot-XI)", subs:["Glycolysis & Fermentation", "Aerobic Respiration (TCA Cycle)"]},
               {name:"DT-14 (Bot-XI)", subs:["ETS & Oxidative Phosphorylation", "Respiratory Quotient"]}
           ]
       },
       {
           phase: 3, unit: "Plant Phys", subject: "Biology", topic: "Plant Growth & Development",
           dailyTests: [
               {name:"DT-15 (Bot-XI)", subs:["Growth Phases & Curves", "Auxins & Gibberellins"]},
               {name:"DT-16 (Bot-XI)", subs:["Cytokinins, Ethylene, ABA", "Photoperiodism & Vernalization"]}
           ]
       },

       // ============================================================
       // PHASE 4: Mar 15 - Mar 30 (15 Days)
       // Focus: Rotation, Gravity, Thermo, Equilibrium, Human Phys
       // ============================================================

       // --- PHYSICS: Unit 5 & 6 (Mechanics II) ---
       {
           phase: 4, unit: "Mechanics II", subject: "Physics", topic: "System of Particles (Rotation)",
           dailyTests: [
               {name:"DT-22 (Phy-XI)", subs:["Centre of Mass (Discrete/Continuous)", "Motion of CoM"]},
               {name:"DT-23 (Phy-XI)", subs:["Vector Product & Angular Velocity", "Torque & Angular Momentum"]},
               {name:"DT-24 (Phy-XI)", subs:["Moment of Inertia", "Theorems of Parallel/Perpendicular Axes"]},
               {name:"DT-25 (Phy-XI)", subs:["Kinematics of Rotation", "Rolling Motion"]}
           ]
       },
       {
           phase: 4, unit: "Mechanics II", subject: "Physics", topic: "Gravitation",
           dailyTests: [
               {name:"DT-28 (Phy-XI)", subs:["Newton's Law of Gravitation", "Acceleration due to Gravity (g)"]},
               {name:"DT-29 (Phy-XI)", subs:["Gravitational Potential & Field", "Escape Velocity & Satellites"]},
               {name:"DT-30 (Phy-XI)", subs:["Kepler's Laws", "Weightlessness"]}
           ]
       },
       {
           phase: 4, unit: "Thermodynamics", subject: "Physics", topic: "Thermodynamics (Phy)",
           dailyTests: [
               {name:"DT-41 (Phy-XI)", subs:["Thermal Equilibrium & Zeroth Law", "First Law of Thermodynamics"]},
               {name:"DT-42 (Phy-XI)", subs:["Thermodynamic Processes (Iso/Adia)", "Heat Engines & Refrigerators"]},
               {name:"DT-43 (Phy-XI)", subs:["Kinetic Theory of Gases", "Law of Equipartition of Energy"]}
           ]
       },

       // --- CHEMISTRY: Unit 6 & 7 (Physical Chem) ---
       {
           phase: 4, unit: "Physical Chem", subject: "Chemistry", topic: "Thermodynamics (Chem)",
           dailyTests: [
               {name:"DT-15 (Chem-XI)", subs:["System & Surroundings", "Internal Energy & Enthalpy (H)"]},
               {name:"DT-16 (Chem-XI)", subs:["Hess's Law & Bond Enthalpy", "Entropy & Second Law"]},
               {name:"DT-17 (Chem-XI)", subs:["Gibbs Energy & Spontaneity", "Third Law of Thermodynamics"]}
           ]
       },
       {
           phase: 4, unit: "Physical Chem", subject: "Chemistry", topic: "Equilibrium",
           dailyTests: [
               {name:"DT-18 (Chem-XI)", subs:["Law of Mass Action & Kc/Kp", "Le Chatelier's Principle"]},
               {name:"DT-19 (Chem-XI)", subs:["Ionization of Acids/Bases", "pH Scale & Calculations"]},
               {name:"DT-20 (Chem-XI)", subs:["Buffer Solutions", "Solubility Product (Ksp)"]}
           ]
       },
       // p-Block Elements (Group 13-14)
       {
           phase: 4, unit: "Inorganic", subject: "Chemistry", topic: "p-Block Elements",
           dailyTests: [
               {name:"DT-21 (Chem-XI)", subs:["Group 13: Boron Family Trends", "Important Compounds of Boron"]},
               {name:"DT-22 (Chem-XI)", subs:["Group 14: Carbon Family Trends", "Allotropes of Carbon"]}
           ]
       },

       // --- BIOLOGY: Unit 5 (Human Physiology) ---
       {
           phase: 4, unit: "Human Phys", subject: "Biology", topic: "Breathing & Exchange of Gases",
           dailyTests: [
               {name:"DT-17 (Zoo-XI)", subs:["Respiratory Organs", "Mechanism of Breathing"]},
               {name:"DT-18 (Zoo-XI)", subs:["Exchange & Transport of Gases", "Regulation & Disorders"]}
           ]
       },
       {
           phase: 4, unit: "Human Phys", subject: "Biology", topic: "Body Fluids & Circulation",
           dailyTests: [
               {name:"DT-19 (Zoo-XI)", subs:["Blood Components & Groups", "Lymph & Circulatory Pathways"]},
               {name:"DT-20 (Zoo-XI)", subs:["Human Heart & Cardiac Cycle", "ECG & Disorders"]}
           ]
       },
       {
           phase: 4, unit: "Human Phys", subject: "Biology", topic: "Excretory Products",
           dailyTests: [
               {name:"DT-21 (Zoo-XI)", subs:["Human Excretory System", "Urine Formation"]},
               {name:"DT-22 (Zoo-XI)", subs:["Counter Current Mechanism", "Regulation of Kidney Function"]}
           ]
       },
       {
           phase: 4, unit: "Human Phys", subject: "Biology", topic: "Locomotion & Movement",
           dailyTests: [
               {name:"DT-23 (Zoo-XI)", subs:["Types of Movement & Muscle", "Mechanism of Muscle Contraction"]},
               {name:"DT-24 (Zoo-XI)", subs:["Skeletal System", "Joints & Disorders"]}
           ]
       },
       {
           phase: 4, unit: "Human Phys", subject: "Biology", topic: "Neural Control & Coordination",
           dailyTests: [
               {name:"DT-25 (Zoo-XI)", subs:["Neuron Structure & Nerve Impulse", "Synaptic Transmission"]},
               {name:"DT-26 (Zoo-XI)", subs:["Central Neural System (Brain)", "Reflex Action & Sensory Organs"]}
           ]
       },
       {
           phase: 4, unit: "Human Phys", subject: "Biology", topic: "Chemical Coordination",
           dailyTests: [
               {name:"DT-27 (Zoo-XI)", subs:["Hypothalamus & Pituitary", "Thyroid, Parathyroid, Adrenal"]},
               {name:"DT-28 (Zoo-XI)", subs:["Pancreas & Gonads", "Mechanism of Hormone Action"]}
           ]
       }
   ]
};

        // --- STATE MODIFICATION: USE REAL DATE ---
        const state = {
            // UPDATED: Now uses current real-world date
            
            displayName: null,
            currentDate: new Date(), 
            selectedDate: new Date(),
            tasks: {}, 
            prayers: {},
            activeView: 'overview',
            nextExam: null,
            dailyTestsAttempted: {},
            expandedTests: {}, 
            expandedFocusGroups: {},
            goalCompletedToday: false, // Track if sound played
            mistakes: [], // NEW: Array for mistakes
            activeNotebook: null // NEW: Currently open subject
        };
window.state = state;
        // --- FIXED: ADDED ESCAPE HELPERS FOR SECURITY ---
        const escapeHtml = (unsafe) => {
            if (typeof unsafe !== 'string') return '';
            return unsafe
                .replace(/&/g, "&amp;")
                .replace(/</g, "&lt;")
                .replace(/>/g, "&gt;")
                .replace(/"/g, "&quot;")
                .replace(/'/g, "&#039;");
        };

        const escapeRegex = (string) => {
            return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        };

    // Renamed to 'safeQuote' to avoid conflict with global escape()
        const safeQuote = (str) => {
            if (!str) return '';
            return str
                .replace(/\\/g, '\\\\')
                .replace(/'/g, "\\'")
                .replace(/"/g, '&quot;');
        };    
        const formatDateKey = (d) => {
            return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
        };

        function getSubjectColor(subject) {
            switch(subject) {
                case 'Physics': return 'bg-phy-100 dark:bg-phy-700/30 text-phy-700 dark:text-phy-100';
                case 'Chemistry': return 'bg-chem-100 dark:bg-chem-700/30 text-chem-700 dark:text-chem-100';
                case 'Botany': return 'bg-bio-100 dark:bg-bio-700/30 text-bio-700 dark:text-bio-100';
                case 'Zoology': return 'bg-bio-100 dark:bg-bio-700/30 text-bio-700 dark:text-bio-100';
                default: return 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200';
            }
        }
// --- NEW PROFILE UI LOGIC ---
window.updateProfileUI = function(user) {
    const isGuest = !user || user.isAnonymous;
    const name = state.displayName || (user && user.email ? user.email.split('@')[0] : "Guest User");
    const initial = name.charAt(0).toUpperCase();

    const guestStyle = {
        cardBorder: "border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800",
        avatarBg: "bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400",
        icon: "log-in"
    };

    const userStyle = {
        cardBorder: "border-brand-200 dark:border-brand-900/50 bg-brand-50/50 dark:bg-brand-900/10",
        avatarBg: "bg-gradient-to-br from-brand-500 to-blue-600 text-white shadow-brand-500/30",
        icon: "log-out"
    };

    const currentStyle = isGuest ? guestStyle : userStyle;

    const updateElements = (prefix) => {
        const card = document.getElementById(`${prefix}-user-card`);
        const avatarBg = document.getElementById(`${prefix}-user-avatar-bg`);
        // Removed avatarText because new design puts text directly in avatarBg
        const nameEl = document.getElementById(`${prefix}-user-name`);
        const statusEl = document.getElementById(`${prefix}-sync-status`);
        const btn = document.getElementById(`${prefix}-auth-btn`);

        if(!card) return;

        if(prefix === 'mobile') {
            card.className = `flex items-center gap-3 px-3 py-3 rounded-2xl border transition-all cursor-pointer ${currentStyle.cardBorder}`;
        }
        
        avatarBg.className = `flex items-center justify-center font-bold shadow-sm transition-colors ${prefix === 'mobile' ? 'w-10 h-10 rounded-full text-sm' : 'w-9 h-9 rounded-xl text-xs'} ${currentStyle.avatarBg}`;
        
        // FIX: Set text directly on the background element
        avatarBg.textContent = isGuest ? "?" : initial;
        
        nameEl.textContent = name;
        
        statusEl.innerHTML = isGuest 
            ? `<span class="w-1.5 h-1.5 rounded-full bg-slate-400"></span> <span class="text-slate-500 dark:text-slate-400">Local Only</span>`
            : `<span class="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span> <span class="text-green-600 dark:text-green-400">Synced</span>`;

        btn.innerHTML = `<i data-lucide="${currentStyle.icon}" class="${prefix === 'mobile' ? 'w-5 h-5' : 'w-4 h-4'}"></i>`;
        
        if(isGuest) {
            btn.className = `${prefix === 'mobile' ? 'p-2' : 'p-1.5'} rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-lg hover:scale-105 transition-all`;
        } else {
            btn.className = `${prefix === 'mobile' ? 'p-2' : 'p-1.5'} rounded-xl text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all`;
        }
    };
    updateElements('mobile');
    updateElements('desktop');
    if(window.lucide) lucide.createIcons();
};

window.handleProfileClick = function() {
    if (!currentUser || currentUser.isAnonymous) document.getElementById('auth-modal').classList.remove('hidden');
};

window.handleAuthAction = function(e) {
    e.stopPropagation(); 
    if (!currentUser || currentUser.isAnonymous) document.getElementById('auth-modal').classList.remove('hidden');
    else handleLogout();
};
// ✅ NEW: Detect overlaps between Main Exam and Active Backlog Phase
window.checkSyllabusOverlap = function() {
    if (!state.nextExam || typeof backlogPlan === 'undefined') return;

    // 1. Get Active Main Topics
    const mainTopics = new Set(state.nextExam.syllabus.map(c => c.topic));

    // 2. Get Active Backlog Topics (Dynamic Phase)
    const planStart = backlogPlan.startDate;
    const diff = Math.ceil((new Date() - planStart) / (1000 * 60 * 60 * 24));
    let activePhase = 1;
    if(diff > 45) activePhase = 4;
    else if(diff > 30) activePhase = 3;
    else if(diff > 15) activePhase = 2;

    const backlogTopics = backlogPlan.syllabus
        .filter(c => c.phase === activePhase) // Only check active phase
        .map(c => c.topic);

    // 3. Find Overlaps
    const overlaps = backlogTopics.filter(topic => mainTopics.has(topic));

    // 4. Alert User
    if (overlaps.length > 0) {
        // Show a special toast for synergy
        setTimeout(() => {
            showToast(`🚀 Synergy Alert: '${overlaps[0]}' is in both Main & Backlog!`);
        }, 1500); // Small delay so it appears after load
    }
};
function init() {
    setupSchedule(); 
    initScrollHeader(); 
    checkSyllabusOverlap();

    if (!isFirebaseActive && !localStorage.getItem('studyflow_demo_mode')) {
        document.getElementById('auth-modal').classList.remove('hidden');
        if(window.lucide) lucide.createIcons();
        return;
    }

    if(isFirebaseActive) {
        onAuthStateChanged(auth, (user) => {
            currentUser = user;
            
            if (user) {
                document.getElementById('auth-modal').classList.add('hidden');
                const docRef = getSafeDocRef(user.uid);
                
                unsubscribeDoc = onSnapshot(docRef, (docSnap) => {
                    if (docSnap.exists()) {
                        const data = docSnap.data();
                        state.tasks = data.tasks || {};
                        state.dailyTestsAttempted = data.dailyTestsAttempted || {};
                        state.mistakes = data.mistakes || []; 
                        state.prayers = data.prayers || {};
                        state.displayName = data.displayName || null;
                        
                        updateProfileUI(user);
                        renderAll();

                        // ✅ FORCE UPDATE LEADERBOARD ON LOAD
                        // This fixes the "Old High Score" issue by recalculating 
                        // and syncing your stats immediately with the new formula.
                        saveData(); 

                    } else {
                        saveData();
                        updateProfileUI(user);
                    }
                }, (error) => {
                    console.error("Firestore error fallback:", error);
                    initLocalMode();
                });   
            } else {
                updateProfileUI(null);
                document.getElementById('auth-modal').classList.remove('hidden');
            }
        });
    } else {
        initLocalMode();
    }

    // Setup Mistake Form Listener
    const mistakeForm = document.getElementById('mistake-form');
    if(mistakeForm) {
        const newMForm = mistakeForm.cloneNode(true);
        mistakeForm.parentNode.replaceChild(newMForm, mistakeForm);
        newMForm.addEventListener('submit', window.saveMistake);
    }
}             

function initLocalMode() {
        const storedPrayers = localStorage.getItem('studyflow_prayers');
        if (storedPrayers) state.prayers = JSON.parse(storedPrayers);
        try {
            const storedTasks = localStorage.getItem('studyflow_tasks_v2');
            if (storedTasks) state.tasks = JSON.parse(storedTasks);
            
            const storedAttempts = localStorage.getItem('studyflow_attempts_v2'); 
            if (storedAttempts) state.dailyTestsAttempted = JSON.parse(storedAttempts);
            
            const storedMistakes = localStorage.getItem('studyflow_mistakes'); 
            if (storedMistakes) state.mistakes = JSON.parse(storedMistakes);

            const storedName = localStorage.getItem('studyflow_username');
            if (storedName) state.displayName = storedName;
            
        } catch (e) {
            console.error("Local data corrupted", e);
            localStorage.removeItem('studyflow_tasks_v2');
        }
        renderAll();
    }
        
function setupSchedule() {
            // Get the current full date and time
            const now = new Date();
            
            // Find the first exam where the deadline (5 PM on exam day) hasn't passed yet
            state.nextExam = mainSchedule.find(e => {
                const examDeadline = new Date(e.date);
                examDeadline.setHours(17, 0, 0, 0); // Set deadline to 5:00 PM (17:00)
                
                // If the 5 PM deadline is still in the future, this is our current target
                return examDeadline > now;
            }) || mainSchedule[mainSchedule.length-1];

            // ✅ SAFE ADD TASK LISTENER (Prevents crash since footer is removed)
            
// ✅ SAFE ADD TASK LISTENER
            const addTaskForm = document.getElementById('add-task-form');
            if (addTaskForm) {
                const newForm = addTaskForm.cloneNode(true);
                addTaskForm.parentNode.replaceChild(newForm, addTaskForm);
                
                newForm.addEventListener('submit', (e) => {
                    e.preventDefault();
                    const input = document.getElementById('new-task-input');
                    if (input && input.value.trim()) {
                        
                        // Safe selection of values without optional chaining
                        const typeEl = document.getElementById('new-task-type');
                        const subEl = document.getElementById('new-task-subject');
                        
                        const type = typeEl ? typeEl.value : 'main';
                        const subject = subEl ? subEl.value : 'General';
                        
                        addTask(input.value.trim(), type, subject);
                        input.value = '';
                    }
                });
            }
            // Setup Mistake Form Listener
            const mistakeForm = document.getElementById('mistake-form');
            if(mistakeForm) {
                const newMForm = mistakeForm.cloneNode(true);
                mistakeForm.parentNode.replaceChild(newMForm, mistakeForm);
                newMForm.addEventListener('submit', window.saveMistake);
            }
        }


// --- HELPER: CALCULATE STATS (Fair Ground: All Factors are 0-100%) ---
function calculateUserStats() {
    // 1. Snapshot of all completed tasks
    const allCompleted = new Set(
        Object.values(state.tasks).flat()
        .filter(t => t.completed)
        .map(t => t.text)
    );

    // --- PHASE LOGIC START ---
    let currentPhase = 1;
    if(typeof backlogPlan !== 'undefined') {
        const planStart = backlogPlan.startDate;
        const diff = Math.ceil((new Date() - planStart) / (1000 * 60 * 60 * 24));
        if(diff > 45) currentPhase = 4;
        else if(diff > 30) currentPhase = 3;
        else if(diff > 15) currentPhase = 2;
    }
    // --- PHASE LOGIC END ---

    // 2. Main Exam % (Weighted) & Count Total Tests
    let mainTotal = 0, mainDone = 0;
    let mainTestsCount = 0;
    const validTestNames = new Set();

    if(state.nextExam && state.nextExam.syllabus) {
        state.nextExam.syllabus.forEach(s => s.dailyTests.forEach(dt => {
            validTestNames.add(dt.name);
            mainTestsCount++; // Count available tests
            
            const pts = getSubtopicPoints(dt, s.subject, s.topic);
            dt.subs.forEach(sub => {
                mainTotal += pts;
                if(allCompleted.has(`Study: ${s.topic} - ${sub}`)) mainDone += pts;
            });
        }));
    }
    const mainPct = mainTotal ? Math.round((mainDone/mainTotal)*100) : 0;

    // 3. Backlog % (Weighted - ACTIVE PHASE ONLY) & Count Total Tests
    let blTotal = 0, blDone = 0;
    let blTestsCount = 0;

    if(typeof backlogPlan !== 'undefined' && backlogPlan.syllabus) {
        backlogPlan.syllabus.forEach(s => {
            if (s.phase === currentPhase) { 
                s.dailyTests.forEach(dt => {
                    validTestNames.add(dt.name);
                    blTestsCount++; // Count available tests
                    
                    const pts = getSubtopicPoints(dt, s.subject, s.topic);
                    dt.subs.forEach(sub => {
                        blTotal += pts;
                        if(allCompleted.has(`Study: ${s.topic} - ${sub}`)) blDone += pts;
                    });
                });
            }
        });
    }
    const blPct = blTotal ? Math.round((blDone/blTotal)*100) : 0;

    // 4. Test Progress % (The New "Fair" Metric)
    // We calculate what % of the CURRENT RELEVANT tests you have attempted.
    const totalPossibleTests = mainTestsCount + blTestsCount;
    
    const attemptsCount = Object.keys(state.dailyTestsAttempted).filter(k => 
        state.dailyTestsAttempted[k] && validTestNames.has(k)
    ).length;

    const testPct = totalPossibleTests ? Math.round((attemptsCount / totalPossibleTests) * 100) : 0;

    // 5. FAIR SCORE FORMULA
    // All three components are now equal (0-100 scale).
    // Max Score = 300 (100 + 100 + 100)
    const overallScore = mainPct + blPct + testPct;

    return { 
        mainPct, 
        blPct, 
        testCount: attemptsCount, // Keep returning raw count for the UI "Pill"
        overallScore 
    };
}
function saveData() {
    const stats = calculateUserStats(); 

    if(isFirebaseActive && currentUser) {
        const docRef = getSafeDocRef(currentUser.uid);
        
        const statusEl = document.getElementById('desktop-sync-status');
        if(statusEl) statusEl.innerHTML = `<span class="w-1.5 h-1.5 rounded-full bg-yellow-500 animate-pulse"></span> Saving...`;

        // 1. Save Personal Data
        setDoc(docRef, {
            tasks: state.tasks,
            dailyTestsAttempted: state.dailyTestsAttempted,
            mistakes: state.mistakes || [],
            displayName: state.displayName,
            prayers: state.prayers || {} 
        }, { merge: true }).then(() => {
            if(statusEl) statusEl.innerHTML = `<span class="w-1.5 h-1.5 rounded-full bg-green-500"></span> Synced`;
        }).catch(err => {
            console.error("Personal Save failed:", err);
            if(statusEl) statusEl.innerHTML = `<span class="w-1.5 h-1.5 rounded-full bg-red-500"></span> Save Failed`;
        });

        // 2. Save Leaderboard Entry (DETAILED SYNC)
        const lbRef = doc(db, 'leaderboard', currentUser.uid);

        setDoc(lbRef, {
            email: currentUser.email || 'Anonymous',
            displayName: state.displayName || 'Anonymous',
            
            // X, Y, Z Factors
            mainPct: stats.mainPct,
            blPct: stats.blPct,
            testCount: stats.testCount,
            
            // Score & Reset Key
            overallScore: stats.overallScore, 
            currentExam: state.nextExam.name, // Used to filter/reset seasons
            
            lastUpdated: new Date()
        }, { merge: true }).catch(err => {
            console.error("Leaderboard Save failed:", err);
        });
    } else {
        // Local Storage Fallback
        localStorage.setItem('studyflow_tasks_v2', JSON.stringify(state.tasks));
        localStorage.setItem('studyflow_attempts_v2', JSON.stringify(state.dailyTestsAttempted));
        localStorage.setItem('studyflow_mistakes', JSON.stringify(state.mistakes || []));
        localStorage.setItem('studyflow_username', state.displayName);
        localStorage.setItem('studyflow_prayers', JSON.stringify(state.prayers || {}));
    }
    renderAll();
}

 // --- PRAYER FUNCTIONS ---
window.openPrayerModal = function() {
    document.getElementById('modal-prayer-date').textContent = state.selectedDate.toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long' });
    document.getElementById('prayer-modal').classList.remove('hidden');
    renderPrayerModalItems();
};

window.togglePrayer = function(prayerName) {
    const k = formatDateKey(state.selectedDate);
    if (!state.prayers[k]) state.prayers[k] = {};
    state.prayers[k][prayerName] = !state.prayers[k][prayerName];
    saveData();
    
    // Update both the modal (if open) and the NEW header widget
    renderPrayerModalItems();
    renderHeaderPrayerWidget(); // <--- Changed this line!
    updateSidebarBadges();      // Optional: Updates badges if you add prayer logic there later
};

window.renderPrayerModalItems = function() {
    const list = document.getElementById('modal-prayer-list');
    if(!list) return;
    const k = formatDateKey(state.selectedDate);
    const todayData = state.prayers[k] || {};
    const prayers = [
        { name: 'Fajr', time: 'Before Sunrise' }, { name: 'Dhuhr', time: 'After Noon' },
        { name: 'Asr', time: 'Afternoon' }, { name: 'Maghrib', time: 'After Sunset' }, { name: 'Isha', time: 'Night' }
    ];
    list.innerHTML = prayers.map(p => {
        const isDone = todayData[p.name] === true;
        const bg = isDone ? "bg-emerald-500 border-emerald-600 text-white" : "bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400";
        return `<button onclick="togglePrayer('${p.name}')" class="flex items-center justify-between p-3 rounded-xl border transition-all ${bg}">
            <div class="text-left"><div class="font-bold text-sm ${isDone ? 'text-white' : 'text-slate-800 dark:text-white'}">${p.name}</div><div class="text-[10px] font-bold uppercase tracking-wider ${isDone ? 'text-emerald-100' : 'text-slate-400'}">${p.time}</div></div>
            <div class="w-6 h-6 rounded-full border-2 flex items-center justify-center ${isDone ? 'border-white bg-white text-emerald-600' : 'border-slate-300 dark:border-slate-600'}">${isDone ? '<i data-lucide="check" class="w-3.5 h-3.5"></i>' : ''}</div></button>`;
    }).join('');
    if(window.lucide) lucide.createIcons({ root: list });

   updateSidebarBadges();
};

window.updateHeaderPrayerBtn = function() {
    const el = document.getElementById('header-prayer-count');
    if(!el) return;
    const k = formatDateKey(state.selectedDate);
    const todayData = state.prayers[k] || {};
    const count = Object.values(todayData).filter(v => v === true).length;
    el.textContent = `${count}/5`;
    if(count === 5) el.className = "bg-yellow-400 text-black text-[9px] px-1.5 py-0.5 rounded ml-1 font-bold shadow-sm";
    else el.className = "bg-emerald-600 text-white text-[9px] px-1.5 py-0.5 rounded ml-1";
};
// --- SPIRITUAL DASHBOARD LOGIC ---
window.renderNamazView = function() {
    // --- PART 1: THE "HOLY LIGHT" RAMADAN TIMER ---
    if (typeof window.ramadanTimerInterval === 'undefined') window.ramadanTimerInterval = null;
    if (window.ramadanTimerInterval) clearInterval(window.ramadanTimerInterval);

    const countEl = document.getElementById('ramadan-days-left');
    const ramadanDate = new Date('2026-02-17T00:00:00');

    // 1. VISUAL UPGRADE: Make the card glow
    if (countEl) {
        const card = countEl.closest('.rounded-3xl'); // Find the main card container
        if (card) {
            // Apply new "Ramadan" styling (Brighter Green + Gold Glow + Glass Border)
            card.className = "bg-gradient-to-br from-emerald-500 via-teal-600 to-emerald-800 rounded-3xl p-8 text-white shadow-2xl shadow-emerald-400/40 relative overflow-hidden group border border-emerald-400/30 transition-all duration-500";
            
            // Find the background lantern and make it Golden
            const lanternContainer = card.querySelector('.absolute');
            if(lanternContainer) {
                // Add a golden drop-shadow to the lantern icon
                lanternContainer.innerHTML = '<i data-lucide="lamp-ceiling" class="w-64 h-64 text-amber-200/20 drop-shadow-[0_0_30px_rgba(251,191,36,0.4)] transform rotate-12 transition-transform duration-700 group-hover:rotate-0"></i>';
                if(window.lucide) lucide.createIcons({ root: lanternContainer });
            }
        }
    }

    const updateTimer = () => {
        const now = new Date();
        const diff = ramadanDate - now;
        if (diff <= 0) {
            if(countEl) countEl.innerHTML = "<span class='text-amber-200 font-bold text-2xl drop-shadow-md'>Ramadan Mubarak! 🌙</span>";
            return;
        }
        const d = Math.floor(diff / (1000 * 60 * 60 * 24));
        const h = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const s = Math.floor((diff % (1000 * 60)) / 1000);
        
        // NEW STYLING: Gold Borders & Brighter Text
        const makeBox = (val, label) => `
            <div class="flex flex-col items-center justify-center bg-black/20 rounded-xl border border-amber-200/30 p-2 min-w-[55px] md:min-w-[65px] backdrop-blur-md shadow-[0_0_15px_rgba(16,185,129,0.2)]">
                <span class="text-2xl md:text-3xl font-bold text-white font-mono leading-none drop-shadow-sm">${String(val).padStart(2, '0')}</span>
                <span class="text-[9px] font-bold text-amber-300 uppercase mt-1 tracking-widest">${label}</span>
            </div>`;
            
        if (countEl) {
            if (countEl.parentElement && countEl.nextElementSibling) {
                countEl.nextElementSibling.style.display = 'none';
                countEl.parentElement.classList.remove('p-4', 'min-w-[120px]');
                countEl.parentElement.classList.add('p-0', 'pl-0', 'md:pl-6'); // Adjust alignment
            }
            countEl.innerHTML = `
                <div class="flex gap-2 items-center">
                    ${makeBox(d,'Day')}
                    <span class="text-amber-200/60 font-bold text-xl pb-4 animate-pulse">:</span>
                    ${makeBox(h,'Hr')}
                    <span class="text-amber-200/60 font-bold text-xl pb-4 animate-pulse">:</span>
                    ${makeBox(m,'Min')}
                    <span class="text-amber-200/60 font-bold text-xl pb-4 animate-pulse hidden md:block">:</span>
                    ${makeBox(s,'Sec')}
                </div>`;
        }
    };
    updateTimer();
    window.ramadanTimerInterval = setInterval(updateTimer, 1000);


    // --- PART 2: DATA DASHBOARD (Preserved) ---
    const calculateStats = (days) => {
        const counts = { Fajr: 0, Dhuhr: 0, Asr: 0, Maghrib: 0, Isha: 0 };
        let total = 0, streak = 0, streakBroken = false;
        for(let i=0; i<days; i++) {
            const d = new Date(); d.setDate(d.getDate() - i);
            const k = formatDateKey(d);
            let dailyCount = 0;
            if(state.prayers && state.prayers[k]) {
                const p = state.prayers[k];
                ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'].forEach(name => {
                    if(p[name]) { counts[name]++; dailyCount++; }
                });
            }
            total += dailyCount;
            if(!streakBroken) {
                if(dailyCount > 0) streak++;
                else if(i > 0) streakBroken = true;
            }
        }
        return { counts, total, streak, rate: Math.round((total / (days * 5)) * 100) };
    };

    const stats = calculateStats(30);
    const entries = Object.entries(stats.counts);
    entries.sort((a, b) => b[1] - a[1]);

    let bestName = "None yet";
    let worstName = "All";
    
    if (stats.total > 0) {
        bestName = entries[0][0]; 
        worstName = stats.rate === 100 ? "None!" : entries[entries.length-1][0];
    }

    const oldInsightCard = document.getElementById('insight-best');
    if (oldInsightCard) {
        const gridContainer = oldInsightCard.closest('.grid');
        if (gridContainer && !gridContainer.classList.contains('dashboard-active')) {
            const dashboardHTML = `
                <div class="grid grid-cols-3 gap-3 mb-4">
                    <div class="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 text-center shadow-sm">
                        <div class="text-2xl md:text-3xl font-black text-brand-600 dark:text-brand-400">${stats.total}</div>
                        <div class="text-[9px] uppercase font-bold text-slate-400 tracking-wider">Prayers (30d)</div>
                    </div>
                    <div class="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 text-center shadow-sm">
                        <div class="text-2xl md:text-3xl font-black text-emerald-500">${stats.rate}%</div>
                        <div class="text-[9px] uppercase font-bold text-slate-400 tracking-wider">Consistency</div>
                    </div>
                    <div class="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 text-center shadow-sm">
                        <div class="text-2xl md:text-3xl font-black text-orange-500">${stats.streak}</div>
                        <div class="text-[9px] uppercase font-bold text-slate-400 tracking-wider">Day Streak</div>
                    </div>
                </div>

                <div class="grid grid-cols-2 gap-3 mb-4">
                    <div class="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center gap-3 shadow-sm">
                        <div class="p-3 bg-green-100 dark:bg-green-900/20 rounded-full text-green-600 dark:text-green-400"><i data-lucide="check-circle-2" class="w-5 h-5"></i></div>
                        <div><div class="text-[9px] uppercase font-bold text-slate-400 tracking-wider">Strongest</div><div class="text-lg font-bold text-slate-900 dark:text-white">${bestName}</div></div>
                    </div>
                    <div class="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center gap-3 shadow-sm">
                        <div class="p-3 bg-red-100 dark:bg-red-900/20 rounded-full text-red-600 dark:text-red-400"><i data-lucide="alert-circle" class="w-5 h-5"></i></div>
                        <div><div class="text-[9px] uppercase font-bold text-slate-400 tracking-wider">Needs Focus</div><div class="text-lg font-bold text-slate-900 dark:text-white">${worstName}</div></div>
                    </div>
                </div>

                <div class="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm mb-4">
                    <h3 class="text-sm font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2"><i data-lucide="bar-chart-2" class="w-4 h-4 text-slate-400"></i> Prayer Frequency</h3>
                    <div class="space-y-4">
                        ${['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'].map(p => {
                            const count = stats.counts[p] || 0;
                            const pct = (count / 30) * 100;
                            let color = pct >= 80 ? 'bg-emerald-500' : (pct >= 50 ? 'bg-brand-500' : 'bg-orange-400');
                            return `<div><div class="flex justify-between text-xs font-bold mb-1.5"><span class="text-slate-600 dark:text-slate-300 w-16">${p}</span><span class="text-slate-400">${count}/30 days</span></div><div class="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden"><div class="h-full ${color} transition-all duration-1000" style="width: ${pct}%"></div></div></div>`;
                        }).join('')}
                    </div>
                </div>`;
            const wrapper = document.createElement('div');
            wrapper.innerHTML = dashboardHTML;
            wrapper.classList.add('dashboard-active');
            gridContainer.replaceWith(wrapper);
            if(window.lucide) lucide.createIcons({ root: wrapper });
        }
    }

    renderDailyHadith();
};

function calculatePrayerStats() {
    if(!state.prayers) return;

    const counts = { Fajr: 0, Dhuhr: 0, Asr: 0, Maghrib: 0, Isha: 0 };
    const totalDays = 30; // Look back period
    let daysChecked = 0;

    // Iterate backwards 30 days
    for(let i=0; i<totalDays; i++) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const k = formatDateKey(d);
        
        if(state.prayers[k]) {
            daysChecked++;
            const p = state.prayers[k];
            if(p.Fajr) counts.Fajr++;
            if(p.Dhuhr) counts.Dhuhr++;
            if(p.Asr) counts.Asr++;
            if(p.Maghrib) counts.Maghrib++;
            if(p.Isha) counts.Isha++;
        }
    }

    // Determine Best & Worst
    let bestName = "None yet";
    let bestCount = -1;
    let worstName = "None";
    let worstCount = 999;

    Object.entries(counts).forEach(([name, count]) => {
        if(count > bestCount) { bestCount = count; bestName = name; }
        if(count < worstCount) { worstCount = count; worstName = name; }
    });

    // Update UI
    const bestEl = document.getElementById('insight-best');
    const worstEl = document.getElementById('insight-worst');

    if(bestEl) {
        if (bestCount === 0) bestEl.textContent = "Start Today";
        else bestEl.textContent = bestName;
    }

    if(worstEl) {
        if (bestCount === 0) worstEl.textContent = "All Prayers";
        else if (worstCount === bestCount) worstEl.textContent = "Consistent"; // All equal
        else worstEl.textContent = worstName;
    }
}

function renderDailyHadith() {
    const hadiths = [
        { text: "The difference between a man and shirk and kufr is the abandoning of the Prayer.", source: "Sahih Muslim" },
        { text: "The first matter that the slave will be brought to account for on the Day of Judgment is the Prayer.", source: "Sahih Al-Jami" },
        { text: "He who prays the two cool prayers (Asr and Fajr) will enter Paradise.", source: "Sahih Bukhari" },
        { text: "No one who prays before the rising of the sun and before its setting will enter the Fire.", source: "Sahih Muslim" },
        { text: "Between faith and unbelief is abandoning the prayer.", source: "Sahih Muslim" },
        { text: "Whoever misses the Asr prayer, it is as if he has lost his family and his wealth.", source: "Sahih Bukhari" }
    ];

    // Pick based on day of month to rotate consistently
    const dayIndex = new Date().getDate() % hadiths.length;
    const selected = hadiths[dayIndex];

    const textEl = document.getElementById('daily-hadith-text');
    const sourceEl = document.getElementById('daily-hadith-source');

    if(textEl) textEl.textContent = `"${selected.text}"`;
    if(sourceEl) sourceEl.textContent = selected.source;
}
        


// ======================================================
        // 🧠 ADVANCED SMART MIX ENGINE (Context-Aware Fix)
        // ======================================================

        // --- 1. CONFIGURATION: THE POINTS SYSTEM ---
        const POINT_RULES = {
            Physics: 4,
            Chemistry: 3,
            HighYieldBio: 3, 
            StandardBio: 2
        };

        const HIGH_YIELD_TOPICS = [
            "Sexual Reproduction in Plants", 
            "Principles of Inheritance", 
            "Molecular Basis of Inheritance", 
            "Evolution"
        ];

        function getTestPoints(subject, topic) {
            if (subject === 'Physics') return POINT_RULES.Physics;
            if (subject === 'Chemistry') return POINT_RULES.Chemistry;
            if (subject === 'Botany' || subject === 'Zoology' || subject === 'Biology') {
                const isHighYield = HIGH_YIELD_TOPICS.some(h => topic.includes(h));
                return isHighYield ? POINT_RULES.HighYieldBio : POINT_RULES.StandardBio;
            }
            return 1;
        }

        function getSubtopicPoints(testObj, subject, topic) {
            const totalPts = getTestPoints(subject, topic);
            const count = testObj.subs.length || 1;
            return totalPts / count;
        }

   // --- 2. THE MATH ENGINE (Calculates Syllabus Stats) ---
function calculateSmartMath(type) {
    const today = new Date();
    today.setHours(0,0,0,0);
    
    let targetDate, syllabus;
    
    // ✅ DYNAMIC PHASE CALCULATION
    // We calculate this upfront so we can filter EVERYTHING by it
    let activePhase = 1;
    if (typeof backlogPlan !== 'undefined') {
        const planStart = backlogPlan.startDate;
        const diff = Math.ceil((new Date() - planStart) / (1000 * 60 * 60 * 24));
        if(diff > 45) activePhase = 4;
        else if(diff > 30) activePhase = 3;
        else if(diff > 15) activePhase = 2;
    }

    if (type === 'main') {
        targetDate = state.nextExam ? new Date(state.nextExam.date) : new Date(); 
        syllabus = state.nextExam ? state.nextExam.syllabus : [];
    } else {
        // Backlog Target: End of current phase (Start + Phase*15 days)
        const planStart = typeof backlogPlan !== 'undefined' ? backlogPlan.startDate : new Date();
        targetDate = new Date(planStart);
        targetDate.setDate(planStart.getDate() + (activePhase * 15));
        
        // ✅ STRICT FILTERING: Only include chapters from the ACTIVE phase
        // This prevents future chapters (like Hydrocarbons in Phase 3) from counting as "Planned Points" now
        const fullSyllabus = typeof backlogPlan !== 'undefined' ? backlogPlan.syllabus : [];
        syllabus = fullSyllabus.filter(c => c.phase === activePhase);
    }

    const daysLeft = Math.max(1, Math.ceil((targetDate - today) / (1000 * 60 * 60 * 24)));

    let totalPoints = 0;
    let earnedPoints = 0;
    let pendingTasks = []; 

    const allCompleted = new Set(Object.values(state.tasks).flat().filter(t => t.completed).map(t => t.text));
    const plannedToday = new Set((state.tasks[formatDateKey(today)] || []).map(t => t.text));

    syllabus.forEach(chap => {
        chap.dailyTests.forEach(dt => {
            const subPts = getSubtopicPoints(dt, chap.subject, chap.topic);
            
            dt.subs.forEach(sub => {
                totalPoints += subPts;
                const taskName = `Study: ${chap.topic} - ${sub}`;
                
                if (allCompleted.has(taskName) || state.dailyTestsAttempted[dt.name]) {
                    earnedPoints += subPts;
                } else if (!plannedToday.has(taskName)) {
                    pendingTasks.push({
                        text: taskName,
                        subject: chap.subject,
                        points: subPts,
                        chapter: chap.topic,
                        type: type
                    });
                }
            });
        });
    });

    const remainingPoints = totalPoints - earnedPoints;
    const dailyTargetPoints = remainingPoints / daysLeft;

    return { daysLeft, totalPoints, remainingPoints, dailyTargetPoints, pendingTasks, syllabusRef: syllabus };
}   
  
        // --- 3. HELPER: CALCULATE POINTS ALREADY IN PLANNER ---
        function getPlannerPointsForToday(mode, syllabusRef) {
            const k = formatDateKey(state.selectedDate);
            const tasks = state.tasks[k] || [];
            let sum = 0;

            tasks.forEach(t => {
                // Try to find this task in the syllabus to get its point value
                // We scan the syllabusRef passed from calculateSmartMath
                syllabusRef.forEach(chap => {
                    chap.dailyTests.forEach(dt => {
                        dt.subs.forEach(sub => {
                            if (t.text.includes(sub)) {
                                sum += getSubtopicPoints(dt, chap.subject, chap.topic);
                            }
                        });
                    });
                });
            });
            return sum;
        }

  // ==========================================
// ⚡ MODERN SMART MIX CONTROLLER
// ==========================================
let tempMixData = null; // Store data while modal is open

window.generateSmartMix = function(mode = 'main') {
    const math = calculateSmartMath(mode);
    const alreadyPlannedPts = getPlannerPointsForToday(mode, math.syllabusRef);
    const pointsNeeded = Math.max(0, math.dailyTargetPoints - alreadyPlannedPts);

    // 1. If Target Met, show simple toast
    if (pointsNeeded < 0.5) {
        showToast("✅ Daily target already met! Great job.");
        return;
    }

    // 2. Calculate the Candidates (The "Mix")
    const subjectLoad = {};
    math.pendingTasks.forEach(t => {
        if (!subjectLoad[t.subject]) subjectLoad[t.subject] = [];
        subjectLoad[t.subject].push(t);
    });

    let currentPoints = 0;
    let mixPool = [];
    const SAFE_CAP = 12; 

    while (currentPoints < pointsNeeded && mixPool.length < SAFE_CAP && math.pendingTasks.length > 0) {
        const heavySubject = Object.keys(subjectLoad).reduce((a, b) => 
            subjectLoad[a].length > subjectLoad[b].length ? a : b
        );

        if (!subjectLoad[heavySubject] || subjectLoad[heavySubject].length === 0) break;

        const task = subjectLoad[heavySubject].shift();
        mixPool.push(task);
        currentPoints += task.points;

        const index = math.pendingTasks.indexOf(task);
        if (index > -1) math.pendingTasks.splice(index, 1);
    }

    // Shuffle & Interleave
    let finalMix = [];
    let lastSubject = "";
    while (mixPool.length > 0) {
        let candidateIndex = mixPool.findIndex(t => t.subject !== lastSubject);
        if (candidateIndex === -1) candidateIndex = 0;
        const selected = mixPool[candidateIndex];
        finalMix.push(selected);
        lastSubject = selected.subject;
        mixPool.splice(candidateIndex, 1);
    }

    // 3. STORE DATA FOR CONFIRMATION
    tempMixData = finalMix;

    // 4. POPULATE THE MODERN MODAL
    document.getElementById('sm-target').innerText = math.dailyTargetPoints.toFixed(1);
    document.getElementById('sm-planned').innerText = alreadyPlannedPts.toFixed(1);
    document.getElementById('sm-gap').innerText = pointsNeeded.toFixed(1);
    document.getElementById('sm-suggestion').innerHTML = `I have selected <b class="text-indigo-500">${finalMix.length} tasks</b> (${currentPoints.toFixed(1)} Pts) to bridge this gap perfectly.`;
    
    document.getElementById('smartMixSubtitle').innerText = mode === 'main' ? 'Exam Sprint Mode' : 'Backlog Recovery Mode';
    
    const header = document.getElementById('smartMixHeader');
    if(mode === 'main') header.className = "relative h-32 bg-gradient-to-br from-brand-600 to-indigo-600 p-6 flex flex-col justify-between";
    else header.className = "relative h-32 bg-gradient-to-br from-orange-500 to-red-500 p-6 flex flex-col justify-between";

    // 5. OPEN MODAL ANIMATION
    const modal = document.getElementById('smart-mix-modal');
    const backdrop = document.getElementById('smartMixBackdrop');
    const card = document.getElementById('smartMixCard');
    
    modal.classList.remove('hidden');
    // Micro-delay for CSS transition
    setTimeout(() => {
        backdrop.classList.remove('opacity-0');
        card.classList.remove('scale-95', 'opacity-0');
        card.classList.add('scale-100', 'opacity-100');
    }, 10);

    // 6. ATTACH CONFIRM LISTENER
    const btn = document.getElementById('btn-confirm-mix');
    btn.onclick = () => confirmSmartMixExecute();
};

window.closeSmartMixModal = function() {
    const modal = document.getElementById('smart-mix-modal');
    const backdrop = document.getElementById('smartMixBackdrop');
    const card = document.getElementById('smartMixCard');

    backdrop.classList.add('opacity-0');
    card.classList.remove('scale-100', 'opacity-100');
    card.classList.add('scale-95', 'opacity-0');

    setTimeout(() => {
        modal.classList.add('hidden');
        tempMixData = null;
    }, 300);
};

window.confirmSmartMixExecute = function() {
    if(!tempMixData) return;

    tempMixData.forEach(t => {
        const key = formatDateKey(state.selectedDate);
        if (!state.tasks[key]) state.tasks[key] = [];
        state.tasks[key].push({
            id: Date.now() + Math.random().toString(36).substr(2, 9), 
            text: t.text, type: t.type, subject: t.subject, chapter: t.chapter, completed: false 
        });
    });
    
    saveData();
    renderAll();
    closeSmartMixModal();
    
    // Confetti!
    confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
    });
    
    showToast(`🚀 Added ${tempMixData.length} tasks to your plan.`);
};      

// --- ✨ NEW VISUAL: POINTS REWARD TOAST (Fixed Centering) ---
window.showPointsToast = function(points, current, target, subject, type) {
    // 1. Remove existing to prevent stacking
    const existing = document.getElementById('points-toast-wrapper');
    if (existing) existing.remove();

    // 2. Calculate Progress
    const percent = Math.min(100, Math.round((current / target) * 100));
    
    // 3. Subject Colors
    let gradient = "from-emerald-500 to-teal-500";
    let icon = "zap";
    
    if (subject === 'Physics') {
        gradient = "from-blue-500 to-indigo-500";
        icon = "atom";
    } else if (subject === 'Chemistry') {
        gradient = "from-orange-500 to-amber-500";
        icon = "flask-conical";
    } else if (subject === 'Botany' || subject === 'Zoology' || subject === 'Biology') {
        gradient = "from-green-500 to-emerald-600";
        icon = "leaf";
    }

    // 4. Create WRAPPER (Positioning Only)
    const wrapper = document.createElement('div');
    wrapper.id = "points-toast-wrapper";
    wrapper.className = "fixed bottom-24 left-1/2 -translate-x-1/2 z-[100] w-[90%] max-w-sm pointer-events-none";

    // 5. Create INNER CARD (Styling & Animation)
    const toast = document.createElement('div');
    toast.className = "bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-white/20 dark:border-slate-700 shadow-2xl rounded-2xl p-4 ring-1 ring-black/5 animate-in slide-in-from-bottom-4 fade-in duration-300 pointer-events-auto";
    
    // Extract color name for shadow (e.g., 'emerald' from 'from-emerald-500')
    const colorName = gradient.split('-')[1];

    toast.innerHTML = `
        <div class="flex justify-between items-start mb-2">
            <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center text-white shadow-lg shadow-${colorName}-500/30">
                    <i data-lucide="${icon}" class="w-5 h-5"></i>
                </div>
                <div>
                    <h4 class="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">${subject} • ${type === 'main' ? 'Exam' : 'Backlog'}</h4>
                    <div class="text-xl font-black text-slate-800 dark:text-white flex items-center gap-1">
                        +${points.toFixed(2)} <span class="text-sm font-bold text-slate-400">Pts</span>
                    </div>
                </div>
            </div>
            <div class="text-right">
                <div class="text-[10px] font-bold uppercase text-slate-400">Target</div>
                <div class="text-sm font-bold text-slate-700 dark:text-slate-300">
                    <span class="${percent >= 100 ? 'text-green-500' : ''}">${current.toFixed(1)}</span>
                    <span class="opacity-50">/</span> 
                    ${target.toFixed(1)}
                </div>
            </div>
        </div>

        <div class="relative h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
            <div class="absolute inset-0 bg-gradient-to-r ${gradient} transition-all duration-1000 ease-out" style="width: ${percent}%"></div>
        </div>
        <div class="mt-1 flex justify-between text-[9px] font-bold uppercase tracking-wider text-slate-400">
            <span>Daily Progress</span>
            <span>${percent}%</span>
        </div>
    `;

    // 6. Assemble & Inject
    wrapper.appendChild(toast);
    document.body.appendChild(wrapper);

    if (window.lucide) lucide.createIcons({ root: toast });

    // 7. Remove after 3.5 seconds
    setTimeout(() => {
        toast.classList.add('animate-out', 'fade-out', 'slide-out-to-bottom-4');
        setTimeout(() => wrapper.remove(), 300);
    }, 3500);
};
   


// --- 5. MANUAL ADD HOOK (With NEW Visuals & Duplicate Check) ---
window.addTask = function(text, type = 'main', subject = 'General', chapter = null) {
    // 1. Get Today's List
    const key = formatDateKey(state.selectedDate);
    if (!state.tasks[key]) state.tasks[key] = [];

    // PREVENT DUPLICATES
    const alreadyExists = state.tasks[key].some(t => t.text === text);
    if (alreadyExists) {
        showToast("⚠️ Task already added to planner");
        return; 
    }

    // 2. Add New Task
    state.tasks[key].push({
        id: Date.now() + Math.random().toString(36).substr(2, 9), 
        text, type, subject, chapter, completed: false 
    });
    saveData();
    renderAll();

    // 3. CHECK POINTS & SHOW UPDATED VISUALS
    let pointsFound = 0;
    let detectedType = 'main';
    let detectedSubject = subject; 
    let syllabusRef = [];

    // Scan Main
    if (state.nextExam) {
        state.nextExam.syllabus.forEach(chap => {
            chap.dailyTests.forEach(dt => {
                dt.subs.forEach(sub => {
                    if (text.includes(sub)) {
                        pointsFound = getSubtopicPoints(dt, chap.subject, chap.topic);
                        detectedType = 'main';
                        detectedSubject = chap.subject; 
                        syllabusRef = state.nextExam.syllabus;
                    }
                });
            });
        });
    }
    
    // Scan Backlog (STRICT ACTIVE PHASE CHECK)
    if (pointsFound === 0 && typeof backlogPlan !== 'undefined') {
        // Calculate Active Phase dynamically
        const planStart = backlogPlan.startDate;
        const diff = Math.ceil((new Date() - planStart) / (1000 * 60 * 60 * 24));
        let activePhase = 1;
        if(diff > 45) activePhase = 4;
        else if(diff > 30) activePhase = 3;
        else if(diff > 15) activePhase = 2;

        backlogPlan.syllabus.forEach(chap => {
            // ✅ Only check chapters in the current phase
            if (chap.phase !== activePhase) return;

            chap.dailyTests.forEach(dt => {
                dt.subs.forEach(sub => {
                    if (text.includes(sub)) {
                        pointsFound = getSubtopicPoints(dt, chap.subject, chap.topic);
                        detectedType = 'backlog';
                        detectedSubject = chap.subject;
                        // Use filtered syllabus reference
                        syllabusRef = backlogPlan.syllabus.filter(c => c.phase === activePhase);
                    }
                });
            });
        });
    }

    // 4. TRIGGER THE NEW VISUAL TOAST
    if (pointsFound > 0) {
        const math = calculateSmartMath(detectedType);
        const planned = getPlannerPointsForToday(detectedType, syllabusRef);
        
        showPointsToast(pointsFound, planned, math.dailyTargetPoints, detectedSubject, detectedType);
    } else {
        showToast("Task added to planner");
    }
};
        // ✅ RESTORED FUNCTIONS

        window.deleteTask = function(id) {
            const key = formatDateKey(state.selectedDate);
            if(state.tasks[key]) {
                state.tasks[key] = state.tasks[key].filter(t => t.id !== id);
                saveData();
                renderAll(); 
            }
        };

      window.deleteGroup = function(chapterName) {
    // ✅ NO CONFIRMATION: Deletes immediately
    const key = formatDateKey(state.selectedDate);
    if(state.tasks[key]) {
        state.tasks[key] = state.tasks[key].filter(t => {
            let chap = t.chapter;
            if (!chap && t.text.startsWith("Study: ")) {
                const parts = t.text.replace("Study: ", "").split(" - ");
                if (parts.length > 1) chap = parts[0];
            }
            return chap !== chapterName;
        });
        
        saveData();
        if (state.expandedFocusGroups[chapterName]) delete state.expandedFocusGroups[chapterName];
        renderAll();
        
        // Optional: Feedback
        showToast(`Deleted group: ${chapterName}`);
    }
};  
        
        window.toggleTask = function(id) {
            const key = formatDateKey(state.selectedDate);
            if(state.tasks[key]) {
                const t = state.tasks[key].find(x => x.id === id);
                if(t) { t.completed = !t.completed; saveData(); }
            }
        };

        window.toggleFocusGroup = function(chapterName) {
            state.expandedFocusGroups[chapterName] = !state.expandedFocusGroups[chapterName];
            renderTasks(); // Re-renders only the tasks list
        };

        window.toggleTestAttempt = function(testName) {
            // FIXED: Explicitly set to false instead of deleting key so that { merge: true } updates the DB correctly
            if (state.dailyTestsAttempted[testName]) {
                 state.dailyTestsAttempted[testName] = false; 
            } else {
                 state.dailyTestsAttempted[testName] = true;
            }
            saveData();
        };

window.switchView = function(view) {
    state.activeView = view;
    toggleMobileMenu(true); // Close mobile menu if open
    
    // 1. Update Buttons Highlighting
  ['overview','target','backlog', 'mistakes', 'leaderboard', 'namaz', 'points'].forEach(v => {
         const btn = document.getElementById(`nav-${v}`);
        if(btn) {
            // Reset all to default style
            btn.className = "group relative w-full flex items-center gap-3 px-4 py-3.5 rounded-xl font-medium text-sm text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:text-brand-600 dark:hover:text-brand-400 transition-all duration-200 hover:translate-x-1";
            
            // Remove any existing active indicators
            const existingDot = btn.querySelector('.active-indicator');
            if(existingDot) existingDot.classList.add('hidden');

            // Apply Active Style
            if(v === view) {
                btn.className = "group relative w-full flex items-center gap-3 px-4 py-3.5 rounded-xl font-bold text-sm bg-brand-50 dark:bg-brand-900/20 text-brand-700 dark:text-brand-400 shadow-sm ring-1 ring-brand-200 dark:ring-brand-800 transition-all";
                if(existingDot) existingDot.classList.remove('hidden');
            }
        }
        
        // Hide all Views
        const viewEl = document.getElementById(`view-${v}`);
        if(viewEl) viewEl.classList.add('hidden');
    });

    // 2. Show Active View
    const activeEl = document.getElementById(`view-${view}`);
    if(activeEl) activeEl.classList.remove('hidden');
    
    // 3. FORCE RENDER (This fixes the blank page issue)
    if(view === 'target') renderSyllabus('main');
    if(view === 'backlog') renderSyllabus('backlog');
    if(view === 'leaderboard') fetchLeaderboard();
    if(view === 'namaz') renderNamazView();
    if(view === 'points') renderPointsAnalytics();
    if(view === 'mistakes') {
        if(state.activeNotebook) renderNotebookEntries();
        else updateShelfCounts();
    }
    if(view === 'overview') renderTasks();
    
    // Initialize icons for the new view
    if(window.lucide) lucide.createIcons();
};

window.toggleMobileMenu = function(forceClose = false) {
    // TARGET THE NEW ID "sidebar" INSTEAD OF "mobile-sidebar"
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('mobile-menu-overlay');
    
    if (!sidebar) return;

    if (forceClose) {
        // Force Close: Hide sidebar off-screen & hide overlay
        sidebar.classList.add('-translate-x-full');
        sidebar.classList.remove('translate-x-0'); // Ensure it slides out
        if(overlay) overlay.classList.add('hidden');
    } else {
        // Toggle: Slide in or out
        const isClosed = sidebar.classList.contains('-translate-x-full');
        
        if (isClosed) {
            // OPEN IT
            sidebar.classList.remove('-translate-x-full');
            sidebar.classList.add('translate-x-0');
            if(overlay) overlay.classList.remove('hidden');
        } else {
            // CLOSE IT
            sidebar.classList.add('-translate-x-full');
            sidebar.classList.remove('translate-x-0');
            if(overlay) overlay.classList.add('hidden');
        }
    }
};
                
        // --- BOOKSHELF FUNCTIONS ---

        window.openNotebook = function(subject) {
            state.activeNotebook = subject;
            
            // UI Transitions
            document.getElementById('notebook-shelf').classList.add('hidden');
            document.getElementById('notebook-content').classList.remove('hidden');
            
            // Set Headers
            document.getElementById('notebook-title').textContent = `${subject} Notebook`;
            document.getElementById('mistake-subject-display').value = subject;
            
            // Dynamic Header Colors
            const headerBg = document.getElementById('notebook-header-bg');
            if(subject === 'Physics') headerBg.className = "px-6 py-4 border-b border-blue-100 dark:border-blue-900 flex items-center justify-between transition-colors bg-blue-50 dark:bg-blue-900/20";
            else if(subject === 'Chemistry') headerBg.className = "px-6 py-4 border-b border-orange-100 dark:border-orange-900 flex items-center justify-between transition-colors bg-orange-50 dark:bg-orange-900/20";
            else headerBg.className = "px-6 py-4 border-b border-green-100 dark:border-green-900 flex items-center justify-between transition-colors bg-green-50 dark:bg-green-900/20";

            renderNotebookEntries();
        };

        window.closeNotebook = function() {
            state.activeNotebook = null;
            document.getElementById('notebook-content').classList.add('hidden');
            document.getElementById('notebook-shelf').classList.remove('hidden');
            updateShelfCounts();
        };

        // --- IMAGE HANDLING ---

        window.handleImageUpload = function(input) {
            const file = input.files[0];
            if (file) {
                // INCREASED SIZE LIMIT: 800KB (approx 800,000 bytes)
                // This balances larger images with storage stability.
               if(file.size > 1048576) { // 1MB limit                    alert("Image is too large! Please use an image under 800KB.");
                    input.value = ''; // clear
                    return;
                }

                const reader = new FileReader();
                reader.onload = function(e) {
                    // Show preview
                    document.getElementById('upload-placeholder').classList.add('hidden');
                    document.getElementById('image-preview-container').classList.remove('hidden');
                    document.getElementById('image-preview').src = e.target.result;
                    // Store base64 string in hidden input
                    document.getElementById('mistake-image-base64').value = e.target.result;
                };
                reader.readAsDataURL(file);
            }
        };

        window.clearImage = function() {
            document.getElementById('mistake-file').value = '';
            document.getElementById('mistake-image-base64').value = '';
            document.getElementById('upload-placeholder').classList.remove('hidden');
            document.getElementById('image-preview-container').classList.add('hidden');
            // Prevent event bubbling if clicking the X
            if(event) event.stopPropagation(); 
        };

        window.viewFullImage = function(src) {
            document.getElementById('full-size-image').src = src;
            document.getElementById('image-viewer-modal').classList.remove('hidden');
        };

        // --- MISTAKE RENDERING & SAVING ---

        window.saveMistake = function(e) {
            e.preventDefault();
            if(!state.activeNotebook) return;

            const type = document.getElementById('mistake-type').value;
            const chapter = document.getElementById('mistake-chapter').value;
            const desc = document.getElementById('mistake-desc').value;
            const answer = document.getElementById('mistake-answer').value; // NEW
            const imgData = document.getElementById('mistake-image-base64').value;

            if(!chapter || !desc) {
                alert("Please fill in Chapter and Question Description");
                return;
            }

            const newMistake = {
                id: Date.now().toString(),
                date: new Date().toISOString(),
                subject: state.activeNotebook,
                chapter: chapter,
                type: type,
                desc: desc,
                answer: answer, // NEW
                image: imgData,
                resolved: false
            };

            if(!state.mistakes) state.mistakes = [];
            state.mistakes.unshift(newMistake);

            // Reset Form
            document.getElementById('mistake-form').reset();
            clearImage();
            document.getElementById('add-mistake-modal').classList.add('hidden');

            saveData();
            renderNotebookEntries();
            updateShelfCounts();
        };
        
        window.deleteMistake = function(id) {
            if(confirm("Delete this entry?")) {
                state.mistakes = state.mistakes.filter(m => m.id !== id);
                saveData();
                renderNotebookEntries();
            }
        };

        window.toggleMistakeResolved = function(id) {
            const m = state.mistakes.find(m => m.id === id);
            if(m) {
                m.resolved = !m.resolved;
                saveData();
                renderNotebookEntries();
                updateShelfCounts();
            }
        };

        window.renderNotebookEntries = function() {
            const list = document.getElementById('notebook-entries');
            if(!list || !state.activeNotebook) return;

            list.innerHTML = '';
            
            // Filter by the currently open notebook (Subject)
            const entries = (state.mistakes || []).filter(m => m.subject === state.activeNotebook);

            if(entries.length === 0) {
                list.innerHTML = `
                    <div class="h-64 flex flex-col items-center justify-center text-slate-400 dark:text-slate-500 opacity-60">
                        <i data-lucide="book-open" class="w-12 h-12 mb-3"></i>
                        <p>No errors logged in ${state.activeNotebook} yet.</p>
                    </div>`;
            }

            entries.forEach(m => {
                const dateStr = new Date(m.date).toLocaleDateString();
                
                let typeBadge = 'bg-slate-200 text-slate-700';
                if(m.type === 'Conceptual') typeBadge = 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300';
                if(m.type === 'Silly') typeBadge = 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300';
                if(m.type === 'Memory') typeBadge = 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300';

                const html = `
                    <div class="bg-white dark:bg-slate-900 border ${m.resolved ? 'border-green-200 dark:border-green-900' : 'border-slate-200 dark:border-slate-800'} rounded-xl p-0 shadow-sm overflow-hidden group">
                        <div class="p-4 flex flex-col md:flex-row gap-4">
                            <!-- Text Content -->
                             <div class="flex-1 min-w-0">
    <div class="flex items-center gap-2">
        <p class="text-sm font-bold text-slate-900 dark:text-white truncate max-w-[110px]" id="mobile-user-email">Guest</p>
        <button onclick="openProfileModal()" class="shrink-0 p-1.5 bg-brand-100 dark:bg-brand-900 text-brand-700 dark:text-brand-300 rounded-lg hover:bg-brand-200 transition-colors" aria-label="Edit Profile">
            <i data-lucide="edit-3" class="w-4 h-4"></i>
        </button>
    </div>
    <p class="text-[10px] font-medium text-slate-500 dark:text-slate-400" id="mobile-sync-status">Local Storage</p>
</div>                               
                                <div class="mb-2">
                                    <p class="text-xs font-bold text-slate-400 uppercase mb-1">Question / Mistake</p>
                                    <p class="text-sm text-slate-800 dark:text-slate-200 whitespace-pre-wrap ${m.resolved ? 'line-through opacity-60' : ''}">${escapeHtml(m.desc)}</p>
                                </div>
                                
                                <div id="answer-container-${m.id}" class="hidden mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 border-dashed">
                                    <p class="text-xs font-bold text-green-600 dark:text-green-400 uppercase mb-1">Correct Answer / Explanation</p>
                                    <p class="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap">${escapeHtml(m.answer || 'No answer recorded.')}</p>
                                </div>
                                
                                <button onclick="document.getElementById('answer-container-${m.id}').classList.remove('hidden'); this.classList.add('hidden')" class="mt-3 text-xs font-bold text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-1">
                                    <i data-lucide="eye" class="w-3 h-3"></i> Reveal Answer
                                </button>
                            </div>
                            
                            <!-- Thumbnail (if exists) -->
                            ${m.image ? `
                                <div class="w-24 h-24 flex-shrink-0 cursor-zoom-in border border-slate-100 dark:border-slate-700 rounded-lg overflow-hidden bg-slate-50 relative group/img" onclick="viewFullImage('${m.image}')">
                                    <img src="${m.image}" class="w-full h-full object-cover">
                                    <div class="absolute inset-0 bg-black/0 group-hover/img:bg-black/10 transition-colors"></div>
                                </div>
                            ` : ''}
                        </div>
                        
                        <!-- Actions Footer -->
                        <div class="bg-slate-50 dark:bg-slate-800/50 px-4 py-2 flex justify-between items-center border-t border-slate-100 dark:border-slate-800">
                            <button onclick="deleteMistake('${m.id}')" class="text-xs text-slate-400 hover:text-red-500 font-medium flex items-center gap-1">
                                <i data-lucide="trash-2" class="w-3 h-3"></i> Delete
                            </button>
                            <button onclick="toggleMistakeResolved('${m.id}')" class="text-xs font-bold flex items-center gap-1 ${m.resolved ? 'text-green-600 dark:text-green-400' : 'text-slate-500 hover:text-brand-600'}">
                                <i data-lucide="${m.resolved ? 'check-circle-2' : 'circle'}" class="w-3 h-3"></i>
                                ${m.resolved ? 'Resolved' : 'Mark Resolved'}
                            </button>
                        </div>
                    </div>
                `;
                list.insertAdjacentHTML('beforeend', html);
            });

            if(window.lucide) lucide.createIcons({ root: list });
        };

        window.updateShelfCounts = function() {
            const counts = { Physics: 0, Chemistry: 0, Biology: 0 };
            (state.mistakes || []).forEach(m => {
                if(counts[m.subject] !== undefined && !m.resolved) counts[m.subject]++;
            });
            
            const pEl = document.getElementById('count-physics');
            const cEl = document.getElementById('count-chemistry');
            const bEl = document.getElementById('count-biology');

            if(pEl) pEl.textContent = `${counts.Physics} Active Errors`;
            if(cEl) cEl.textContent = `${counts.Chemistry} Active Errors`;
            if(bEl) bEl.textContent = `${counts.Biology} Active Errors`;
        };

        window.updateFooterProgress = function() { renderStats(); };
        window.toggleDailyTest = function(uniqueId) { state.expandedTests[uniqueId] = !state.expandedTests[uniqueId]; renderSyllabus(state.activeView === 'backlog' ? 'backlog' : 'main'); };
        window.toggleChapter = function(uniqueId) { state.expandedTests[uniqueId] = !state.expandedTests[uniqueId]; renderSyllabus(state.activeView === 'backlog' ? 'backlog' : 'main'); };
        window.addSyllabusTask = function(txt, type, subject, chapter) { addTask(`Study: ${txt}`, type, subject, chapter); };
        
        // FIXED: Immutable date operation
        window.changeDay = function(d) { 
            const newDate = new Date(state.selectedDate);
            newDate.setDate(newDate.getDate() + d);
            state.selectedDate = newDate;
            renderAll(); 
        };
        
        window.goToToday = function() {
            state.selectedDate = new Date();
            renderAll();
        };


// --- LEADERBOARD LOGIC ---
let leaderboardCache = [];
let activeRankTab = 'overall';

window.switchRankTab = function(tab) {
    activeRankTab = tab;
    ['overall', 'exam', 'backlog', 'tests'].forEach(t => {
        const btn = document.getElementById(`tab-${t}`);
        if(btn) {
            if(t === tab) btn.className = "px-4 py-2 rounded-lg text-xs font-bold transition-all bg-white dark:bg-slate-700 shadow-sm text-brand-600 dark:text-brand-400 ring-1 ring-black/5 dark:ring-white/10";
            else btn.className = "px-4 py-2 rounded-lg text-xs font-bold transition-all text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200";
        }
    });
    renderLeaderboardList();
};

window.fetchLeaderboard = async function() {
    if (!isFirebaseActive) {
        document.getElementById('leaderboard-list').innerHTML = `<div class="p-8 text-center text-slate-400">Leaderboard requires Cloud Sync. Please log in.</div>`;
        return;
    }
    try {
        // Fetch top 50 users
        const q = query(collection(db, "leaderboard"), orderBy("overallScore", "desc"), limit(50));
        const snapshot = await getDocs(q);
        leaderboardCache = [];
        snapshot.forEach(doc => {
            leaderboardCache.push({ id: doc.id, ...doc.data() });
        });
        renderLeaderboardList();
    } catch (e) {
        console.error("Error fetching leaderboard:", e);
        document.getElementById('leaderboard-list').innerHTML = `<div class="p-8 text-center text-red-400">Failed to load rankings.<br>Check Firestore rules.</div>`;
    }
};
window.renderLeaderboardList = function() {
    const list = document.getElementById('leaderboard-list');
    if(!list) return;

    // 1. Get Live Stats for "You" so the list updates instantly when you interact
    const myStats = calculateUserStats();
    
    // 2. Update Profile Card (Top Section)
    const myNameEl = document.getElementById('lb-user-name');
    if(myNameEl) myNameEl.textContent = state.displayName || (currentUser ? currentUser.email.split('@')[0] : "Guest");
    
    // Update Your Pill Stats
    if(document.getElementById('lb-my-exam')) document.getElementById('lb-my-exam').textContent = `${myStats.mainPct}%`;
    if(document.getElementById('lb-my-backlog')) document.getElementById('lb-my-backlog').textContent = `${myStats.blPct}%`;
    // Note: We now use testPct (%) for consistency with the new Fair Rule
    if(document.getElementById('lb-my-tests')) document.getElementById('lb-my-tests').textContent = `${myStats.testPct || 0}%`;
    
    // 3. FILTER & SORT (By Season)
    const currentExamName = state.nextExam.name;
    const headerTitle = document.querySelector('#view-leaderboard h1');
    
    // Add Season Badge to Title
    if(headerTitle) headerTitle.innerHTML = `<i data-lucide="trophy" class="w-5 h-5 text-yellow-500"></i> Leaderboard <span class="hidden md:inline-block text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 px-2 py-0.5 rounded-full ml-2 align-middle border border-slate-200 dark:border-slate-700">${currentExamName}</span>`;

    let sortedData = [...leaderboardCache]
        .filter(u => u.currentExam === currentExamName) 
        .sort((a, b) => (b.overallScore || 0) - (a.overallScore || 0));

    // Update My Rank Display
    const myId = currentUser ? currentUser.uid : null;
    const myRankIndex = sortedData.findIndex(u => u.id === myId);
    const myRankEl = document.getElementById('lb-my-rank');
    if(myRankEl) myRankEl.textContent = myRankIndex > -1 ? `#${myRankIndex + 1}` : '-';

    // 4. EMPTY STATE
    if(sortedData.length === 0) {
        list.innerHTML = `
            <div class="flex flex-col items-center justify-center py-12 text-slate-400 opacity-60">
                <div class="bg-slate-100 dark:bg-slate-800 p-4 rounded-full mb-3">
                    <i data-lucide="flag" class="w-8 h-8 text-slate-300 dark:text-slate-600"></i>
                </div>
                <p class="text-sm font-medium">New Season Started!</p>
                <p class="text-xs">Complete a task to be the first.</p>
            </div>`;
        if(window.lucide) lucide.createIcons({ root: list });
        return;
    }

    // 5. RENDER CARDS (New Design)
    list.innerHTML = sortedData.map((user, index) => {
        const isMe = user.id === myId;
        const stats = isMe ? myStats : user; // Use live stats for yourself
        
        // --- RANK STYLING (Gold/Silver/Bronze) ---
        let rankDisplay = `<span class="text-sm font-bold text-slate-500 w-6 text-center">#${index + 1}</span>`;
        let borderClass = "border-slate-200 dark:border-slate-800";
        let bgClass = "bg-white dark:bg-slate-900";

        if (index === 0) {
            rankDisplay = `<div class="w-7 h-7 rounded-full bg-yellow-100 text-yellow-700 flex items-center justify-center shadow-sm ring-1 ring-yellow-200"><i data-lucide="crown" class="w-3.5 h-3.5 fill-current"></i></div>`;
            borderClass = "border-yellow-400/60 ring-1 ring-yellow-400/20";
            bgClass = "bg-gradient-to-r from-yellow-50/50 to-white dark:from-yellow-900/10 dark:to-slate-900";
        } else if (index === 1) {
            rankDisplay = `<div class="w-7 h-7 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center shadow-sm ring-1 ring-slate-200 font-bold text-xs">2</div>`;
            borderClass = "border-slate-300 dark:border-slate-600";
        } else if (index === 2) {
            rankDisplay = `<div class="w-7 h-7 rounded-full bg-orange-100 text-orange-700 flex items-center justify-center shadow-sm ring-1 ring-orange-200 font-bold text-xs">3</div>`;
            borderClass = "border-orange-300 dark:border-orange-700";
        }

        // Highlight "Me"
        if (isMe) {
            borderClass = "border-brand-500 ring-1 ring-brand-500 shadow-md shadow-brand-500/10";
            bgClass = "bg-brand-50 dark:bg-brand-900/10";
        }

        // Safe Fallbacks for display
        const dispMain = stats.mainPct || 0;
        const dispBacklog = stats.blPct || 0;
        // Show % if available (new data), otherwise count (old data) to avoid showing "0%" for valid old tests
        const dispTest = (stats.testPct !== undefined) ? `${stats.testPct}%` : (stats.testCount || 0); 

        return `
            <div class="relative flex flex-col gap-3 p-4 rounded-2xl border ${borderClass} ${bgClass} mb-3 transition-transform active:scale-[0.99]">
                
                <div class="flex justify-between items-center">
                    <div class="flex items-center gap-3">
                        ${rankDisplay}
                        <div class="flex flex-col">
                            <span class="text-sm font-bold text-slate-900 dark:text-white leading-tight flex items-center gap-2">
                                ${user.displayName || 'User'}
                                ${isMe ? '<span class="bg-brand-600 text-white text-[9px] px-1.5 py-0.5 rounded-full font-bold tracking-wide">YOU</span>' : ''}
                            </span>
                            <span class="text-[10px] text-slate-400 font-medium">Rank ${index + 1}</span>
                        </div>
                    </div>
                    <div class="text-right">
                        <span class="block text-lg font-black text-brand-600 dark:text-brand-400 leading-none">${stats.overallScore || 0}</span>
                        <span class="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Points</span>
                    </div>
                </div>

                <div class="grid grid-cols-3 gap-2 mt-1">
                    <div class="flex items-center gap-2 bg-slate-50 dark:bg-black/20 p-2 rounded-lg border border-slate-100 dark:border-white/5">
                        <div class="w-6 h-6 rounded-md bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0">
                            <i data-lucide="target" class="w-3.5 h-3.5"></i>
                        </div>
                        <div class="min-w-0">
                            <div class="text-[9px] text-slate-400 font-bold uppercase truncate">Exam</div>
                            <div class="text-xs font-bold text-slate-700 dark:text-slate-200">${dispMain}%</div>
                        </div>
                    </div>

                    <div class="flex items-center gap-2 bg-slate-50 dark:bg-black/20 p-2 rounded-lg border border-slate-100 dark:border-white/5">
                        <div class="w-6 h-6 rounded-md bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center text-orange-600 dark:text-orange-400 shrink-0">
                            <i data-lucide="history" class="w-3.5 h-3.5"></i>
                        </div>
                        <div class="min-w-0">
                            <div class="text-[9px] text-slate-400 font-bold uppercase truncate">Backlog</div>
                            <div class="text-xs font-bold text-slate-700 dark:text-slate-200">${dispBacklog}%</div>
                        </div>
                    </div>

                    <div class="flex items-center gap-2 bg-slate-50 dark:bg-black/20 p-2 rounded-lg border border-slate-100 dark:border-white/5">
                        <div class="w-6 h-6 rounded-md bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
                            <i data-lucide="file-check" class="w-3.5 h-3.5"></i>
                        </div>
                        <div class="min-w-0">
                            <div class="text-[9px] text-slate-400 font-bold uppercase truncate">Tests</div>
                            <div class="text-xs font-bold text-slate-700 dark:text-slate-200">${dispTest}</div>
                        </div>
                    </div>
                </div>

            </div>
        `;
    }).join('');

    if(window.lucide) lucide.createIcons({ root: list });
    updateSidebarBadges();
};     
// --- PROFILE FUNCTIONS ---
    window.openProfileModal = function() {
        const input = document.getElementById('profile-name-input');
        if(state.displayName) input.value = state.displayName;
        document.getElementById('profile-modal').classList.remove('hidden');
        input.focus();
    };

    window.saveProfileName = function() {
        const input = document.getElementById('profile-name-input');
        const newName = input.value.trim();
        
        if(newName) {
            state.displayName = newName;
            if(isFirebaseActive && currentUser) {
                const docRef = getSafeDocRef(currentUser.uid);
                setDoc(docRef, { displayName: newName }, { merge: true });
            } else {
                localStorage.setItem('studyflow_username', newName);
            }
            saveData();
        }
        document.getElementById('profile-modal').classList.add('hidden');
        renderHeader(); 
    };


window.updateSidebarBadges = function() {
    // 1. Mistake Badge (Count unresolved)
    const mistakeCount = (state.mistakes || []).filter(m => !m.resolved).length;
    const mBadge = document.getElementById('badge-mistakes');
    if(mBadge) {
        mBadge.textContent = mistakeCount;
        if(mistakeCount > 0) mBadge.classList.remove('hidden');
        else mBadge.classList.add('hidden');
    }

    // 2. Backlog Phase Badge
    const bBadge = document.getElementById('badge-backlog');
    if(bBadge && typeof backlogPlan !== 'undefined') {
        const planStart = backlogPlan.startDate || new Date();
        const diffDays = Math.ceil((new Date() - planStart) / (1000 * 60 * 60 * 24)); 
        let phase = 1;
        if(diffDays > 45) phase = 4;
        else if(diffDays > 30) phase = 3;
        else if(diffDays > 15) phase = 2;
        
        bBadge.textContent = `Ph ${phase}`;
        bBadge.classList.remove('hidden');
    }

    // 3. Leaderboard Rank (From Cache)
    const rBadge = document.getElementById('badge-rank');
    if(rBadge && leaderboardCache.length > 0 && currentUser) {
        const myRank = leaderboardCache.findIndex(u => u.id === currentUser.uid);
        if(myRank > -1) {
            rBadge.textContent = `#${myRank + 1}`;
            rBadge.classList.remove('hidden');
        }
    }
};

// --- PLANNER FUNCTIONS ---



window.initScrollHeader = function() {
    // 🛑 LOGIC DISABLED for GitHub Style
    const headerEl = document.getElementById('overview-header');
    if(headerEl) headerEl.style.transform = "none";
};

document.addEventListener('DOMContentLoaded', init);
        // Optimization: FOUC listener - Triggered on DOMContentLoaded instead of Load for faster paint
        document.addEventListener('DOMContentLoaded', () => {
            // Small timeout to allow Tailwind CDN to parse initial classes
            setTimeout(() => document.body.classList.add('loaded'), 50);
        });

        // UTILITY: Debounce for search performance
        function debounce(func, wait) {
            let timeout;
            return function(...args) {
                clearTimeout(timeout);
                timeout = setTimeout(() => func.apply(this, args), wait);
            };
        }

        // Global search handler with debounce
        const debouncedRender = debounce((query, type) => {
            renderSyllabus(type, query);
        }, 300); // 300ms delay

        window.handleSearch = function(query, type) {
            debouncedRender(query, type);
        };

        
window.renderAll = function() {
    renderHeader();
renderHeaderPrayerWidget();
    renderStats();
    updateSidebarBadges();


    // Performance Optimization: Lazy Rendering
    if (state.activeView === 'overview') {
        renderTasks();
            } else if (state.activeView === 'target') {
        renderSyllabus('main');
    } else if (state.activeView === 'backlog') {
        renderSyllabus('backlog');
    } else if (state.activeView === 'mistakes') {
        if(state.activeNotebook) {
            renderNotebookEntries();
        } else {
            updateShelfCounts();
        }
    } else if (state.activeView === 'namaz') {
        renderNamazView();
    } else if (state.activeView === 'leaderboard') {
        renderLeaderboardList();
    }
    else if (state.activeView === 'points') {
        renderPointsAnalytics();
    }
    // Re-scan icons if library is loaded
    if(window.lucide) lucide.createIcons();
};

window.renderTasks = renderTasks;


window.renderHeader = function() {
    const container = document.getElementById('header-dynamic-greeting');
    if (!container) return;

    // 1. IF OVERVIEW: Show Date Switcher
    if (state.activeView === 'overview') {
        const isToday = formatDateKey(state.selectedDate) === formatDateKey(new Date());
        
        // Format: "Jan 30" or "Today"
        const dateDisplay = isToday 
            ? `<span class="font-extrabold text-brand-600 dark:text-brand-400">Today</span>` 
            : state.selectedDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });

        container.innerHTML = `
            <div class="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm animate-in fade-in zoom-in duration-200">
                <button onclick="changeDay(-1)" class="p-1.5 hover:bg-white dark:hover:bg-slate-700 rounded-lg text-slate-500 dark:text-slate-400 transition-all active:scale-90" aria-label="Previous Day">
                    <i data-lucide="chevron-left" class="w-4 h-4"></i>
                </button>
                
                <button onclick="goToToday()" class="px-3 py-1 text-xs font-bold text-slate-700 dark:text-slate-200 min-w-[80px] text-center active:scale-95 transition-transform" title="Jump to Today">
                    ${dateDisplay}
                </button>

                <button onclick="changeDay(1)" class="p-1.5 hover:bg-white dark:hover:bg-slate-700 rounded-lg text-slate-500 dark:text-slate-400 transition-all active:scale-90" aria-label="Next Day">
                    <i data-lucide="chevron-right" class="w-4 h-4"></i>
                </button>
            </div>
        `;
    } 
    // 2. OTHER VIEWS: Show Page Title
    else {
        const titles = {
            'target': 'Target Syllabus',
            'backlog': 'Recovery Plan',
            'mistakes': 'Mistake Notebook',
            'leaderboard': 'Leaderboard',
            'namaz': 'Spiritual Growth',
            'points': 'Points Analytics'
        };
        const title = titles[state.activeView] || 'StudyFlow';
        
        container.innerHTML = `
            <h1 class="text-lg font-bold text-slate-900 dark:text-white tracking-tight px-1 flex items-center gap-2 animate-in slide-in-from-left-2 fade-in duration-200">
                ${title}
            </h1>
        `;
    }

    // 3. Render Widgets (Prayer Strip)
    if(typeof window.renderHeaderPrayerWidget === 'function') {
        window.renderHeaderPrayerWidget();
    }
    
    // 4. Refresh Icons
    if(window.lucide) lucide.createIcons({ root: container });
};

// ✅ RESTORED: This function was missing!
window.renderHeaderPrayerWidget = function() {
    const container = document.getElementById('header-prayer-widget');
    if (!container) return;

    const k = formatDateKey(state.selectedDate);
    const todayData = state.prayers[k] || {};
    
    const prayers = [
        { key: 'Fajr', label: 'F' },
        { key: 'Dhuhr', label: 'D' },
        { key: 'Asr', label: 'A' },
        { key: 'Maghrib', label: 'M' },
        { key: 'Isha', label: 'I' }
    ];

    container.innerHTML = prayers.map(p => {
        const isDone = todayData[p.key] === true;
        
        let baseClass = "flex-1 md:flex-none h-9 w-8 md:w-10 md:h-10 rounded-xl flex items-center justify-center text-xs font-bold transition-all duration-200 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-sm";
        
        let stateClass = isDone 
            ? "bg-emerald-500 text-white !border-emerald-500 shadow-md shadow-emerald-500/30 scale-105" 
            : "text-slate-400 dark:text-slate-500 hover:text-brand-600 dark:hover:text-brand-400 hover:border-brand-300 dark:hover:border-brand-700";

        return `
            <button onclick="togglePrayer('${p.key}')" class="${baseClass} ${stateClass}" title="Mark ${p.key} as done">
                ${isDone ? '<i data-lucide="check" class="w-3.5 h-3.5"></i>' : p.label}
            </button>
        `;
    }).join('');

    if(window.lucide) lucide.createIcons({ root: container });
};
// ==========================================
// 🚀 TACTICAL DASHBOARD V4 (Strict Phases + Total %)
// ==========================================
window.renderStats = function() {
    const container = document.getElementById('stats-container');
    if (!container) return;

    // --- 1. DETERMINE ACTIVE BACKLOG PHASE ---
    // We calculate this first to filter data correctly
    const planStart = (typeof backlogPlan !== 'undefined') ? backlogPlan.startDate : new Date();
    const now = new Date();
    const diffTime = now - planStart;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
    
    let currentPhase = 1;
    if(diffDays > 45) currentPhase = 4;
    else if(diffDays > 30) currentPhase = 3;
    else if(diffDays > 15) currentPhase = 2;

    // --- 2. PREPARE SYLLABUS DATA ---
    // Main Exam: Uses everything
    const mainSyllabus = state.nextExam ? state.nextExam.syllabus : [];
    
    // Backlog: STRICTLY filter to ONLY the current phase
    const backlogSyllabus = (typeof backlogPlan !== 'undefined') 
        ? backlogPlan.syllabus.filter(item => item.phase === currentPhase) 
        : [];

    // --- 3. CORE CALCULATIONS ---
    // We re-use the smart math logic but pass our filtered syllabus
    // Note: calculateSmartMath usually grabs data internally, so we simulate it here for stats
    
    const getDailyData = (syllabus) => {
        const k = formatDateKey(state.selectedDate);
        const tasks = state.tasks[k] || [];
        let planned = 0, completed = 0;
        
        tasks.forEach(t => {
            syllabus.forEach(chap => {
                chap.dailyTests.forEach(dt => {
                    dt.subs.forEach(sub => {
                        if (t.text.includes(sub)) {
                             const pts = getSubtopicPoints(dt, chap.subject, chap.topic);
                             planned += pts;
                             if(t.completed) completed += pts;
                        }
                    });
                });
            });
        });
        return { planned, completed };
    };

    const execMain = getDailyData(mainSyllabus);
    const execBacklog = getDailyData(backlogSyllabus); // Uses filtered list

    // Recalculate Targets based on filtered lists
    const getTarget = (syllabus, endDateStr) => {
        const today = new Date(); today.setHours(0,0,0,0);
        const targetDate = new Date(endDateStr);
        const daysLeft = Math.max(1, Math.ceil((targetDate - today) / (1000 * 60 * 60 * 24)));
        
        let totalPts = 0, earnedPts = 0;
        const allCompleted = new Set(Object.values(state.tasks).flat().filter(t => t.completed).map(t => t.text));

        syllabus.forEach(chap => {
            chap.dailyTests.forEach(dt => {
                const subPts = getSubtopicPoints(dt, chap.subject, chap.topic);
                dt.subs.forEach(sub => {
                    totalPts += subPts;
                    if (allCompleted.has(`Study: ${chap.topic} - ${sub}`) || state.dailyTestsAttempted[dt.name]) {
                        earnedPts += subPts;
                    }
                });
            });
        });
        
        // Coverage % Calculation
        const coveragePct = totalPts === 0 ? 0 : Math.round((earnedPts / totalPts) * 100);
        
        return { 
            daysLeft, 
            dailyTarget: (totalPts - earnedPts) / daysLeft,
            coveragePct
        };
    };

    // Dates: Main Exam vs Current Phase End
    const mainStats = getTarget(mainSyllabus, '2026-02-07T00:00:00');
    
    // Calculate Phase End Date dynamically
    const phaseEndDate = new Date(planStart);
    phaseEndDate.setDate(planStart.getDate() + (currentPhase * 15));
    const backlogStats = getTarget(backlogSyllabus, phaseEndDate);

    // --- 4. VELOCITY VISUALS ---
    const getVelocityStatus = (done, target) => {
        if (target <= 0.1) return { label: "GOAL MET", color: "text-emerald-400", bg: "bg-emerald-500", percent: 100 };
        const pct = (done / target) * 100;
        if (pct >= 100) return { label: "CRUSHING IT", color: "text-emerald-400", bg: "bg-emerald-500", percent: Math.min(100, pct) };
        if (pct >= 80) return { label: "ON TRACK", color: "text-teal-400", bg: "bg-teal-500", percent: pct };
        if (pct >= 50) return { label: "WORKING", color: "text-yellow-400", bg: "bg-yellow-500", percent: pct };
        if (pct > 0) return { label: "LAGGING", color: "text-orange-400", bg: "bg-orange-500", percent: pct };
        return { label: "NOT STARTED", color: "text-slate-400", bg: "bg-slate-500", percent: 0 };
    };

    const velMain = getVelocityStatus(execMain.completed, mainStats.dailyTarget);
    const velBacklog = getVelocityStatus(execBacklog.completed, backlogStats.dailyTarget);

    // --- 5. SUBJECT ANALYTICS (Filtered) ---
    const getSubjectBreakdown = (syllabus) => {
        const stats = { Physics: {t:0, d:0}, Chemistry: {t:0, d:0}, Biology: {t:0, d:0} };
        const allCompleted = new Set(Object.values(state.tasks).flat().filter(t => t.completed).map(t => t.text));

        syllabus.forEach(chap => {
            let subj = chap.subject;
            if(subj === 'Botany' || subj === 'Zoology') subj = 'Biology';
            chap.dailyTests.forEach(dt => {
                const isTestDone = state.dailyTestsAttempted[dt.name];
                dt.subs.forEach(sub => {
                    if(stats[subj]) {
                        stats[subj].t++;
                        if(isTestDone || allCompleted.has(`Study: ${chap.topic} - ${sub}`)) stats[subj].d++;
                    }
                });
            });
        });
        return { 
            Physics: { total: stats.Physics.t, done: stats.Physics.d },
            Chemistry: { total: stats.Chemistry.t, done: stats.Chemistry.d },
            Biology: { total: stats.Biology.t, done: stats.Biology.d }
        };
    };

    const statsMain = getSubjectBreakdown(mainSyllabus);
    const statsBacklog = getSubjectBreakdown(backlogSyllabus); // Strict Phase Filtering Applied Here

    // Helper for rendering Subject Bars
    const renderSmartSubject = (subj, data, allData) => {
        const pct = data.total > 0 ? Math.round((data.done / data.total) * 100) : 0;
        
        let totalPct = 0; let count = 0;
        Object.values(allData).forEach(d => { if(d.total > 0) { totalPct += (d.done / d.total) * 100; count++; } });
        const avg = count > 0 ? totalPct / count : 0;
        
        let status = "Balanced";
        let barColor = "bg-slate-400";
        let statusIcon = "";

        if(pct < avg - 5) { status = "Lagging"; barColor = "bg-rose-500"; statusIcon = `<i data-lucide="alert-circle" class="w-2 h-2 text-rose-500"></i>`; }
        else if (pct > avg + 5) { status = "Strong"; barColor = "bg-emerald-500"; statusIcon = `<i data-lucide="zap" class="w-2 h-2 text-emerald-500"></i>`; }
        else {
            if(subj === 'Physics') barColor = "bg-blue-500";
            if(subj === 'Chemistry') barColor = "bg-cyan-500";
            if(subj === 'Biology') barColor = "bg-green-500";
        }

        return `
            <div class="mb-3 last:mb-0 group">
                <div class="flex justify-between items-end mb-1">
                    <div class="flex items-center gap-1.5">
                        <span class="text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400 w-14">${subj}</span>
                        ${statusIcon}
                    </div>
                    <span class="text-xs font-bold text-slate-700 dark:text-white">${pct}%</span>
                </div>
                <div class="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div class="h-full ${barColor} transition-all duration-1000 group-hover:opacity-80" style="width: ${pct}%"></div>
                </div>
            </div>
        `;
    };

    // Find Weakest Subject
    let weakestSub = "None";
    let lowest = 101;
    [statsMain, statsBacklog].forEach(grp => Object.entries(grp).forEach(([k, v]) => {
        const p = v.total > 0 ? (v.done / v.total) * 100 : 0;
        if(p < lowest) { lowest = p; weakestSub = k; }
    }));

    // --- 6. RENDER HTML ---
    container.innerHTML = `
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-8">
            
            <div class="relative overflow-hidden rounded-3xl p-6 bg-slate-900 dark:bg-black text-white shadow-xl flex flex-col justify-between group border border-slate-800">
                <div class="absolute top-0 right-0 p-6 opacity-10 group-hover:scale-110 transition-transform duration-700">
                    <i data-lucide="zap" class="w-32 h-32 text-white"></i>
                </div>
                
                <div class="relative z-10">
                    <div class="flex justify-between items-start mb-6">
                        <div class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/10 backdrop-blur-md border border-white/10 text-[10px] font-bold uppercase tracking-wider text-slate-300">
                            Main Target
                        </div>
                        <div class="text-right">
                            <div class="text-2xl font-black leading-none">${mainStats.daysLeft}</div>
                            <div class="text-[9px] uppercase font-bold text-slate-500">Days Left</div>
                        </div>
                    </div>

                    <div class="grid grid-cols-2 gap-4 mb-6">
                        <div>
                            <div class="text-3xl font-black tracking-tight mb-0.5">
                                ${execMain.completed.toFixed(1)} <span class="text-sm text-slate-500 font-bold">/ ${mainStats.dailyTarget.toFixed(1)}</span>
                            </div>
                            <div class="text-[9px] uppercase font-bold text-slate-400">Daily Velocity</div>
                        </div>
                        <div class="text-right">
                            <div class="text-3xl font-black tracking-tight mb-0.5 text-blue-400">
                                ${mainStats.coveragePct}%
                            </div>
                            <div class="text-[9px] uppercase font-bold text-slate-400">Total Covered</div>
                        </div>
                    </div>

                    <div>
                        <div class="flex justify-between items-end mb-2">
                            <div class="flex items-center gap-2">
                                <span class="relative flex h-2 w-2">
                                  <span class="animate-ping absolute inline-flex h-full w-full rounded-full ${velMain.bg} opacity-75"></span>
                                  <span class="relative inline-flex rounded-full h-2 w-2 ${velMain.bg}"></span>
                                </span>
                                <span class="text-xs font-bold ${velMain.color}">${velMain.label}</span>
                            </div>
                        </div>
                        <div class="h-4 w-full bg-slate-800 rounded-full overflow-hidden border border-white/5">
                            <div class="h-full bg-gradient-to-r from-blue-500 to-indigo-500 shadow-[0_0_15px_rgba(59,130,246,0.5)] transition-all duration-1000 relative" style="width: ${velMain.percent}%">
                                <div class="absolute inset-0 bg-white/20 w-full -translate-x-full animate-[shimmer_2s_infinite]"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="relative overflow-hidden rounded-3xl p-6 bg-slate-900 dark:bg-black text-white shadow-xl flex flex-col justify-between group border border-slate-800">
                <div class="absolute top-0 right-0 p-6 opacity-10 group-hover:scale-110 transition-transform duration-700">
                    <i data-lucide="history" class="w-32 h-32 text-orange-500"></i>
                </div>
                
                <div class="relative z-10">
                    <div class="flex justify-between items-start mb-6">
                        <div class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-orange-500/10 backdrop-blur-md border border-orange-500/20 text-[10px] font-bold uppercase tracking-wider text-orange-200">
                            Backlog Phase ${currentPhase}
                        </div>
                        <div class="text-right">
                            <div class="text-2xl font-black leading-none text-orange-500">${backlogStats.daysLeft}</div>
                            <div class="text-[9px] uppercase font-bold text-slate-500">Days Left</div>
                        </div>
                    </div>

                    <div class="grid grid-cols-2 gap-4 mb-6">
                        <div>
                            <div class="text-3xl font-black tracking-tight mb-0.5 text-white">
                                ${execBacklog.completed.toFixed(1)} <span class="text-sm text-slate-500 font-bold">/ ${backlogStats.dailyTarget.toFixed(1)}</span>
                            </div>
                            <div class="text-[9px] uppercase font-bold text-slate-400">Daily Velocity</div>
                        </div>
                        <div class="text-right">
                            <div class="text-3xl font-black tracking-tight mb-0.5 text-orange-400">
                                ${backlogStats.coveragePct}%
                            </div>
                            <div class="text-[9px] uppercase font-bold text-slate-400">Phase Completion</div>
                        </div>
                    </div>

                    <div>
                        <div class="flex justify-between items-end mb-2">
                            <div class="flex items-center gap-2">
                                <span class="relative flex h-2 w-2">
                                  <span class="animate-ping absolute inline-flex h-full w-full rounded-full ${velBacklog.bg} opacity-75"></span>
                                  <span class="relative inline-flex rounded-full h-2 w-2 ${velBacklog.bg}"></span>
                                </span>
                                <span class="text-xs font-bold ${velBacklog.color}">${velBacklog.label}</span>
                            </div>
                        </div>
                        <div class="h-4 w-full bg-slate-800 rounded-full overflow-hidden border border-white/5">
                            <div class="h-full bg-gradient-to-r from-orange-500 to-red-500 shadow-[0_0_15px_rgba(249,115,22,0.5)] transition-all duration-1000 relative" style="width: ${velBacklog.percent}%">
                                <div class="absolute inset-0 bg-white/20 w-full -translate-x-full animate-[shimmer_2s_infinite]"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm flex flex-col relative overflow-hidden">
                <div class="flex justify-between items-center mb-4">
                    <h4 class="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <i data-lucide="bar-chart-2" class="w-4 h-4 text-brand-500"></i> Subject Analysis
                    </h4>
                    ${weakestSub !== "None" ? `<span class="text-[9px] font-bold px-2 py-0.5 rounded-full bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 animate-pulse">Focus: ${weakestSub}</span>` : ''}
                </div>

                <div class="grid grid-cols-2 gap-6 h-full">
                    <div>
                        <div class="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-3 border-b border-slate-100 dark:border-slate-800 pb-1">
                            Main Exam
                        </div>
                        <div class="space-y-1">
                            ${renderSmartSubject('Physics', statsMain.Physics, statsMain)}
                            ${renderSmartSubject('Chemistry', statsMain.Chemistry, statsMain)}
                            ${renderSmartSubject('Biology', statsMain.Biology, statsMain)}
                        </div>
                    </div>

                    <div class="border-l border-slate-100 dark:border-slate-800 pl-6">
                        <div class="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-3 border-b border-slate-100 dark:border-slate-800 pb-1">
                            Backlog (Ph ${currentPhase})
                        </div>
                        <div class="space-y-1">
                            ${renderSmartSubject('Physics', statsBacklog.Physics, statsBacklog)}
                            ${renderSmartSubject('Chemistry', statsBacklog.Chemistry, statsBacklog)}
                            ${renderSmartSubject('Biology', statsBacklog.Biology, statsBacklog)}
                        </div>
                    </div>
                </div>
            </div>

        </div>
    `;

    if(window.lucide) lucide.createIcons({ root: container });
};
 function createTaskElementHTML(t, isSubTask = false) {
            // Updated Styles for "Pill" look
            let wrapperClass = "group flex items-center justify-between p-3 rounded-2xl transition-all duration-200 border relative overflow-hidden ";
            
            if (t.type === 'main') {
                wrapperClass += "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-brand-300 dark:hover:border-brand-700 hover:shadow-md dark:hover:shadow-none hover:shadow-brand-500/5";
            } else if (t.type === 'backlog') {
                wrapperClass += "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-orange-300 dark:hover:border-orange-700 hover:shadow-md hover:shadow-orange-500/5";
            } else {
                wrapperClass += "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-600 hover:shadow-sm";
            }

            // Subtasks (inside groups) get a slightly different look
            if(isSubTask) {
                wrapperClass = "flex items-center justify-between p-2.5 pl-4 rounded-xl border border-transparent hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all mb-1";
            }

            // Completed State
            if (t.completed) {
                wrapperClass += " opacity-60 grayscale";
            }

            // Tags
            let typeColorClass = t.type === 'main' 
                ? 'text-brand-600 bg-brand-50 dark:bg-brand-900/20 dark:text-brand-300' 
                : (t.type === 'backlog' ? 'text-orange-600 bg-orange-50 dark:bg-orange-900/20 dark:text-orange-300' : 'text-slate-500 bg-slate-100 dark:bg-slate-800');
            
            let subjectColor = getSubjectColor(t.subject).replace('bg-', 'bg-opacity-50 bg-'); // Make lighter

            let displayText = t.text;
            if(isSubTask && t.chapter) {
                 const prefix = `Study: ${t.chapter} - `;
                 if(displayText.startsWith(prefix)) displayText = displayText.substring(prefix.length);
            }

            // Safe HTML escape to match your security standards
            const safeText = escapeHtml(displayText);

            return `
                <div class="${wrapperClass}">
                    ${t.completed ? '<div class="absolute inset-0 bg-slate-100/50 dark:bg-black/50 z-0 pointer-events-none"></div>' : ''}
                    
                    <div class="flex items-center gap-4 overflow-hidden cursor-pointer flex-1 relative z-10" onclick="toggleTask('${t.id}')">
                        <div class="w-6 h-6 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-all duration-300 ${t.completed ? 'bg-green-500 border-green-500 scale-110' : 'border-slate-300 dark:border-slate-600 hover:border-brand-400'}">
                            <i data-lucide="check" class="w-3.5 h-3.5 text-white transform ${t.completed ? 'scale-100' : 'scale-0'} transition-transform duration-200"></i>
                        </div>
                        
                        <div class="flex flex-col min-w-0">
                            <span class="truncate text-sm font-semibold ${t.completed ? 'text-slate-400 line-through decoration-2 decoration-slate-300' : 'text-slate-800 dark:text-slate-200'}">${safeText}</span>
                            
                            ${!isSubTask ? `
                            <div class="flex items-center gap-2 mt-1">
                                <span class="text-[10px] font-bold px-2 py-0.5 rounded-full ${subjectColor}">${t.subject}</span>
                                <span class="text-[10px] font-bold px-2 py-0.5 rounded-full ${typeColorClass}">${t.type === 'main' ? 'Exam Prep' : (t.type === 'backlog' ? 'Backlog' : 'Task')}</span>
                            </div>` : ''}
                        </div>
                    </div>
                    
                    <button onclick="deleteTask('${t.id}')" class="relative z-10 opacity-0 group-hover:opacity-100 text-slate-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 p-2 rounded-lg transition-all" aria-label="Delete Task">
                        <i data-lucide="trash-2" class="w-4 h-4"></i>
                    </button>
                </div>
            `;
        }       

function renderTasks() {
            const list = document.getElementById('overview-task-list');
            if(!list) return;
            const k = formatDateKey(state.selectedDate);
            const tasks = state.tasks[k] || [];
            
            list.innerHTML = '';

            // --- IMPROVED LOGIC: DETECT "READY" TESTS ONLY ---
            
            // 1. Snapshot of all completed tasks
            const allCompleted = new Set(Object.values(state.tasks).flat().filter(t => t.completed).map(t => t.text));
            const readyTests = [];

            // 2. Scan Syllabus
            function scanSyllabus(syllabusArray, source) {
                if(!syllabusArray) return;
                
                syllabusArray.forEach(chapter => {
                    chapter.dailyTests.forEach(test => {
                        // Skip if already done
                        if(state.dailyTestsAttempted[test.name]) return;

                        // Check subtopics
                        const missingSubs = [];
                        test.subs.forEach(sub => {
                            const expectedTaskName = `Study: ${chapter.topic} - ${sub}`;
                            if(!allCompleted.has(expectedTaskName)) {
                                missingSubs.push(sub);
                            }
                        });

                        const total = test.subs.length;
                        const missingCount = missingSubs.length;

                        // Case A: Fully Ready (All topics done)
                        if(missingCount === 0 && total > 0) {
                            readyTests.push({
                                name: test.name,
                                topic: chapter.topic,
                                subject: chapter.subject,
                                subs: test.subs,
                                source: source
                            });
                        }
                    });
                });
            }

            // 3. Run Scan
            if(state.nextExam) scanSyllabus(state.nextExam.syllabus, 'main');
            if(typeof backlogPlan !== 'undefined') scanSyllabus(backlogPlan.syllabus, 'backlog');

     
// 4. Render "READY" Cards (Smart Grouping - ALWAYS BUNDLE)
            if(readyTests.length > 0) {
                // Helper to generate a single card HTML
                const generateCard = (test, isGrouped = false) => {
                    const subSummary = test.subs.slice(0, 3).join(', ') + (test.subs.length > 3 ? '...' : '');
                    const safeTestName = test.name.replace(/'/g, "\\'");
                    
                    return `
                    <div class="${isGrouped ? 'mb-3 last:mb-0' : 'mb-6'} bg-gradient-to-r from-emerald-600 to-teal-600 rounded-xl p-5 text-white shadow-lg shadow-emerald-500/20 relative overflow-hidden group animate-in slide-in-from-top-2 fade-in duration-300">
                        <div class="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity"><i data-lucide="award" class="w-24 h-24 rotate-12"></i></div>
                        <div class="relative z-10">
                            <div class="flex justify-between items-start mb-3">
                                <div>
                                    <span class="bg-white/20 backdrop-blur-md px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider text-white border border-white/10">Unlocked</span>
                                    <h3 class="text-xl font-bold text-white tracking-tight mt-1">${test.name}</h3>
                                    <p class="text-xs text-emerald-100 font-medium">Topic: ${test.topic}</p>
                                </div>
                                <div class="bg-white/20 p-2 rounded-lg backdrop-blur-sm shadow-sm animate-pulse"><i data-lucide="unlock" class="w-6 h-6 text-white"></i></div>
                            </div>
                            <div class="bg-black/10 rounded-lg p-2 mb-4">
                                <p class="text-[10px] uppercase font-bold text-emerald-200 mb-1">Includes</p>
                                <p class="text-xs text-white/90 font-medium truncate">${subSummary}</p>
                            </div>
                            <button onclick="confetti({particleCount: 150, spread: 60, origin: { y: 0.7 }}); toggleTestAttempt('${safeTestName}'); renderAll();" class="w-full bg-white text-emerald-700 py-3 rounded-xl text-sm font-bold shadow-md hover:bg-emerald-50 active:scale-[0.98] transition-all flex items-center justify-center gap-2">
                                <i data-lucide="check-circle-2" class="w-4 h-4"></i> Attempt & Mark Done
                            </button>
                        </div>
                    </div>`;
                };

                // --- ALWAYS BUNDLE LOGIC ---
                const bundleId = `unlock-bundle-${Date.now()}`;
                
                const finalHtml = `
                <div class="mb-6 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl p-1 shadow-xl shadow-indigo-500/20 animate-in slide-in-from-top-2 fade-in duration-300 cursor-pointer select-none group" onclick="const el = document.getElementById('${bundleId}'); el.classList.toggle('hidden'); this.querySelector('.arrow-icon').classList.toggle('rotate-180');">
                    <div class="bg-white/10 backdrop-blur-md p-4 rounded-lg flex justify-between items-center border border-white/10 hover:bg-white/20 transition-all">
                        <div class="flex items-center gap-4">
                            <div class="bg-white p-2.5 rounded-xl text-indigo-600 shadow-sm relative">
                                <i data-lucide="layers" class="w-6 h-6"></i>
                                <div class="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-indigo-600">
                                    ${readyTests.length}
                                </div>
                            </div>
                            <div class="text-white">
                                <h3 class="font-bold text-lg leading-tight">Tests Ready!</h3>
                                <p class="text-xs text-indigo-100 font-medium opacity-80">Tap to expand stack</p>
                            </div>
                        </div>
                        <div class="bg-black/20 p-2 rounded-full arrow-icon transition-transform duration-300">
                            <i data-lucide="chevron-down" class="w-5 h-5 text-white"></i>
                        </div>
                    </div>
                </div>
                
                <div id="${bundleId}" class="hidden pl-2 border-l-2 border-indigo-100 dark:border-indigo-900/30 mb-8 space-y-4">
                    ${readyTests.map(test => generateCard(test, true)).join('')}
                </div>
                `;

                list.insertAdjacentHTML('beforeend', finalHtml);
            }

            // --- END NEW LOGIC ---

            // --- STANDARD TASK RENDERING ---
            if(tasks.length === 0 && readyTests.length === 0) {
                list.innerHTML = `<div class="h-40 flex flex-col items-center justify-center text-slate-400 dark:text-slate-600 text-sm"><i data-lucide="coffee" class="w-8 h-8 mb-2 opacity-50"></i>No focus targets set.</div>`;
                if(window.lucide) lucide.createIcons({ root: list });
                return;
            }

            const groups = {};
            const standalone = [];
            tasks.forEach(t => {
                let chap = t.chapter;
                if (!chap && t.text.startsWith("Study: ")) {
                    const parts = t.text.replace("Study: ", "").split(" - ");
                    if (parts.length > 1) chap = parts[0];
                }
                if (chap) {
                    if (!groups[chap]) groups[chap] = { name: chap, tasks: [], subject: t.subject, type: t.type };
                    groups[chap].tasks.push(t);
                } else standalone.push(t);
            });

            standalone.forEach(t => {
                const el = document.createElement('div');
                el.innerHTML = createTaskElementHTML(t, false);
                list.appendChild(el.firstElementChild);
            });

            Object.values(groups).forEach(group => {
                const isExpanded = state.expandedFocusGroups[group.name];
                const completedCount = group.tasks.filter(t => t.completed).length;
                const totalCount = group.tasks.length;
                const isAllDone = totalCount > 0 && completedCount === totalCount;
                
                let groupBorder = 'border-slate-200 dark:border-slate-800';
                let groupBg = 'bg-white dark:bg-slate-900';
                if(group.type === 'main') { groupBorder = 'border-brand-200 dark:border-brand-900'; groupBg = 'bg-brand-50/30 dark:bg-brand-900/10'; }
                if(group.type === 'backlog') { groupBorder = 'border-orange-200 dark:border-orange-900'; groupBg = 'bg-orange-50/30 dark:bg-orange-900/10'; }
                
                let typeBadge = '';
                if (group.type === 'main') typeBadge = `<span class="text-[9px] font-bold px-1.5 py-0.5 rounded bg-brand-100 dark:bg-brand-900 text-brand-700 dark:text-brand-300">Exam</span>`;
                else if (group.type === 'backlog') typeBadge = `<span class="text-[9px] font-bold px-1.5 py-0.5 rounded bg-orange-100 dark:bg-orange-900 text-orange-700 dark:text-orange-300">Backlog</span>`;
                
                const safeGroupName = group.name.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
                const escapeQuote = (str) => str.replace(/'/g, "\\'");

                const groupContainer = document.createElement('div');
                groupContainer.className = `rounded-xl border ${groupBorder} ${groupBg} overflow-hidden mb-2 transition-all shadow-sm group`;
                
                const headerHtml = `
                    <div class="p-3 flex items-center justify-between cursor-pointer hover:bg-opacity-50 transition-colors" onclick="toggleFocusGroup('${escapeQuote(group.name)}')">
                        <div class="flex items-center gap-3">
                            <div class="p-1.5 rounded-lg ${isAllDone ? 'bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-300' : 'bg-white dark:bg-slate-800 shadow-sm text-slate-500 dark:text-slate-400'}">
                                <i data-lucide="${isAllDone ? 'check-circle' : 'book-open'}" class="w-4 h-4"></i>
                            </div>
                            <div>
                                <h4 class="text-sm font-bold text-slate-800 dark:text-slate-200 leading-tight">${safeGroupName}</h4>
                                <div class="flex items-center gap-2 mt-0.5">
                                    <span class="text-[9px] uppercase font-bold tracking-wider text-slate-500 dark:text-slate-400">${group.subject}</span>
                                    ${typeBadge}
                                    <span class="text-[9px] font-medium text-slate-400">•</span>
                                    <span class="text-[9px] font-medium ${isAllDone ? 'text-green-600 dark:text-green-400' : 'text-slate-500 dark:text-slate-400'}">${completedCount}/${totalCount} Done</span>
                                </div>
                            </div>
                        </div>
                        <div class="flex items-center gap-3">
                            <button onclick="deleteGroup('${escapeQuote(group.name)}'); event.stopPropagation();" class="text-slate-300 hover:text-red-500 transition-colors p-1 opacity-0 group-hover:opacity-100" title="Delete Chapter">
                                <i data-lucide="trash-2" class="w-4 h-4"></i>
                            </button>
                            <i data-lucide="chevron-down" class="w-4 h-4 text-slate-400 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}"></i>
                        </div>
                    </div>
                `;
                
                let bodyHtml = '';
                if (isExpanded) {
                    const taskListHtml = group.tasks.map(t => createTaskElementHTML(t, true)).join('');
                    bodyHtml = `
                        <div class="border-t ${groupBorder} p-2 pl-4 bg-white/50 dark:bg-slate-900/50 animate-in fade-in slide-in-from-top-1 duration-200">
                            ${taskListHtml}
                        </div>
                    `;
                }
                groupContainer.innerHTML = headerHtml + bodyHtml;
                list.appendChild(groupContainer);
            });
            
            if(window.lucide) lucide.createIcons({ root: list });
        }
window.renderSyllabus = function(type, searchQuery = '') {
    const container = document.getElementById(type === 'main' ? 'main-syllabus-container' : 'backlog-syllabus-container');
    if(!container) return;
    
    container.innerHTML = '';
    const rawData = type === 'main' ? state.nextExam.syllabus : backlogPlan.syllabus;
    
    // --- 4. DEADLINE & PROGRESS LOGIC ---
    if(type === 'backlog') {
        const planStart = backlogPlan.startDate || new Date();
        const now = new Date();
        const diffTime = Math.abs(now - planStart);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
        
        let currentPhase = 1;
        if(diffDays > 15) currentPhase = 2;
        if(diffDays > 30) currentPhase = 3;
        if(diffDays > 45) currentPhase = 4;

        const phaseEndDate = new Date(planStart);
        phaseEndDate.setDate(planStart.getDate() + (currentPhase * 15));
        
        const deadlineEl = document.getElementById('backlog-deadline-display');
        if(deadlineEl) deadlineEl.innerText = phaseEndDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        
        const phaseLabelEl = document.getElementById('backlog-phase-label');
        if(phaseLabelEl) phaseLabelEl.innerText = `Phase ${currentPhase} Active`;
    }

    const allCompleted = new Set(Object.values(state.tasks).flat().filter(t => t.completed).map(t => t.text));
    const k = formatDateKey(state.selectedDate);
    const todaysTasks = new Set((state.tasks[k] || []).map(t => t.text));
    const lowerQuery = searchQuery.toLowerCase().trim();
    const fragment = document.createDocumentFragment();
    
    let lastPhase = 0;
    let lastUnit = "";

    let activePhaseUI = 1;
    if(type === 'backlog') {
        const planStart = backlogPlan.startDate;
        const d = Math.ceil((new Date() - planStart) / (1000 * 60 * 60 * 24));
        if(d > 15) activePhaseUI = 2;
        if(d > 30) activePhaseUI = 3;
        if(d > 45) activePhaseUI = 4;
    }

    rawData.forEach((item, chapterIdx) => {
        // --- 1. PHASE DIVIDER ---
        if(item.phase && item.phase !== lastPhase) {
            lastPhase = item.phase;
            lastUnit = ""; 
            
            const pStart = new Date(backlogPlan.startDate);
            pStart.setDate(pStart.getDate() + ((item.phase-1)*15));
            const pEnd = new Date(backlogPlan.startDate);
            pEnd.setDate(pEnd.getDate() + (item.phase*15) - 1);
            
            const dateStr = `${pStart.toLocaleDateString('en-US', {month:'short', day:'numeric'})} - ${pEnd.toLocaleDateString('en-US', {month:'short', day:'numeric'})}`;
            const isActive = item.phase === activePhaseUI;

            const divider = document.createElement('div');
            divider.className = `mt-8 mb-4 flex flex-col gap-1 ${isActive ? 'opacity-100' : 'opacity-60 grayscale'}`;
            divider.innerHTML = `
                <div class="flex items-center gap-4">
                    <div class="h-px bg-slate-300 dark:bg-slate-700 flex-1"></div>
                    <div class="px-4 py-1.5 rounded-full text-xs font-extrabold uppercase tracking-widest border ${isActive ? 'bg-brand-500 border-brand-500 text-white shadow-lg shadow-brand-500/20' : 'bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-500'}">
                        Phase ${item.phase} <span class="opacity-75 font-medium ml-1">(${dateStr})</span>
                    </div>
                    <div class="h-px bg-slate-300 dark:bg-slate-700 flex-1"></div>
                </div>
            `;
            fragment.appendChild(divider);
        }

        // --- 2. UNIT HEADER ---
        if(item.unit && item.unit !== lastUnit) {
            lastUnit = item.unit;
            const unitHeader = document.createElement('div');
            unitHeader.className = "mt-4 mb-2 ml-1";
            unitHeader.innerHTML = `
                <span class="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-2">
                    <i data-lucide="layers" class="w-3 h-3"></i> ${item.unit}
                </span>
            `;
            fragment.appendChild(unitHeader);
        }

        // --- 3. CHAPTER CARD ---
        const chapterMatch = item.topic.toLowerCase().includes(lowerQuery) || item.subject.toLowerCase().includes(lowerQuery);
        
        const matchingTests = item.dailyTests.filter(dt => {
            if (chapterMatch) return true; 
            return dt.name.toLowerCase().includes(lowerQuery) || 
                dt.subs.some(sub => sub.toLowerCase().includes(lowerQuery));
        });

        if (lowerQuery && !chapterMatch && matchingTests.length === 0) return;
        
        const chapterId = `${type}-chapter-${chapterIdx}`;
        const isChapterExpanded = lowerQuery ? true : state.expandedTests[chapterId];
        const allDailyTestsCompleted = item.dailyTests.every(dt => state.dailyTestsAttempted[dt.name]);
        
        let borderClass = "border-slate-200 dark:border-slate-800";
        if(item.phase === activePhaseUI && !allDailyTestsCompleted) borderClass = "border-brand-400 dark:border-brand-600 ring-1 ring-brand-400/30";

        const chapterCardClass = allDailyTestsCompleted 
            ? "bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-900 rounded-xl overflow-hidden shadow-sm mb-4 opacity-70"
            : `bg-white dark:bg-slate-900 border ${borderClass} rounded-xl overflow-hidden shadow-sm mb-4 transition-all`;

        const card = document.createElement('div');
        card.className = chapterCardClass;
        
        // Escape Topic Name for HTML Display
        const safeTopicDisplay = item.topic.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
        
        let html = `
            <div class="px-4 py-3 border-b ${allDailyTestsCompleted ? 'border-green-200 dark:border-green-800 bg-green-100 dark:bg-green-900/20' : 'border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800'} flex justify-between items-center cursor-pointer select-none" onclick="toggleChapter('${chapterId}')">
                <div>
                    <span class="text-[10px] font-bold uppercase tracking-wider ${allDailyTestsCompleted ? 'text-green-700 dark:text-green-300' : 'text-slate-400 dark:text-slate-500'}">${item.subject}</span>
                    <div class="flex items-center gap-2">
                        <h4 class="font-bold text-slate-800 dark:text-white">${safeTopicDisplay}</h4> 
                        ${allDailyTestsCompleted ? '<i data-lucide="check-circle" class="w-4 h-4 text-green-600 dark:text-green-400"></i>' : ''}
                    </div>
                </div>
                <i data-lucide="chevron-down" class="w-5 h-5 text-slate-400 transition-transform duration-300 ${isChapterExpanded ? 'rotate-180' : ''}"></i>
            </div>
        `;
        
         if (isChapterExpanded) {
            html += `<div class="p-4 grid grid-cols-1 gap-3">`;
            const testsToRender = lowerQuery ? matchingTests : item.dailyTests;
            
            testsToRender.forEach((dt) => {
                const originalIndex = item.dailyTests.indexOf(dt);
                const testId = `${chapterId}-test-${originalIndex}`;
                const isTestExpanded = lowerQuery ? true : state.expandedTests[testId];
                const total = dt.subs.length;
                const doneCount = dt.subs.filter(s => allCompleted.has(`Study: ${item.topic} - ${s}`)).length;
                const isReady = total > 0 && doneCount === total;
                const isAttempted = state.dailyTestsAttempted[dt.name];
                
                let cardStyle = "border border-slate-100 dark:border-slate-800 rounded-lg bg-white dark:bg-slate-800 hover:border-brand-100 dark:hover:border-brand-900 transition-colors relative";
                if (isAttempted) cardStyle = "border-0 rounded-lg bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-md";

                const showCheckbox = isReady || isAttempted;
                // ESCAPE TEST NAME FOR ONCLICK
                const safeTestName = dt.name.replace(/'/g, "\\'");
                
                html += `
                    <div class="${cardStyle} overflow-hidden">
                        <div class="p-3 flex justify-between items-center cursor-pointer" onclick="toggleDailyTest('${testId}')">
                             <div class="flex items-center gap-2">
                                <i data-lucide="chevron-right" class="w-4 h-4 ${isAttempted ? 'text-white/70' : 'text-slate-400'} transition-transform duration-200 ${isTestExpanded ? 'rotate-90' : ''}"></i>
                                <div class="flex items-center gap-2" onclick="event.stopPropagation()">
                                    ${showCheckbox ? `<input type="checkbox" ${isAttempted ? 'checked' : ''} onchange="toggleTestAttempt('${safeTestName}')" class="w-4 h-4 rounded border-slate-300 text-green-600 focus:ring-green-500 cursor-pointer">` : ''}        
                                    <span class="text-xs font-bold ${isAttempted ? 'text-green-800 bg-white/90' : 'text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-700'} px-2 py-0.5 rounded backdrop-blur-sm">${dt.name}</span>
                                </div>
                            </div>
                            <span class="text-[10px] font-medium ${isAttempted ? 'text-white/80' : 'text-slate-400'}">${doneCount}/${total}</span>
                        </div>
                        ${isTestExpanded ? `
                            <div class="px-3 pb-3 pt-0 border-t ${isAttempted ? 'border-white/20' : 'border-slate-50 dark:border-slate-700'} mt-2">
                                <div class="space-y-1 mt-2 ${isAttempted ? 'text-white' : 'text-slate-500 dark:text-slate-400'}">
                                    ${dt.subs.map(sub => {
                                        const taskName = `Study: ${item.topic} - ${sub}`;
                                        const isAdded = todaysTasks.has(taskName);
                                        const isDone = allCompleted.has(taskName);
                                        
                                        // ✅✅✅ FIX: ESCAPE SINGLE QUOTES FOR JS FUNCTIONS ✅✅✅
                                        const safeTopic = item.topic.replace(/'/g, "\\'");
                                        const safeSub = sub.replace(/'/g, "\\'");
                                        
                                        return `
                                            <div class="flex items-center justify-between group pl-6 py-0.5">
                                                <span class="text-[11px] truncate w-3/4 ${isDone ? 'line-through opacity-50' : ''}" title="${sub}">• ${sub}</span>
                                                ${!isDone ? 
                                                    `<button onclick="addSyllabusTask('${safeTopic} - ${safeSub}', '${type}', '${item.subject}', '${safeTopic}')" class="${isAttempted ? 'text-white/80' : 'text-brand-400 hover:text-brand-600'} transition-colors p-1">
                                                        <i data-lucide="${isAdded ? 'copy-check' : 'plus-circle'}" class="w-4 h-4"></i>
                                                    </button>` : 
                                                    `<i data-lucide="check" class="w-3 h-3 ${isAttempted ? 'text-white' : 'text-green-500'}"></i>`
                                                }
                                            </div>`;
                                    }).join('')}
                                </div>
                            </div>
                        ` : ''}
                    </div>
                `;
            });
            html += `</div>`;
        }
        card.innerHTML = html;
        fragment.appendChild(card);
    });
    container.appendChild(fragment);
    if(window.lucide) lucide.createIcons({ root: container });
};
      
    // --- MODAL CONTROLLER ---
const modal = document.getElementById('customModal');
const backdrop = document.getElementById('modalBackdrop');
const card = document.getElementById('modalCard');
const icon = document.getElementById('modalIcon');
const iconBg = document.getElementById('modalIconBg');
const title = document.getElementById('modalTitle');
const msg = document.getElementById('modalMessage');
const btn = document.getElementById('modalBtn');

// FIX: Must use 'window.' so other functions can call it
window.showPopup = function(type, header, text) {
    // 1. Setup Colors based on Type
    if (type === 'error') {
        // Red Style
        iconBg.className = "mx-auto flex items-center justify-center h-16 w-16 rounded-full mb-4 bg-red-100 dark:bg-red-900/30";
        icon.className = "h-8 w-8 text-red-600 dark:text-red-400";
        icon.setAttribute('data-lucide', 'alert-circle');
        btn.className = "w-full py-3 px-4 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl shadow-lg shadow-red-500/20";
    } else if (type === 'success') {
        // Green Style
        iconBg.className = "mx-auto flex items-center justify-center h-16 w-16 rounded-full mb-4 bg-green-100 dark:bg-green-900/30";
        icon.className = "h-8 w-8 text-green-600 dark:text-green-400";
        icon.setAttribute('data-lucide', 'check-circle-2');
        btn.className = "w-full py-3 px-4 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-xl shadow-lg shadow-green-500/20";
    } else {
        // Blue/Info Style
        iconBg.className = "mx-auto flex items-center justify-center h-16 w-16 rounded-full mb-4 bg-blue-100 dark:bg-blue-900/30";
        icon.className = "h-8 w-8 text-blue-600 dark:text-blue-400";
        icon.setAttribute('data-lucide', 'info');
        btn.className = "w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow-lg shadow-blue-500/20";
    }

    // 2. Set Content
    title.innerText = header;
    msg.innerText = text;
    if(window.lucide) lucide.createIcons();

    // 3. Show Animation
    modal.classList.remove('hidden');
    setTimeout(() => {
        backdrop.classList.remove('opacity-0');
        card.classList.remove('scale-95', 'opacity-0');
        card.classList.add('scale-100', 'opacity-100');
    }, 10);
};

// FIX: Must use 'window.' so the HTML onclick="closeModal()" can see it
window.closeModal = function() {
    backdrop.classList.add('opacity-0');
    card.classList.remove('scale-100', 'opacity-100');
    card.classList.add('scale-95', 'opacity-0');
    
setTimeout(() => {
        modal.classList.add('hidden');
    }, 300); 
};

// --- FINAL "BALANCED REALISM" SNOW ENGINE ---
let snowActive = false;
let snowFrameId = null;
let snowLedges = []; 
let flakeImage = null; // Stores the pre-rendered snowflake image

// UI Toggles
window.toggleSnow = function() {
    snowActive = !snowActive;
    localStorage.setItem('studyflow_snow', snowActive);
    updateSnowUI();
    if(snowActive) startSnow();
    else stopSnow();
};

function updateSnowUI() {
    const transform = snowActive ? 'translateX(16px)' : 'translateX(0)';
    ['snow-dot-pc', 'snow-dot-mobile'].forEach(id => {
        const dot = document.getElementById(id);
        if(dot) {
            dot.style.transform = transform;
            dot.parentElement.className = `relative w-8 h-4 rounded-full transition-colors ${snowActive ? 'bg-cyan-500' : 'bg-slate-200 dark:bg-slate-700'}`;
        }
    });
}

// 1. PERFORMANCE: PRE-RENDER FLAKE (Zero Lag)
function preRenderFlake() {
    const canvas = document.createElement('canvas');
    canvas.width = 20;
    canvas.height = 20;
    const ctx = canvas.getContext('2d');

    // Draw a soft, white, fluffy circle ONCE
    const grad = ctx.createRadialGradient(10, 10, 0, 10, 10, 10);
    grad.addColorStop(0, 'rgba(255, 255, 255, 0.9)'); // Center core
    grad.addColorStop(0.4, 'rgba(255, 255, 255, 0.3)'); // Fluffy mid
    grad.addColorStop(1, 'rgba(255, 255, 255, 0)'); // Fade out
    
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(10, 10, 10, 0, Math.PI * 2);
    ctx.fill();

    return canvas;
}

// 2. MAIN ENGINE
function startSnow() {
    const canvas = document.getElementById('snow-canvas');
    if(!canvas) return;
    
    // Create the sprite once
    if(!flakeImage) flakeImage = preRenderFlake();

    canvas.classList.remove('hidden');
    const ctx = canvas.getContext('2d');
    
    let width = window.innerWidth;
    let height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;

const maxFalling = 400; 
    const fallingFlakes = [];
    let landedFlakes = []; 

    // LEDGE SCANNER
    function updateSurfaces() {
        snowLedges = [];
        // We select ALL containers to ensure bottom cards get recognized
        const elements = document.querySelectorAll('header, button, .rounded-xl, .rounded-2xl, .rounded-3xl, nav');
        elements.forEach(el => {
            const rect = el.getBoundingClientRect();
            // Only add if visible on screen
            if(rect.bottom > 0 && rect.top < height && rect.width > 0) {
                snowLedges.push({
                    top: rect.top + 3, // Slight overlap
                    left: rect.left,
                    right: rect.right
                });
            }
        });
    }
    updateSurfaces();
    window.addEventListener('scroll', () => { if(snowActive) updateSurfaces(); }, { passive: true });

    // SPAWN PARTICLES (Everywhere on screen immediately)
    for(let i = 0; i < maxFalling; i++) {
        fallingFlakes.push(createFlake(width, height, true));
    }

    // ANIMATION LOOP
    let globalTime = 0;
    
    function draw() {
        ctx.clearRect(0, 0, width, height);
        globalTime += 0.01;
        
        // WIND PHYSICS: Sine wave + Random Gusts
        const baseWind = Math.sin(globalTime * 0.2) * 0.5; // Gentle sway
        const gust = Math.sin(globalTime * 1.5) * 0.2; // Fast random gusts
        const windSpeed = baseWind + gust; 

        // A. DRAW LANDED FLAKES
        landedFlakes = landedFlakes.filter(f => {
            f.meltTime--;
            if(f.meltTime <= 0) return false;

            // Fade out as it melts
            ctx.globalAlpha = f.meltTime < 60 ? f.meltTime / 60 : 0.8;
            ctx.drawImage(flakeImage, f.x - f.r, f.y - f.r, f.r * 2, f.r * 2);
            return true;
        });

        // B. DRAW FALLING FLAKES
        fallingFlakes.forEach(f => {
            // Depth-based Opacity (Far flakes = dim)
            ctx.globalAlpha = f.z * 0.9;
            
            // Draw Cached Image
            ctx.drawImage(flakeImage, f.x - f.r, f.y - f.r, f.r * 2, f.r * 2);

            // Move
            f.y += f.speed; 
            // Sway logic: Wind affects lighter/closer flakes differently
            f.x += windSpeed * f.z + Math.sin(globalTime * 2 + f.swayOffset) * (0.3 * f.z);

            // COLLISION (Accumulation)
            // Only check collision for flakes that are "close" (Z > 0.6)
            if (f.y < height && f.y > 0 && f.z > 0.6) {
                for (let ledge of snowLedges) {
                    if (Math.abs(f.y - ledge.top) < 6 && f.x > ledge.left && f.x < ledge.right) {
                        
                        // FIX: Reduced chance from 30% -> 2% per frame
                        // This allows snow to fall past the header and hit bottom cards
                        if(Math.random() > 0.98) { 
                            landedFlakes.push({
                                x: f.x,
                                y: ledge.top,
                                r: f.r * (0.8 + Math.random() * 0.4), // Varied pile size
                                meltTime: 200 + Math.random() * 200 // 3-6 seconds
                            });
                            // Teleport to top immediately to maintain air density
                            resetFlake(f, width, height);
                        }
                        break;
                    }
                }
            }

            // LOOP & WRAP
            if(f.y > height + 10) resetFlake(f, width, height);
            
            // Screen Wrapping (Ensures sides stay populated)
            if(f.x > width + 20) f.x = -20;
            if(f.x < -20) f.x = width + 20;
        });

        snowFrameId = requestAnimationFrame(draw);
    }

    window.addEventListener('resize', () => {
        width = window.innerWidth;
        height = window.innerHeight;
        canvas.width = width;
        canvas.height = height;
        updateSurfaces();
    });

    draw();
}

function stopSnow() {
    const canvas = document.getElementById('snow-canvas');
    if(canvas) canvas.classList.add('hidden');
    if(snowFrameId) cancelAnimationFrame(snowFrameId);
}

// Helper: Create a Flake
function createFlake(w, h, preWarm = false) {
    const z = Math.random(); 
    return {
        x: Math.random() * w,
        y: preWarm ? Math.random() * h : -20 - (Math.random() * 100), 
        z: z, // Depth 0-1
        r: (z * 3) + 2, // Size: 2px to 5px
        speed: (z * 1.5) + 1, // Speed: 1px to 2.5px
        swayOffset: Math.random() * Math.PI * 2
    };
}

// Helper: Reset Flake to Top
function resetFlake(f, w, h) {
    const z = Math.random();
    f.x = Math.random() * w; 
    f.y = -20 - (Math.random() * 100); 
    f.z = z;
    f.r = (z * 3) + 2;
    f.speed = (z * 1.5) + 1;
}

// AUTO-START
document.addEventListener('DOMContentLoaded', () => {
    const storedVal = localStorage.getItem('studyflow_snow');
    if(storedVal === null || storedVal === 'true') {
        snowActive = true;
        updateSnowUI();
        startSnow();
    } else {
        snowActive = false;
        updateSnowUI();
    }
});

// --- OPTIONAL: ADVANCED FLUID PHYSICS ---
document.addEventListener('mousemove', (e) => {
    // Parallax Effect
    const layers = document.querySelectorAll('.blob');
    layers.forEach((layer, index) => {
        const speed = (index + 1) * 0.05;
        const x = (window.innerWidth - e.pageX * speed) / 100;
        const y = (window.innerHeight - e.pageY * speed) / 100;
        layer.style.transform = `translateX(${x}px) translateY(${y}px)`;
    });
});

// ✅ AUTO-FIX: Close mobile menu when resizing to PC view
window.addEventListener('resize', () => {
    if (window.innerWidth >= 768) {
        // If screen becomes desktop width, ensure mobile overlays are gone
        const overlay = document.getElementById('mobile-menu-overlay');
        const sidebar = document.getElementById('sidebar');
        
        if (overlay) overlay.classList.add('hidden');
        if (sidebar) {
            // Reset specific mobile classes if necessary, 
            // but the CSS md:translate-x-0 handles the main visibility.
            sidebar.classList.add('-translate-x-full'); // Reset toggle state
            sidebar.classList.remove('translate-x-0');
        }
        document.body.classList.remove('overflow-hidden'); // Restore scrolling
    }
});
// ==========================================
// 📊 POINTS ANALYTICS VIEW ENGINE (Fixed Math & Breakdown)
// ==========================================

window.renderPointsAnalytics = function() {
    const container = document.getElementById('points-content');
    if (!container) return;

    // --- HELPER: Analyze a Syllabus Tree ---
    const analyzeSyllabus = (syllabusArray, type, endDate) => {
        let counts = { Physics: 0, Chemistry: 0, Biology: 0, Total: 0 };
        let points = { Total: 0, Earned: 0 };
        let breakdown = { Physics: 0, Chemistry: 0, Biology: 0 }; // NEW: Track points per subject
        
        const allCompleted = new Set(Object.values(state.tasks).flat().filter(t => t.completed).map(t => t.text));

        syllabusArray.forEach(chap => {
            let subj = chap.subject;
            if (subj === 'Botany' || subj === 'Zoology') subj = 'Biology';

            chap.dailyTests.forEach(dt => {
                // 1. Count Tests
                counts.Total++;
                if (counts[subj] !== undefined) counts[subj]++;

                // 2. Calculate Points (FIXED LOGIC)
                // Get the Full Value of the test (e.g. 4 pts for Physics)
                const fullTestValue = getTestPoints(chap.subject, chap.topic); 
                
                // Add FULL value to Total Possible
                points.Total += fullTestValue;
                
                // Add to Subject Breakdown
                if (breakdown[subj] !== undefined) breakdown[subj] += fullTestValue;

                // 3. Calculate Earned Points (Fractional based on completion)
                const subsCount = dt.subs.length || 1;
                const subValue = fullTestValue / subsCount;
                
                dt.subs.forEach(sub => {
                    const taskName = `Study: ${chap.topic} - ${sub}`;
                    if (allCompleted.has(taskName) || state.dailyTestsAttempted[dt.name]) {
                        points.Earned += subValue;
                    }
                });
            });
        });

        // 4. Daily Targets
        const today = new Date(); today.setHours(0,0,0,0);
        const targetDate = new Date(endDate);
        const daysLeft = Math.max(1, Math.ceil((targetDate - today) / (1000 * 60 * 60 * 24)));
        const remaining = points.Total - points.Earned;
        const dailyNeed = remaining / daysLeft;

        return { counts, points, daysLeft, dailyNeed, breakdown };
    };

    // --- 1. MAIN EXAM ANALYTICS ---
    const mainStats = analyzeSyllabus(state.nextExam.syllabus, 'main', state.nextExam.date);

    // --- 2. BACKLOG ANALYTICS (Active Phase Only) ---
    const planStart = backlogPlan.startDate;
    const diff = Math.ceil((new Date() - planStart) / (1000 * 60 * 60 * 24));
    let activePhase = 1;
    if(diff > 45) activePhase = 4;
    else if(diff > 30) activePhase = 3;
    else if(diff > 15) activePhase = 2;

    const backlogFiltered = backlogPlan.syllabus.filter(c => c.phase === activePhase);
    const phaseEndDate = new Date(planStart);
    phaseEndDate.setDate(planStart.getDate() + (activePhase * 15));
    
    const backlogStats = analyzeSyllabus(backlogFiltered, 'backlog', phaseEndDate);


    // --- 3. RENDER HTML ---
    const generateCard = (title, icon, color, stats, isBacklog) => `
        <div class="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
            <div class="px-6 py-5 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/30">
                <div class="flex items-center gap-3">
                    <div class="w-10 h-10 rounded-xl bg-${color}-100 dark:bg-${color}-900/30 text-${color}-600 dark:text-${color}-400 flex items-center justify-center shadow-sm">
                        <i data-lucide="${icon}" class="w-5 h-5"></i>
                    </div>
                    <div>
                        <h2 class="text-lg font-bold text-slate-900 dark:text-white">${title}</h2>
                        <p class="text-xs text-slate-500 font-medium">Strategy & Breakdown</p>
                    </div>
                </div>
                ${isBacklog ? `<span class="px-3 py-1 rounded-full bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 text-xs font-bold uppercase tracking-wide">Phase ${activePhase}</span>` : ''}
            </div>

            <div class="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                    <h3 class="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Total Load Breakdown</h3>
                    <div class="flex items-center gap-4 mb-6">
                        <div class="text-4xl font-black text-slate-800 dark:text-white">${stats.counts.Total}</div>
                        <div class="text-sm font-medium text-slate-500 leading-tight">Total Daily<br>Tests Available</div>
                    </div>
                    
                    <div class="space-y-3">
                        <div class="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
                            <span class="text-sm font-bold text-blue-600 dark:text-blue-400 flex items-center gap-2"><i data-lucide="atom" class="w-4 h-4"></i> Physics</span>
                            <div class="text-right">
                                <span class="block text-sm font-black text-slate-700 dark:text-slate-200">${stats.counts.Physics} Tests</span>
                                <span class="block text-[10px] font-bold text-slate-400">${stats.breakdown.Physics.toFixed(0)} Pts</span>
                            </div>
                        </div>
                        <div class="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
                            <span class="text-sm font-bold text-teal-600 dark:text-teal-400 flex items-center gap-2"><i data-lucide="flask-conical" class="w-4 h-4"></i> Chemistry</span>
                            <div class="text-right">
                                <span class="block text-sm font-black text-slate-700 dark:text-slate-200">${stats.counts.Chemistry} Tests</span>
                                <span class="block text-[10px] font-bold text-slate-400">${stats.breakdown.Chemistry.toFixed(0)} Pts</span>
                            </div>
                        </div>
                        <div class="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
                            <span class="text-sm font-bold text-green-600 dark:text-green-400 flex items-center gap-2"><i data-lucide="dna" class="w-4 h-4"></i> Biology</span>
                            <div class="text-right">
                                <span class="block text-sm font-black text-slate-700 dark:text-slate-200">${stats.counts.Biology} Tests</span>
                                <span class="block text-[10px] font-bold text-slate-400">${stats.breakdown.Biology.toFixed(0)} Pts</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="border-l border-slate-100 dark:border-slate-800 md:pl-8">
                    <h3 class="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Points & Targets</h3>
                    
                    <div class="grid grid-cols-2 gap-4 mb-6">
                        <div class="p-4 rounded-2xl bg-${color}-50 dark:bg-${color}-900/10 border border-${color}-100 dark:border-${color}-900/30 text-center">
                            <div class="text-2xl font-black text-${color}-600 dark:text-${color}-400">${stats.points.Earned.toFixed(1)}</div>
                            <div class="text-[10px] font-bold uppercase text-${color}-700/60 dark:text-${color}-300/60">Live Points</div>
                        </div>
                        <div class="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-center">
                            <div class="text-2xl font-black text-slate-600 dark:text-slate-400">${stats.points.Total.toFixed(0)}</div>
                            <div class="text-[10px] font-bold uppercase text-slate-400">Total Possible</div>
                        </div>
                    </div>

                    <div class="bg-slate-900 dark:bg-black rounded-2xl p-5 text-white shadow-xl relative overflow-hidden group">
                        <div class="absolute inset-0 bg-gradient-to-r from-${color}-600 to-${color}-500 opacity-20"></div>
                        <div class="relative z-10 flex justify-between items-center">
                            <div>
                                <p class="text-xs text-${color}-200 font-bold uppercase tracking-wide mb-1">Required Velocity</p>
                                <div class="text-3xl font-black">${stats.dailyNeed <= 0 ? 'GOAL MET' : stats.dailyNeed.toFixed(1)} <span class="text-sm font-medium opacity-60">pts/day</span></div>
                            </div>
                            <div class="text-right">
                                <p class="text-xs text-slate-300 font-bold uppercase tracking-wide mb-1">Time Left</p>
                                <div class="text-2xl font-bold">${stats.daysLeft} <span class="text-sm font-medium opacity-60">Days</span></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;

    // --- 4. EXPLANATION CARD ---
    const explanationHtml = `
        <div class="mt-8 p-6 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800 rounded-3xl">
            <h3 class="text-sm font-bold text-indigo-900 dark:text-indigo-300 uppercase tracking-wider mb-4 flex items-center gap-2">
                <i data-lucide="info" class="w-4 h-4"></i> How Points Are Calculated
            </h3>
            <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div class="bg-white dark:bg-slate-900 p-4 rounded-xl border border-indigo-100 dark:border-indigo-800/50 text-center">
                    <div class="text-2xl font-black text-blue-500">4 Pts</div>
                    <div class="text-xs font-medium text-slate-500">Per Physics Test</div>
                </div>
                <div class="bg-white dark:bg-slate-900 p-4 rounded-xl border border-indigo-100 dark:border-indigo-800/50 text-center">
                    <div class="text-2xl font-black text-teal-500">3 Pts</div>
                    <div class="text-xs font-medium text-slate-500">Per Chem Test</div>
                </div>
                <div class="bg-white dark:bg-slate-900 p-4 rounded-xl border border-indigo-100 dark:border-indigo-800/50 text-center">
                    <div class="text-2xl font-black text-green-500">2 Pts</div>
                    <div class="text-xs font-medium text-slate-500">Per Bio Test</div>
                </div>
                <div class="bg-white dark:bg-slate-900 p-4 rounded-xl border border-indigo-100 dark:border-indigo-800/50 text-center ring-2 ring-indigo-500/20">
                    <div class="text-2xl font-black text-indigo-500">3 Pts</div>
                    <div class="text-xs font-bold text-indigo-600 dark:text-indigo-400">High Yield Bio</div>
                </div>
            </div>
            <p class="text-xs text-center text-slate-500 dark:text-slate-400 mt-4 italic opacity-80">
                * High Yield Bio includes Genetics, Reproduction, & Evolution topics.
            </p>
        </div>
    `;

    container.innerHTML = `
        ${generateCard("Main Exam (AIATS)", "crosshair", "brand", mainStats, false)}
        ${generateCard("Backlog Recovery", "history", "orange", backlogStats, true)}
        ${explanationHtml}
    `;

    if(window.lucide) lucide.createIcons({ root: container });
};