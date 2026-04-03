import { useEffect, useMemo, useState } from "react";
import SessionPackageCard from "./SessionPackageCard";

const jsonSources = [
    "https://raw.githubusercontent.com/KinardJacob/KinardJacob.github.io/refs/heads/main/projects/project%207/packages.json",
    `${process.env.PUBLIC_URL || ""}/packages.json`,
    "/packages.json"
];

const normalizePackageItem = (item) => {
    const type = item.type || "Session";
    const duration = item.duration || "Flexible";
    const location = item.location || "Location of your choice";

    return {
        image: "",
        title: item.title || "Photography Session",
        meta: `${type} • ${duration} • ${location}`,
        description: item.description || "Custom session details available on request.",
        price: item.price || "Contact for pricing"
    };
};

const SessionPackagesSection = () => {
    const [packages, setPackages] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        let isMounted = true;

        const loadPortfolioItems = async () => {
            setIsLoading(true);
            setError("");

            for (const source of jsonSources) {
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
                setError("Could not load photography sessions right now.");
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
                    <SessionPackageCard key={`${sessionPackage.title}-${sessionPackage.price}`} {...sessionPackage} />
                ))}
            </div>
        );
    }, [error, isLoading, packages]);

    return (
        <section className="packages-section">
            <div className="packages-container">
                <h2>Popular Session Packages</h2>
                {content}
            </div>
        </section>
    );
};

export default SessionPackagesSection;
