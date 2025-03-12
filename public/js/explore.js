// ✅ Execute code when the DOM is fully loaded
document.addEventListener("DOMContentLoaded", async () => {
    // ✅ Get reference to the game gallery container
    const gameGallery = document.getElementById("gameGallery");

    try {
        // ✅ Fetch game data from the server
        const response = await fetch("/games/explore"); // Sends a request to get the list of games
        const games = await response.json(); // Convert the response to JSON format

        // ✅ Loop through the retrieved games and create game cards dynamically
        games.forEach(game => {
            // ✅ Create a new div element for the game card
            const gameCard = document.createElement("div");
            gameCard.classList.add("game-card"); // Add CSS class for styling

            // ✅ Set the inner HTML of the game card with game details
            gameCard.innerHTML = `
                <img src="${game.image}" alt="${game.name}"> <!-- Game image -->
                <h3>${game.name}</h3> <!-- Game name -->
                <a href="/game-info/${game.id}" class="btn">📜 פרטי המשחק</a> <!-- Link to game details -->
            `;

            // ✅ Append the game card to the gallery container
            gameGallery.appendChild(gameCard);
        });
    } catch (error) {
        console.error("Error fetching games:", error); // Log any errors that occur during the fetch request
    }
});
