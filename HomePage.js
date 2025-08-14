// This component displays the yearly calendar view.
const HomePage = ({ setPage, setSelectedDate }) => {
    const months = [...Array(12).keys()];
    const currentYear = new Date().getFullYear();

    const handleMonthClick = (month) => {
        setSelectedDate(new Date(currentYear, month, 1));
        setPage('monthly');
    };

    return (
        <div className="bg-white rounded-xl shadow-xl p-8 max-w-6xl w-full">
            <h1 className="text-6xl font-['Bangers'] text-[#D63031] mb-8 text-center" style={{ textShadow: '2px 2px #fff' }}>2025</h1>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                {months.map(month => (
                    <div
                        key={month}
                        onClick={() => handleMonthClick(month)}
                        className="bg-[#F8F4EE] p-4 rounded-lg shadow-md cursor-pointer hover:bg-[#EFEAE3] transition-colors"
                    >
                        <h3 className="text-xl font-['Bangers'] text-[#D63031] mb-2">{monthNames[month]}</h3>
                        <div className="grid grid-cols-7 text-center text-sm text-gray-500">
                            <div>S</div><div>M</div><div>T</div><div>W</div><div>T</div><div>F</div><div>S</div>
                        </div>
                        <div className="grid grid-cols-7 gap-1 text-center text-sm mt-2">
                            {/* Simple placeholder grid */}
                            {[...Array(new Date(currentYear, month + 1, 0).getDate()).keys()].map(day => (
                                <span key={day} className="w-6 h-6 flex items-center justify-center">
                                    {day + 1}
                                </span>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
