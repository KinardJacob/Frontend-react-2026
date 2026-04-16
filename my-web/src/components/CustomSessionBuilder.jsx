import { useEffect, useMemo, useState } from "react";

const isLocalClient = typeof window !== "undefined" && window.location.hostname === "localhost";
const defaultApiBase = isLocalClient ? "http://localhost:3001" : "https://demo-backend-nllg.onrender.com";
const apiBase = process.env.REACT_APP_API_BASE_URL || defaultApiBase;
const endpoint = process.env.REACT_APP_CUSTOM_SECTION_ENDPOINT || `${apiBase}/api/custom-sections`;
const fallbackEndpoint = isLocalClient
    ? "https://demo-backend-nllg.onrender.com/api/custom-sections"
    : "http://localhost:3001/api/custom-sections";

const initialFormState = {
    sessionName: "",
    description: "",
    price: ""
};

const validateForm = (formValues) => {
    const nextErrors = {};

    if (!formValues.sessionName.trim()) {
        nextErrors.sessionName = "Session name is required.";
    } else if (formValues.sessionName.trim().length < 3 || formValues.sessionName.trim().length > 60) {
        nextErrors.sessionName = "Name must be between 3 and 60 characters.";
    }

    if (!formValues.description.trim()) {
        nextErrors.description = "Session description is required.";
    } else if (formValues.description.trim().length < 20 || formValues.description.trim().length > 260) {
        nextErrors.description = "Description must be between 20 and 260 characters.";
    }

    if (!formValues.price.trim()) {
        nextErrors.price = "Price is required.";
    } else {
        const normalizedPrice = formValues.price.trim().replace("$", "");
        const numericPrice = Number(normalizedPrice);
        if (!Number.isFinite(numericPrice) || numericPrice <= 0) {
            nextErrors.price = "Price must be a positive number.";
        }
    }

    return nextErrors;
};

const parseSessionsResponse = (payload) => {
    if (Array.isArray(payload)) {
        return payload;
    }

    if (payload && Array.isArray(payload.customSections)) {
        return payload.customSections;
    }

    return [];
};

