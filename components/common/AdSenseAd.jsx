import { useEffect, useRef } from 'react';

export function AdSenseAd({
    style = { display: 'block', width: '100%', minHeight: 90 },
    format = 'auto',
    responsive = 'true',
    className = '',
    testBannerLink,
}) {
    const adRef = useRef(null);
    const pushedRef = useRef(false);
    const adClient = process.env.NEXT_PUBLIC_ADSENSE_CLIENT;
    const adSlot = process.env.NEXT_PUBLIC_ADSENSE_SLOT;
    const adsEnabled = process.env.NEXT_PUBLIC_ADSENSE_ENABLED === 'true';

    useEffect(() => {
        if (!adsEnabled) return;
        if (typeof window === 'undefined') return;
        if (!adRef.current) return;
        if (!adClient || !adSlot) return;

        const rect = adRef.current.getBoundingClientRect();
        if (rect.width === 0) return;

        if (!window.adsbygoogle) {
            const script = document.createElement('script');
            script.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js';
            script.async = true;
            script.crossOrigin = 'anonymous';
            document.body.appendChild(script);
            script.onload = () => {
                if (window.adsbygoogle && adRef.current && !pushedRef.current) {
                    window.adsbygoogle.push({});
                    pushedRef.current = true;
                }
            };
        } else if (window.adsbygoogle && adRef.current && !pushedRef.current) {
            window.adsbygoogle.push({});
            pushedRef.current = true;
        }
    }, [adClient, adSlot, adsEnabled]);

    if (!adsEnabled) {
        const img = (
            <img
                src="/media/banners/Dhimay_Ads_Nimto.png"
                alt="Test Ad Banner"
                style={{
                    width: '100%',
                    minHeight: 90,
                    maxWidth: 728,
                    objectFit: 'cover',
                    borderRadius: 8,
                    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                    background: '#f3f3f3',
                }}
            />
        );
        return (
            <div className={`flex flex-col items-center justify-center my-6 w-full ${className}`}>
                <div className="text-center mb-7">
                    <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
                        Event Partner
                    </h2>
                </div>
                {testBannerLink ? (
                    <a href={testBannerLink} target="_blank" rel="noopener noreferrer">
                        {img}
                    </a>
                ) : (
                    img
                )}
            </div>
        );
    }

    if (!adClient || !adSlot) return null;

    return (
        <div className={`flex justify-center my-6 w-full ${className}`}>
            <ins
                className="adsbygoogle"
                style={style}
                data-ad-client={adClient}
                data-ad-slot={adSlot}
                data-ad-format={format}
                data-full-width-responsive={responsive}
                ref={adRef}
            ></ins>
        </div>
    );
}