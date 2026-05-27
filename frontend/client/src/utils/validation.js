export const today = () => {
  return new Date().toISOString().split("T")[0];
};

export const validatePhone = (phone) => {
  if (!phone) return "Phone number is required";
  const digits = phone.replace(/\D/g, "");
  if (digits.length !== 10) return "Phone number must be exactly 10 digits";
  return null;
};

export const validateDate = (date, label = "Date") => {
  if (!date) return `${label} is required`;
  return null;
};

export const validateStartDate = (date) => {
  if (!date) return "Start date is required";
  const selected = new Date(date);
  const todayDate = new Date();
  todayDate.setHours(0, 0, 0, 0);
  if (selected < todayDate) {
    return "Start date cannot be a past date";
  }
  return null;
};

export const validateEndDate = (startDate, endDate) => {
  if (!endDate) return "End date is required";
  if (!startDate) return null;
  const start = new Date(startDate);
  const end = new Date(endDate);
  if (end < start) return "End date cannot be before start date";
  return null;
};

export const validateRequired = (value, label) => {
  if (!value || String(value).trim() === "") {
    return `${label} is required`;
  }
  return null;
};

export const validateAmount = (value, label = "Amount") => {
  if (!value && value !== 0) return `${label} is required`;
  if (isNaN(value) || Number(value) < 0) return `${label} must be a valid positive number`;
  return null;
};