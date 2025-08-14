// This is the main application file that orchestrates all the components.
const { useState, useEffect } = React;
const { initializeApp, getApps } = firebaseApp;
const { getAuth, signInWithCustomToken, signInAnonymously, onAuthStateChanged } = firebaseAuth;
const { getFirestore, collection, onSnapshot, doc, setDoc, addDoc, serverTimestamp, query, where } = firestore;

// Define the global Firebase variables to be populated by the Canvas environment
const firebaseConfig = typeof __firebase_config !== 'undefined' ? JSON.parse(__firebase_config) : {};
const initialAuthToken = typeof __initial_auth_token !== 'undefined' ? __initial_auth_token : null;
const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';

// --- MAIN APP COMPONENT ---
const App = () => {
    const [page, setPage] = useState('home');
    const [selectedDate, setSelectedDate] = useState(null);
    const [db, setDb] = useState(null);
    const [auth, setAuth] = useState(null);
    const [userId, setUserId] = useState(null);
    const [isAuthReady, setIsAuthReady] = useState(false);

    // Initialize Firebase
    useEffect(() => {
        let firebaseApp;
        try {
            if (!getApps().length) {
                firebaseApp = initializeApp(firebaseConfig);
            }
            const firestoreDb = getFirestore(firebaseApp);
            const firebaseAuth = getAuth(firebaseApp);
            setDb(firestoreDb);
            setAuth(firebaseAuth);

            onAuthStateChanged(firebaseAuth, async (user) => {
                if (user) {
                    setUserId(user.uid);
                    setIsAuthReady(true);
                } else {
                    try {
                        if (initialAuthToken) {
                            await signInWithCustomToken(firebaseAuth, initialAuthToken);
                        } else {
                            await signInAnonymously(firebaseAuth);
                            const anonymousUser = firebaseAuth.currentUser;
                            setUserId(anonymousUser?.uid || crypto.randomUUID());
                        }
                    } catch (error) {
                        console.error("Firebase sign-in error:", error);
                        // Fallback to anonymous ID if sign-in fails
                        setUserId(crypto.randomUUID());
                    } finally {
                         setIsAuthReady(true);
                    }
                }
            });
        } catch (e) {
            console.error("Failed to initialize Firebase:", e);
            setUserId(crypto.randomUUID());
            setIsAuthReady(true);
        }
    }, []);

    // --- PAGE NAVIGATION ---
    const renderPage = () => {
        switch (page) {
            case 'home':
                return <HomePage setPage={setPage} setSelectedDate={setSelectedDate} />;
            case 'monthly':
                return <MonthlyCalendar date={selectedDate} setPage={setPage} userId={userId} db={db} isAuthReady={isAuthReady} />;
            case 'friends':
                return <FriendsPage setPage={setPage} userId={userId} db={db} isAuthReady={isAuthReady} />;
            default:
                return <HomePage setPage={setPage} setSelectedDate={setSelectedDate} />;
        }
    };

    return (
        <div className="bg-[#F7F1E3] font-[Inter] min-h-screen p-4 flex flex-col items-center justify-center">
            {isAuthReady && userId && (
                 <div className="text-sm text-gray-500 mb-2">User ID: {userId}</div>
            )}
            <nav className="flex justify-center space-x-4 mb-8">
                <button onClick={() => setPage('home')} className="px-4 py-2 bg-[#D63031] text-white font-bold rounded-lg hover:bg-red-700 transition-colors">Home</button>
                <button onClick={() => setPage('friends')} className="px-4 py-2 bg-[#D63031] text-white font-bold rounded-lg hover:bg-red-700 transition-colors">Friends</button>
            </nav>
            {renderPage()}
        </div>
    );
};

// Render the main app component
ReactDOM.createRoot(document.getElementById('root')).render(<App />);

