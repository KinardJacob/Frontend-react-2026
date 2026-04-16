import { useState, useEffect } from "react";

const initialFormState = {
    sessionType: "",
    preferredDate: "",
    name: "",
    email: "",
    phone: "",
    details: ""
};

const validateForm = (formValues) => {
    const nextErrors = {};

    if (!formValues.sessionType) {
        nextErrors.sessionType = "Please select a session type.";
    }

    if (!formValues.preferredDate) {
        nextErrors.preferredDate = "Please select a preferred date.";
    }

    if (!formValues.name.trim()) {
        nextErrors.name = "Name is required.";
    } else if (formValues.name.trim().length < 2 || formValues.name.trim().length > 50) {
        nextErrors.name = "Name must be between 2 and 50 characters.";
    }

    if (!formValues.email.trim()) {
        nextErrors.email = "Email is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formValues.email)) {
        nextErrors.email = "Please enter a valid email address.";
    }

    if (!formValues.phone.trim()) {
        nextErrors.phone = "Phone number is required.";
    } else if (!/^[?\d\s\-()]+$/.test(formValues.phone) || formValues.phone.replace(/\D/g, '').length < 10) {
        nextErrors.phone = "Please enter a valid phone number.";
    }

    if (formValues.details.trim() && formValues.details.trim().length > 500) {
        nextErrors.details = "Details must be 500 characters or less.";
    }

    return nextErrors;
};

