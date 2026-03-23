import "../css/Behind.css";
import familyLaughImage from "../images/family of four laugh.png";
import processOutlineImage from "../images/ChatGPT Image Feb 8, 2026, 10_24_40 PM.png";

const Behind = () => {
    return (
        <main className="behind-page">
            <section className="behind-hero">
                <div className="behind-hero-content">
                    <h1>What Your Session Feels Like</h1>
                </div>
            </section>

            <section className="process-section">
                <div className="process-container">
                    <div className="process-image-wrap">
                        <img src={processOutlineImage} alt="Photography process outline" />
                    </div>
                    <div className="process-summary">
                        <p>
                            A simple, stress-free process from start to finish, just four easy steps and you&apos;re on
                            your way to beautiful photos.
                        </p>
                    </div>
                </div>
            </section>

            <section className="closing-section">
                <div className="closing-container">
                    <p>
                        Thanks for being here! I love giving people a look at what really happens behind the scenes,
                        where the real laughs, tiny adjustments, and genuine moments unfold. Whether I&apos;m fixing a
                        collar, chasing the perfect light, or cracking a joke to get a natural smile, my goal is
                        always the same: to make you feel comfortable and capture memories you&apos;ll love. I&apos;m
                        grateful you trust me with your story, and I can&apos;t wait to create something meaningful
                        together.
                    </p>
                </div>
                <img className="behind-reference-image" src={familyLaughImage} alt="Family laughing together" />
            </section>
        </main>
    );
};

export default Behind;
