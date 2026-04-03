import { useState } from "react";

const initialFormData = {
    name: "",
    email: "",
    phone: "",
    session: "",
    message: ""
};

const validateContactForm = (data) => {
    if (!data.name.trim()) {
        return "Please enter your name.";
    }

    if (!data.email.trim()) {
        return "Please enter your email.";
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(data.email)) {
        return "Please use a valid email address.";
    }

    if (!data.session.trim()) {
        return "Please select a session type.";
    }

    if (!data.message.trim() || data.message.trim().length < 10) {
        return "Please include a message with at least 10 characters.";
    }

    return "";
};

const ContactForm = () => {
    const [formData, setFormData] = useState(initialFormData);
    const [status, setStatus] = useState({ message: "", type: "success" });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const onInputChange = (event) => {
        const { name, value } = event.target;
        setFormData((currentData) => ({
            ...currentData,
            [name]: value
        }));
    };

    const onSubmit = async (event) => {
        event.preventDefault();

        const errorMessage = validateContactForm(formData);
        if (errorMessage) {
            setStatus({ message: errorMessage, type: "error" });
            return;
        }

        
        const accessKey = process.env.REACT_APP_WEB3FORMS_ACCESS_KEY || "45c7942b-dd42-4f01-a697-d6e4c84f6059";
        if (!accessKey) {
            setStatus({
                message: "Form key is missing. Add REACT_APP_WEB3FORMS_ACCESS_KEY to your environment.",
                type: "error"
            });
            return;
        }

        setIsSubmitting(true);
        setStatus({ message: "Sending your message...", type: "success" });

        try {
            const web3FormData = new FormData();
            web3FormData.append("access_key", accessKey);
            web3FormData.append("subject", `Photography inquiry: ${formData.session || "General"}`);
            web3FormData.append("name", formData.name);
            web3FormData.append("email", formData.email);
            web3FormData.append("phone", formData.phone);
            web3FormData.append("session", formData.session);
            web3FormData.append("message", formData.message);

            const response = await fetch("https://api.web3forms.com/submit", {
                method: "POST",
                body: web3FormData,
                headers: {
                    Accept: "application/json"
                }
            });

            const result = await response.json();

            if (response.ok && result.success) {
                setStatus({
                    message: "Message sent successfully! I will get back to you soon.",
                    type: "success"
                });
                setFormData(initialFormData);
            } else {
                setStatus({
                    message: result.message || "Message failed to send. Please try again.",
                    type: "error"
                });
            }
        } catch (submitError) {
            setStatus({
                message: "Network error. Please check your connection and try again.",
                type: "error"
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <section className="contact-section" id="contact">
            <div className="contact-container">
                <h2>Contact Me</h2>
                <p className="contact-intro">Tell me about your vision and I&apos;ll help plan your shoot.</p>

                <form className="contact-form" noValidate onSubmit={onSubmit}>
                    <label htmlFor="name">Name</label>
                    <input type="text" id="name" name="name" value={formData.name} onChange={onInputChange} />

                    <label htmlFor="email">Email</label>
                    <input type="email" id="email" name="email" value={formData.email} onChange={onInputChange} />

                    <label htmlFor="phone">Phone</label>
                    <input
                        type="tel"
                        id="phone"
                        name="phone"
                        placeholder="Optional"
                        value={formData.phone}
                        onChange={onInputChange}
                    />

                    <label htmlFor="session">Session Type</label>
                    <select id="session" name="session" value={formData.session} onChange={onInputChange}>
                        <option value="" disabled>
                            Select a session
                        </option>
                        <option value="Family">Family</option>
                        <option value="Graduation">Graduation</option>
                        <option value="Headshots">Headshots</option>
                        <option value="Couples">Couples</option>
                        <option value="Other">Other</option>
                    </select>

                    <label htmlFor="message">Message</label>
                    <textarea id="message" name="message" rows="5" value={formData.message} onChange={onInputChange} />

                    <button type="submit" className="about-book-button" disabled={isSubmitting}>
                        {isSubmitting ? "Sending..." : "Send Message"}
                    </button>
                </form>

                {status.message ? (
                    <p
                        className={`form-status ${status.type === "success" ? "status-success" : "status-error"}`}
                        role="status"
                        aria-live="polite"
                    >
                        {status.message}
                    </p>
                ) : null}
            </div>
        </section>
    );
};

export default ContactForm;