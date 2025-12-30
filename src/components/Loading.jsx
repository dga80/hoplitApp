import HoplitLogo from './HoplitLogo';
import './Loading.css';

export default function Loading({ type = 'full' }) {
    // type: 'full' (Splash Screen) or 'mini' (Tab loading)

    return (
        <div className={`loading-container ${type}`}>
            <div className="logo-wrapper">
                <HoplitLogo className="loading-logo" />
                <div className="loading-pulse"></div>
            </div>
            {type === 'full' && (
                <h1 className="loading-title">HoplitApp</h1>
            )}
        </div>
    );
}
