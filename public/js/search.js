document.addEventListener("DOMContentLoaded", () => {
    const searchInput = document.getElementById("searchInput");
    const suggestionsList = document.getElementById("suggestions");

    searchInput.addEventListener("input", async () => {
        const query = searchInput.value.trim();
        if (query.length < 2) {
            suggestionsList.innerHTML = "";
            suggestionsList.classList.remove("show");
            return;
        }

        try {
            const response = await fetch(`/search/suggestions?query=${query}`);
            const data = await response.json();
            suggestionsList.innerHTML = "";
            
            if (data.suggestions.length > 0) {
                data.suggestions.forEach(suggestion => {
                    const listItem = document.createElement("li");
                    listItem.textContent = suggestion.name;
                    listItem.addEventListener("click", () => {
                        searchInput.value = suggestion.name;
                        suggestionsList.innerHTML = "";
                        suggestionsList.classList.remove("show");
                    });
                    suggestionsList.appendChild(listItem);
                });

                suggestionsList.classList.add("show");
            } else {
                suggestionsList.classList.remove("show");
            }

        } catch (error) {
            console.error("❌ Error fetching suggestions:", error);
        }
    });

    // Hide suggestions if clicked outside
    document.addEventListener("click", (e) => {
        if (!searchInput.contains(e.target) && !suggestionsList.contains(e.target)) {
            suggestionsList.innerHTML = "";
            suggestionsList.classList.remove("show");
        }
    });
});
