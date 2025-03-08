document.addEventListener("DOMContentLoaded", () => {
    const searchInput = document.getElementById("searchInput");
    const suggestionsBox = document.getElementById("suggestions");

    // 🔍 Function to fetch live suggestions
    async function fetchSuggestions(query) {
        if (query.length < 2) {
            suggestionsBox.classList.remove("active");
            return;
        }

        try {
            const response = await fetch(`/search/suggestions?query=${query}`);
            const data = await response.json();

            // ✅ Populate suggestions
            if (data.suggestions.length > 0) {
                suggestionsBox.innerHTML = data.suggestions.map(game => 
                    `<li onclick="selectSuggestion('${game.name}')">${game.name}</li>`
                ).join("");
                suggestionsBox.classList.add("active");
            } else {
                suggestionsBox.classList.remove("active");
            }
        } catch (error) {
            console.error("❌ Error fetching suggestions:", error);
        }
    }

    // ✅ Handle input change
    searchInput.addEventListener("input", function () {
        fetchSuggestions(this.value.trim());
    });

    // ✅ Select a suggestion and autofill input
    window.selectSuggestion = function (name) {
        searchInput.value = name;
        suggestionsBox.classList.remove("active");
    };

    // 🔄 Hide suggestions when clicking outside
    document.addEventListener("click", (e) => {
        if (!searchInput.contains(e.target) && !suggestionsBox.contains(e.target)) {
            suggestionsBox.classList.remove("active");
        }
    });
});
