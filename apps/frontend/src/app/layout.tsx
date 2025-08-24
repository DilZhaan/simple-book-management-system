import './assets/global.css';
import './assets/shared-background.css';
import { AuthProvider } from './_context/AuthContext';
import Header from './_components/header';
import BackgroundWrapper from './_components/BackgroundWrapper';

export const metadata = {
  title: 'Simple Book Management System',
  description: 'A simple book management system with user authentication',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <BackgroundWrapper className="page-wrapper">
            <Header />
            <main>{children}</main>
          </BackgroundWrapper>
        </AuthProvider>
      </body>
    </html>
  );
}
