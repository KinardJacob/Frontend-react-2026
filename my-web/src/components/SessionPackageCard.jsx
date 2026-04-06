const SessionPackageCard = ({ image, title, meta, description, price, onOpenDetails }) => {
    return (
        <article
            className="session-package-card"
            role="button"
            tabIndex={0}
            onClick={onOpenDetails}
            onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                    onOpenDetails();
                }
            }}
        >
            {image ? <img src={image} alt={title} /> : null}
            <div className="session-package-content">
                <h3>{title}</h3>
                <p className="session-package-meta">{meta}</p>
                <p>{description}</p>
                <p className="session-package-price">{price}</p>
                <p className="session-package-cta">Tap for full details</p>
            </div>
        </article>
    );
};

export default SessionPackageCard;
