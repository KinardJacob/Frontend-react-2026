const SessionPackageCard = ({ image, title, meta, description, price }) => {
    return (
        <article className="session-package-card">
            <img src={image} alt={title} />
            <div className="session-package-content">
                <h3>{title}</h3>
                <p className="session-package-meta">{meta}</p>
                <p>{description}</p>
                <p className="session-package-price">{price}</p>
            </div>
        </article>
    );
};

export default SessionPackageCard;
