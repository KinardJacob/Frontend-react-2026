import "../css/Services.css";
import cheerfulFamilyImage from "../images/a cheerful family ph.png";
import graduationPortraitImage from "../images/a graduation portrai.png";
import professionalPortraitImage from "../images/a professional portr.png";
import ServicePlanCard from "../components/ServicePlanCard";
import ServiceDetailCard from "../components/ServiceDetailCard";
import SessionPackageCard from "../components/SessionPackageCard";

const pricingPlans = [
    { title: "Mini", price: "$10", features: "10 Pictures" },
    { title: "Standard", price: "$25", features: "30 Pictures" },
    { title: "Deluxe", price: "$50", features: "45 Pictures" }
];

const serviceDetails = [
    ["15 Min", "Place: My choice", "Revisions: 0"],
    ["30 Min", "Place: You Pick", "Revisions: 1"],
    ["60 Min", "Place: You Pick", "Revisions: 2", "FREE: USB"]
];

const sessionPackages = [
    {
        image: cheerfulFamilyImage,
        title: "Classic Family Session",
        meta: "Family • 60 minutes • Local Park or Home",
        description: "Perfect for updated portraits with natural posing guidance and a warm editing style.",
        price: "$180"
    },
    {
        image: graduationPortraitImage,
        title: "Graduation Portraits",
        meta: "Graduation • 45 minutes • Campus Area",
        description: "Celebrate your milestone with polished portraits around your favorite campus spots.",
        price: "$160"
    },
    {
        image: professionalPortraitImage,
        title: "Professional Headshots",
        meta: "Branding • 40 minutes • Studio or Office",
        description: "Clean and confident headshots ideal for LinkedIn, resumes, and personal branding.",
        price: "$150"
    }
];

const Services = () => {
    return (
        <main className="services-page">
            <section className="services-hero" id="services">
                <div className="services-hero-content">
                    <h1>Simple, Transparent Pricing</h1>
                </div>
            </section>

            <section className="pricing-section">
                <div className="pricing-grid">
                    {pricingPlans.map((plan) => (
                        <ServicePlanCard key={plan.title} {...plan} />
                    ))}
                </div>
            </section>

            <section className="details-section">
                <div className="details-panel">
                    <h2>Details</h2>
                    <div className="details-grid">
                        {serviceDetails.map((items, index) => (
                            <ServiceDetailCard key={pricingPlans[index].title} items={items} />
                        ))}
                    </div>
                </div>
            </section>

            <section className="packages-section">
                <div className="packages-container">
                    <h2>Popular Session Packages</h2>
                    <p className="packages-intro">
                        A few of the most requested sessions are shown here as React components instead of loading from
                        JSON.
                    </p>
                    <div className="packages-grid">
                        {sessionPackages.map((sessionPackage) => (
                            <SessionPackageCard key={sessionPackage.title} {...sessionPackage} />
                        ))}
                    </div>
                </div>
            </section>
        </main>
    );
};

export default Services;
