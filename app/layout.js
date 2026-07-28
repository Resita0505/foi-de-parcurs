import './globals.css';

export const metadata = {
  title: 'Foi de Parcurs',
  description: 'Aplicație de gestiune flotă auto',
};

export default function RootLayout({ children }) {
  return (
    <html lang="ro">
      <body>{children}</body>
    </html>
  );
}
