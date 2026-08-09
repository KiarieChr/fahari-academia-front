import React, { useState, useEffect, useRef } from 'react';
import { Loader2 } from 'lucide-react';

/**
 * LazyImage component with automatic lazy loading
 * Supports both Intersection Observer (native lazy loading) and fallback
 * Shows placeholder while loading, prevents layout shift with aspect ratio
 */
const LazyImage = ({
    src,
    alt = 'Image',
    className = '',
    placeholderBg = 'bg-gray-200',
    aspectRatio = 'aspect-square', // or aspect-video, aspect-[4/3], etc.
    onLoad = () => {},
    onError = () => {},
    fallback = null,
}) => {
    const [loaded, setLoaded] = useState(false);
    const [error, setError] = useState(false);
    const [imageSrc, setImageSrc] = useState(null);
    const imgRef = useRef(null);

    useEffect(() => {
        if (!src) {
            setError(true);
            return;
        }

        // Use Intersection Observer if available
        if ('IntersectionObserver' in window) {
            const observer = new IntersectionObserver(
                entries => {
                    entries.forEach(entry => {
                        if (entry.isIntersecting) {
                            setImageSrc(src);
                            observer.unobserve(entry.target);
                        }
                    });
                },
                {
                    rootMargin: '50px', // Start loading 50px before entering viewport
                }
            );

            if (imgRef.current) {
                observer.observe(imgRef.current);
            }

            return () => observer.disconnect();
        } else {
            // Fallback for older browsers
            setImageSrc(src);
        }
    }, [src]);

    const handleLoad = () => {
        setLoaded(true);
        onLoad();
    };

    const handleError = () => {
        setError(true);
        setLoaded(true);
        onError();
    };

    if (error && fallback) {
        return fallback;
    }

    return (
        <div
            ref={imgRef}
            className={`relative overflow-hidden ${aspectRatio} ${!loaded && !error ? placeholderBg : ''} ${className}`}
        >
            {/* Loading skeleton */}
            {!loaded && !error && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-100 z-10">
                    <Loader2 size={24} className="animate-spin text-gray-400" />
                </div>
            )}

            {/* Image */}
            {imageSrc && !error && (
                <img
                    src={imageSrc}
                    alt={alt}
                    onLoad={handleLoad}
                    onError={handleError}
                    className={`w-full h-full object-cover ${loaded ? 'opacity-100' : 'opacity-0'} transition-opacity duration-300`}
                />
            )}

            {/* Error state */}
            {error && !fallback && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-100 text-gray-400">
                    <span className="text-sm">Image not available</span>
                </div>
            )}
        </div>
    );
};

export default LazyImage;
