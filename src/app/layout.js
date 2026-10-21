import './globals.css';
import { Providers } from '@/lib/providers.js';

export const metadata = {
  title: 'Faculty Feedback & Intelligence Portal',
  description: 'Institutional faculty feedback, automated reminder escalation, technical anonymity, and AI-powered academic insights.',
  keywords: ['faculty feedback', 'higher education', 'teaching evaluation', 'academic intelligence']
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full bg-slate-50 text-slate-900 antialiased font-sans">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
