const getCurrentWeekTimeframe = () => {
    const today = new Date();
    const dayOfWeek = today.getDay(); // Get current day (0 = Sunday, 1 = Monday, ..., 6 = Saturday)

    // Calculate the first (Monday) and last (Sunday) day of the week
    const firstDay = new Date(today);
    firstDay.setDate(today.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1));

    const lastDay = new Date(firstDay);
    lastDay.setDate(firstDay.getDate() + 6);

    // Function to format the date as "D/M/YYYY"
    const formatDate = (date) =>
        `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`; // Month is 0-indexed, so +1

    return `income_${formatDate(firstDay)}-${formatDate(lastDay)}`;
};

export default getCurrentWeekTimeframe;
