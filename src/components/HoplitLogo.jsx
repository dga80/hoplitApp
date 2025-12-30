export default function HoplitLogo({ className = "" }) {
    return (
        <img
            src="/logo.svg"
            alt="HoplitApp Logo"
            className={className}
            style={{ display: 'block' }}
        />
    );
}
