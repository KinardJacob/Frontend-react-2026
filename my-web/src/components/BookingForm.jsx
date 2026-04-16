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
    const trimmedName = formValues.name.trim();
    const trimmedEmail = formValues.email.trim();
    const trimmedPhone = formValues.phone.trim();
    const trimmedDetails = formValues.details.trim();
    const selectedDate = formValues.preferredDate ? new Date(formValues.preferredDate) : null;
    const tomorrow = new Date();
    tomorrow.setHours(0, 0, 0, 0);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const maxDate = new Date(tomorrow);
    maxDate.setFullYear(maxDate.getFullYear() + 1);

    if (!formValues.sessionType) {
        nextErrors.sessionType = "Please select a session type.";
    }

    if (!formValues.preferredDate) {
        nextErrors.preferredDate = "Please select a preferred date.";
    } else if (!selectedDate || Number.isNaN(selectedDate.getTime())) {
        nextErrors.preferredDate = "Please choose a valid date.";
    } else if (selectedDate < tomorrow || selectedDate > maxDate) {
        nextErrors.preferredDate = "Date must be within the next year.";
    }

    if (!trimmedName) {
        nextErrors.name = "Name is required.";
    } else if (trimmedName.length < 2 || trimmedName.length > 50) {
        nextErrors.name = "Name must be between 2 and 50 characters.";
    }

    if (!trimmedEmail) {
        nextErrors.email = "Email is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
        nextErrors.email = "Please enter a valid email address.";
    }

    if (!trimmedPhone) {
        nextErrors.phone = "Phone number is required.";
    } else if (!/^\+?[\d\s\-()]+$/.test(trimmedPhone) || trimmedPhone.replace(/\D/g, "").length < 10) {
        nextErrors.phone = "Please enter a valid phone number.";
    }

    if (trimmedDetails && trimmedDetails.length > 500) {
        nextErrors.details = "Details must be 500 characters or less.";
    }

    return nextErrors;
};

const getBookingId = (booking) => booking?.id ?? booking?._id ?? null;

const normalizeBooking = (booking, fallbackId) => ({
    id: getBookingId(booking) ?? fallbackId,
    sessionType: booking?.sessionType ?? "",
    preferredDate: booking?.preferredDate ?? "",
    name: booking?.name ?? "",
    email: booking?.email ?? "",
    phone: booking?.phone ?? "",
    details: booking?.details ?? ""
});

const toFormState = (booking) => ({
    sessionType: booking.sessionType,
    preferredDate: booking.preferredDate,
    name: booking.name,
    email: booking.email,
    phone: booking.phone,
    details: booking.details
});

const extractBookingArray = (data) => {
    if (Array.isArray(data)) {
        return data;
    }

    if (Array.isArray(data?.bookings)) {
        return data.bookings;
    }

    return [];
};

const extractBookingObject = (data) => data?.booking ?? data;

