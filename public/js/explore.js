document.addEventListener("DOMContentLoaded", async () => {
    const gameGallery = document.getElementById("gameGallery");
    try {
        const response = await fetch("/games/explore");
        const games = await response.json();

        games.forEach(game => {
            const gameCard = document.createElement("div");
            gameCard.classList.add("game-card");
            gameCard.innerHTML = `
                       <img src="${game.image}" alt="${game.name}">
                      <h3>${game.name}</h3>
                      <a href="/game-info/${game.id}" class="btn">📜 פרטי המשחק</a>
                  `;
            gameGallery.appendChild(gameCard);
        });
    } catch (error) {
        console.error("Error fetching games:", error);
    }
});