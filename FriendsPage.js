// This component handles the social messaging feature.
const { useState, useEffect } = React;
const { collection, onSnapshot, addDoc, query, where, serverTimestamp } = firestore;

const FriendsPage = ({ setPage, userId, db, isAuthReady }) => {
    const [friendId, setFriendId] = useState('');
    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState([]);

    // Fetch messages from Firestore
    useEffect(() => {
        if (!isAuthReady || !db || !userId) return;

        const messagesCollectionRef = collection(db, 'artifacts', appId, 'public', 'data', 'messages');
        const q = query(messagesCollectionRef, where('recipientId', '==', userId));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const fetchedMessages = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setMessages(fetchedMessages);
        }, (error) => {
            console.error("Error fetching messages:", error);
        });

        return () => unsubscribe();
    }, [isAuthReady, db, userId]);

    const handleSendMessage = async () => {
        if (!friendId.trim() || !message.trim() || !db || !userId) return;

        try {
            const messagesCollectionRef = collection(db, 'artifacts', appId, 'public', 'data', 'messages');
            await addDoc(messagesCollectionRef, {
                senderId: userId,
                recipientId: friendId,
                message: message,
                createdAt: serverTimestamp()
            });
            setMessage('');
        } catch (error) {
            console.error("Error sending message:", error);
        }
    };

    return (
        <div className="bg-white rounded-xl shadow-xl p-8 max-w-2xl w-full">
            <h2 className="text-4xl font-['Bangers'] text-[#D63031] mb-6 text-center">Send Fake Holiday Messages</h2>
            <div className="mb-6">
                <label className="block text-lg font-bold text-[#D63031] mb-2">Friend's User ID</label>
                <input
                    type="text"
                    value={friendId}
                    onChange={(e) => setFriendId(e.target.value)}
                    placeholder="Enter friend's User ID here"
                    className="w-full p-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-[#D63031]"
                />
            </div>
            <div className="mb-6">
                <label className="block text-lg font-bold text-[#D63031] mb-2">Message</label>
                <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Write a sarcastic fake holiday message..."
                    rows="4"
                    className="w-full p-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-[#D63031]"
                ></textarea>
            </div>
            <button onClick={handleSendMessage} className="w-full px-4 py-3 bg-[#D63031] text-white font-bold rounded-lg hover:bg-red-700">
                Send Message
            </button>

            <div className="mt-8">
                <h3 className="text-2xl font-bold text-[#D63031] mb-4">Messages for You</h3>
                {messages.length > 0 ? (
                    <ul className="space-y-4">
                        {messages.map((msg, index) => (
                            <li key={index} className="bg-[#F8F4EE] p-4 rounded-lg shadow">
                                <p className="text-gray-700">{msg.message}</p>
                                <p className="text-sm text-gray-500 mt-2">From: {msg.senderId}</p>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="text-gray-500">No new messages.</p>
                )}
            </div>
        </div>
    );
};
