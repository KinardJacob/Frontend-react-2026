const ServiceDetailCard = ({ items }) => {
    return (
        <div className="details-box">
            <ul>
                {items.map((item) => (
                    <li key={item}>{item}</li>
                ))}
            </ul>
        </div>
    );
};

export default ServiceDetailCard;
