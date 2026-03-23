import { Link } from "react-router-dom";
import "../css/ClientGallery.css";
import coupleLandscapeImage from "../images/ChatGPT Image Feb 8, 2026, 09_48_31 PM.png";
import heroImage from "../images/ChatGPT Image Feb 8, 2026, 09_42_09 PM.png";
import familyLaughImage from "../images/family of four laugh.png";
import graduationPortraitImage from "../images/a graduation portrai.png";
import sunsetFieldImage from "../images/landscape-oriented 3i.png";
import casualPortraitImage from "../images/portrait-oriented im2.png";
import outdoorPortraitImage from "../images/portrait-oriented im5.png";
import GalleryImageCard from "../components/GalleryImageCard";
import ReviewCard from "../components/ReviewCard";

const galleryImages = [
    { image: familyLaughImage, alt: "Family laughing together" },
    { image: graduationPortraitImage, alt: "Graduation portrait" },
    { image: outdoorPortraitImage, alt: "Outdoor portrait session" },
    { image: sunsetFieldImage, alt: "Sunset field portrait" },
    { image: casualPortraitImage, alt: "Casual portrait" },
    { image: coupleLandscapeImage, alt: "Landscape with couple" }
];

const reviews = [
    {
        quote: "Jacob made the whole shoot easy, and the photos felt completely natural.",
        author: "The Smith Family"
    },
    {
        quote: "Great direction, quick turnaround, and exactly the style I wanted.",
        author: "Senior Session Client"
    },
    {
        quote: "The best part was how comfortable everything felt from start to finish.",
        author: "Portrait Client"
    }
];

const ClientGallery = () => {
    return (
        <main className="client-gallery-page">
            <section className="client-gallery-hero">
                <div className="client-gallery-hero-content">
                    <h1>Recent Client Highlights</h1>
                </div>
                <img className="client-gallery-hero-image" src={heroImage} alt="Mountain portrait backdrop" />
            </section>

            <section className="gallery-section">
                <div className="gallery-container">
                    <h2>Portfolio Favorites</h2>
                    <div className="gallery-grid">
                        {galleryImages.map((item) => (
                            <GalleryImageCard key={item.alt} image={item.image} alt={item.alt} />
                        ))}
                    </div>
                </div>
            </section>

            <section className="reviews-section">
                <div className="reviews-container">
                    <h2>Client Words</h2>
                    <div className="reviews-grid">
                        {reviews.map((review) => (
                            <ReviewCard key={review.author} quote={review.quote} author={review.author} />
                        ))}
                    </div>
                    <Link className="client-gallery-book-button" to="/about">
                        Book Your Session
                    </Link>
                </div>
            </section>
        </main>
    );
};

export default ClientGallery;