const BookingForm = () => {
    const [formValues, setFormValues] = useState(initialFormState);
    const [formErrors, setFormErrors] = useState({});
    const [sessionTypes, setSessionTypes] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [feedback, setFeedback] = useState({ type: "idle", message: "" });

    // Load session types from API
    useEffect(() => {
        const loadSessionTypes = async () => {
            try {
                const apiBase = process.env.REACT_APP_API_BASE_URL || "https://demo-backend-nllg.onrender.com";
                const response = await fetch(`${apiBase}/api/packages`);
                
                if (response.ok) {
                    const data = await response.json();
                    const packages = Array.isArray(data) ? data : data.packages || [];
                    setSessionTypes(packages);
                } else {
                    // Fallback to predefined session types if API fails
                    setSessionTypes([
                        { id: 1, title: "Mini Session", price: "$10" },
                        { id: 2, title: "Standard Session", price: "$25" },
                        { id: 3, title: "Deluxe Session", price: "$50" }
                    ]);
                }
            } catch (error) {
                console.warn("Failed to load session types:", error);
                // Fallback to predefined session types
                setSessionTypes([
                    { id: 1, title: "Mini Session", price: "$10" },
                    { id: 2, title: "Standard Session", price: "$25" },
                    { id: 3, title: "Deluxe Session", price: "$50" }
                ]);
            }
        };

        loadSessionTypes();
    }, []);

    const handleInputChange = (event) => {
        const { name, value } = event.target;
        setFormValues((prevValues) => ({
            ...prevValues,
            [name]: value
        }));

        // Clear error for the changed field
        if (formErrors[name]) {
            setFormErrors((prevErrors) => ({
                ...prevErrors,
                [name]: ""
            }));
        }
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        
        const errors = validateForm(formValues);
        setFormErrors(errors);

        if (Object.keys(errors).length > 0) {
            setFeedback({ type: "error", message: "Please correct the errors below." });
            return;
        }

        setIsSubmitting(true);
        setFeedback({ type: "idle", message: "" });

        try {
            const apiBase = process.env.REACT_APP_API_BASE_URL || "https://demo-backend-nllg.onrender.com";
            const response = await fetch(`${apiBase}/api/bookings`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formValues),
            });

            if (!response.ok) {
                const data = await response.json().catch(() => ({}));
                throw new Error(data.message || "Server error");
            }

            setFeedback({ 
                type: "success", 
                message: "Booking request submitted successfully! We'll contact you soon to confirm your session."
            });
            setFormValues(initialFormState);
        } catch (error) {
            setFeedback({ 
                type: "error", 
                message: "Failed to submit booking request. Please try again or contact us directly."
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const getTomorrowDate = () => {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        return tomorrow.toISOString().split('T')[0];
    };

    const getMaxDate = () => {
        const maxDate = new Date();
        maxDate.setFullYear(maxDate.getFullYear() + 1);
        return maxDate.toISOString().split('T')[0];
    };

    return (
        <section className="custom-builder-section" aria-labelledby="booking-form-heading">
            <div className="custom-builder-shell">
                <h2 id="booking-form-heading">Book Your Session</h2>
                <p className="custom-builder-intro">
                    Ready to book a photography session? Fill out the form below and we'll get back to you to confirm your booking.
                </p>

                <form onSubmit={handleSubmit} className="custom-builder-form" noValidate>
                    {feedback.type !== "idle" && (
                        <div className={`form-feedback ${feedback.type}`} role="alert">
                            {feedback.message}
                        </div>
                    )}

                    <div className="form-row">
                        <label className="custom-field" htmlFor="sessionType">
                            Session Type *
                            <select
                                name="sessionType"
                                id="sessionType"
                                value={formValues.sessionType}
                                onChange={handleInputChange}
                                className={formErrors.sessionType ? "input-error" : ""}
                                required
                            >
                                <option value="">Select a session type</option>
                                {sessionTypes.map((session) => (
                                    <option key={session.id} value={session.title}>
                                        {session.title} {session.price && `- ${session.price}`}
                                    </option>
                                ))}
                            </select>
                            {formErrors.sessionType && (
                                <span className="error-text" role="alert">{formErrors.sessionType}</span>
                            )}
                        </label>

                        <label className="custom-field" htmlFor="preferredDate">
                            Preferred Date *
                            <input
                                type="date"
                                name="preferredDate"
                                id="preferredDate"
                                value={formValues.preferredDate}
                                onChange={handleInputChange}
                                min={getTomorrowDate()}
                                max={getMaxDate()}
                                className={formErrors.preferredDate ? "input-error" : ""}
                                required
                            />
                            {formErrors.preferredDate && (
                                <span className="error-text" role="alert">{formErrors.preferredDate}</span>
                            )}
                        </label>
                    </div>

                    <div className="form-row">
                        <label className="custom-field" htmlFor="name">
                            Full Name *
                            <input
                                type="text"
                                name="name"
                                id="name"
                                value={formValues.name}
                                onChange={handleInputChange}
                                placeholder="Enter your full name"
                                className={formErrors.name ? "input-error" : ""}
                                required
                            />
                            {formErrors.name && (
                                <span className="error-text" role="alert">{formErrors.name}</span>
                            )}
                        </label>

                        <label className="custom-field" htmlFor="email">
                            Email Address *
                            <input
                                type="email"
                                name="email"
                                id="email"
                                value={formValues.email}
                                onChange={handleInputChange}
                                placeholder="your.email@example.com"
                                className={formErrors.email ? "input-error" : ""}
                                required
                            />
                            {formErrors.email && (
                                <span className="error-text" role="alert">{formErrors.email}</span>
                            )}
                        </label>
                    </div>

                    <label className="custom-field" htmlFor="phone">
                        Phone Number *
                        <input
                            type="tel"
                            name="phone"
                            id="phone"
                            value={formValues.phone}
                            onChange={handleInputChange}
                            placeholder="(555) 123-4567"
                            className={formErrors.phone ? "input-error" : ""}
                            required
                        />
                        {formErrors.phone && (
                            <span className="error-text" role="alert">{formErrors.phone}</span>
                        )}
                    </label>

                    <label className="custom-field" htmlFor="details">
                        Special Requests or Questions (Optional)
                        <textarea
                            name="details"
                            id="details"
                            rows="4"
                            value={formValues.details}
                            onChange={handleInputChange}
                            placeholder="Let us know about any special requests, questions, or specific requirements for your session..."
                            className={formErrors.details ? "input-error" : ""}
                            maxLength="500"
                        />
                        <div className="character-count">
                            {formValues.details.length}/500 characters
                        </div>
                        {formErrors.details && (
                            <span className="error-text" role="alert">{formErrors.details}</span>
                        )}
                    </label>

                    <button
                        type="submit"
                        className="submit-button"
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? "Submitting..." : "Submit Booking Request"}
                    </button>
                </form>
            </div>
        </section>
    );
};

export default BookingForm;