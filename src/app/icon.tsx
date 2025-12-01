import { ImageResponse } from 'next/og';

// Image metadata
export function generateImageMetadata() {
    return [
        {
            contentType: 'image/png',
            size: { width: 32, height: 32 },
            id: 'small',
        },
        {
            contentType: 'image/png',
            size: { width: 192, height: 192 },
            id: 'medium',
        },
        {
            contentType: 'image/png',
            size: { width: 512, height: 512 },
            id: 'large',
        },
    ];
}

// Image generation
export default function Icon({ id }: { id: string }) {
    const size = id === 'small' ? 32 : id === 'medium' ? 192 : 512;
    const fontSize = Math.floor(size * 0.75);
    const radius = Math.floor(size * 0.15);

    return new ImageResponse(
        (
            <div
                style={{
                    fontSize: fontSize,
                    background: '#fbbf24', // Safety Yellow
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'black',
                    borderRadius: radius,
                    fontWeight: 800
                }}
            >
                MU
            </div>
        ),
        {
            width: size,
            height: size,
        }
    );
}
