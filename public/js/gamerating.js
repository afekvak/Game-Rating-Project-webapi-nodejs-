const stars = document.querySelectorAll('.rating-stars .star');
const ratingInput = document.getElementById('ratingInput');
let selectedRating = 0;

stars.forEach((star, index) => {
    // העכבר זז מעל כוכב
    star.addEventListener('mousemove', (e) => {
        const rect = star.getBoundingClientRect();
        const isHalf = (e.clientX - rect.left) < rect.width / 2;
        const hoverRating = isHalf ? index + 0.5 : index + 1;
        updateStarsVisual(hoverRating);
    });

    // יוצא מהכוכבים
    star.addEventListener('mouseleave', () => {
        updateStarsVisual(selectedRating);
    });

    // לחיצה על כוכב
    star.addEventListener('click', (e) => {
        const rect = star.getBoundingClientRect();
        const isHalf = (e.clientX - rect.left) < rect.width / 2;
        selectedRating = isHalf ? index + 0.5 : index + 1;
        ratingInput.value = selectedRating;
        updateStarsVisual(selectedRating);
    });
});

function updateStarsVisual(rating) {
    stars.forEach((star, i) => {
        star.classList.remove('full', 'half');
        if (rating >= i + 1) {
            star.classList.add('full');
        } else if (rating >= i + 0.5) {
            star.classList.add('half');
        }
    });
}

// שליחת טופס
document.getElementById("ratingForm").addEventListener("submit", async (e) => {
    e.preventDefault();

    const rating = parseFloat(document.getElementById("ratingInput").value);
    const playedHours = parseFloat(document.getElementById("playedHours").value);
    const review = document.getElementById("review").value.trim();

    if (!rating || rating < 0.5 || rating > 5 || !playedHours || playedHours < 0 || review === "") {
        alert("יש למלא את כל השדות בצורה תקינה (כולל דירוג של חצי כוכב לפחות).");
        return;
    }

    const response = await fetch("/ratings/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            gameId: GAME_ID,  // ✅ This uses the global variable set from EJS
            rating,
            playedHours,
            review
        })
    });

    const data = await response.json();
    alert(data.message);
});
