import React from 'react';
import './ContentLoader.css';

interface ContentLoaderProps {
    message?: string;
    size?: 'sm' | 'md' | 'lg';
}

const ContentLoader: React.FC<ContentLoaderProps> = ({ message, size = 'md' }) => {
    return (
        <div className={`content-loader-container loader-size-${size}`}>
            <div className="content-spinner"></div>
            {message && <div className="content-loader-message">{message}</div>}
        </div>
    );
};

export default ContentLoader;
