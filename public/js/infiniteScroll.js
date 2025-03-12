// ✅ Execute the script once the DOM is fully loaded
document.addEventListener("DOMContentLoaded", () => {
    let page = 1; // ✅ Keep track of the current page number for pagination
    let isLoading = false; // ✅ Prevent multiple simultaneous requests
    const gameGallery = document.querySelector(".game-gallery"); // ✅ Select the container where games will be displayed

    // ✅ Create a loading indicator (spinner)
    const loader = document.createElement("div");
    loader.classList.add("loader"); // Apply loader styling
    loader.innerHTML = "<div class='spinner'></div>"; // Spinner HTML
    document.body.appendChild(loader); // ✅ Append loader to the body

    // ✅ Functions to show/hide loader
    const showLoader = () => loader.style.display = "block"; // Show loader
    const hideLoader = () => loader.style.display = "none"; // Hide loader

    // ✅ Function to load more games (infinite scroll)
    const loadMoreGames = async () => {
        if (isLoading) return; // ✅ Prevent multiple API calls at once
        isLoading = true;
        showLoader(); // ✅ Show loader while fetching data
        page++; // ✅ Increment page count for pagination

        try {
            console.log(`🔄 Fetching page ${page}...`); // Log current page request

            // ✅ Fetch game data from the server
            const response = await fetch(`/games/explore?page=${page}`, {
                headers: {
                    'Accept': 'application/json' // Ensure the server returns JSON
                }
            });

            if (!response.ok) throw new Error("Failed to fetch"); // ✅ Handle request failure

            const data = await response.json(); // ✅ Convert response to JSON

            // ✅ Check if games were returned, if not, stop loading more
            if (!data.games || data.games.length === 0) {
                console.log("⚠️ No more games to load.");
                hideLoader();
                return;
            }

            // ✅ Loop through the fetched games and add them to the gallery
            data.games.forEach(game => {
                const gameCard = document.createElement("div");
                gameCard.classList.add("game-card"); // Apply game card styling
                gameCard.innerHTML = `
                    <img src="${game.image}" alt="${game.name}"> <!-- Game image -->
                    <h3>${game.name}</h3> <!-- Game name -->
                    <a href="/games/game-info/${game.id}" class="btn">📜 פרטי המשחק</a> <!-- Button linking to game details -->
                `;
                gameGallery.appendChild(gameCard); // ✅ Append game card to the gallery
            });

            hideLoader(); // ✅ Hide loader once games are loaded
            isLoading = false; // ✅ Allow loading more games when needed
        } catch (error) {
            console.error("❌ Error loading more games:", error); // ✅ Log errors for debugging
            hideLoader(); // Hide loader in case of error
            isLoading = false; // Allow future requests
        }
    };

    // ✅ Infinite scroll event listener
    window.addEventListener("scroll", () => {
        // ✅ Check if the user has scrolled near the bottom of the page
        if ((window.innerHeight + window.scrollY) >= (document.documentElement.scrollHeight - 100)) {
            loadMoreGames(); // ✅ Load more games when reaching the bottom
        }
    });
});
