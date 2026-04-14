import dynamic from 'next/dynamic';
import { styled, Box } from '@mui/material';

// Import Lottie dynamically with SSR disabled
const Lottie = dynamic(() => import('lottie-react'), {
    ssr: false,
});

const Loader = () => {
    return (
        <LoaderLayout>
            {typeof window !== 'undefined' && (
                <Lottie
                    animationData={require('@/assets/lottie/Loader-Transparent-Json.json')}
                    loop={false}
                    style={{
                        height: '100%',
                        width: '100%',
                        objectFit: 'cover',
                        borderRadius: '2.4rem',
                    }}
                />
            )}
        </LoaderLayout>
    );
};

export default dynamic(() => Promise.resolve(Loader), {
    ssr: false,
});

const LoaderLayout = styled(Box)(({ theme }) => ({
    flex: 1,
    flexGrow: 1,
    width: '100%',
    height: '100%',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
}));
