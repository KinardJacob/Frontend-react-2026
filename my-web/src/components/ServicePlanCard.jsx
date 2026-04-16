const ServicePlanCard = ({ title, price, features }) => {
    return (
        <article className="plan-card">
            <h3>{title}</h3>
            <div className="price-badge">{price}</div>
            <p className="plan-features">{features}</p>
            <a className="services-book-button" href="#booking-form" onClick={(e) => {
                e.preventDefault();
                document.getElementById('booking-form')?.scrollIntoView({ behavior: 'smooth' });
            }}>
                Book Now!
            </a>
        </article>
    );
};

export default ServicePlanCard;
