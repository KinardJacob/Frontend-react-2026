import { NavLink } from "react-router-dom";
import { useState } from "react";

const links = [
    { to: "/", label: "Portfolio", end: true },
    { to: "/services", label: "Services & Pricing" },
    { to: "/behind", label: "Behind the Scenes" },
    { to: "/about", label: "About" },
    { to: "/client-gallery", label: "Client Gallery" }
];

const Navigation = () => {
    const [isNavOpen, setIsNavOpen] = useState(false);

    const toggleNav = () => {
        setIsNavOpen((currentState) => !currentState);
    };

    const closeNav = () => {
        setIsNavOpen(false);
    };

    return (
        <nav className="navbar" aria-label="Main navigation">
            <button
                id="toggle-nav"
                type="button"
                className={`nav-toggle${isNavOpen ? " is-open" : ""}`}
                onClick={toggleNav}
                aria-label="Toggle navigation"
                aria-expanded={isNavOpen}
                aria-controls="main-nav-list"
            >
                <span className="nav-toggle-icon" aria-hidden="true">{isNavOpen ? "\u2191" : "\u2193"}</span>
            </button>
            <ul id="main-nav-list" className={`nav-list${isNavOpen ? " is-open" : ""}`}>
                {links.map((link) => (
                    <li key={link.to}>
                        <NavLink to={link.to} end={link.end} onClick={closeNav}>
                            {link.label}
                        </NavLink>
                    </li>
                ))}
            </ul>
        </nav>
    );
};

export default Navigation;