const CustomSessionBuilder = () => {
    const [formValues, setFormValues] = useState(initialFormState);
    const [formErrors, setFormErrors] = useState({});
    const [activeSessions, setActiveSessions] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [feedback, setFeedback] = useState({ type: "idle", message: "" });
    const [lastEndpointUsed, setLastEndpointUsed] = useState(endpoint);

    const nameCount = useMemo(() => formValues.sessionName.trim().length, [formValues.sessionName]);
    const descriptionCount = useMemo(() => formValues.description.trim().length, [formValues.description]);

    const requestWithFallback = async (pathSuffix, options) => {
        const endpointsToTry = endpoint === fallbackEndpoint ? [endpoint] : [endpoint, fallbackEndpoint];
        let networkError = null;

        for (const baseEndpoint of endpointsToTry) {
            const requestUrl = `${baseEndpoint}${pathSuffix}`;
            setLastEndpointUsed(requestUrl);

            try {
                const response = await fetch(requestUrl, options);
                return response;
            } catch (error) {
                networkError = error;
            }
        }

        throw networkError || new TypeError("Network request failed.");
    };

    useEffect(() => {
        let isMounted = true;

        const loadSessions = async () => {
            try {
                const response = await requestWithFallback("", { method: "GET" });
                if (!response.ok) {
                    return;
                }

                const data = await response.json();
                const sessions = parseSessionsResponse(data);
                if (isMounted) {
                    setActiveSessions(sessions);
                }
            } catch {
                // Keep the UI usable even if loading existing custom sessions fails.
            }
        };

        loadSessions();

        return () => {
            isMounted = false;
        };
    }, []);

    const onInputChange = (event) => {
        const { name, value } = event.target;

        setFormValues((previous) => ({
            ...previous,
            [name]: value
        }));

        if (formErrors[name]) {
            setFormErrors((previous) => {
                const next = { ...previous };
                delete next[name];
                return next;
            });
        }
    };

    const clearForm = (resetFeedback = true) => {
        setFormValues(initialFormState);
        setFormErrors({});
        if (resetFeedback) {
            setFeedback({ type: "idle", message: "" });
        }
    };

    const deleteSession = async (sessionId) => {
        try {
            const response = await requestWithFallback(`/${sessionId}`, { method: "DELETE" });
            if (!response.ok && response.status !== 404) {
                throw new Error(`Delete failed (${response.status})`);
            }

            setActiveSessions((prev) => prev.filter((s) => s.id !== sessionId));
            setFeedback({
                type: "success",
                message: "Session deleted successfully."
            });
            setTimeout(() => {
                setFeedback({ type: "idle", message: "" });
            }, 3000);
        } catch (deleteError) {
            setFeedback({
                type: "error",
                message: deleteError.message || "Could not delete this session."
            });
        }
    };

    const onSubmit = async (event) => {
        event.preventDefault();

        const validationErrors = validateForm(formValues);
        if (Object.keys(validationErrors).length > 0) {
            setFormErrors(validationErrors);
            setFeedback({
                type: "error",
                message: "Please fix the highlighted fields."
            });
            return;
        }

        setIsSubmitting(true);
        setFeedback({ type: "idle", message: "" });

        try {
            const payload = {
                sessionName: formValues.sessionName.trim(),
                description: formValues.description.trim(),
                price: formValues.price.trim(),
                sectionTitle: formValues.sessionName.trim(),
                sectionType: "offer",
                introText: formValues.description.trim(),
                ctaLabel: formValues.price.trim(),
                ctaUrl: ""
            };

            const formData = new FormData();
            Object.entries(payload).forEach(([key, value]) => {
                formData.append(key, value);
            });

            const response = await requestWithFallback("", {
                method: "POST",
                body: formData
            });

            if (!response.ok) {
                let errorMessage = `Request failed with status ${response.status}`;
                try {
                    const errorBody = await response.json();
                    if (errorBody?.errors && typeof errorBody.errors === "object") {
                        const mappedErrors = {
                            sessionName: errorBody.errors.sectionTitle,
                            description: errorBody.errors.introText,
                            price: errorBody.errors.ctaLabel || errorBody.errors.price
                        };
                        setFormErrors(Object.fromEntries(Object.entries(mappedErrors).filter(([, value]) => Boolean(value))));
                    }
                    if (errorBody?.message) {
                        errorMessage = errorBody.message;
                    }
                } catch {
                    // Not JSON response
                }
                throw new Error(errorMessage);
            }

            let returnedSession = {
                sectionTitle: payload.sectionTitle,
                introText: payload.introText,
                ctaLabel: payload.price
            };

            try {
                const responseBody = await response.json();
                if (responseBody && typeof responseBody === "object") {
                    returnedSession = {
                        ...returnedSession,
                        ...responseBody
                    };
                }
            } catch {
                // No JSON response body
            }

            const sessionToStore = {
                id: returnedSession.id || `local-${Date.now()}`,
                sectionTitle: returnedSession.sectionTitle || payload.sessionName,
                introText: returnedSession.introText || payload.description,
                ctaLabel: returnedSession.price || returnedSession.ctaLabel || payload.price
            };

            setActiveSessions((previous) => [sessionToStore, ...previous]);
            setFeedback({
                type: "success",
                message: "Session created successfully."
            });

            clearForm(false);
            setTimeout(() => {
                setFeedback({ type: "idle", message: "" });
            }, 4000);
        } catch (submitError) {
            if (submitError instanceof TypeError) {
                setFeedback({
                    type: "error",
                    message: `Could not reach API at ${lastEndpointUsed}. Make sure backend is running.`
                });
            } else {
                setFeedback({
                    type: "error",
                    message: submitError.message || "Could not submit session. Try again."
                });
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <section className="custom-builder-section" aria-labelledby="custom-builder-heading">
            <div className="custom-builder-shell">
                <h2 id="custom-builder-heading">Custom Session Builder</h2>
                <p className="custom-builder-intro">
                    Create and manage custom session offers. They are stored separately from predefined packages.
                </p>

                <form className="custom-builder-form" onSubmit={onSubmit} noValidate>
                    <label className="custom-field" htmlFor="sessionName">
                        Session Name
                        <input
                            id="sessionName"
                            name="sessionName"
                            type="text"
                            value={formValues.sessionName}
                            onChange={onInputChange}
                            placeholder="Ex: Couples Golden Hour"
                            aria-invalid={Boolean(formErrors.sessionName)}
                            aria-describedby={formErrors.sessionName ? "sessionName-error" : "sessionName-hint"}
                        />
                        <small id="sessionName-hint" className="field-hint">
                            3 to 60 characters ({nameCount}/60)
                        </small>
                        {formErrors.sessionName ? (
                            <small id="sessionName-error" className="field-error">
                                {formErrors.sessionName}
                            </small>
                        ) : null}
                    </label>

                    <label className="custom-field custom-field-full" htmlFor="description">
                        Description
                        <textarea
                            id="description"
                            name="description"
                            value={formValues.description}
                            onChange={onInputChange}
                            rows={4}
                            placeholder="Describe what makes this custom session special."
                            aria-invalid={Boolean(formErrors.description)}
                            aria-describedby={formErrors.description ? "description-error" : "description-hint"}
                        />
                        <small id="description-hint" className="field-hint">
                            20 to 260 characters ({descriptionCount}/260)
                        </small>
                        {formErrors.description ? (
                            <small id="description-error" className="field-error">
                                {formErrors.description}
                            </small>
                        ) : null}
                    </label>

                    <label className="custom-field" htmlFor="price">
                        Price
                        <input
                            id="price"
                            name="price"
                            type="text"
                            value={formValues.price}
                            onChange={onInputChange}
                            placeholder="Ex: $175"
                            aria-invalid={Boolean(formErrors.price)}
                            aria-describedby={formErrors.price ? "price-error" : "price-hint"}
                        />
                        <small id="price-hint" className="field-hint">Enter a positive value (ex: 175 or $175)</small>
                        {formErrors.price ? (
                            <small id="price-error" className="field-error">
                                {formErrors.price}
                            </small>
                        ) : null}
                    </label>

                    <div className="custom-form-actions">
                        <button className="custom-submit" type="submit" disabled={isSubmitting}>
                            {isSubmitting ? "Creating..." : "Create Session"}
                        </button>
                    </div>
                </form>

                {feedback.message ? (
                    <p className={`custom-status ${feedback.type === "success" ? "is-success" : "is-error"}`}>
                        {feedback.message}
                    </p>
                ) : null}

                <section className="submitted-preview" aria-live="polite">
                    <h3>Your Custom Sessions</h3>
                    {activeSessions.length === 0 ? (
                        <p className="submitted-preview-empty">No custom sessions yet. Create one above!</p>
                    ) : (
                        <div className="packages-grid custom-sessions-grid">
                            {activeSessions.map((session) => (
                                <article key={session.id} className="session-package-card custom-session-card">
                                    <div className="session-package-content">
                                        <h3>{session.sectionTitle}</h3>
                                        <p>{session.introText}</p>
                                        <p className="session-package-price">
                                            Price: <strong>{session.price || session.ctaLabel}</strong>
                                        </p>
                                        <div className="custom-session-actions">
                                            <button
                                                type="button"
                                                className="action-delete"
                                                onClick={() => deleteSession(session.id)}
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </div>
                                </article>
                            ))}
                        </div>
                    )}
                </section>
            </div>
        </section>
    );
};

export default CustomSessionBuilder;
