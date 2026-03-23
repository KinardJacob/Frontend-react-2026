const ReviewCard = ({ quote, author }) => {
    return (
        <article className="review-card">
            <p>&quot;{quote}&quot;</p>
            <h3>&mdash; {author}</h3>
        </article>
    );
};

export default ReviewCard;
