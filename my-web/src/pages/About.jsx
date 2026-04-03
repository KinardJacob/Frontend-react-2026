import "../css/About.css";
import beachPortraitImage from "../images/IMG_20250506_192646484_HDR_PORTRAIT.jpg";
import aboutHeroImage from "../images/landscape-oriented i.png";
import FactsColumn from "../components/FactsColumn";
import ContactForm from "../components/ContactForm";

const factColumns = [
    [
        "Years of experience",
        "I've done graduation photos",
        "Airshows",
        "Sports",
        "Outdoors"
    ],
    [
        "I enjoy nature",
        "I love spending time outside with friends and family",
        "I love me some BBQ!"
    ]
];

const About = () => {
    return (
        <main className="about-page">
            <section className="about-hero">
                <div className="about-hero-content">
                    <h1>Hi, I&apos;m Jacob</h1>
                </div>
                <img className="about-hero-image" src={aboutHeroImage} alt="Scenic outdoor landscape" />
            </section>

            <section className="about-section">
                <div className="about-container">
                    <div className="about-image">
                        <img src={beachPortraitImage} alt="Jacob on the beach" />
                    </div>
                    <div className="about-content">
                        <p>
                            Photography is how I connect with the world, capturing emotion, texture, and light with
                            purpose. My work spans portraits, graduation shoots, and lifestyle storytelling, always
                            with technical precision and creative warmth. Kinard Photography is where care meets
                            clarity.
                        </p>
                    </div>
                </div>
            </section>

            <section className="facts-section">
                <div className="facts-container">
                    <h2>Facts about me</h2>
                    <div className="facts-grid">
                        {factColumns.map((items, index) => (
                            <FactsColumn key={index} items={items} />
                        ))}
                    </div>
                </div>
            </section>

            <ContactForm />
        </main>
    );
};

export default About;
