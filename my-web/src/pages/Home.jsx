import { Link } from "react-router-dom";
import "../css/Home.css";
import HeroCarousel from "../components/HeroCarousel";
import cheerfulFamilyImage from "../images/a cheerful family ph.png";
import professionalPortraitImage from "../images/a professional portr.png";
import graduationPortraitImage from "../images/a graduation portrai.png";
import mountainLandscapeImage from "../images/ChatGPT Image Feb 8, 2026, 09_42_09 PM.png";
import mountainsHeroImage from "../images/mountains-5455002_1280.jpg";
import secondaryHeroImage from "../images/landscape-oriented i.png";
import familyLaughHeroImage from "../images/family of four laugh.png";
import portraitHeroImage from "../images/IMG_20250506_192646484_HDR_PORTRAIT.jpg";

const heroImages = [mountainsHeroImage, secondaryHeroImage, familyLaughHeroImage, portraitHeroImage];

const Home = () => {
    return (
        <main>
            <HeroCarousel images={heroImages}>
                    <h1>Explore your photography needs today!</h1>
            </HeroCarousel>

            <section className="family-section">
                <div className="family-container">
                    <div className="family-image">
                        <img src={cheerfulFamilyImage} alt="Cheerful family portrait" />
                    </div>
                    <div className="family-content">
                        <h2>Upgrade your family photos!</h2>
                        <p className="family-description">
                            Capture the joy, love, and laughter that make your family unique. Whether it&apos;s a cozy
                            indoor session or a scenic outdoor shoot, I&apos;ll help you preserve memories that last a
                            lifetime.
                        </p>
                        <Link className="book-button" to="/services#booking-form">
                            Book Now!
                        </Link>
                    </div>
                </div>
            </section>

            <section className="why-section" id="about">
                <div className="why-container">
                    <div className="why-images">
                        <img
                            src={professionalPortraitImage}
                            alt="Professional portrait"
                            className="img-large"
                        />
                        <img
                            src={graduationPortraitImage}
                            alt="Graduation portrait"
                            className="img-small img-top-right"
                        />
                        <img
                            src={mountainLandscapeImage}
                            alt="Mountain landscape"
                            className="img-small img-bottom-right"
                        />
                    </div>
                    <div className="why-content">
                        <h2>Why Choose Me?</h2>
                        <p>
                            I make photography easy, fun, and stress-free. Whether it&apos;s your first session or your
                            tenth, I&apos;ll guide you through every step and deliver images you&apos;ll love.
                        </p>
                    </div>
                </div>
            </section>

            <section className="iframe-section" id="weekly-location">
                <div className="iframe-container">
                    <h2>Photographers Weekly Scenic Location</h2>
                    <p className="iframe-intro">Each week I feature a new scenic shoot spot.</p>
                    <div className="video-frame-wrapper">
                        <iframe
                            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d5825.583743610142!2d-80.90891172266416!3d34.086960173144114!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x88f8a951842f59d9%3A0xd80fd18bacc3b3bc!2sSesquicentennial%20State%20Park!5e1!3m2!1sen!2sus!4v1773014376685!5m2!1sen!2sus"
                            title="Photographers Weekly Scenic Location Map"
                            loading="lazy"
                            referrerPolicy="strict-origin-when-cross-origin"
                            allowFullScreen
                        />
                    </div>
                </div>
            </section>
        </main>
    );
};

export default Home;

