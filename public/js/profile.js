// document.addEventListener("DOMContentLoaded", () => {
//     // Select all delete buttons
//     const deleteButtons = document.querySelectorAll(".delete-btn");

//     deleteButtons.forEach(button => {
//         button.addEventListener("click", async function () {
//             const ratingId = this.closest(".rating-item").querySelector(".ratingId").value;

//             console.log("Debug: Retrieved Rating ID ->", ratingId);

//             if (!ratingId) {
//                 alert("Error: Missing rating ID!");
//                 return;
//             }

//             try {
//                 const response = await fetch("/profile/remove-rating", {
//                     method: "POST",
//                     headers: {
//                         "Content-Type": "application/json"
//                     },
//                     body: JSON.stringify({ ratingId }) // Send rating ID in JSON format
//                 });

//                 const data = await response.json();
//                 alert(data.message);

//                 if (response.ok) {
//                     location.reload(); // Refresh page after successful delete
//                 }
//             } catch (error) {
//                 console.error("❌ Error removing rating:", error);
//                 alert("Error: Could not remove rating.");
//             }
//         });
//     });
// });
