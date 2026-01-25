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
    // Create toast element
    const toast = document.createElement('div');
    toast.className = "fixed bottom-24 left-1/2 -translate-x-1/2 z-[100] bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-6 py-3 rounded-2xl font-bold text-sm shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-bottom-4 duration-300";
    toast.innerHTML = `<i data-lucide="sparkles" class="w-4 h-4 text-brand-500"></i> ${message}`;
    
    document.body.appendChild(toast);
    if(window.lucide) lucide.createIcons({ root: toast });

    // Remove after 4 seconds
    setTimeout(() => {
        toast.classList.add('animate-out', 'fade-out', 'slide-out-to-bottom-4');
        setTimeout(() => toast.remove(), 300);
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
                document.getElementById('theme-text').textContent = 'Light Mode';
            } else {
                html.classList.add('dark');
                localStorage.setItem('theme', 'dark');
                document.getElementById('theme-text').textContent = 'Dark Mode';
            }
        };

        // Initialize Theme (Default to Dark)
        if (localStorage.theme === 'light') {
            document.documentElement.classList.remove('dark');
            document.getElementById('theme-text').textContent = 'Light Mode';
        } else {
            // Default path
            document.documentElement.classList.add('dark');
            document.getElementById('theme-text').textContent = 'Dark Mode';
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

   // --- UT-10 (FEB 1) ---
   {
       name: "UT-10",
       date: new Date('2026-02-01T00:00:00'),
       syllabus: [
           {
               subject: "Physics",
               topic: "Wave Optics",
               dailyTests: [
                   {name:"DT-31 (Phy-XII)", subs:["Huygens Principle", "Interference (Young's Experiment)"]},
                   {name:"DT-32 (Phy-XII)", subs:["Diffraction", "Polarization"]}
               ]
           },
           {
               subject: "Physics",
               topic: "Dual Nature of Matter",
               dailyTests: [
                   {name:"DT-33 (Phy-XII)", subs:["Photoelectric Effect"]},
                   {name:"DT-34 (Phy-XII)", subs:["Wave Nature of Matter", "Davisson Germer Experiment"]}
               ]
           },
           {
               subject: "Physics",
               topic: "Atoms",
               dailyTests: [
                   {name:"DT-35 (Phy-XII)", subs:["Bohr Model", "Hydrogen Spectrum"]}
               ]
           },
           {
               subject: "Chemistry",
               topic: "p-Block Elements (Group 15-18)",
               dailyTests: [
                   {name:"DT-10 (Chem-XII)", subs:["Nitrogen Family (Grp 15)", "Oxides of Nitrogen", "Phosphorus Allotropic Forms", "Oxides of Phosphorus"]},
                   {name:"DT-11 (Chem-XII)", subs:["Oxygen Family (Grp 16)", "Oxides of Oxygen", "Sulphur Allotropic Forms" , "Oxoacids of Sulphur", "Oxides of Nitrogen"]},
                   {name:"DT-12 (Chem-XII)", subs:["Halogens (Grp 17)", "Oxoacids of Halogens", "Noble Gases (Grp 18)"]}
               ]
           },
           {
               subject: "Chemistry",
               topic: "Practical Chemistry",
               dailyTests: [
                   {name:"Rev (Chem-XII)", subs:["Principles of Practical Chemistry"]}
               ]
           },
           {
               subject: "Botany",
               topic: "Biodiversity & Conservation",
               dailyTests: [
                   {name:"DT-21 (Bot-XII)", subs:["Biodiversity Patterns"]},
                   {name:"DT-22 (Bot-XII)", subs:["Loss of Biodiversity", "Conservation Strategies"]}
               ]
           },
           {
               subject: "Zoology",
               topic: "Biotech: Applications",
               dailyTests: [
                   {name:"DT-23 (Zoo-XII)", subs:["Biotech in Agriculture", "Bt Cotton"]},
                   {name:"DT-24 (Zoo-XII)", subs:["Biotech in Medicine", "Insulin", "Gene Therapy"]}
               ]
           },
           {
               subject: "Zoology",
               topic: "Evolution",
               dailyTests: [
                   {name:"DT-10 (Zoo-XII)", subs:["Origin of Life", "Miller's Experiment"]},
                   {name:"DT-11 (Zoo-XII)", subs:["Evidences of Evolution"]},
                   {name:"DT-12 (Zoo-XII)", subs:["Hardy Weinberg Principle", "Natural Selection"]},
                   {name:"DT-13 (Zoo-XII)", subs:["Speciation"]},
                   {name:"DT-14 (Zoo-XII)", subs:["Human Evolution"]}
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

const backlogPlan = {
   name: "Backlog & Revision", // Renamed to reflect mixed content
   date: new Date('2026-02-03T00:00:00'), // Updated to Feb 3, 2026
    syllabus: [
       // =========================================
       // PART 1: AIATS-5 PENDING (Chem/Bio Only)
       // =========================================

       // --- CHEMISTRY (AIATS-5) ---
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

       // --- BOTANY (AIATS-5) ---
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

       // --- ZOOLOGY (AIATS-5) ---
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
       },

       // =========================================
       // PART 2: CLASS 11 REVISION (New Section)
       // =========================================

              { 
           subject: "Chemistry", 
           topic: "GOC: General Organic Chem", 
           dailyTests: [
               {name:"DT-23 (Chem-XI)", subs:["IUPAC Nomenclature"]},
               {name:"DT-24 (Chem-XI)", subs:["Nucleophiles & Electrophiles"]},
               {name:"DT-25 (Chem-XI)", subs:["Inductive Effect", "Resonance", "Hyperconjugation"]},
               {name:"DT-26 (Chem-XI)", subs:["Carbocation", "Carbanion", "Free Radicals"]}
              
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
        const avatarText = document.getElementById(`${prefix}-user-avatar-text`);
        const nameEl = document.getElementById(`${prefix}-user-name`);
        const statusEl = document.getElementById(`${prefix}-sync-status`);
        const btn = document.getElementById(`${prefix}-auth-btn`);

        if(!card) return;

        if(prefix === 'mobile') {
            card.className = `flex items-center gap-3 px-3 py-3 rounded-2xl border transition-all cursor-pointer ${currentStyle.cardBorder}`;
        }
        
        avatarBg.className = `flex items-center justify-center font-bold shadow-sm transition-colors ${prefix === 'mobile' ? 'w-10 h-10 rounded-full text-sm' : 'w-9 h-9 rounded-xl text-xs'} ${currentStyle.avatarBg}`;
        avatarText.textContent = isGuest ? "?" : initial;
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
        function init() {
            // FIX: This must run FIRST to prevent the crash
            setupSchedule(); 

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
                                
                                updateProfileUI(user); // Updates UI to "User Mode"
                                renderAll();
                            } else {
                                saveData();
                                updateProfileUI(user);
                            }
                        }, (error) => {
                            console.error("Firestore error fallback:", error);
                            initLocalMode();
                        });   
                    } else {
                        updateProfileUI(null); // Updates UI to "Guest Mode"
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

            const addTaskForm = document.getElementById('add-task-form');
            if(addTaskForm) {
                const newForm = addTaskForm.cloneNode(true);
                addTaskForm.parentNode.replaceChild(newForm, addTaskForm);
                newForm.addEventListener('submit', (e) => {
                    e.preventDefault();
                    const inp = document.getElementById('new-task-input');
                    const typeSelect = document.getElementById('new-task-type');
                    const subSelect = document.getElementById('new-task-subject');
                    if(inp.value.trim()) { 
                        addTask(inp.value.trim(), typeSelect.value, subSelect.value); 
                        inp.value = ''; 
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


// --- HELPER: CALCULATE STATS (FIXED: SCOPED TO CURRENT EXAM) ---
function calculateUserStats() {
    // 1. Build Valid Tests List (ONLY for Current Exam + Backlog)
    const validTests = new Set();
    
    // A. Add Current Exam Tests
    if (state.nextExam && state.nextExam.syllabus) {
        state.nextExam.syllabus.forEach(s => s.dailyTests.forEach(dt => validTests.add(dt.name)));
    }
    
    // B. Add Backlog Tests
    if (typeof backlogPlan !== 'undefined' && backlogPlan.syllabus) {
        backlogPlan.syllabus.forEach(s => s.dailyTests.forEach(dt => validTests.add(dt.name)));
    }

    // 2. Scan Completed Tasks
    const allCompleted = new Set(
        Object.values(state.tasks).flat()
        .filter(t => t.completed)
        .map(t => t.text)
    );

    // 3. Main Exam %
    let mainTotal = 0, mainDone = 0;
    if(state.nextExam && state.nextExam.syllabus) {
        state.nextExam.syllabus.forEach(s => s.dailyTests.forEach(dt => dt.subs.forEach(sub => {
            mainTotal++;
            if(allCompleted.has(`Study: ${s.topic} - ${sub}`)) mainDone++;
        })));
    }
    const mainPct = mainTotal ? Math.round((mainDone/mainTotal)*100) : 0;

    // 4. Backlog %
    let blTotal = 0, blDone = 0;
    if(typeof backlogPlan !== 'undefined' && backlogPlan.syllabus) {
        backlogPlan.syllabus.forEach(s => s.dailyTests.forEach(dt => dt.subs.forEach(sub => {
            blTotal++;
            if(allCompleted.has(`Study: ${s.topic} - ${sub}`)) blDone++;
        })));
    }
    const blPct = blTotal ? Math.round((blDone/blTotal)*100) : 0;

    // 5. Test Count (ONLY counts tests in validTests set)
    const testCount = Object.keys(state.dailyTestsAttempted).filter(k => 
        state.dailyTestsAttempted[k] && validTests.has(k)
    ).length;

    // 6. Overall Percentage (Weighted Average for Leaderboard)
    // We give Main Exam 70% weight, Backlog 30% weight
    const overallPct = Math.round((mainPct * 0.7) + (blPct * 0.3));

    // 7. Overall Score (For sorting tie-breakers)
    const overallScore = (mainPct * 10) + (blPct * 5) + (testCount * 20);

    return { mainPct, blPct, testCount, overallPct, overallScore };
}

function saveData() {
    const stats = calculateUserStats(); // Uses the fixed calculator above

    if(isFirebaseActive && currentUser) {
        const docRef = getSafeDocRef(currentUser.uid);
        
        const statusEl = document.getElementById('desktop-sync-status');
        if(statusEl) statusEl.innerHTML = `<span class="w-1.5 h-1.5 rounded-full bg-yellow-500 animate-pulse"></span> Saving...`;

        // 1. Save Personal Data (Private)
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

        // 2. Save Leaderboard Entry (FIXED ERROR HANDLING)
        const lbRef = doc(db, 'leaderboard', currentUser.uid);

        // Use the new stats calculated above
        setDoc(lbRef, {
            email: currentUser.email || 'Anonymous',
            displayName: state.displayName || 'Anonymous',
            
            // SAVE THE NEW FIELDS
            mainPct: stats.mainPct,
            blPct: stats.blPct,
            testCount: stats.testCount,
            overallPct: stats.overallPct, // New Field
            overallScore: stats.overallScore, // New Field
            
            currentExam: state.nextExam.name, // CRITICAL for filtering
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
    renderPrayerModalItems();
    updateHeaderPrayerBtn();
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
        // Global functions
        window.addTask = function(text, type = 'main', subject = 'General', chapter = null) {
            const key = formatDateKey(state.selectedDate);
            if (!state.tasks[key]) state.tasks[key] = [];
            state.tasks[key].push({
                id: Date.now() + Math.random().toString(36).substr(2, 9), 
                text, type, subject, chapter, completed: false 
            });
            saveData();
        };

        window.deleteTask = function(id) {
            const key = formatDateKey(state.selectedDate);
            if(state.tasks[key]) {
                state.tasks[key] = state.tasks[key].filter(t => t.id !== id);
                saveData();
            }
        };

        window.deleteGroup = function(chapterName) {
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
    toggleMobileMenu(true); 
    
    // Handle specific view logic
    if(view === 'leaderboard') {
        fetchLeaderboard();
        switchRankTab('overall'); 
    }
    if(view === 'namaz') {
        renderNamazView();
    }
    // NEW: Handle Planner View
    if(view === 'planner') {
        renderPlanner();
    }
    // Reset Notebook if leaving mistakes view
    if(view === 'mistakes') {
        closeNotebook(); 
    }

    // Updated list to include 'planner'
    ['overview','target','backlog', 'mistakes', 'leaderboard', 'namaz', 'planner'].forEach(v => {
        const btn = document.getElementById(`nav-${v}`);
        if(btn) {
            if(v === view) btn.className = "w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-sm transition-all bg-brand-50 dark:bg-brand-900/20 text-brand-700 dark:text-brand-400 shadow-sm";
            else btn.className = "w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-sm text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white transition-all";
        }
        const viewEl = document.getElementById(`view-${v}`);
        if(viewEl) viewEl.classList.add('hidden');
    });

    const activeEl = document.getElementById(`view-${view}`);
    if(activeEl) activeEl.classList.remove('hidden');
    
    // Only render standard views if NOT leaderboard or planner (Planner handles its own render)
    if(view !== 'leaderboard' && view !== 'planner') renderAll();
};



        window.toggleMobileMenu = function(forceClose = false) {
            const body = document.getElementById('app-body');
            if (forceClose) { body.classList.remove('menu-open'); body.classList.add('menu-closed'); } 
            else {
                if (body.classList.contains('menu-open')) { body.classList.remove('menu-open'); body.classList.add('menu-closed'); } 
                else { body.classList.remove('menu-closed'); body.classList.add('menu-open'); }
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

    // 1. Live Recalculate
    const myStats = calculateUserStats();
    
    // 2. Update Profile Card (Top Section)
    const myNameEl = document.getElementById('lb-user-name');
    if(myNameEl) myNameEl.textContent = state.displayName || (currentUser ? currentUser.email.split('@')[0] : "Guest");
    
    if(document.getElementById('lb-my-exam')) document.getElementById('lb-my-exam').textContent = `${myStats.mainPct}%`;
    if(document.getElementById('lb-my-backlog')) document.getElementById('lb-my-backlog').textContent = `${myStats.blPct}%`;
    if(document.getElementById('lb-my-tests')) document.getElementById('lb-my-tests').textContent = myStats.testCount;

    const myId = currentUser ? currentUser.uid : null;
    let sortedData = [...leaderboardCache];

    // --- LEAGUE FILTER ---
    const currentExamName = state.nextExam.name;
    const headerTitle = document.querySelector('#view-leaderboard h1');
    if(headerTitle) headerTitle.innerHTML = `<i data-lucide="trophy" class="w-6 h-6 text-yellow-500"></i> Leaderboard <span class="hidden md:inline-block text-xs bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-2 py-0.5 rounded ml-2 align-middle">${currentExamName} Season</span>`;

    // Filter strictly by current exam
    sortedData = sortedData.filter(u => u.currentExam === currentExamName);

    // Sort by Overall Score (High to Low)
    sortedData.sort((a, b) => (b.overallScore || 0) - (a.overallScore || 0));

    // Update My Rank Display
    const myRankEl = document.getElementById('lb-my-rank');
    const myRankIndex = sortedData.findIndex(u => u.id === myId);
    if(myRankEl) myRankEl.textContent = myRankIndex > -1 ? `#${myRankIndex + 1}` : '-';

    if(sortedData.length === 0) {
        list.innerHTML = `<div class="flex flex-col items-center justify-center py-12 text-slate-400 opacity-60">
            <i data-lucide="flag" class="w-12 h-12 mb-3"></i>
            <p>New Season Started! Be the first to score.</p>
        </div>`;
        if(window.lucide) lucide.createIcons({ root: list });
        return;
    }

    // --- NEW MODERN CARD DESIGN ---
    list.innerHTML = sortedData.map((user, index) => {
        const isMe = user.id === myId;
        
        // Use live stats for "Me", cached for others
        const stats = isMe ? myStats : user;
        const mainPct = stats.mainPct || 0;
        const blPct = stats.blPct || 0;
        const testCnt = stats.testCount || 0;
        const overall = stats.overallPct || Math.round((mainPct * 0.7) + (blPct * 0.3));

        // Rank Styling
        let rankBadge = `<span class="font-bold text-slate-500 text-sm">#${index + 1}</span>`;
        let cardBorder = isMe ? "border-brand-500 ring-1 ring-brand-500" : "border-slate-200 dark:border-slate-800";
        let cardBg = isMe ? "bg-brand-50/50 dark:bg-brand-900/10" : "bg-white dark:bg-slate-900";
        
        if (index === 0) {
            rankBadge = `<div class="w-8 h-8 rounded-full bg-yellow-400 text-yellow-900 flex items-center justify-center font-bold text-sm shadow-sm"><i data-lucide="crown" class="w-4 h-4"></i></div>`;
            cardBorder = "border-yellow-400/50";
        } else if (index === 1) {
            rankBadge = `<div class="w-8 h-8 rounded-full bg-slate-300 text-slate-700 flex items-center justify-center font-bold text-sm shadow-sm">2</div>`;
        } else if (index === 2) {
            rankBadge = `<div class="w-8 h-8 rounded-full bg-orange-300 text-orange-800 flex items-center justify-center font-bold text-sm shadow-sm">3</div>`;
        }

        const userName = user.displayName || (user.email ? user.email.split('@')[0] : 'Anonymous');
        const firstLetter = userName.charAt(0).toUpperCase();

        return `
            <div class="relative flex flex-col md:flex-row md:items-center gap-4 p-4 rounded-xl border ${cardBorder} ${cardBg} mb-3 transition-all hover:scale-[1.01] hover:shadow-md group">
                
                <div class="flex items-center gap-4 flex-1">
                    <div class="shrink-0 w-8 flex justify-center">${rankBadge}</div>
                    
                    <div class="flex items-center gap-3">
                        <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-800 flex items-center justify-center text-sm font-bold text-slate-600 dark:text-slate-300 shadow-inner">
                            ${firstLetter}
                        </div>
                        <div>
                            <p class="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                ${userName}
                                ${isMe ? '<span class="bg-brand-100 dark:bg-brand-900 text-brand-700 dark:text-brand-300 text-[9px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">You</span>' : ''}
                            </p>
                            <p class="text-[10px] text-slate-500 font-medium">League: ${user.currentExam || 'Unknown'}</p>
                        </div>
                    </div>
                </div>

                <div class="w-full md:w-48 flex flex-col justify-center">
                    <div class="flex justify-between text-[10px] font-bold text-slate-400 uppercase mb-1">
                        <span>Overall Progress</span>
                        <span class="${index < 3 ? 'text-brand-600 dark:text-brand-400' : ''}">${overall}%</span>
                    </div>
                    <div class="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div class="h-full bg-gradient-to-r from-brand-500 to-indigo-500 rounded-full" style="width: ${overall}%"></div>
                    </div>
                </div>

                <div class="flex items-center gap-2 justify-between md:justify-end w-full md:w-auto mt-2 md:mt-0 pt-2 md:pt-0 border-t md:border-t-0 border-slate-100 dark:border-slate-800/50">
                    <div class="flex flex-col items-center px-3 border-r border-slate-100 dark:border-slate-800 last:border-0">
                        <span class="text-[10px] uppercase font-bold text-slate-400">Exam</span>
                        <span class="text-sm font-bold text-brand-600 dark:text-brand-400">${mainPct}%</span>
                    </div>
                    <div class="flex flex-col items-center px-3 border-r border-slate-100 dark:border-slate-800 last:border-0">
                        <span class="text-[10px] uppercase font-bold text-slate-400">Backlog</span>
                        <span class="text-sm font-bold text-orange-500">${blPct}%</span>
                    </div>
                    <div class="flex flex-col items-center px-3">
                        <span class="text-[10px] uppercase font-bold text-slate-400">Tests</span>
                        <span class="text-sm font-bold text-slate-700 dark:text-slate-300">${testCnt}</span>
                    </div>
                </div>

            </div>
        `;
    }).join('');

    if(window.lucide) lucide.createIcons({ root: list });
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

// --- NEW: SMART WEIGHTED LOAD BALANCER ---

let currentAiSuggestions = { main: [], backlog: [] };

// --- INTELLIGENT GAP-FILLING SMART MIX ---
window.checkStudyPace = function() {
    const container = document.getElementById('ai-strategy-container');
    if (!container) return;
    
    container.innerHTML = ''; 
    container.classList.remove('hidden');

    const today = new Date(); 
    today.setHours(0,0,0,0);
    const k = formatDateKey(state.selectedDate);
    const todaysTasks = state.tasks[k] || [];

    // HELPER: Calculate Weight of any Subject/Topic
    function getWeight(subject, topic) {
        if (subject === 'Physics') return 4;
        if (subject === 'Chemistry') {
            const t = (topic || '').toLowerCase();
            if (t.includes('organic') || t.includes('hydro') || t.includes('halo') || 
                t.includes('alcohol') || t.includes('aldehyde') || t.includes('amine') || 
                t.includes('thermo') || t.includes('equilibrium') || t.includes('electro')) {
                return 3;
            }
            return 2;
        }
        return 1; // Botany/Zoology
    }

    // --- ENGINE: The "Gap Filler" Algorithm ---
    function generateSmartMix(trackName, syllabusData, deadlineDate, colorTheme) {
        if (!deadlineDate) return null;

        const dDate = new Date(deadlineDate);
        let rawDays = Math.ceil((dDate - today) / (1000 * 60 * 60 * 24));
        if (trackName === 'main') rawDays = rawDays > 0 ? rawDays - 1 : 0;
        const daysLeft = Math.max(1, rawDays);

        // 1. CALCULATE TOTAL REMAINING WORK (Backlog + Future)
        let allPending = [];
        let totalRemainingPoints = 0;

        syllabusData.forEach(chapter => {
            chapter.dailyTests.forEach(dt => {
                // Only include if NOT done 
                if (!state.dailyTestsAttempted[dt.name]) {
                    const pts = getWeight(chapter.subject, chapter.topic);
                    
                    // CHECK: Is this specific sub-task ALREADY in today's planner?
                    // We check if ANY sub-topic of this test is planned
                    const isAlreadyPlanned = dt.subs.some(sub => 
                        todaysTasks.some(t => t.text === `Study: ${chapter.topic} - ${sub}`)
                    );

                    if (!isAlreadyPlanned) {
                        allPending.push({
                            name: dt.name,
                            subject: chapter.subject,
                            topic: chapter.topic,
                            points: pts
                        });
                        totalRemainingPoints += pts;
                    }
                }
            });
        });

        if (allPending.length === 0) return null; // Nothing left!

        // 2. CALCULATE "ALREADY PLANNED" SCORE
        // This is the "Intelligence" part. We sum up points of tasks you manually added.
        let manualPoints = 0;
        todaysTasks.forEach(t => {
            // Only count tasks that match this track (Main vs Backlog)
            if (t.type === trackName) {
                // Try to infer weight from the text or subject
                let subject = t.subject;
                let topic = t.chapter || '';
                if (!topic && t.text.includes(' - ')) topic = t.text.split(' - ')[0].replace('Study: ', '');
                
                manualPoints += getWeight(subject, topic);
            }
        });

        // 3. CALCULATE THE GAP (Target - Manual)
        const bufferMultiplier = daysLeft < 5 ? 1.25 : 1.15;
        const rawDailyTarget = Math.ceil((totalRemainingPoints / daysLeft) * bufferMultiplier);
        
        // The Magic: Subtract what you've already done/planned
        let neededPoints = rawDailyTarget - manualPoints;

        // If you've already planned MORE than the target, don't suggest anything!
        if (neededPoints <= 0) return null; 

        // 4. FILL THE GAP (Greedy Sort)
        allPending.sort((a, b) => b.points - a.points); // Hardest first

        let selectedBatch = [];
        let currentPoints = 0;

        for (const task of allPending) {
            if (currentPoints >= neededPoints) break;
            selectedBatch.push(task);
            currentPoints += task.points;
        }

        // Save for the button
        currentAiSuggestions[trackName] = selectedBatch;

        // 5. GENERATE PREVIEW
        const previewMap = selectedBatch.reduce((acc, item) => {
            let n = item.subject.substring(0,3); 
            if(item.subject === 'Chemistry') n = item.points >= 3 ? 'Org/Phys' : 'Inorg';
            acc[n] = (acc[n] || 0) + 1;
            return acc;
        }, {});

        return {
            name: trackName === 'main' ? 'Smart Gap Fill' : 'Backlog Gap Fill',
            days: daysLeft,
            dailyCount: selectedBatch.length,
            points: currentPoints,
            manualPoints: manualPoints, // Pass this to show off intelligence
            color: colorTheme,
            trackId: trackName,
            preview: previewMap
        };
    }

    // --- RENDER UI ---
    let html = '';
    
    const renderCard = (stats) => {
        const isV = stats.color === 'violet';
        const bg = isV ? 'bg-violet-50 dark:bg-violet-900/10' : 'bg-orange-50 dark:bg-orange-900/10';
        const border = isV ? 'border-violet-200 dark:border-violet-800' : 'border-orange-200 dark:border-orange-800';
        const textMain = isV ? 'text-violet-700 dark:text-violet-300' : 'text-orange-700 dark:text-orange-300';
        const btnBg = isV ? 'bg-violet-600 hover:bg-violet-700' : 'bg-orange-600 hover:bg-orange-700';
        const mixText = Object.entries(stats.preview).map(([k,v]) => `${k}: ${v}`).join(', ');

        // Smart Message: "You planned X, we suggest Y more"
        const smartMessage = stats.manualPoints > 0 
            ? `<span class="text-[10px] font-bold opacity-70 block mt-1">(You planned ${stats.manualPoints} pts manually. Adding ${stats.points} more.)</span>` 
            : '';

        return `
        <div class="${bg} border ${border} rounded-2xl p-5 relative overflow-hidden group shadow-sm mb-4 animate-in slide-in-from-top-2 duration-500">
            <div class="absolute -right-6 -top-6 ${textMain} opacity-10 transform rotate-12"><i data-lucide="brain-circuit" class="w-32 h-32"></i></div>
            <div class="relative z-10 flex flex-col md:flex-row gap-4 items-center justify-between">
                <div>
                    <div class="flex items-center gap-2 mb-1">
                        <span class="px-2 py-0.5 rounded text-[10px] font-bold uppercase ${isV ? 'bg-violet-100 dark:bg-violet-900' : 'bg-orange-100 dark:bg-orange-900'} ${textMain} tracking-wide flex items-center gap-1"><i data-lucide="zap" class="w-3 h-3"></i> ${stats.name}</span>
                        <span class="text-xs font-bold text-slate-400">${stats.days} Days Left</span>
                    </div>
                    <h3 class="text-lg font-bold text-slate-800 dark:text-white">
                        Recommended: <span class="${textMain}">${stats.points} Points</span>
                        ${smartMessage}
                    </h3>
                    <div class="flex items-center gap-2 mt-2 text-xs text-slate-500 dark:text-slate-400 font-medium bg-white/50 dark:bg-black/20 px-3 py-1.5 rounded-lg border border-${stats.color}-100 dark:border-${stats.color}-900/30 w-fit">
                        <i data-lucide="layers" class="w-3 h-3"></i><span>${mixText}</span>
                    </div>
                </div>
                <button onclick="acceptAiPlan('${stats.trackId}')" class="w-full md:w-auto px-6 py-3 ${btnBg} text-white rounded-xl text-sm font-bold shadow-lg shadow-${stats.color}-500/20 transition-all active:scale-95 flex items-center justify-center gap-2 whitespace-nowrap">
                    <i data-lucide="plus-circle" class="w-4 h-4"></i> Accept Mission
                </button>
            </div>
        </div>`;
    };

    if (state.nextExam && state.nextExam.syllabus) {
        const mainStats = generateSmartMix('main', state.nextExam.syllabus, state.nextExam.date, 'violet');
        if (mainStats) html += renderCard(mainStats);
    }
    
    if (typeof backlogPlan !== 'undefined' && backlogPlan.syllabus) {
        const backlogStats = generateSmartMix('backlog', backlogPlan.syllabus, backlogPlan.date, 'orange');
        if (backlogStats) html += renderCard(backlogStats);
    }

    container.innerHTML = html;
    if (window.lucide) lucide.createIcons({ root: container });
};



window.acceptAiPlan = function(track) {
    const suggestions = currentAiSuggestions[track];
    if (!suggestions || suggestions.length === 0) return;

    let addedCount = 0;
    const key = formatDateKey(state.selectedDate);

    suggestions.forEach(item => {
        // Find the full test data from the syllabus to get all sub-topics
        const sourceData = track === 'main' ? state.nextExam.syllabus : backlogPlan.syllabus;
        const chapter = sourceData.find(c => c.topic === item.topic);
        const testData = chapter?.dailyTests.find(dt => dt.name === item.name);

        if (testData) {
            testData.subs.forEach(sub => {
                const taskText = `Study: ${item.topic} - ${sub}`;
                // Only add if the task isn't already on today's list
                const exists = (state.tasks[key] || []).some(t => t.text === taskText);
                
                if (!exists) {
                    addTask(taskText, track, item.subject, item.topic);
                    addedCount++;
                }
            });
        }
    });

    // Save and Refresh
    saveData();
    renderAll();

    // Feedback
    if (window.confetti) {
        confetti({ 
            particleCount: 100, 
            spread: 50, 
            origin: { y: 0.8 },
            colors: track === 'main' ? ['#8b5cf6'] : ['#f97316']
        });
    }

    showToast(`📚 Added ${addedCount} sub-topics to your mission. Complete them to unlock the Daily Tests!`);
};
// --- PLANNER FUNCTIONS ---


// --- NEW MOBILE-FIRST PLANNER LOGIC ---

// 1. Tab Switching (Unscheduled vs Scheduled)
window.state.plannerTab = 'unscheduled'; 

window.setPlannerTab = function(tab) {
    state.plannerTab = tab;
    const unschBtn = document.getElementById('tab-unscheduled');
    const schBtn = document.getElementById('tab-scheduled');
    const unschSec = document.getElementById('planner-section-unscheduled');
    const schSec = document.getElementById('planner-section-scheduled');

    if(tab === 'unscheduled') {
        unschBtn.className = "px-3 py-1.5 rounded-md text-xs font-bold transition-all bg-white dark:bg-slate-700 shadow-sm text-indigo-600 dark:text-indigo-300";
        schBtn.className = "px-3 py-1.5 rounded-md text-xs font-bold transition-all text-slate-500 hover:text-slate-800 dark:text-slate-500 dark:hover:text-slate-300";
        unschSec.classList.remove('hidden');
        schSec.classList.add('hidden');
    } else {
        schBtn.className = "px-3 py-1.5 rounded-md text-xs font-bold transition-all bg-white dark:bg-slate-700 shadow-sm text-indigo-600 dark:text-indigo-300";
        unschBtn.className = "px-3 py-1.5 rounded-md text-xs font-bold transition-all text-slate-500 hover:text-slate-800 dark:text-slate-500 dark:hover:text-slate-300";
        schSec.classList.remove('hidden');
        unschSec.classList.add('hidden');
    }
};
// --- Helper for Accordion Toggle ---
window.togglePlannerGroup = function(id) {
    const body = document.getElementById(`group-body-${id}`);
    const icon = document.getElementById(`group-icon-${id}`);
    
    if(body) {
        const isHidden = body.classList.contains('hidden');
        if(isHidden) {
            body.classList.remove('hidden');
            body.classList.add('animate-in', 'fade-in', 'slide-in-from-top-1');
            if(icon) icon.style.transform = 'rotate(180deg)';
        } else {
            body.classList.add('hidden');
            if(icon) icon.style.transform = 'rotate(0deg)';
        }
    }
};
// 2. Main Render Function
window.renderPlanner = function() {
    setPlannerTab(state.plannerTab || 'unscheduled');

    const poolList = document.getElementById('planner-pool-list');
    const scheduleList = document.getElementById('planner-schedule-list');
    const completedList = document.getElementById('planner-completed-list');
    const completedContainer = document.getElementById('planner-completed-container');
    
    if(!poolList) return;

    poolList.innerHTML = '';
    scheduleList.innerHTML = '';
    completedList.innerHTML = '';

    const k = formatDateKey(state.selectedDate);
    const tasks = state.tasks[k] || [];
    
    // Filter tasks
    const unscheduled = tasks.filter(t => !t.completed && (!t.timeLabel || t.timeLabel.trim() === ''));
    const scheduled = tasks.filter(t => !t.completed && t.timeLabel && t.timeLabel.trim() !== '');
    const completed = tasks.filter(t => t.completed);

    // --- Helper to Group Tasks by Chapter ---
    const groupByChapter = (taskList) => {
        const groups = {};
        taskList.forEach(t => {
            // Extract chapter name or default to "General"
            let chap = t.chapter;
            if(!chap && t.text.includes(" - ")) chap = t.text.split(" - ")[0];
            if(!chap) chap = 'General Tasks';
            
            if(!groups[chap]) groups[chap] = [];
            groups[chap].push(t);
        });
        return groups;
    };

    // --- A. UNSCHEDULED TAB (With Dropdown) ---
    if(unscheduled.length === 0) {
        poolList.innerHTML = `<div class="flex flex-col items-center justify-center py-12 text-slate-400"><i data-lucide="check-circle-2" class="w-10 h-10 mb-2 opacity-50"></i><p class="text-sm">All set! Check your schedule.</p></div>`;
    } else {
        const groups = groupByChapter(unscheduled);
        Object.entries(groups).forEach(([chapName, groupTasks], index) => {
            // Create unique ID for accordion
            const safeId = 'pool-' + index + '-' + Date.now(); 
            
            const el = document.createElement('div');
            el.className = "bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden transition-all";
            
            el.innerHTML = `
                <div class="p-3 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center cursor-pointer select-none" onclick="togglePlannerGroup('${safeId}')">
                    <div class="flex items-center gap-2 overflow-hidden">
                        <i data-lucide="chevron-down" id="group-icon-${safeId}" class="w-4 h-4 text-slate-400 transition-transform duration-200"></i>
                        <div class="font-bold text-sm text-slate-800 dark:text-slate-200 truncate">
                            ${chapName} <span class="text-xs font-normal text-slate-400 ml-1">(${groupTasks.length})</span>
                        </div>
                    </div>
                    <button onclick="event.stopPropagation(); openScheduler(null, '${chapName}')" class="shrink-0 flex items-center gap-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 px-2.5 py-1.5 rounded-lg text-xs font-bold hover:bg-indigo-200 transition-colors z-10">
                        <i data-lucide="clock" class="w-3 h-3"></i> Plan All
                    </button>
                </div>
                
                <div id="group-body-${safeId}" class="hidden bg-white dark:bg-slate-900">
                    <div class="p-1 space-y-0.5">
                        ${groupTasks.map(t => `
                            <div class="flex items-center justify-between p-2 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-lg group transition-colors pl-8">
                                <span class="text-xs font-medium text-slate-600 dark:text-slate-300 truncate pr-2">${t.text.replace(chapName + ' - ', '')}</span>
                                <button onclick="openScheduler('${t.id}', '${t.text}')" class="p-1.5 text-slate-400 hover:text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-all" title="Plan specific topic">
                                    <i data-lucide="arrow-right-circle" class="w-4 h-4"></i>
                                </button>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
            poolList.appendChild(el);
        });
    }

    // --- B. SCHEDULED TAB (With Dropdown) ---
    if(scheduled.length === 0) {
        scheduleList.innerHTML = `<div class="text-center py-10 text-slate-400 text-xs italic">Nothing scheduled yet. Go to 'To Plan' tab.</div>`;
    } else {
        const groups = groupByChapter(scheduled);
        
        Object.entries(groups).forEach(([chapName, groupTasks], index) => {
            const safeId = 'sched-' + index + '-' + Date.now();
            
            // Determine time label for the group (use the first task's time or "Mixed")
            const timeLabel = groupTasks[0].timeLabel || "Scheduled";
            const isMixed = groupTasks.some(t => t.timeLabel !== timeLabel);
            const displayTime = isMixed ? "Multiple Times" : timeLabel;

            const el = document.createElement('div');
            el.className = "flex gap-3 relative mb-4"; // Flex container for Timeline + Card
            
            el.innerHTML = `
                <div class="flex flex-col items-center pt-2">
                    <div class="w-3 h-3 bg-indigo-500 rounded-full ring-4 ring-indigo-50 dark:ring-indigo-900/20 z-10"></div>
                    <div class="w-0.5 flex-1 bg-slate-200 dark:bg-slate-800 my-1"></div>
                </div>

                <div class="flex-1 min-w-0">
                    <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden">
                        
                        <div class="p-3 flex justify-between items-start cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors" onclick="togglePlannerGroup('${safeId}')">
                            <div>
                                <div class="inline-flex items-center gap-1.5 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 px-2 py-0.5 rounded-md text-[10px] font-bold mb-1.5">
                                    <i data-lucide="clock" class="w-3 h-3"></i> ${displayTime}
                                </div>
                                <h4 class="font-bold text-slate-800 dark:text-white text-sm leading-tight flex items-center gap-2">
                                    ${chapName}
                                    <span class="text-xs font-normal text-slate-400">(${groupTasks.length})</span>
                                </h4>
                            </div>
                            <i data-lucide="chevron-down" id="group-icon-${safeId}" class="w-4 h-4 text-slate-400 mt-1 transition-transform duration-200"></i>
                        </div>

                        <div id="group-body-${safeId}" class="hidden border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20">
                            <div class="p-2 space-y-1">
                                ${groupTasks.map(t => `
                                    <div class="flex items-center gap-3 p-2 bg-white dark:bg-slate-900 rounded-lg border border-slate-100 dark:border-slate-800/50 shadow-sm">
                                        <button onclick="toggleTask('${t.id}'); renderPlanner();" class="shrink-0 w-5 h-5 rounded-full border-2 border-slate-300 dark:border-slate-600 hover:border-green-500 hover:bg-green-50 transition-all"></button>
                                        <div class="flex-1 min-w-0">
                                            <p class="text-xs font-medium text-slate-700 dark:text-slate-300 truncate">${t.text.replace(chapName + ' - ', '')}</p>
                                        </div>
                                        <button onclick="removeTime('${t.id}')" class="text-slate-300 hover:text-red-500">
                                            <i data-lucide="x-circle" class="w-4 h-4"></i>
                                        </button>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    </div>
                </div>
            `;
            scheduleList.appendChild(el);
        });
    }

    // --- C. COMPLETED SECTION ---
    if(completed.length > 0) {
        completedContainer.classList.remove('hidden');
        completed.forEach(t => {
            const el = document.createElement('div');
            el.className = "flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-100 dark:border-slate-800/50";
            el.innerHTML = `
                <div class="p-1 rounded-full bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400 cursor-pointer" onclick="toggleTask('${t.id}'); renderPlanner();">
                    <i data-lucide="check" class="w-3 h-3"></i>
                </div>
                <div class="flex-1 min-w-0">
                    <p class="text-xs font-medium text-slate-500 line-through truncate">${t.text}</p>
                </div>
                <span class="text-[10px] text-slate-400">${t.timeLabel || 'Done'}</span>
            `;
            completedList.appendChild(el);
        });
    } else {
        completedContainer.classList.add('hidden');
    }

    if(window.lucide) lucide.createIcons({ root: document.getElementById('view-planner') });
};

// 3. Quick Add Task
window.addPlannerTask = function() {
    const textInput = document.getElementById('planner-new-text');
    if(textInput && textInput.value.trim()) {
        const key = formatDateKey(state.selectedDate);
        if (!state.tasks[key]) state.tasks[key] = [];
        
        state.tasks[key].push({
        id: 'task_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),    
            text: textInput.value.trim(),
            type: 'manual', 
            subject: 'General', 
            timeLabel: "", // Empty = Unscheduled
            completed: false 
        });
        
        textInput.value = '';
        saveData();
        renderPlanner();
    }
};

// 4. Modal & Time Logic
window.openScheduler = function(taskId, name) {
    const modal = document.getElementById('scheduler-modal');
    const title = document.getElementById('scheduler-subtitle');
    const idInput = document.getElementById('scheduler-task-id');
    const isChapInput = document.getElementById('scheduler-is-chapter');
    const chapNameInput = document.getElementById('scheduler-chapter-name');
    
    // Reset inputs
    document.getElementById('scheduler-start').value = '';
    document.getElementById('scheduler-duration').value = '';

    if(taskId) {
        title.textContent = "Scheduling: " + name;
        idInput.value = taskId;
        isChapInput.value = "false";
    } else {
        title.textContent = "Scheduling Chapter: " + name;
        isChapInput.value = "true";
        chapNameInput.value = name;
    }
    modal.classList.remove('hidden');
};

window.closeScheduler = function() {
    document.getElementById('scheduler-modal').classList.add('hidden');
};

window.setDuration = function(val) {
    document.getElementById('scheduler-duration').value = val;
};

window.confirmSchedule = function() {
    const startStr = document.getElementById('scheduler-start').value;
    const duration = parseFloat(document.getElementById('scheduler-duration').value);
    
    if(!startStr || !duration) {
        alert("Please set both start time and duration.");
        return;
    }

    // Calculate End Time
    const [h, m] = startStr.split(':').map(Number);
    const startDate = new Date();
    startDate.setHours(h, m, 0, 0);
    const endDate = new Date(startDate.getTime() + duration * 60 * 60 * 1000);
    
    const formatTime = (d) => d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
    const timeLabel = `${formatTime(startDate)} - ${formatTime(endDate)}`;

    const k = formatDateKey(state.selectedDate);
    const isChapter = document.getElementById('scheduler-is-chapter').value === "true";
    
    if(isChapter) {
        const chapName = document.getElementById('scheduler-chapter-name').value;
        (state.tasks[k] || []).forEach(t => {
            let tChap = t.chapter || (t.text.includes(" - ") ? t.text.split(" - ")[0] : null);
            if(tChap === chapName && !t.completed) {
                t.timeLabel = timeLabel;
            }
        });
    } else {
        const taskId = document.getElementById('scheduler-task-id').value;
        const task = (state.tasks[k] || []).find(t => t.id === taskId);
        if(task) task.timeLabel = timeLabel;
    }

    saveData();
    closeScheduler();
    
    // Auto-switch to Scheduled tab
    setPlannerTab('scheduled');
    renderPlanner();
};

window.removeTime = function(id) {
    const k = formatDateKey(state.selectedDate);
    const task = state.tasks[k].find(t => t.id === id);
    if(task) {
        task.timeLabel = ""; 
        saveData();
        renderPlanner();
    }
};


window.assignChapterTime = function(chapName, inputId) {
    const input = document.getElementById(inputId);
    if(!input || !input.value.trim()) return;
    
    const timeVal = input.value.trim();
    const k = formatDateKey(state.selectedDate);
    const tasks = state.tasks[k] || [];
    
    let updatedCount = 0;
    
    tasks.forEach(t => {
        // Match explicit chapter OR inferred chapter from text string
        let tChap = t.chapter;
        if (!tChap && t.text.startsWith("Study: ")) {
            const parts = t.text.replace("Study: ", "").split(" - ");
            if (parts.length > 1) tChap = parts[0];
        }
        if(!tChap) tChap = 'Miscellaneous Tasks';

        // If it matches AND is currently unscheduled, update it
        if(tChap === chapName && (!t.timeLabel || t.timeLabel.trim() === '')) {
            t.timeLabel = timeVal;
            updatedCount++;
        }
    });

    if(updatedCount > 0) {
        saveData();
        renderPlanner();
        // Simple toast notification
        const toast = document.createElement('div');
        toast.className = "fixed bottom-4 right-4 bg-slate-900 text-white px-4 py-2 rounded-lg shadow-lg z-50 animate-in fade-in slide-in-from-bottom-2";
        toast.textContent = `Moved ${updatedCount} tasks to ${timeVal}`;
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 3000);
    }
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

        
function renderAll() {
            renderHeader();
            updateHeaderPrayerBtn();
            renderStats();
            
            // Performance Optimization: Lazy Rendering
            if (state.activeView === 'overview') {
                renderTasks();
                checkStudyPace(); // This activates the Smart Coach
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
            
            // Re-scan icons if library is loaded
            if(window.lucide) lucide.createIcons();
        }
// FIX: Make all these functions global so HTML buttons can see them
window.renderAll = renderAll;
window.renderTasks = renderTasks;
        function renderHeader() {
            const els = { date: document.getElementById('overview-date'), agendaDate: document.getElementById('agenda-date-display') };
            const dateStr = state.selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
            if(els.date) els.date.textContent = state.selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
            if(els.agendaDate) els.agendaDate.textContent = dateStr;
        }
function renderStats() {
            const today = new Date(); today.setHours(0,0,0,0);
            const exDate = new Date(state.nextExam.date); exDate.setHours(0,0,0,0);
            
            // FIXED: Exclude exam day from prep days for visual count
            let rawDiff = Math.ceil((exDate - today)/(1000*60*60*24));
            const diff = rawDiff > 0 ? rawDiff - 1 : rawDiff;
                    const formattedDate = state.nextExam.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
            
            // Text Updates
            const elements = {
                name: document.getElementById('card-main-name'),
                date: document.getElementById('card-main-date-info'),
                days: document.getElementById('card-main-days'),
                sylTitle: document.getElementById('syllabus-title'),
                sylDate: document.getElementById('syllabus-date'),
                sylDays: document.getElementById('syllabus-days-left'),
                blDays: document.getElementById('backlog-days-left'),
                blLarge: document.getElementById('backlog-days-large')
            };

            if(elements.name) elements.name.textContent = state.nextExam.name;
            if(elements.date) elements.date.textContent = `Exam Date: ${formattedDate}`;
if(elements.days) {
    elements.days.textContent = diff;
    
    // URGENCY FOR MAIN EXAM (Starts at 5 days)
    if (diff <= 5) {
        // Neon Pink + Pulse (Beautiful contrast on Blue)
        elements.days.className = "block text-5xl font-black tracking-tighter text-fuchsia-300 animate-pulse";
    } else {
        // Reset to default white
        elements.days.className = "block text-5xl font-black tracking-tighter";
    }
}
    
    
    
    if(elements.sylTitle) elements.sylTitle.textContent = state.nextExam.name + " Syllabus";
            if(elements.sylDate) elements.sylDate.textContent = formattedDate;
            if(elements.sylDays) elements.sylDays.textContent = `${diff} Days Left`;
const blDate = new Date(backlogPlan.date); blDate.setHours(0,0,0,0);
// NEW LOGIC BLOCK:
if(elements.blDateDisplay && typeof backlogPlan !== 'undefined') {
    elements.blDateDisplay.textContent = backlogPlan.date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric', 
        year: 'numeric' 
    });
}


    
            // FIX: Subtract 1 day to exclude the deadline day itself
            let rawBlDiff = Math.ceil((blDate - today)/(1000*60*60*24));
            const blDiff = rawBlDiff > 0 ? rawBlDiff  : rawBlDiff;
    
if(elements.blLarge) elements.blLarge.textContent = blDiff;
// 2. REPLACE the old 'blDays' line with this new block:
if(elements.blDays) {
    elements.blDays.textContent = `${blDiff} Days Left`;
    
    // Dynamic Urgency Color Logic
    if (blDiff <= 3) {
        // Red + Pulse (Critical)
        elements.blDays.className = "text-xs font-bold text-red-600 dark:text-red-400 mt-1 animate-pulse";
    } else {
        // Orange (Normal)
        elements.blDays.className = "text-xs font-bold text-orange-600 dark:text-orange-400 mt-1";
    }
}           
           
            // Global Progress Calculation
            const allCompleted = new Set(Object.values(state.tasks).flat().filter(t => t.completed).map(t => t.text));
            
            // Main Syllabus Progress
            let mainTotal = 0, mainDone = 0;
            state.nextExam.syllabus.forEach(s => s.dailyTests.forEach(dt => dt.subs.forEach(sub => {
                mainTotal++;
                if(allCompleted.has(`Study: ${s.topic} - ${sub}`)) mainDone++;
            })));
            const mainPct = mainTotal ? Math.round((mainDone/mainTotal)*100) : 0;
            const mainBar = document.getElementById('card-main-bar');
            if(mainBar) mainBar.style.width = `${mainPct}%`;
            const mainText = document.getElementById('card-main-text');
            if(mainText) mainText.textContent = `${mainPct}%`;

            // Backlog Progress
            let blTotal = 0, blDone = 0;
            backlogPlan.syllabus.forEach(s => s.dailyTests.forEach(dt => dt.subs.forEach(sub => {
                blTotal++;
                if(allCompleted.has(`Study: ${s.topic} - ${sub}`)) blDone++;
            })));
            const blPct = blTotal ? Math.round((blDone/blTotal)*100) : 0;
            const blBar = document.getElementById('card-backlog-bar');
            if(blBar) blBar.style.width = `${blPct}%`;
            const blText = document.getElementById('card-backlog-text');
            if(blText) blText.textContent = `${blPct}%`;

            // Sidebar / Daily Goal Logic
            const subjectSelect = document.getElementById('new-task-subject');
            const selectedSubject = subjectSelect ? subjectSelect.value : 'General';
            const k = formatDateKey(state.selectedDate);
            const todays = state.tasks[k] || [];
            
            let filteredTasks = todays;
            if (selectedSubject !== 'General') filteredTasks = todays.filter(t => t.subject === selectedSubject);

            const totalFiltered = filteredTasks.length;
            const completedFiltered = filteredTasks.filter(t=>t.completed).length;
            const dayPct = totalFiltered ? Math.round((completedFiltered / totalFiltered)*100) : 0;
            
            // CONFETTI & SOUND LOGIC
            if (totalFiltered > 0 && dayPct === 100 && !state.goalCompletedToday) {
                // Check if this completion just happened (avoid looping on re-render)
                state.goalCompletedToday = true; 
                try {
                    // Realistic Confetti Fire
                    var count = 200;
                    var defaults = { origin: { y: 0.7 } };

                    function fire(particleRatio, opts) {
                        if (window.confetti) {
                            confetti(Object.assign({}, defaults, opts, {
                                particleCount: Math.floor(count * particleRatio)
                            }));
                        }
                    }

                    fire(0.25, { spread: 26, startVelocity: 55, });
                    fire(0.2, { spread: 60, });
                    fire(0.35, { spread: 100, decay: 0.91, scalar: 0.8 });
                    fire(0.1, { spread: 120, startVelocity: 25, decay: 0.92, scalar: 1.2 });
                    fire(0.1, { spread: 120, startVelocity: 45, });
                    
                    // Sound
                    successSound.currentTime = 0;
                    successSound.play().catch(e => console.log("Audio play failed (interaction required first)"));
                } catch(e) {
                    console.log("Effects failed", e);
                }
            } else if (dayPct < 100) {
                state.goalCompletedToday = false;
            }

            // Gradient Bar
            let completedExamCount = filteredTasks.filter(t => t.completed && t.type === 'main').length;
            let completedBacklogCount = filteredTasks.filter(t => t.completed && t.type === 'backlog').length;
            let gradientStyle = `bg-brand-500`; 
            
            if (completedFiltered > 0) {
                const totalScored = completedExamCount + completedBacklogCount;
                if (totalScored > 0) {
                    const examShare = (completedExamCount / totalScored) * 100;
                    gradientStyle = `background: linear-gradient(90deg, #0ea5e9 0%, #0ea5e9 ${examShare}%, #f97316 ${examShare}%, #f97316 100%)`;
                } else { gradientStyle = `background-color: #0ea5e9`; }
            } else { gradientStyle = `background-color: #0ea5e9`; }

            const sideBar = document.getElementById('sidebar-progress-bar');
            if(sideBar) {
                sideBar.style = `width: ${dayPct}%; ${gradientStyle}`;
                sideBar.classList.remove('bg-brand-500'); 
            }
            
            const sideText = document.getElementById('sidebar-progress-text');
            if(sideText) sideText.textContent = `${dayPct}%`;
// --- START OF NEW CODE FOR MOBILE ---
            const mobSideBar = document.getElementById('mobile-sidebar-progress-bar');
            if(mobSideBar) {
                mobSideBar.style = `width: ${dayPct}%; ${gradientStyle}`;
                mobSideBar.classList.remove('bg-brand-500'); 
            }
            
            const mobSideText = document.getElementById('mobile-sidebar-progress-text');
            if(mobSideText) mobSideText.textContent = `${dayPct}%`;
            // --- END OF NEW CODE FOR MOBILE ---
            
            const footerLabel = document.getElementById('footer-goal-label');
            if(footerLabel) footerLabel.textContent = selectedSubject === 'General' ? 'Daily Goal' : `${selectedSubject} Goal`;
        }

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

            // 4. Render "READY" Cards (Green)
            if(readyTests.length > 0) {
                const readyHtml = readyTests.map(test => {
                    const subSummary = test.subs.slice(0, 3).join(', ') + (test.subs.length > 3 ? '...' : '');
                    
                    return `
                    <div class="mb-6 bg-gradient-to-r from-emerald-600 to-teal-600 rounded-xl p-5 text-white shadow-lg shadow-emerald-500/20 relative overflow-hidden group animate-in slide-in-from-top-2 fade-in duration-300">
                        <div class="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                            <i data-lucide="award" class="w-24 h-24 rotate-12"></i>
                        </div>
                        <div class="relative z-10">
                            <div class="flex justify-between items-start mb-3">
                                <div>
                                    <span class="bg-white/20 backdrop-blur-md px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider text-white border border-white/10">
                                        Unlocked
                                    </span>
                                    <h3 class="text-xl font-bold text-white tracking-tight mt-1">${test.name}</h3>
                                    <p class="text-xs text-emerald-100 font-medium">Topic: ${test.topic}</p>
                                </div>
                                <div class="bg-white/20 p-2 rounded-lg backdrop-blur-sm shadow-sm animate-pulse">
                                    <i data-lucide="unlock" class="w-6 h-6 text-white"></i>
                                </div>
                            </div>
                            
                            <div class="bg-black/10 rounded-lg p-2 mb-4">
                                <p class="text-[10px] uppercase font-bold text-emerald-200 mb-1">Includes</p>
                                <p class="text-xs text-white/90 font-medium truncate">${subSummary}</p>
                            </div>

                            <button onclick="confetti({particleCount: 150, spread: 60, origin: { y: 0.7 }}); toggleTestAttempt('${test.name}'); renderAll();" 
                                class="w-full bg-white text-emerald-700 py-3 rounded-xl text-sm font-bold shadow-md hover:bg-emerald-50 active:scale-[0.98] transition-all flex items-center justify-center gap-2">
                                <i data-lucide="check-circle-2" class="w-4 h-4"></i>
                                Attempt & Mark Done
                            </button>
                        </div>
                    </div>
                `}).join('');
                list.insertAdjacentHTML('beforeend', readyHtml);
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

// Optimized Render Syllabus with Search & Fragments
window.renderSyllabus = function(type, searchQuery = '') {
    const container = document.getElementById(type === 'main' ? 'main-syllabus-container' : 'backlog-syllabus-container');
    if(!container) return;
    
    // 1. Clear Container
    container.innerHTML = '';

    // 2. Prepare Data & Helpers
    const rawData = type === 'main' ? state.nextExam.syllabus : backlogPlan.syllabus;
    
    // BUG FIX: Distinguish between "Done Ever" and "Added Today"
    // 'allCompleted' is for history (Green Strikethrough)
    const allCompleted = new Set(Object.values(state.tasks).flat().filter(t => t.completed).map(t => t.text));
    
    // 'todaysTasks' is for the "Add" button state (Plus vs Check icon)
    const k = formatDateKey(state.selectedDate);
    const todaysTasks = new Set((state.tasks[k] || []).map(t => t.text));

    const lowerQuery = searchQuery.toLowerCase().trim();

    // 3. Performance: Create a DocumentFragment
    const fragment = document.createDocumentFragment();
    let hasResults = false;

    const safeQuery = escapeRegex(lowerQuery);
    const queryRegex = safeQuery ? new RegExp(`(${safeQuery})`, 'gi') : null;

    rawData.forEach((item, chapterIdx) => {
        // Search Logic
        const chapterMatch = item.topic.toLowerCase().includes(lowerQuery) || item.subject.toLowerCase().includes(lowerQuery);
        const matchingTests = item.dailyTests.filter(dt => {
            if (chapterMatch) return true; 
            return dt.name.toLowerCase().includes(lowerQuery) || 
                dt.subs.some(sub => sub.toLowerCase().includes(lowerQuery));
        });

        if (lowerQuery && !chapterMatch && matchingTests.length === 0) return;
        
        hasResults = true;
        const chapterId = `${type}-chapter-${chapterIdx}`;
        const isChapterExpanded = lowerQuery ? true : state.expandedTests[chapterId];
        
        const allDailyTests = item.dailyTests || [];
        const allDailyTestsCompleted = allDailyTests.every(dt => state.dailyTestsAttempted[dt.name]);
        
        const chapterCardClass = allDailyTestsCompleted 
            ? "bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-900 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow card-transition mb-4"
            : "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow card-transition mb-4";
        
        const chapterHeaderClass = allDailyTestsCompleted
            ? "bg-green-100 dark:bg-green-900/20 px-4 py-3 border-b border-green-200 dark:border-green-800 flex justify-between items-center cursor-pointer select-none"
            : "bg-slate-50 dark:bg-slate-800 px-4 py-3 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center cursor-pointer select-none";

        const card = document.createElement('div');
        card.className = chapterCardClass;
        
        const safeTopic = escapeHtml(item.topic);
        const displayTopic = queryRegex 
            ? safeTopic.replace(queryRegex, '<span class="bg-yellow-200 dark:bg-yellow-900/50 text-slate-900 dark:text-white">$1</span>')
            : safeTopic;

        let html = `
            <div class="${chapterHeaderClass}" onclick="toggleChapter('${chapterId}')">
                <div>
                    <span class="text-[10px] font-bold uppercase tracking-wider ${allDailyTestsCompleted ? 'text-green-700 dark:text-green-300' : 'text-slate-400 dark:text-slate-500'}">${item.subject}</span>
                    <div class="flex items-center gap-2">
                        <h4 class="font-bold text-slate-800 dark:text-white">${displayTopic}</h4> 
                        ${allDailyTestsCompleted ? '<i data-lucide="check-circle" class="w-4 h-4 text-green-600 dark:text-green-400"></i>' : ''}
                    </div>
                </div>
                    <i data-lucide="chevron-down" class="w-5 h-5 text-slate-400 transition-transform duration-300 ${isChapterExpanded ? 'rotate-180' : ''}"></i>
            </div>
        `;

        if (isChapterExpanded) {
            html += `<div class="p-4 grid grid-cols-1 gap-3 animate-in fade-in slide-in-from-top-2 duration-300">`;
            
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
                let cardContentStyle = ""; 
                
                if (isAttempted) {
                    cardStyle = "border-0 rounded-lg bg-gradient-to-r from-green-500 to-emerald-600 transition-colors relative shadow-md text-white";
                    cardContentStyle = "text-white"; 
                }

                const showCheckbox = isReady || isAttempted;
                const safeTestName = escapeHtml(dt.name);
                const displayName = queryRegex 
                    ? safeTestName.replace(queryRegex, '<span class="bg-yellow-200 dark:bg-yellow-600 text-black">$1</span>') 
                    : safeTestName;

                html += `
                    <div class="${cardStyle} overflow-hidden">
                        <div class="p-3 flex justify-between items-center cursor-pointer" onclick="toggleDailyTest('${testId}')">
                            <div class="flex items-center gap-2">
                                <i data-lucide="chevron-right" class="w-4 h-4 ${isAttempted ? 'text-white/70' : 'text-slate-400 dark:text-slate-500'} transition-transform duration-200 ${isTestExpanded ? 'rotate-90' : ''}"></i>
                                <div class="flex items-center gap-2" onclick="event.stopPropagation()">
                               ${showCheckbox ? 
    `<input type="checkbox" 
        ${isAttempted ? 'checked' : ''} 
        onchange="toggleTestAttempt('${safeQuote(dt.name)}')" class="w-4 h-4 rounded border-slate-300 text-green-600 focus:ring-green-500 cursor-pointer"
    >` : ''
}        

                                    <span class="text-xs font-bold ${isAttempted ? 'text-green-800 bg-white/90' : 'text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-700'} px-2 py-0.5 rounded backdrop-blur-sm select-text cursor-text">${displayName}</span>
                                </div>
                            </div>
                                ${isAttempted ? 
                                `<span class="text-[10px] font-bold text-green-700 bg-white px-2 py-0.5 rounded-full flex items-center gap-1 shadow-sm"><i data-lucide="award" class="w-3 h-3"></i> Done</span>` 
                            : isReady ? 
                                `<span class="text-[10px] font-bold text-green-600 dark:text-green-300 bg-green-50 dark:bg-green-900/30 px-2 py-0.5 rounded-full flex items-center gap-1 animate-pulse"><i data-lucide="check-circle" class="w-3 h-3"></i> Ready</span>` 
                            :
                                `<span class="text-[10px] font-medium ${isAttempted ? 'text-white/80' : 'text-slate-400 dark:text-slate-500'}">${doneCount}/${total}</span>`
                            }
                        </div>
                        ${isTestExpanded ? `
                            <div class="px-3 pb-3 pt-0 border-t ${isAttempted ? 'border-white/20' : 'border-slate-50 dark:border-slate-700'} animate-in fade-in slide-in-from-top-1 duration-200">
                                <div class="space-y-1 mt-2 ${cardContentStyle}">
                                    ${dt.subs.map(sub => {
                                        const taskName = `Study: ${item.topic} - ${sub}`;
                                        
                                        // HERE IS THE FIX: Check todaysTasks for "Added" status
                                        const isAdded = todaysTasks.has(taskName);
                                        const isDone = allCompleted.has(taskName);
                                        
                                        const safeSub = escapeHtml(sub);
                                        const displaySub = queryRegex 
                                            ? safeSub.replace(queryRegex, '<span class="bg-yellow-200 dark:bg-yellow-600 text-black">$1</span>') 
                                            : safeSub;

                                        let textClass = "text-slate-500 dark:text-slate-400";
                                        if (isAttempted) textClass = "text-white/90";
                                        if (isDone) textClass = isAttempted ? "line-through opacity-70 text-white/70" : "line-through opacity-50 decoration-slate-400 dark:decoration-slate-500";
                                        
                                        let btnClass = "text-brand-400 hover:text-brand-600 dark:hover:text-brand-300";
                                        if (isAttempted) btnClass = "text-white/80 hover:text-white";
                                        
                                        return `
                                            <div class="flex items-center justify-between group pl-6 py-0.5">
                                                <span class="text-[11px] truncate w-3/4 ${textClass}" title="${safeSub}">• ${displaySub}</span>
                                                ${!isDone ? 
                                                    `
<button onclick="addSyllabusTask('${safeQuote(item.topic)} - ${safeQuote(sub)}', '${type}', '${item.subject}', '${safeQuote(item.topic)}')" class="${btnClass} transition-colors p-1" title="${isAdded ? 'Already in Agenda' : 'Add to Selected Date'}" aria-label="Add to plan">
                                                        <i data-lucide="${isAdded ? 'copy-check' : 'plus-circle'}" class="w-4 h-4"></i>
                                                    </button>` : 
                                                    `<i data-lucide="check" class="w-3 h-3 ${isAttempted ? 'text-white' : 'text-green-500 dark:text-green-400'}"></i>`
                                                }
                                            </div>
                                        `;
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

    if (!hasResults && lowerQuery) {
        container.innerHTML = `<div class="p-8 text-center text-slate-400 dark:text-slate-500">No topics found matching "${escapeHtml(searchQuery)}"</div>`;
    } else {
        container.appendChild(fragment); 
    }
    
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

    const maxFalling = 400; // Constant density
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







