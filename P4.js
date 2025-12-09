/* script.js
   Meal Planner & Grocery List Generator
   Jorden Eifert - CS-111 - Project 4
*/

// ----- Data Structure: meals for each day and slot -----

const daysOfWeek = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday"
];

// Each meal will look like: { name: "", category: "", ingredients: ["a", "b"] }
function createEmptyDay() {
  return {
    breakfast: null,
    lunch: null,
    dinner: null,
    snack: null
  };
}

// weekMeals is a JSON-like object holding all the data
const weekMeals = {};
daysOfWeek.forEach((day) => {
  weekMeals[day] = createEmptyDay();
});

// ----- DOM elements -----

let currentDay = "Monday";

const dayTabs = document.querySelectorAll(".day-tab");
const currentDayLabel = document.getElementById("current-day-label");
const plannedDayLabel = document.getElementById("planned-day-label");

const mealNameInput = document.getElementById("meal-name");
const mealCategorySelect = document.getElementById("meal-category");
const mealIngredientsInput = document.getElementById("meal-ingredients");

const addMealBtn = document.getElementById("add-meal-btn");
const clearDayBtn = document.getElementById("clear-day-btn");

const groceryListElement = document.getElementById("grocery-list");
const generateListBtn = document.getElementById("generate-list-btn");
const clearListBtn = document.getElementById("clear-list-btn");

// Helper to get all radio buttons with name "meal-slot"
function getSelectedMealSlot() {
  const radios = document.querySelectorAll('input[name="meal-slot"]');
  for (const radio of radios) {
    if (radio.checked) {
      return radio.value; // "breakfast", "lunch", etc.
    }
  }
  return null;
}

// Helper to set the selected radio button
function setSelectedMealSlot(slot) {
  const radios = document.querySelectorAll('input[name="meal-slot"]');
  radios.forEach((radio) => {
    radio.checked = radio.value === slot;
  });
}

// ----- Rendering functions -----

// Update day labels at top of panels
function updateDayLabels() {
  currentDayLabel.textContent = currentDay;
  plannedDayLabel.textContent = currentDay;
}

// Render meals for current day in the right panel
function renderMealsForCurrentDay() {
  const dayData = weekMeals[currentDay];
  const slots = ["breakfast", "lunch", "dinner", "snack"];

  slots.forEach((slot) => {
    const slotElement = document.querySelector(`.meal-slot[data-slot="${slot}"]`);
    const titleElement = slotElement.querySelector(".meal-title");

    const meal = dayData[slot];
    if (meal) {
      titleElement.textContent = `${meal.name} (${meal.category})`;
      titleElement.classList.remove("empty");
    } else {
      titleElement.textContent = "Empty";
      titleElement.classList.add("empty");
    }
  });
}

// Clear the form inputs
function clearForm() {
  mealNameInput.value = "";
  mealCategorySelect.value = "Breakfast";
  mealIngredientsInput.value = "";
  // Default to breakfast so there's always a selected slot when adding
  setSelectedMealSlot("breakfast");
}

// ----- Event handlers -----

// Change selected day when a tab is clicked
dayTabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    const selectedDay = tab.dataset.day;
    currentDay = selectedDay;

    // Highlight active tab
    dayTabs.forEach((t) => t.classList.remove("active"));
    tab.classList.add("active");

    updateDayLabels();
    renderMealsForCurrentDay();
    clearForm();
  });
});

// Add or update meal for selected day and slot
addMealBtn.addEventListener("click", () => {
  const mealName = mealNameInput.value.trim();
  const mealCategory = mealCategorySelect.value;
  const mealSlot = getSelectedMealSlot();
  const ingredientText = mealIngredientsInput.value.trim();

  if (!mealSlot) {
    alert("Please choose a meal slot (Breakfast, Lunch, Dinner, or Snack).");
    return;
  }

  if (!mealName) {
    alert("Please enter a meal name.");
    return;
  }

  if (!ingredientText) {
    alert("Please enter at least one ingredient.");
    return;
  }

  // Turn comma-separated ingredients into an array
  const ingredients = ingredientText
    .split(",")
    .map((item) => item.trim())
    .filter((item) => item.length > 0);

  const meal = {
    name: mealName,
    category: mealCategory,
    ingredients: ingredients
  };

  weekMeals[currentDay][mealSlot] = meal;

  renderMealsForCurrentDay();
  clearForm();
});

