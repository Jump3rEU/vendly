# Vendly

**Bezpečný lokální prodej. Peníze v klidu.**

Moderní český marketplace postavený na Next.js s maximální důvěrou, právní ochranou a světové úrovně designem.

## 🚀 Rychlý start (Localhost)

### Windows - jednoduše:
1. Dvakrát klikněte na **`start-vendly.bat`**
2. Počkejte na spuštění
3. Otevřete prohlížeč na: `http://localhost:3000`

### Nebo manuálně:
```bash
npm install
npm run dev
```

## 📱 Responsive design
- Mobilní telefony (iOS, Android)
- Tablety
- Desktopy
- Připraveno pro native aplikace

## 🔒 Právní ochrana
- ToS (Obchodní podmínky)
- Privacy Policy (GDPR compliant)
- Pravidla tržiště
- Escrow vysvětlení
- Cookie Policy

## 🛠 Tech Stack
- **Next.js 14** (App Router)
- **React 18**
- **TypeScript**
- **Tailwind CSS**
- **Lucide React Icons**

## 📁 Struktura

```
app/
├── layout.tsx              # Globální layout
├── page.tsx                # Landing page
├── inzeraty/               # Browse listings
├── inzerat/[id]/           # Detail inzerátu
├── prodat/                 # Sell flow
├── kosik/                  # Checkout
├── profil/                 # User profile
├── pravni/                 # Právní stránky
components/
├── layout/                 # Header, Footer, Navigation
├── ui/                     # Buttons, Cards, Badges
└── trust/                  # Trust indicators
```

## 🌍 Production deployment
```bash
npm run build
npm run start
```

Nebo použijte: **`start-production.bat`**

---

**© 2026 Vendly** • Made with ❤️ in Czech Republic
