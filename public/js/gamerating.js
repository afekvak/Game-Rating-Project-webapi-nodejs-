
document.getElementById("ratingForm").addEventListener("submit", async (e) => {
    e.preventDefault(); // ✅ Prevent form from refreshing the page
    const rating = document.getElementById("rating").value; // ✅ Get selected rating value
    const gameId = "<%= game.rawgId %>"; // ✅ Ensure the correct ID is sent

    console.log("Submitting rating for gameId:", gameId); // ✅ Debugging

    // ✅ Send rating data to the server
    const response = await fetch("/ratings/submit", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ gameId, rating })
    });

    const data = await response.json(); // ✅ Convert response to JSON
    alert(data.message); // ✅ Show success or error message
});
