import { Link } from "react-router-dom";

const ServicePlanCard = ({ title, price, features }) => {
    return (
        <article className="plan-card">
            <h3>{title}</h3>
            <div className="price-badge">{price}</div>
            <p className="plan-features">{features}</p>
            <Link className="services-book-button" to="/about">
                Book Now!
            </Link>
        </article>
    );
};

export default ServicePlanCard;
