// ✅ Execute when the DOM is fully loaded
document.addEventListener("DOMContentLoaded", () => {
    // ✅ Select the search input field and suggestions list container
    const searchInput = document.getElementById("searchInput");
    const suggestionsList = document.getElementById("suggestions");

    // ✅ Listen for user input in the search field
    searchInput.addEventListener("input", async () => {
        const query = searchInput.value.trim(); // ✅ Get and trim the input value

        // ✅ If the input is too short, clear suggestions and hide the list
        if (query.length < 2) {
            suggestionsList.innerHTML = ""; // Clear the suggestions
            suggestionsList.classList.remove("show"); // Hide the list
            return;
        }

        try {
            // ✅ Fetch search suggestions from the server
            const response = await fetch(`/search/suggestions?query=${query}`);
            const data = await response.json(); // Convert response to JSON

            // ✅ Clear previous suggestions
            suggestionsList.innerHTML = "";

            // ✅ If there are suggestions, display them
            if (data.suggestions.length > 0) {
                data.suggestions.forEach(suggestion => {
                    const listItem = document.createElement("li"); // ✅ Create list item
                    listItem.textContent = suggestion.name; // ✅ Set game name as text

                    // ✅ When a suggestion is clicked, update the input field and hide the list
                    listItem.addEventListener("click", () => {
                        searchInput.value = suggestion.name; // ✅ Set selected game name in input
                        suggestionsList.innerHTML = ""; // ✅ Clear suggestions
                        suggestionsList.classList.remove("show"); // ✅ Hide suggestions list
                    });

                    // ✅ Append suggestion item to the list
                    suggestionsList.appendChild(listItem);
                });

                suggestionsList.classList.add("show"); // ✅ Show the list
            } else {
                suggestionsList.classList.remove("show"); // ✅ Hide if no suggestions
            }
        } catch (error) {
            console.error("❌ Error fetching suggestions:", error); // ✅ Log errors for debugging
        }
    });

    // ✅ Hide suggestions if the user clicks outside the input or list
    document.addEventListener("click", (e) => {
        if (!searchInput.contains(e.target) && !suggestionsList.contains(e.target)) {
            suggestionsList.innerHTML = ""; // ✅ Clear suggestions
            suggestionsList.classList.remove("show"); // ✅ Hide suggestions list
        }
    });
});
