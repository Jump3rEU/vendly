# 🚀 VENDLY - Spuštění projektu

## ✅ RYCHLÝ START

### 1️⃣ NEJJEDNODUŠŠÍ ZPŮSOB (Windows)

Dvakrát klikněte na:
```
install.bat          # Nejdřív nainstaluje závislosti
start-vendly.bat     # Pak spustí projekt
```

### 2️⃣ MANUÁLNÍ ZPŮSOB

```bash
# 1. Instalace
npm install

# 2. Spuštění dev serveru
npm run dev

# 3. Otevřete prohlížeč
http://localhost:3000
```

---

## 📱 TESTOVÁNÍ NA MOBILECH

### Na stejné síti (Wi-Fi):

1. Zjistěte IP adresu počítače:
   ```bash
   ipconfig
   ```
   Hledejte "IPv4 Address", např.: `192.168.1.100`

2. Na mobilu otevřete:
   ```
   http://192.168.1.100:3000
   ```

### Responsivní testování v prohlížeči:

- **Chrome**: F12 → Ikona telefonu (Ctrl+Shift+M)
- **Firefox**: F12 → Responsive Design Mode (Ctrl+Shift+M)

---

## 🏗️ STRUKTURA PROJEKTU

```
vendly/
├── app/                          # Next.js App Router
│   ├── layout.tsx               # Globální layout s Header/Footer
│   ├── page.tsx                 # Landing page
│   ├── globals.css              # Globální styly
│   │
│   ├── inzeraty/                # Browse listings
│   │   └── page.tsx
│   │
│   ├── inzerat/[id]/            # Detail inzerátu
│   │   └── page.tsx
│   │
│   ├── prodat/                  # Sell flow s právními kontrolami
│   │   └── page.tsx
│   │
│   ├── kosik/                   # Checkout + escrow vysvětlení
│   │   └── page.tsx
│   │
│   ├── profil/                  # User profile + trust score
│   │   └── page.tsx
│   │
│   ├── jak-to-funguje/          # How it works
│   │   └── page.tsx
│   │
│   └── pravni/                  # Všechny právní dokumenty
│       ├── obchodni-podminky/
│       ├── ochrana-osobnich-udaju/
│       ├── pravidla-trziste/
│       ├── platby-a-escrow/
│       └── cookies/
│
├── components/
│   ├── layout/                  # Layout komponenty
│   │   ├── Header.tsx          # Sticky header s navigací
│   │   └── Footer.tsx          # Footer s právními odkazy
│   │
│   ├── ui/                      # UI komponenty
│   │   ├── Button.tsx
│   │   ├── CategoryCard.tsx
│   │   ├── ListingCard.tsx
│   │   └── SellerCard.tsx
│   │
│   └── trust/                   # Trust & bezpečnost
│       ├── TrustBadge.tsx
│       ├── VerifiedBadge.tsx
│       └── EscrowExplanation.tsx
│
├── start-vendly.bat            # 🚀 HLAVNÍ SPOUŠTĚCÍ SOUBOR
├── start-production.bat        # Production build
├── install.bat                 # Instalace závislostí
├── package.json
├── tailwind.config.js
├── tsconfig.json
└── README.md
```

---

## 🎨 DESIGN SYSTÉM

### Barvy (Tailwind)

```css
primary-600     # Hlavní modrá
trust-600       # Zelená (důvěra)
warning-500     # Oranžová (upozornění)
danger-500      # Červená (nebezpečí)
```

### Komponenty

- **Button**: `primary`, `secondary`, `outline`, `white`, `danger`
- **Touch targets**: Min. 44px (mobilní přístupnost)
- **Focus rings**: Vždy viditelné pro klávesnici
- **Responsive**: Mobile-first přístup

---

## ⚖️ PRÁVNÍ OCHRANA

### ✅ IMPLEMENTOVÁNO:

