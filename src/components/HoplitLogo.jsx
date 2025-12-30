export default function HoplitLogo({ className = "" }) {
    return (
        <svg
            viewBox="0 0 100 120"
            className={className}
            xmlns="http://www.w3.org/2000/svg"
        >
            {/* Left Shield Side (Light Orange) */}
            <path d="M50 5 L10 35 V85 L50 115 V5Z" fill="#FF7B2D" />
            {/* Right Shield Side (Darker Orange for depth) */}
            <path d="M50 5 L90 35 V85 L50 115 V5Z" fill="#E65C15" />

            {/* Stylized Helmet Visor / Inner Path (Black) */}
            <path
                d="M25 55 L50 45 L75 55 L75 65 L50 55 L25 65 Z"
                fill="#121212"
            />
            <path
                d="M25 75 L50 65 L80 75 L80 88 L50 78 L50 110 H40 L40 78 L25 85 Z"
                fill="#121212"
            />
        </svg>
    );
}
