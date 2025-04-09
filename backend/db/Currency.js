export const formatUSD = (num) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(num);
  
export const formatVND = (num) =>
    new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(num);
  
export const parseCurrency = (val) => {
    if (!val || typeof val !== "string") return 0;
    const clean = val.replace(/[^0-9.-]+/g, '');
    return parseFloat(clean) || 0;
  };