document.addEventListener("DOMContentLoaded", () => {
    let page = 1;
    let isLoading = false;
    const gameGallery = document.querySelector(".game-gallery");

    const loader = document.createElement("div");
    loader.classList.add("loader");
    loader.innerHTML = "<div class='spinner'></div>";
    document.body.appendChild(loader);

    const showLoader = () => loader.style.display = "block";
    const hideLoader = () => loader.style.display = "none";

    const loadMoreGames = async () => {
        if (isLoading) return;
        isLoading = true;
        showLoader();
        page++;

        try {
            const response = await fetch(`/games/explore?page=${page}`, {
                headers: { 'Accept': 'application/json' }
            });

            if (!response.ok) throw new Error("Failed to fetch");

            const data = await response.json();

            if (!data.games || data.games.length === 0) {
                hideLoader();
                return;
            }

            data.games.forEach(game => {
                const gameCard = document.createElement("div");
                gameCard.classList.add("game-card");
                gameCard.innerHTML = `
                    <img src="${game.image}" alt="${game.name}">
                    <h3>${game.name}</h3>
                    ${
                        game.rating !== 'N/A'
                        ? `<p>⭐ ${game.rating} (${game.totalRatings} ratings)</p>`
                        : `<p>⭐ Rating: N/A</p>`
                    }
                    <a href="/games/game-info/${game.id}" class="btn">📜 פרטי המשחק</a>
                `;
                gameGallery.appendChild(gameCard);
            });

            hideLoader();
            isLoading = false;
        } catch (error) {
            console.error("❌ Error loading more games:", error);
            hideLoader();
            isLoading = false;
        }
    };

    window.addEventListener("scroll", () => {
        if ((window.innerHeight + window.scrollY) >= (document.documentElement.scrollHeight - 100)) {
            loadMoreGames();
        }
    });
});
