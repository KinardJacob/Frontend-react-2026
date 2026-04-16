import "../css/Services.css";
import ServicePlanCard from "../components/ServicePlanCard";
import ServiceDetailCard from "../components/ServiceDetailCard";
import SessionPackagesSection from "../components/SessionPackagesSection";
import CustomSectionBuilderForm from "../components/CustomSectionBuilderForm";

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

            <SessionPackagesSection />

            <CustomSectionBuilderForm />
        </main>
    );
};

export default Services;
