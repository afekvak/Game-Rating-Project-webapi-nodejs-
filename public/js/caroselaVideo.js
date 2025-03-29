document.addEventListener("DOMContentLoaded", () => {
    const slides = document.querySelectorAll(".swiper-slide");

    slides.forEach(slide => {
        const card = slide.querySelector(".top-game-card");
        const image = card.querySelector("img");
        const videoWrapper = card.querySelector(".video-wrapper");

        if (videoWrapper) {
            slide.addEventListener("mouseenter", () => {
                if (slide.classList.contains("swiper-slide-active")) {
                    image.style.display = "none";
                    videoWrapper.style.display = "block";
                    swiper.autoplay.stop();
                }
            });

            slide.addEventListener("mouseleave", () => {
                image.style.display = "block";
                videoWrapper.style.display = "none";
                swiper.autoplay.start();
            });
        }
    });
});