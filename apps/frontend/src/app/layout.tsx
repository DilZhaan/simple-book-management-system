import './global.css';
import { AuthProvider } from './_context/AuthContext';
import Header from './_components/header';

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
          <Header />
          <main>{children}</main>
        </AuthProvider>
      </body>
    </html>
  );
}
