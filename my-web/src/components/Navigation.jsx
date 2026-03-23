import { NavLink } from "react-router-dom";

const links = [
    { to: "/", label: "Portfolio", end: true },
    { to: "/services", label: "Services & Pricing" },
    { to: "/behind", label: "Behind the Scenes" },
    { to: "/about", label: "About" },
    { to: "/client-gallery", label: "Client Gallery" }
];

const Navigation = () => {
    return (
        <nav className="navbar" aria-label="Main navigation">
            <ul className="nav-list">
                {links.map((link) => (
                    <li key={link.to}>
                        <NavLink to={link.to} end={link.end}>
                            {link.label}
                        </NavLink>
                    </li>
                ))}
            </ul>
        </nav>
    );
};

export default Navigation;
