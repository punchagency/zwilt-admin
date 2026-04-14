import type { AppProps } from 'next/app';
import type { NextPage } from 'next';
import { RecoilRoot } from 'recoil';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Layout from '@/components/layouts/Layout';
import AppTheme from '@/theme/AppTheme';
import { initializeApollo, ApolloProviderWrapper } from '@/lib/with-apollo';
import AuthGuard from '@/components/common/AuthGuard';
import { UserProvider } from '@/contexts/UserContext';
import ErrorBoundary from '@/components/common/ErrorBoundary';

type ZwiltPage<P = {}> = NextPage<P> & {
    requireAuth?: boolean;
};

interface ZwiltAdminAppProps extends AppProps {
    Component: ZwiltPage;
}

export default function App({ Component, pageProps }: ZwiltAdminAppProps) {
    const getLayout =
        (Component as any).getLayout ||
        ((page: any) => <Layout>{page}</Layout>);

    return (
        <ErrorBoundary>
            <RecoilRoot>
                <AppTheme>
                    <ApolloProviderWrapper>
                        <UserProvider>
                            {Component.requireAuth !== false ? (
                                <AuthGuard>
                                    {getLayout(<Component {...pageProps} />)}
                                </AuthGuard>
                            ) : (
                                getLayout(<Component {...pageProps} />)
                            )}
                        </UserProvider>
                    </ApolloProviderWrapper>
                </AppTheme>
            </RecoilRoot>
            <ToastContainer
                position="top-right"
                autoClose={4000}
                hideProgressBar={false}
                newestOnTop
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="light"
            />
        </ErrorBoundary>
    );
}
