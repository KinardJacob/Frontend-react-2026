import { Link } from "react-router-dom";
import "../css/Home.css";
import cheerfulFamilyImage from "../images/a cheerful family ph.png";
import professionalPortraitImage from "../images/a professional portr.png";
import graduationPortraitImage from "../images/a graduation portrai.png";
import mountainLandscapeImage from "../images/ChatGPT Image Feb 8, 2026, 09_42_09 PM.png";

const Home = () => {
    return (
        <main>
            <section className="hero" id="portfolio">
                <div className="hero-content">
                    <h1>Explore your photography needs today!</h1>
                </div>
            </section>

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
                        <Link className="book-button" to="/about">
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
        </main>
    );
};

export default Home;

