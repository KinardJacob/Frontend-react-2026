import { useMemo, useState } from "react";

const apiBase = process.env.REACT_APP_API_BASE_URL || "http://localhost:3001";
const endpoint = process.env.REACT_APP_CUSTOM_SECTION_ENDPOINT || `${apiBase}/api/custom-sections`;
const allowedSectionTypes = ["info", "feature", "testimonial", "offer"];

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
        nextErrors.sectionTitle = "Section title is required.";
    } else if (formValues.sectionTitle.trim().length < 3 || formValues.sectionTitle.trim().length > 60) {
        nextErrors.sectionTitle = "Title must be between 3 and 60 characters.";
    }

    const normalizedType = formValues.sectionType.trim().toLowerCase();
    if (!normalizedType) {
        nextErrors.sectionType = "Section type is required.";
    } else if (!allowedSectionTypes.includes(normalizedType)) {
        nextErrors.sectionType = `Section type must be one of: ${allowedSectionTypes.join(", ")}.`;
    }

    if (!formValues.introText.trim()) {
        nextErrors.introText = "Intro text is required.";
    } else if (formValues.introText.trim().length < 20 || formValues.introText.trim().length > 260) {
        nextErrors.introText = "Intro text must be between 20 and 260 characters.";
    }

    if (formValues.ctaLabel && formValues.ctaLabel.trim().length > 30) {
        nextErrors.ctaLabel = "CTA label must be 30 characters or less.";
    }

    if (formValues.ctaUrl) {
        const allowedProtocols = /^(https?:\/\/)/i;
        if (!allowedProtocols.test(formValues.ctaUrl.trim())) {
            nextErrors.ctaUrl = "CTA URL must start with http:// or https://.";
        }
    }

    return nextErrors;
};

const CustomSectionBuilderForm = () => {
    const [formValues, setFormValues] = useState(initialFormState);
    const [formErrors, setFormErrors] = useState({});
    const [submitStatus, setSubmitStatus] = useState("idle");
    const [statusMessage, setStatusMessage] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submittedSections, setSubmittedSections] = useState([]);

    const titleCount = useMemo(() => formValues.sectionTitle.trim().length, [formValues.sectionTitle]);
    const introCount = useMemo(() => formValues.introText.trim().length, [formValues.introText]);

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

    const onSubmit = async (event) => {
        event.preventDefault();

        const validationErrors = validateForm(formValues);
        if (Object.keys(validationErrors).length > 0) {
            setFormErrors(validationErrors);
            setSubmitStatus("error");
            setStatusMessage("Please fix the highlighted fields.");
            return;
        }

        setIsSubmitting(true);
        setSubmitStatus("idle");
        setStatusMessage("");

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

            const response = await fetch(endpoint, {
                method: "POST",
                body: formData
            });

            if (!response.ok) {
                let errorMessage = `Request failed (${response.status})`;

                try {
                    const errorBody = await response.json();
                    if (errorBody?.errors && typeof errorBody.errors === "object") {
                        setFormErrors(errorBody.errors);
                    }

                    if (errorBody?.message) {
                        errorMessage = errorBody.message;
                    }
                } catch {
                    // Keep the fallback message when the response is not JSON.
                }

                throw new Error(errorMessage);
            }

            let createdSection = payload;
            try {
                const responseBody = await response.json();
                if (responseBody && typeof responseBody === "object") {
                    createdSection = {
                        ...payload,
                        ...responseBody
                    };
                }
            } catch {
                // Some endpoints return empty responses for successful POSTs.
            }

            setSubmittedSections((previous) => [createdSection, ...previous]);
            setFormValues(initialFormState);
            setFormErrors({});
            setSubmitStatus("success");
            setStatusMessage("Custom section submitted successfully.");
        } catch (submitError) {
            setSubmitStatus("error");
            setStatusMessage(submitError.message || "Could not send section data. Check your API route and try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <section className="custom-builder-section" aria-labelledby="custom-builder-heading">
            <div className="custom-builder-shell">
                <h2 id="custom-builder-heading">Custom Section Builder</h2>
                <p className="custom-builder-intro">
                    Send new Services section content to your server endpoint directly from the client.
                </p>

                <form className="custom-builder-form" onSubmit={onSubmit} noValidate>
                    <label className="custom-field" htmlFor="sectionTitle">
                        Section Title
                        <input
                            id="sectionTitle"
                            name="sectionTitle"
                            type="text"
                            value={formValues.sectionTitle}
                            onChange={onInputChange}
                            placeholder="Ex: Graduation Weekend Spotlight"
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
                        Section Type
                        <select
                            id="sectionType"
                            name="sectionType"
                            value={formValues.sectionType}
                            onChange={onInputChange}
                            aria-invalid={Boolean(formErrors.sectionType)}
                            aria-describedby={formErrors.sectionType ? "sectionType-error" : undefined}
                        >
                            <option value="info">Info</option>
                            <option value="feature">Feature</option>
                            <option value="testimonial">Testimonial</option>
                            <option value="offer">Limited Offer</option>
                        </select>
                        {formErrors.sectionType ? (
                            <small id="sectionType-error" className="field-error">
                                {formErrors.sectionType}
                            </small>
                        ) : null}
                    </label>

                    <label className="custom-field custom-field-full" htmlFor="introText">
                        Intro Text
                        <textarea
                            id="introText"
                            name="introText"
                            value={formValues.introText}
                            onChange={onInputChange}
                            rows={4}
                            placeholder="Describe this section so it can be rendered on the Services page..."
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
                        CTA Label (Optional)
                        <input
                            id="ctaLabel"
                            name="ctaLabel"
                            type="text"
                            value={formValues.ctaLabel}
                            onChange={onInputChange}
                            placeholder="Book This Session"
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
                        CTA URL (Optional)
                        <input
                            id="ctaUrl"
                            name="ctaUrl"
                            type="url"
                            value={formValues.ctaUrl}
                            onChange={onInputChange}
                            placeholder="https://example.com/book"
                            aria-invalid={Boolean(formErrors.ctaUrl)}
                            aria-describedby={formErrors.ctaUrl ? "ctaUrl-error" : undefined}
                        />
                        {formErrors.ctaUrl ? (
                            <small id="ctaUrl-error" className="field-error">
                                {formErrors.ctaUrl}
                            </small>
                        ) : null}
                    </label>

                    <button className="custom-submit" type="submit" disabled={isSubmitting}>
                        {isSubmitting ? "Submitting..." : "Submit Section"}
                    </button>
                </form>

                {statusMessage ? (
                    <p className={`custom-status ${submitStatus === "success" ? "is-success" : "is-error"}`}>
                        {statusMessage}
                    </p>
                ) : null}

                <section className="submitted-preview" aria-live="polite">
                    <h3>Recently Submitted</h3>
                    {submittedSections.length === 0 ? (
                        <p className="submitted-preview-empty">No sections submitted yet.</p>
                    ) : (
                        <ul>
                            {submittedSections.map((item, index) => (
                                <li key={`${item.sectionTitle}-${index}`}>
                                    <strong>{item.sectionTitle}</strong>
                                    <span>{item.sectionType}</span>
                                </li>
                            ))}
                        </ul>
                    )}
                </section>
            </div>
        </section>
    );
};

export default CustomSectionBuilderForm;