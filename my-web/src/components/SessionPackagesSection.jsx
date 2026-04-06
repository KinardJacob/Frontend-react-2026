import { useEffect, useMemo, useState } from "react";
import SessionPackageCard from "./SessionPackageCard";

const apiBase = process.env.REACT_APP_API_BASE_URL || "https://demo-backend-nllg.onrender.com";

const apiSources = [
    `${apiBase}/api/packages`,
    `${apiBase}/api/session-packages`
];

const resolveImageUrl = (imagePath) => {
    if (!imagePath) {
        return "";
    }

    if (/^https?:\/\//i.test(imagePath)) {
        return imagePath;
    }

    const cleanedPath = imagePath.startsWith("/") ? imagePath.slice(1) : imagePath;
    return `${apiBase}/${cleanedPath}`;
};

const normalizePackageItem = (item) => {
    const type = item.type || "Session";
    const duration = item.duration || "Flexible";
    const location = item.location || "Location of your choice";

    return {
        id: item.id,
        image: resolveImageUrl(item.image),
        title: item.title || "Photography Session",
        meta: `${type} • ${duration} • ${location}`,
        description: item.description || "Custom session details available on request.",
        price: item.price || "Contact for pricing",
        details: [
            `Type: ${type}`,
            `Duration: ${duration}`,
            `Location: ${location}`,
            item.editedPhotos ? `Edited Photos: ${item.editedPhotos}` : null,
            item.revisions !== undefined ? `Revisions: ${item.revisions}` : null
        ].filter(Boolean)
    };
};

const SessionPackagesSection = () => {
    const [packages, setPackages] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");
    const [selectedPackage, setSelectedPackage] = useState(null);

    useEffect(() => {
        let isMounted = true;

        const loadPortfolioItems = async () => {
            setIsLoading(true);
            setError("");

            for (const source of apiSources) {
                try {
                    const response = await fetch(source);
                    if (!response.ok) {
                        continue;
                    }

                    const items = await response.json();
                    if (!Array.isArray(items)) {
                        continue;
                    }

                    if (!isMounted) {
                        return;
                    }

                    setPackages(items.map((item) => normalizePackageItem(item)));
                    setIsLoading(false);
                    return;
                } catch (fetchError) {
                    continue;
                }
            }

            if (isMounted) {
                setError("Could not load photography sessions right now. Check your server URL.");
                setIsLoading(false);
            }
        };

        loadPortfolioItems();

        return () => {
            isMounted = false;
        };
    }, []);

    const content = useMemo(() => {
        if (isLoading) {
            return <p className="packages-feedback">Loading sessions...</p>;
        }

        if (error) {
            return <p className="packages-feedback packages-error">{error}</p>;
        }

        return (
            <div className="packages-grid">
                {packages.map((sessionPackage) => (
                    <SessionPackageCard
                        key={`${sessionPackage.id || sessionPackage.title}-${sessionPackage.price}`}
                        {...sessionPackage}
                        onOpenDetails={() => setSelectedPackage(sessionPackage)}
                    />
                ))}
            </div>
        );
    }, [error, isLoading, packages]);

    return (
        <section className="packages-section">
            <div className="packages-container">
                <h2>Popular Session Packages</h2>
                {content}

                {selectedPackage ? (
                    <div
                        className="package-modal-backdrop"
                        role="button"
                        tabIndex={0}
                        onClick={() => setSelectedPackage(null)}
                        onKeyDown={(event) => {
                            if (event.key === "Escape" || event.key === "Enter" || event.key === " ") {
                                setSelectedPackage(null);
                            }
                        }}
                    >
                        <section
                            className="package-modal"
                            role="dialog"
                            aria-modal="true"
                            aria-label={`${selectedPackage.title} details`}
                            onClick={(event) => event.stopPropagation()}
                        >
                            <button
                                type="button"
                                className="package-modal-close"
                                onClick={() => setSelectedPackage(null)}
                            >
                                Close
                            </button>
                            <h3>{selectedPackage.title}</h3>
                            <p className="session-package-meta">{selectedPackage.meta}</p>
                            <p>{selectedPackage.description}</p>
                            <ul className="package-modal-list">
                                {selectedPackage.details?.map((detail) => (
                                    <li key={detail}>{detail}</li>
                                ))}
                            </ul>
                            <p className="session-package-price">{selectedPackage.price}</p>
                        </section>
                    </div>
                ) : null}
            </div>
        </section>
    );
};

export default SessionPackagesSection;
