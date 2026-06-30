/* ========================================
   STATE MANAGEMENT
   ======================================== */
const state = {
  bill: 0,
  tipPercentage: 0,
  people: 0,
  isCustomTip: false,
};

/* ========================================
   DOM REFS (Single source of truth)
   ======================================== */
const DOM = {
  bill: document.getElementById("bill"),
  billError: document.getElementById("bill-error"),
  people: document.getElementById("people"),
  peopleError: document.getElementById("people-error"),
  customTip: document.getElementById("custom-tip"),
  tipButtons: document.querySelectorAll(".tip-btn"),
  tipAmount: document.getElementById("tip-amount"),
  totalAmount: document.getElementById("total-amount"),
  resetBtn: document.getElementById("reset-btn"),
};

/* ========================================
   PURE FUNCTIONS (Business Logic)
   ======================================== */

/**
 * Calculate tip amount per person
 * @param {number} bill - Total bill amount
 * @param {number} tipPercentage - Tip percentage (e.g., 15 for 15%)
 * @param {number} people - Number of people
 * @returns {number} Tip amount per person
 */
const calculateTipPerPerson = (bill, tipPercentage, people) => {
  if (bill <= 0 || tipPercentage <= 0 || people <= 0) return 0;
  return (bill * (tipPercentage / 100)) / people;
};

/**
 * Calculate total per person
 * @param {number} bill - Total bill amount
 * @param {number} tipPercentage - Tip percentage
 * @param {number} people - Number of people
 * @returns {number} Total amount per person
 */
const calculateTotalPerPerson = (bill, tipPercentage, people) => {
  if (bill <= 0 || tipPercentage <= 0 || people <= 0) return 0;
  return bill / people + calculateTipPerPerson(bill, tipPercentage, people);
};

/**
 * Format currency value
 * @param {number} value - Value to format
 * @returns {string} Formatted currency string
 */
const formatCurrency = (value) => {
  return `$${value.toFixed(2)}`;
};

/**
 * Validate a number input
 * @param {number} value - Value to validate
 * @param {string} type - Type of input ('bill' or 'people')
 * @returns {Object} Validation result
 */
const validateInput = (value, type) => {
  const numValue = parseFloat(value);

  if (isNaN(numValue) || numValue < 0) {
    return { isValid: false, message: "Must be a positive number" };
  }

  if (type === "people" && numValue === 0) {
    return { isValid: false, message: "Can't be zero" };
  }

  if (type === "people" && !Number.isInteger(numValue)) {
    return { isValid: false, message: "Must be a whole number" };
  }

  return { isValid: true, message: "" };
};

/**
 * Check if any inputs have values
 * @param {Object} state - Current application state
 * @returns {boolean} True if any input has value
 */
const hasInputValues = (state) => {
  return state.bill > 0 || state.tipPercentage > 0 || state.people > 0;
};

/* ========================================
   UI RENDER FUNCTIONS
   ======================================== */

/**
 * Update the results display
 * @param {Object} state - Current application state
 */
const updateResults = (state) => {
  const { bill, tipPercentage, people } = state;

  // Calculate values using pure functions
  const tipPerPerson = calculateTipPerPerson(bill, tipPercentage, people);
  const totalPerPerson = calculateTotalPerPerson(bill, tipPercentage, people);

  // Update DOM
  DOM.tipAmount.textContent = formatCurrency(tipPerPerson);
  DOM.totalAmount.textContent = formatCurrency(totalPerPerson);
};

/**
 * Update the reset button state
 * @param {Object} state - Current application state
 */
const updateResetButton = (state) => {
  DOM.resetBtn.disabled = !hasInputValues(state);
};

/**
 * Toggle error state on input
 * @param {HTMLElement} input - Input element
 * @param {HTMLElement} errorElement - Error message element
 * @param {string} message - Error message (empty to hide)
 */
const toggleError = (input, errorElement, message) => {
  if (message) {
    input.classList.add("error");
    errorElement.textContent = message;
    errorElement.classList.add("visible");
  } else {
    input.classList.remove("error");
    errorElement.textContent = "";
    errorElement.classList.remove("visible");
  }
};

/**
 * Clear all active tip button states
 */
const clearTipButtons = () => {
  DOM.tipButtons.forEach((btn) => {
    btn.classList.remove("active");
    btn.setAttribute("aria-checked", "false");
  });
};

/**
 * Set active tip button
 * @param {HTMLElement} button - The button to activate
 */
const setActiveTipButton = (button) => {
  clearTipButtons();
  button.classList.add("active");
  button.setAttribute("aria-checked", "true");
};

/**
 * Reset the custom tip input
 */
const resetCustomTip = () => {
  DOM.customTip.value = "";
  state.isCustomTip = false;
};

/* ========================================
   EVENT HANDLERS
   ======================================== */

/**
 * Handle bill input changes
 * @param {Event} e - Input event
 */
const handleBillChange = (e) => {
  const value = e.target.value;
  const validation = validateInput(value, "bill");

  toggleError(e.target, DOM.billError, validation.message);

  state.bill = validation.isValid ? parseFloat(value) : 0;
  updateAll();
};

/**
 * Handle people input changes
 * @param {Event} e - Input event
 */
const handlePeopleChange = (e) => {
  const value = e.target.value;
  const validation = validateInput(value, "people");

  toggleError(e.target, DOM.peopleError, validation.message);

  state.people = validation.isValid ? parseInt(value, 10) : 0;
  updateAll();
};

/**
 * Handle tip button clicks
 * @param {Event} e - Click event
 */
const handleTipClick = (e) => {
  const button = e.currentTarget;
  const tipValue = parseInt(button.dataset.tip, 10);

  // Clear custom tip
  resetCustomTip();

  // Update state
  state.tipPercentage = tipValue;
  state.isCustomTip = false;

  // Update UI
  setActiveTipButton(button);
  updateAll();
};

/**
 * Handle custom tip input changes
 * @param {Event} e - Input event
 */
const handleCustomTipChange = (e) => {
  const value = e.target.value;
  const numValue = parseFloat(value);

  // Clear active tip buttons
  clearTipButtons();

  // Update state
  state.isCustomTip = true;
  state.tipPercentage = numValue > 0 && numValue <= 100 ? numValue : 0;

  updateAll();
};

/**
 * Handle reset button click
 */
const handleReset = () => {
  // Reset state
  state.bill = 0;
  state.tipPercentage = 0;
  state.people = 0;
  state.isCustomTip = false;

  // Reset inputs
  DOM.bill.value = "";
  DOM.people.value = "";
  DOM.customTip.value = "";

  // Reset UI
  clearTipButtons();
  toggleError(DOM.bill, DOM.billError, "");
  toggleError(DOM.people, DOM.peopleError, "");

  // Update results
  updateAll();
};

/**
 * Update all UI components
 */
const updateAll = () => {
  updateResults(state);
  updateResetButton(state);
};

/* ========================================
   INITIALIZATION
   ======================================== */

/**
 * Initialize the application
 */
const init = () => {
  // Add event listeners
  DOM.bill.addEventListener("input", handleBillChange);
  DOM.people.addEventListener("input", handlePeopleChange);
  DOM.customTip.addEventListener("input", handleCustomTipChange);
  DOM.resetBtn.addEventListener("click", handleReset);

  DOM.tipButtons.forEach((button) => {
    button.addEventListener("click", handleTipClick);
  });

  // Initial state
  updateAll();

  console.log("💡 Tip Calculator initialized successfully!");
};

// Start the app when DOM is ready
document.addEventListener("DOMContentLoaded", init);
