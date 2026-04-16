import { useEffect, useMemo, useState } from "react";

const isLocalClient = typeof window !== "undefined" && window.location.hostname === "localhost";
const defaultApiBase = isLocalClient ? "http://localhost:3001" : "https://demo-backend-nllg.onrender.com";
const apiBase = process.env.REACT_APP_API_BASE_URL || defaultApiBase;
const endpoint = process.env.REACT_APP_CUSTOM_SECTION_ENDPOINT || `${apiBase}/api/custom-sections`;
const fallbackEndpoint = isLocalClient
    ? "https://demo-backend-nllg.onrender.com/api/custom-sections"
    : "http://localhost:3001/api/custom-sections";

const SESSION_TYPES = ["info", "feature", "testimonial", "offer"];
const SESSION_TYPE_LABELS = {
    info: "Information",
    feature: "Feature",
    testimonial: "Testimonial",
    offer: "Limited Offer"
};

const initialFormState = {
    sectionTitle: "",
    sectionType: "info",
    introText: "",
    ctaLabel: "",
    ctaUrl: ""
};

const validateForm = (formValues) => {
    const nextErrors = {};

    if (!formValues.sectionTitle.trim()) {
        nextErrors.sectionTitle = "Session name is required.";
    } else if (formValues.sectionTitle.trim().length < 3 || formValues.sectionTitle.trim().length > 60) {
        nextErrors.sectionTitle = "Name must be between 3 and 60 characters.";
    }

    const normalizedType = formValues.sectionType.trim().toLowerCase();
    if (!normalizedType) {
        nextErrors.sectionType = "Session type is required.";
    } else if (!SESSION_TYPES.includes(normalizedType)) {
        nextErrors.sectionType = `Session type must be one of: ${SESSION_TYPES.join(", ")}.`;
    }

    if (!formValues.introText.trim()) {
        nextErrors.introText = "Session description is required.";
    } else if (formValues.introText.trim().length < 20 || formValues.introText.trim().length > 260) {
        nextErrors.introText = "Description must be between 20 and 260 characters.";
    }

    if (formValues.ctaLabel && formValues.ctaLabel.trim().length > 30) {
        nextErrors.ctaLabel = "Button text must be 30 characters or less.";
    }

    if (formValues.ctaUrl) {
        const allowedProtocols = /^(https?:\/\/)/i;
        if (!allowedProtocols.test(formValues.ctaUrl.trim())) {
            nextErrors.ctaUrl = "Button link must start with http:// or https://.";
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
    const [editingId, setEditingId] = useState(null);
    const [feedback, setFeedback] = useState({ type: "idle", message: "" });
    const [lastEndpointUsed, setLastEndpointUsed] = useState(endpoint);

    const titleCount = useMemo(() => formValues.sectionTitle.trim().length, [formValues.sectionTitle]);
    const introCount = useMemo(() => formValues.introText.trim().length, [formValues.introText]);
    const isEditMode = Boolean(editingId);
    const submitButtonLabel = isEditMode
        ? isSubmitting ? "Updating..." : "Update Session"
        : isSubmitting ? "Creating..." : "Create Session";

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
        setEditingId(null);
        if (resetFeedback) {
            setFeedback({ type: "idle", message: "" });
        }
    };

    const startEditSession = (sessionId) => {
        const session = activeSessions.find((s) => s.id === sessionId);
        if (session) {
            setFormValues({
                sectionTitle: session.sectionTitle,
                sectionType: session.sectionType,
                introText: session.introText,
                ctaLabel: session.ctaLabel,
                ctaUrl: session.ctaUrl
            });
            setEditingId(sessionId);
            setFeedback({ type: "idle", message: "" });
            window.scrollTo({ top: 0, behavior: "smooth" });
        }
    };

    const deleteSession = async (sessionId) => {
        try {
            const response = await requestWithFallback(`/${sessionId}`, { method: "DELETE" });
            if (!response.ok && response.status !== 404) {
                throw new Error(`Delete failed (${response.status})`);
            }

            setActiveSessions((prev) => prev.filter((s) => s.id !== sessionId));
            if (editingId === sessionId) {
                clearForm(false);
                setEditingId(null);
            }

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
                sectionTitle: formValues.sectionTitle.trim(),
                sectionType: formValues.sectionType.trim().toLowerCase(),
                introText: formValues.introText.trim(),
                ctaLabel: formValues.ctaLabel.trim(),
                ctaUrl: formValues.ctaUrl.trim()
            };

            const formData = new FormData();
            Object.entries(payload).forEach(([key, value]) => {
                formData.append(key, value);
            });

            const pathSuffix = isEditMode && editingId ? `/${editingId}` : "";
            const method = isEditMode ? "PUT" : "POST";
            const response = await requestWithFallback(pathSuffix, {
                method,
                body: formData
            });

            if (!response.ok) {
                let errorMessage = `Request failed with status ${response.status}`;
                try {
                    const errorBody = await response.json();
                    if (errorBody?.errors && typeof errorBody.errors === "object") {
                        setFormErrors(errorBody.errors);
                    }
                    if (errorBody?.message) {
                        errorMessage = errorBody.message;
                    }
                } catch {
                    // Not JSON response
                }
                throw new Error(errorMessage);
            }

            let returnedSession = payload;
            try {
                const responseBody = await response.json();
                if (responseBody && typeof responseBody === "object") {
                    returnedSession = {
                        ...payload,
                        ...responseBody
                    };
                }
            } catch {
                // No JSON response body
            }

            const sessionToStore = {
                id: returnedSession.id || editingId || `local-${Date.now()}`,
                ...returnedSession
            };

            if (isEditMode && editingId) {
                setActiveSessions((prev) =>
                    prev.map((s) => (s.id === editingId ? sessionToStore : s))
                );
                setFeedback({
                    type: "success",
                    message: "Session updated successfully."
                });
            } else {
                setActiveSessions((previous) => [sessionToStore, ...previous]);
                setFeedback({
                    type: "success",
                    message: "Session created successfully."
                });
            }

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
                    Create, edit, and manage custom session offers. They are stored separately from predefined packages.
                </p>

                <form className="custom-builder-form" onSubmit={onSubmit} noValidate>
                    <label className="custom-field" htmlFor="sectionTitle">
                        Session Name
                        <input
                            id="sectionTitle"
                            name="sectionTitle"
                            type="text"
                            value={formValues.sectionTitle}
                            onChange={onInputChange}
                            placeholder="Ex: Couples Golden Hour"
                            aria-invalid={Boolean(formErrors.sectionTitle)}
                            aria-describedby={formErrors.sectionTitle ? "sectionTitle-error" : "sectionTitle-hint"}
                        />
                        <small id="sectionTitle-hint" className="field-hint">
                            3 to 60 characters ({titleCount}/60)
                        </small>
                        {formErrors.sectionTitle ? (
                            <small id="sectionTitle-error" className="field-error">
                                {formErrors.sectionTitle}
                            </small>
                        ) : null}
                    </label>

                    <label className="custom-field" htmlFor="sectionType">
                        Session Type
                        <select
                            id="sectionType"
                            name="sectionType"
                            value={formValues.sectionType}
                            onChange={onInputChange}
                            aria-invalid={Boolean(formErrors.sectionType)}
                            aria-describedby={formErrors.sectionType ? "sectionType-error" : undefined}
                        >
                            {SESSION_TYPES.map((type) => (
                                <option key={type} value={type}>
                                    {SESSION_TYPE_LABELS[type]}
                                </option>
                            ))}
                        </select>
                        {formErrors.sectionType ? (
                            <small id="sectionType-error" className="field-error">
                                {formErrors.sectionType}
                            </small>
                        ) : null}
                    </label>

                    <label className="custom-field custom-field-full" htmlFor="introText">
                        Session Description
                        <textarea
                            id="introText"
                            name="introText"
                            value={formValues.introText}
                            onChange={onInputChange}
                            rows={4}
                            placeholder="What makes this session special? Include details about location, vibe, and what clients get..."
                            aria-invalid={Boolean(formErrors.introText)}
                            aria-describedby={formErrors.introText ? "introText-error" : "introText-hint"}
                        />
                        <small id="introText-hint" className="field-hint">
                            20 to 260 characters ({introCount}/260)
                        </small>
                        {formErrors.introText ? (
                            <small id="introText-error" className="field-error">
                                {formErrors.introText}
                            </small>
                        ) : null}
                    </label>

                    <label className="custom-field" htmlFor="ctaLabel">
                        Booking Button Text (Optional)
                        <input
                            id="ctaLabel"
                            name="ctaLabel"
                            type="text"
                            value={formValues.ctaLabel}
                            onChange={onInputChange}
                            placeholder="Ex: Reserve Now"
                            aria-invalid={Boolean(formErrors.ctaLabel)}
                            aria-describedby={formErrors.ctaLabel ? "ctaLabel-error" : undefined}
                        />
                        {formErrors.ctaLabel ? (
                            <small id="ctaLabel-error" className="field-error">
                                {formErrors.ctaLabel}
                            </small>
                        ) : null}
                    </label>

                    <label className="custom-field" htmlFor="ctaUrl">
                        Booking Button Link (Optional)
                        <input
                            id="ctaUrl"
                            name="ctaUrl"
                            type="url"
                            value={formValues.ctaUrl}
                            onChange={onInputChange}
                            placeholder="https://calendly.com/yourname"
                            aria-invalid={Boolean(formErrors.ctaUrl)}
                            aria-describedby={formErrors.ctaUrl ? "ctaUrl-error" : undefined}
                        />
                        {formErrors.ctaUrl ? (
                            <small id="ctaUrl-error" className="field-error">
                                {formErrors.ctaUrl}
                            </small>
                        ) : null}
                    </label>

                    <div className="custom-form-actions">
                        <button className="custom-submit" type="submit" disabled={isSubmitting}>
                            {submitButtonLabel}
                        </button>
                        {isEditMode && (
                            <button className="custom-cancel" type="button" onClick={clearForm}>
                                Cancel
                            </button>
                        )}
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
                                        <p className="session-package-meta">
                                            {SESSION_TYPE_LABELS[session.sectionType] || session.sectionType} • Custom
                                        </p>
                                        <p>{session.introText}</p>
                                        {session.ctaLabel ? (
                                            <p className="session-package-price">
                                                Button: <strong>{session.ctaLabel}</strong>
                                            </p>
                                        ) : null}
                                        <div className="custom-session-actions">
                                            <button
                                                type="button"
                                                className="action-edit"
                                                onClick={() => startEditSession(session.id)}
                                            >
                                                Edit
                                            </button>
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
