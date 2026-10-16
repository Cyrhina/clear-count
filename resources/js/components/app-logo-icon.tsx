import type { ImgHTMLAttributes } from 'react';

/** The Clear Count mark: light tile in light mode, dark tile in dark mode. Colour utilities passed by callers (fill/text) don't apply to a bitmap. */
export default function AppLogoIcon({ className = '', ...props }: ImgHTMLAttributes<HTMLImageElement>) {
    return (
        <>
            <img {...props} src="/brand/clear-count-light.png" alt="Clear Count" className={`${className} object-contain dark:hidden`} />
            <img {...props} src="/brand/clear-count-dark.png" alt="Clear Count" className={`${className} hidden object-contain dark:block`} />
        </>
    );
}
