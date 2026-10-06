import type { ImgHTMLAttributes } from 'react';

/** The FBS Pay mark: light tile in light mode, dark tile in dark mode. Colour utilities passed by callers (fill/text) don't apply to a bitmap. */
export default function AppLogoIcon({ className = '', ...props }: ImgHTMLAttributes<HTMLImageElement>) {
    return (
        <>
            <img {...props} src="/brand/fbs-pay-light.png" alt="FBS Pay" className={`${className} object-contain dark:hidden`} />
            <img {...props} src="/brand/fbs-pay-dark.png" alt="FBS Pay" className={`${className} hidden object-contain dark:block`} />
        </>
    );
}