// Clear all meals for the current day
clearDayBtn.addEventListener("click", () => {
  if (
    confirm(
      `Are you sure you want to clear all meals for ${currentDay}?`
    )
  ) {
    weekMeals[currentDay] = createEmptyDay();
    renderMealsForCurrentDay();
    clearForm();
  }
});

// Edit / Delete buttons for each slot (event delegation)
document.addEventListener("click", (event) => {
  const editButton = event.target.closest(".edit-meal-btn");
  const deleteButton = event.target.closest(".delete-meal-btn");

  if (editButton) {
    const slot = editButton.dataset.slot;
    const meal = weekMeals[currentDay][slot];

    if (!meal) {
      alert("There is no meal in this slot to edit.");
      return;
    }

    // Load meal into the form
    mealNameInput.value = meal.name;
    mealCategorySelect.value = meal.category;
    mealIngredientsInput.value = meal.ingredients.join(", ");
    setSelectedMealSlot(slot);
  }

  if (deleteButton) {
    const slot = deleteButton.dataset.slot;
    if (weekMeals[currentDay][slot]) {
      const ok = confirm(
        `Delete the ${slot} meal for ${currentDay}?`
      );
      if (!ok) return;
    }
    weekMeals[currentDay][slot] = null;
    renderMealsForCurrentDay();
  }
});

// ----- Grocery list functions -----

/*
  Function 1 (returns a value):
  Collect all ingredients for the week and return a deduplicated array.
*/
function getAllIngredientsForWeek() {
  const allIngredients = [];

  daysOfWeek.forEach((day) => {
    const dayMeals = weekMeals[day];
    Object.values(dayMeals).forEach((meal) => {
      if (meal) {
        // Spread each meal's ingredients into the big array
        allIngredients.push(...meal.ingredients);
      }
    });
  });

  // Remove duplicates (case-insensitive, but keep original text)
  const seen = new Set();
  const uniqueIngredients = [];

  allIngredients.forEach((ingredient) => {
    const key = ingredient.toLowerCase();
    if (!seen.has(key)) {
      seen.add(key);
      uniqueIngredients.push(ingredient);
    }
  });

  // Sort alphabetically (case-insensitive) for a tidy grocery list
  uniqueIngredients.sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()));

  return uniqueIngredients;
}

/*
  Function 2 (does NOT return a value):
  Takes an array of ingredients and updates the DOM to show the grocery list.
*/
function renderGroceryList(ingredientsArray) {
  groceryListElement.innerHTML = "";

  if (ingredientsArray.length === 0) {
    const messageItem = document.createElement("li");
    messageItem.textContent =
      "No ingredients yet. Add some meals and generate the list.";
    groceryListElement.appendChild(messageItem);
    return;
  }

  ingredientsArray.forEach((ingredient) => {
    const li = document.createElement("li");
    const label = document.createElement("label");
    const checkbox = document.createElement("input");

    checkbox.type = "checkbox";
    checkbox.classList.add("grocery-checkbox");

    label.appendChild(checkbox);
    label.appendChild(document.createTextNode(" " + ingredient));

    li.appendChild(label);
    groceryListElement.appendChild(li);
  });
}

// Generate grocery list button
generateListBtn.addEventListener("click", () => {
  const ingredients = getAllIngredientsForWeek();
  renderGroceryList(ingredients);
});

// Clear grocery list button
clearListBtn.addEventListener("click", () => {
  groceryListElement.innerHTML = "";
});

// Initial render
updateDayLabels();
renderMealsForCurrentDay();
// Initialize form defaults (select breakfast, clear inputs)
clearForm();