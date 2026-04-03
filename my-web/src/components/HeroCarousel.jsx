import { useMemo, useState } from "react";

const HeroCarousel = ({ images, children }) => {
    const heroImages = useMemo(() => images.filter(Boolean), [images]);
    const [currentIndex, setCurrentIndex] = useState(0);

    const moveSlide = (direction) => {
        if (heroImages.length < 2) {
            return;
        }

        setCurrentIndex((previousIndex) => {
            return (previousIndex + direction + heroImages.length) % heroImages.length;
        });
    };

    const currentImage = heroImages[currentIndex] || "";
    const heroBackgroundStyle = {
        backgroundImage: `linear-gradient(rgba(0,0,0,0.25), rgba(0,0,0,0.25)), url("${encodeURI(currentImage)}")`
    };

    return (
        <section className="hero" id="portfolio" style={heroBackgroundStyle}>
            <button
                type="button"
                className="nav-button prev"
                onClick={() => moveSlide(-1)}
                aria-label="Previous hero image"
            >
                {"<"}
            </button>

            <div className="hero-content">{children}</div>

            <button
                type="button"
                className="nav-button next"
                onClick={() => moveSlide(1)}
                aria-label="Next hero image"
            >
                {">"}
            </button>
        </section>
    );
};

export default HeroCarousel;