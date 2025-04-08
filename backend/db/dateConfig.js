export const getCurrentWeekTimeframe = (offset = 0) => {
    const today = new Date();
    today.setDate(today.getDate() + offset * 7); // move to target week

    const dayOfWeek = today.getDay(); // 0 = Sunday, ..., 6 = Saturday
    const firstDay = new Date(today);
    firstDay.setDate(today.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1)); // Monday

    const lastDay = new Date(firstDay);
    lastDay.setDate(firstDay.getDate() + 6); // Sunday

    const formatDate = (date) =>
        `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;

    return `${formatDate(firstDay)}-${formatDate(lastDay)}`;
};


export const getCurrentDate = () => {
    const today = new Date();
    return `${today.getDate()}/${today.getMonth()+1}/${today.getFullYear()}`
}

// export default {getCurrentDate,getCurrentWeekTimeframe};