import Link from 'next/link'
import { Shield } from 'lucide-react'

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-gray-900 text-gray-300 mt-auto border-t border-gray-800">
      <div className="safe-container py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand with improved visual presence */}
          <div className="col-span-1">
            <div className="flex items-center gap-2.5 mb-5">
              <div className="w-9 h-9 bg-gradient-to-br from-primary-400 to-primary-600 rounded-xl flex items-center justify-center shadow-soft">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-white">Vendly</span>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed">
              Bezpečný lokální prodej.<br />Peníze v klidu.
            </p>
          </div>

          {/* O platformě with better spacing */}
          <div>
            <h3 className="font-bold text-white mb-4">O platformě</h3>
            <ul className="space-y-3 text-sm">
              <li>
                <Link href="/jak-to-funguje" className="hover:text-primary-400 transition-smooth inline-block">
                  Jak to funguje
                </Link>
              </li>
              <li>
                <Link href="/o-nas" className="hover:text-primary-400 transition-smooth inline-block">
                  O nás
                </Link>
              </li>
              <li>
                <Link href="/kontakt" className="hover:text-primary-400 transition-smooth inline-block">
                  Kontakt
                </Link>
              </li>
            </ul>
          </div>

          {/* Právní informace (IMPORTANT) with better spacing */}
          <div>
            <h3 className="font-bold text-white mb-4">Právní informace</h3>
            <ul className="space-y-3 text-sm">
              <li>
                <Link href="/pravni/obchodni-podminky" className="hover:text-primary-400 transition-smooth inline-block">
                  Obchodní podmínky
                </Link>
              </li>
              <li>
                <Link href="/pravni/ochrana-osobnich-udaju" className="hover:text-primary-400 transition-smooth inline-block">
                  Ochrana osobních údajů
                </Link>
              </li>
              <li>
                <Link href="/pravni/pravidla-trziste" className="hover:text-primary-400 transition-smooth inline-block">
                  Pravidla tržiště
                </Link>
              </li>
              <li>
                <Link href="/pravni/platby-a-escrow" className="hover:text-primary-400 transition-smooth inline-block">
                  Platby a escrow
                </Link>
              </li>
              <li>
                <Link href="/pravni/cookies" className="hover:text-primary-400 transition-smooth inline-block">
                  Soubory cookies
                </Link>
              </li>
            </ul>
          </div>

          {/* Důvěra a bezpečnost */}
          <div>
            <h3 className="font-bold text-white mb-4">Důvěra</h3>
            <ul className="space-y-3 text-sm">
              <li>
                <Link href="/bezpecnost" className="hover:text-primary-400 transition-smooth inline-block">
                  Jak jsme zabezpečeni
                </Link>
              </li>
              <li>
                <Link href="/pomoc" className="hover:text-primary-400 transition-smooth inline-block">
                  Centrum nápovědy
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Legal disclaimer (CRITICAL) with improved visual hierarchy */}
        <div className="mt-16 pt-10 border-t border-gray-800">
          <div className="bg-gray-800 rounded-xl p-6 mb-8 border border-gray-700 shadow-inner-soft">
            <p className="text-sm text-gray-400 leading-relaxed">
              <strong className="text-gray-200">Důležité upozornění:</strong> Vendly je zprostředkovatelská platforma pro propojení kupujících a prodávajících. 
              Vendly není prodávajícím ani kupujícím zboží. Vendly neposkytuje záruku za stav, kvalitu nebo popis nabízeného zboží. 
              Odpovědnost za popis položky nese prodávající. Odpovědnost za akceptaci nese kupující. 
              Vendly dočasně drží platby v rámci escrow systému pro zajištění bezpečnosti transakce.
            </p>
          </div>

          <div className="flex flex-col md:flex-row justify-between items-center gap-5 text-sm text-gray-500">
            <p className="font-medium">© {currentYear} Vendly. Všechna práva vyhrazena.</p>
            <p>Made with ❤️ in Czech Republic</p>
          </div>
        </div>
      </div>
    </footer>
  )
}
