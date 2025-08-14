// This component displays the monthly calendar and reminder functionality.
const { useState, useEffect, useRef } = React;
const { collection, onSnapshot, addDoc, serverTimestamp, query } = firestore;

const MonthlyCalendar = ({ date, setPage, userId, db, isAuthReady }) => {
    const [currentDate, setCurrentDate] = useState(date || new Date());
    const [modal, setModal] = useState({ isOpen: false, message: '', sarcastic: false });
    const [reminders, setReminders] = useState([]);
    const [newReminder, setNewReminder] = useState('');
    const messageTimer = useRef(null);

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    // Fetch reminders from Firestore
    useEffect(() => {
        if (!isAuthReady || !db || !userId) return;

        const remindersCollectionRef = collection(db, 'artifacts', appId, 'users', userId, 'reminders');
        const q = query(remindersCollectionRef);
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const fetchedReminders = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setReminders(fetchedReminders);
        }, (error) => {
            console.error("Error fetching reminders:", error);
        });

        return () => unsubscribe();
    }, [isAuthReady, db, userId]);

    // Calendar rendering logic
    const renderCalendar = () => {
        const firstDayOfMonth = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const calendarCells = [];

        // Add blank days
        for (let i = 0; i < firstDayOfMonth; i++) {
            calendarCells.push(<div key={`blank-${i}`} className="h-16"></div>);
        }

        // Add days of the month
        for (let day = 1; day <= daysInMonth; day++) {
            const dateString = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const isHoliday = fakeHolidays[dateString];
            const isToday = day === new Date().getDate() && month === new Date().getMonth() && year === new Date().getFullYear();
            
            let cellClasses = "day-cell h-16 flex flex-col justify-center items-center text-xl font-bold rounded-lg transition-colors";
            
            if (isHoliday) {
                cellClasses += " bg-[#D63031] text-white cursor-pointer hover:bg-red-700";
            } else if (isToday) {
                cellClasses += " bg-gray-200 text-gray-800 border-2 border-gray-400";
            } else {
                cellClasses += " bg-[#F8F4EE] text-gray-800 hover:bg-[#EFEAE3]";
            }

            calendarCells.push(
                <div
                    key={dateString}
                    className={cellClasses}
                    onClick={() => isHoliday && showHolidayModal(dateString)}
                >
                    <span>{day}</span>
                </div>
            );
        }

        return calendarCells;
    };

    // Show modal with holiday message
    const showHolidayModal = (dateString) => {
        const holiday = fakeHolidays[dateString];
        if (holiday) {
            setModal({ isOpen: true, message: holiday.reason, sarcastic: false });
            // Start a timer to change the message
            if (messageTimer.current) clearTimeout(messageTimer.current);
            messageTimer.current = setTimeout(() => {
                setModal(prev => ({ ...prev, message: holiday.sarcastic, sarcastic: true }));
            }, 8000); // 8 seconds
        }
    };

    const closeModal = () => {
        setModal({ isOpen: false, message: '', sarcastic: false });
        if (messageTimer.current) clearTimeout(messageTimer.current);
    };

    // Handle reminders
    const handleAddReminder = async () => {
        if (!newReminder.trim() || !db || !userId) return;
        try {
            const remindersCollectionRef = collection(db, 'artifacts', appId, 'users', userId, 'reminders');
            await addDoc(remindersCollectionRef, {
                text: newReminder,
                createdAt: serverTimestamp()
            });
            setNewReminder('');
        } catch (error) {
            console.error("Error adding reminder:", error);
        }
    };

    return (
        <div className="bg-white rounded-xl shadow-xl p-8 max-w-4xl w-full">
            <button onClick={() => setPage('home')} className="mb-4 text-sm text-[#D63031] hover:underline">
                &larr; Back to Year View
            </button>
            <div className="flex justify-between items-center mb-6">
                <button onClick={() => setCurrentDate(new Date(year, month - 1, 1))} className="text-3xl text-[#D63031] hover:text-red-700 transition-colors">&lt;</button>
                <h2 className="text-5xl font-['Bangers'] text-[#D63031]">{monthNames[month]} {year}</h2>
                <button onClick={() => setCurrentDate(new Date(year, month + 1, 1))} className="text-3xl text-[#D63031] hover:text-red-700 transition-colors">&gt;</button>
            </div>
            <div className="grid grid-cols-7 text-center text-sm font-semibold text-gray-500 mb-2">
                <div>S</div><div>M</div><div>T</div><div>W</div><div>T</div><div>F</div><div>S</div>
            </div>
            <div id="calendar-grid" className="grid grid-cols-7 gap-2">
                {renderCalendar()}
            </div>

            {/* Reminders section */}
            <div className="mt-8">
                <h3 className="text-2xl font-bold text-[#D63031] mb-4">Set a Reminder</h3>
                <div className="flex mb-4">
                    <input
                        type="text"
                        value={newReminder}
                        onChange={(e) => setNewReminder(e.target.value)}
                        placeholder="e.g., Don't forget to relax!"
                        className="flex-grow p-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-[#D63031]"
                    />
                    <button onClick={handleAddReminder} className="ml-2 px-4 py-2 bg-[#D63031] text-white rounded-lg hover:bg-red-700">Add</button>
                </div>
                {reminders.length > 0 && (
                    <ul className="list-disc pl-5 text-gray-700">
                        {reminders.map(r => (
                            <li key={r.id} className="text-lg mb-1">{r.text}</li>
                        ))}
                    </ul>
                )}
            </div>

            {/* Holiday Modal */}
            {modal.isOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
                    <div className={`bg-white rounded-xl shadow-2xl p-8 max-w-md w-full transition-all duration-300 transform ${modal.sarcastic ? 'scale-110' : 'scale-100'}`}>
                        <p className={`text-2xl font-bold ${modal.sarcastic ? 'text-[#D63031]' : 'text-gray-800'}`}>
                            {modal.message}
                        </p>
                        <button onClick={closeModal} className="mt-4 px-4 py-2 bg-[#D63031] text-white rounded-lg hover:bg-red-700">Close</button>
                    </div>
                </div>
            )}
        </div>
    );
};