const BookingForm = () => {
    const [formValues, setFormValues] = useState(initialFormState);
    const [formErrors, setFormErrors] = useState({});
    const [sessionTypes, setSessionTypes] = useState([]);
    const [bookings, setBookings] = useState([]);
    const [editingBookingId, setEditingBookingId] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [feedback, setFeedback] = useState({ type: "idle", message: "" });
    const [editDeleteFeedback, setEditDeleteFeedback] = useState({ type: "idle", message: "" });

    const apiBase = process.env.REACT_APP_API_BASE_URL || "https://demo-backend-nllg.onrender.com";

    // Load session types and existing bookings from API.
    useEffect(() => {
        const loadData = async () => {
            try {
                const [packagesResponse, bookingsResponse] = await Promise.all([
                    fetch(`${apiBase}/api/packages`),
                    fetch(`${apiBase}/api/bookings`)
                ]);

                if (packagesResponse.ok) {
                    const data = await packagesResponse.json();
                    const packages = Array.isArray(data) ? data : data.packages || [];
                    setSessionTypes(packages);
                } else {
                    setSessionTypes([
                        { id: 1, title: "Mini Session", price: "$10" },
                        { id: 2, title: "Standard Session", price: "$25" },
                        { id: 3, title: "Deluxe Session", price: "$50" }
                    ]);
                }

                if (bookingsResponse.ok) {
                    const data = await bookingsResponse.json();
                    const bookingItems = extractBookingArray(data).map((booking, index) =>
                        normalizeBooking(booking, `booking-${index}-${Date.now()}`)
                    );
                    setBookings(bookingItems);
                }
            } catch (error) {
                console.warn("Failed to load API resources:", error);
                setSessionTypes([
                    { id: 1, title: "Mini Session", price: "$10" },
                    { id: 2, title: "Standard Session", price: "$25" },
                    { id: 3, title: "Deluxe Session", price: "$50" }
                ]);
            }
        };

        loadData();
    }, [apiBase]);

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
        setEditDeleteFeedback({ type: "idle", message: "" });

        try {
            const method = editingBookingId ? "PUT" : "POST";
            const endpoint = editingBookingId
                ? `${apiBase}/api/bookings/${editingBookingId}`
                : `${apiBase}/api/bookings`;

            const payload = {
                ...formValues,
                name: formValues.name.trim(),
                email: formValues.email.trim(),
                phone: formValues.phone.trim(),
                details: formValues.details.trim()
            };

            const response = await fetch(endpoint, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                const data = await response.json().catch(() => ({}));
                throw new Error(data.message || "Server error");
            }

            const data = await response.json().catch(() => ({}));
            const responseBooking = normalizeBooking(
                extractBookingObject(data),
                editingBookingId ?? `booking-${Date.now()}`
            );

            if (editingBookingId) {
                setBookings((prevBookings) =>
                    prevBookings.map((booking) =>
                        booking.id === editingBookingId
                            ? { ...booking, ...responseBooking, ...payload, id: booking.id }
                            : booking
                    )
                );
                setEditDeleteFeedback({ type: "success", message: "Booking updated successfully." });
            } else {
                const finalBooking = { ...responseBooking, ...payload };
                setBookings((prevBookings) => [finalBooking, ...prevBookings]);
                setFeedback({
                    type: "success",
                    message: "Booking request submitted successfully! We will contact you soon to confirm your session."
                });
            }

            setFormValues(initialFormState);
            setEditingBookingId(null);
        } catch (error) {
            if (editingBookingId) {
                setEditDeleteFeedback({
                    type: "error",
                    message: "Failed to update booking. Please try again."
                });
            } else {
                setFeedback({
                    type: "error",
                    message: "Failed to submit booking request. Please try again or contact us directly."
                });
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleStartEdit = (booking) => {
        setFeedback({ type: "idle", message: "" });
        setEditDeleteFeedback({ type: "idle", message: "" });
        setEditingBookingId(booking.id);
        setFormValues(toFormState(booking));
        setFormErrors({});
        document.getElementById("booking-form")?.scrollIntoView({ behavior: "smooth", block: "start" });
    };

    const handleCancelEdit = () => {
        setEditingBookingId(null);
        setFormValues(initialFormState);
        setFormErrors({});
        setEditDeleteFeedback({ type: "idle", message: "" });
    };

    const handleDeleteBooking = async (booking) => {
        const bookingId = booking.id;

        if (!bookingId) {
            setEditDeleteFeedback({
                type: "error",
                message: "Cannot delete this item because it has no id yet."
            });
            return;
        }

        setIsSubmitting(true);
        setFeedback({ type: "idle", message: "" });
        setEditDeleteFeedback({ type: "idle", message: "" });

        try {
            const response = await fetch(`${apiBase}/api/bookings/${bookingId}`, {
                method: "DELETE"
            });

            if (!response.ok) {
                const data = await response.json().catch(() => ({}));
                throw new Error(data.message || "Server error");
            }

            setBookings((prevBookings) => prevBookings.filter((item) => item.id !== bookingId));
            setEditDeleteFeedback({ type: "success", message: "Booking deleted successfully." });

            if (editingBookingId === bookingId) {
                handleCancelEdit();
            }
        } catch (error) {
            setEditDeleteFeedback({
                type: "error",
                message: "Failed to delete booking. Please try again."
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
        <section id="booking-form" className="custom-builder-section" aria-labelledby="booking-form-heading">
            <div className="custom-builder-shell">
                <h2 id="booking-form-heading">Book Your Session</h2>
                <p className="custom-builder-intro">
                    Ready to book a photography session? Fill out the form below and we'll get back to you to confirm your booking.
                </p>

                {editingBookingId && (
                    <p className="custom-builder-intro is-editing">
                        Editing selected booking request.
                    </p>
                )}

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
                        {isSubmitting
                            ? "Submitting..."
                            : editingBookingId
                                ? "Save Booking Changes"
                                : "Submit Booking Request"}
                    </button>

                    {editingBookingId && (
                        <button
                            type="button"
                            className="custom-cancel"
                            onClick={handleCancelEdit}
                            disabled={isSubmitting}
                        >
                            Cancel Edit
                        </button>
                    )}
                </form>

                {editDeleteFeedback.type !== "idle" && (
                    <div className={`custom-status ${editDeleteFeedback.type === "success" ? "is-success" : "is-error"}`} role="status">
                        {editDeleteFeedback.message}
                    </div>
                )}

                <section className="submitted-preview" aria-labelledby="submitted-bookings-heading">
                    <h3 id="submitted-bookings-heading">Submitted Booking Requests</h3>

                    {bookings.length === 0 ? (
                        <p className="submitted-preview-empty">No booking requests submitted yet.</p>
                    ) : (
                        <ul>
                            {bookings.map((booking) => (
                                <li key={booking.id} className="submitted-booking-item">
                                    <div className="submitted-booking-main">
                                        <span>Session</span>
                                        <strong>{booking.sessionType}</strong>
                                    </div>
                                    <div className="submitted-booking-main">
                                        <span>Date</span>
                                        <strong>{booking.preferredDate}</strong>
                                    </div>
                                    <div className="submitted-booking-main">
                                        <span>Name</span>
                                        <strong>{booking.name}</strong>
                                    </div>
                                    <div className="submitted-booking-main">
                                        <span>Email</span>
                                        <strong>{booking.email}</strong>
                                    </div>
                                    <div className="submitted-booking-main">
                                        <span>Phone</span>
                                        <strong>{booking.phone}</strong>
                                    </div>
                                    {booking.details && (
                                        <div className="submitted-booking-main">
                                            <span>Details</span>
                                            <strong>{booking.details}</strong>
                                        </div>
                                    )}

                                    <div className="custom-session-actions">
                                        <button
                                            type="button"
                                            className="action-edit"
                                            onClick={() => handleStartEdit(booking)}
                                            disabled={isSubmitting}
                                        >
                                            Edit
                                        </button>
                                        <button
                                            type="button"
                                            className="action-delete"
                                            onClick={() => handleDeleteBooking(booking)}
                                            disabled={isSubmitting}
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </section>
            </div>
        </section>
    );
};

export default BookingForm;