1. **Obchodní podmínky**
   - Role platformy jasně definována
   - Omezení odpovědnosti
   - Práva platformy zadržet platby

2. **Privacy Policy (GDPR)**
   - Transparentní zpracování dat
   - Práva uživatelů
   - Minimální cookies

3. **Pravidla tržiště**
   - Kompletní seznam zakázaných položek
   - Sankce za porušení
   - Spolupráce s orgány

4. **Platby & Escrow**
   - Detailní vysvětlení escrow systému
   - Role Vendly v platbách
   - Scénáře vrácení peněz

5. **Cookie Policy**
   - Minimální použití
   - Žádné tracking třetích stran

### 🔒 Právní disclaimery jsou všude:

- ✅ Landing page (footer)
- ✅ Detail inzerátu (velké upozornění)
- ✅ Sell flow (povinné checkboxy)
- ✅ Checkout (jasné vysvětlení escrow)
- ✅ Footer každé stránky

---

## 📱 MOBILE-READY

### Testováno pro:
- ✅ iOS Safari
- ✅ Android Chrome
- ✅ Tablety
- ✅ Desktop (všechny rozlišení)

### Features:
- ✅ Safe area insets (notch podporovaný)
- ✅ Touch targets 44px+
- ✅ Hamburger menu na mobilu
- ✅ Responsive images
- ✅ Mobile-first grid systém

---

## 🔥 PRODUCTION BUILD

```bash
# Způsob 1: Batch soubor
start-production.bat

# Způsob 2: Manuálně
npm run build
npm run start
```

---

## 🚀 DEPLOYMENT

### Vercel (Doporučeno):
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

### Vlastní server:
```bash
npm run build
npm run start
# Server běží na portu 3000
```

---

## 🛡️ BEZPEČNOST

### Implementované funkce:
- ✅ HTTPS/SSL ready
- ✅ CSRF protection (připraveno)
- ✅ XSS protection (React default)
- ✅ Content Security Policy ready
- ✅ Rate limiting (připraveno pro API)

---

## 🎯 CO DĚLAT TEĎ

### 1. Otestujte základní flow:
   - [ ] Landing page
   - [ ] Browse inzerátů
   - [ ] Detail inzerátu
   - [ ] Vytvoření inzerátu
   - [ ] Checkout
   - [ ] Profil

### 2. Přečtěte si právní stránky:
   - [ ] `/pravni/obchodni-podminky`
   - [ ] `/pravni/platby-a-escrow`
   - [ ] Zkontrolujte disclaimery

### 3. Testujte na mobilu:
   - [ ] Otevřete na telefonu
   - [ ] Zkontrolujte touch targets
   - [ ] Otestujte navigaci

---

## 📝 TODO (Pro produkci)

### Implementovat:
- [ ] Backend API (autentizace)
- [ ] Databáze (PostgreSQL/MongoDB)
- [ ] Platební brána integrace
- [ ] Upload obrázků (cloudinary/S3)
- [ ] E-mail notifikace
- [ ] Real-time chat
- [ ] Push notifikace

### Právní:
- [ ] Schválení právníkem (CZ/EU)
- [ ] IČO a sídlo společnosti
- [ ] GDPR officer kontakt
- [ ] Registrace DPH

---

## 🆘 POMOC

### Nefunguje npm install?
- Zkontrolujte Node.js: `node --version` (min. v18)
- Stáhněte: https://nodejs.org/

### Port 3000 již používán?
```bash
# Změňte v package.json nebo:
npx next dev -p 3001
```

### Chyby v Tailwind?
```bash
npm install -D tailwindcss postcss autoprefixer
```

---

## 🎉 HOTOVO!

Váš Vendly marketplace je připraven k testování.

**Pro spuštění:** `start-vendly.bat`
**Pro dokumentaci:** Tento soubor
**Pro právní info:** `/pravni/*`

---

© 2026 Vendly - Made with ❤️ in Czech Republic
