import { Metadata } from 'next'
import { Shield, Lock, Users, Clock } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Jak to funguje - Vendly',
}

export default function JakToFungujePage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="safe-container">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Jak funguje Vendly?
            </h1>
            <p className="text-xl text-gray-600">
              Bezpečný prodej a nákup v několika krocích
            </p>
          </div>

          {/* Pro kupující */}
          <section className="bg-white rounded-xl p-8 shadow-sm border border-gray-200 mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center gap-3">
              <span className="text-4xl">🛍️</span>
              Pro kupující
            </h2>

            <div className="space-y-6">
              <Step 
                number={1}
                title="Najděte si, co hledáte"
                description="Procházejte tisíce inzerátů, filtrujte podle kategorie, ceny nebo lokality. Všechno na jednom místě."
              />
              <Step 
                number={2}
                title="Kontaktujte prodávajícího"
                description="Zeptejte se na detaily, domluvte si osobní předání nebo doručení. Vše přes bezpečnou platformu."
              />
              <Step 
                number={3}
                title="Zaplaťte bezpečně"
                description="Peníze zaplatíte přes Vendly. My je držíme v bezpečí, dokud zboží nepřevezmete."
              />
              <Step 
                number={4}
                title="Převezměte a zkontrolujte"
                description="Při osobním předání si zboží důkladně prohlédněte. Zkontrolujte, že odpovídá popisu."
              />
              <Step 
                number={5}
                title="Potvrďte převzetí"
                description="Po převzetí a kontrole potvrdíte v aplikaci, že je vše v pořádku. Peníze pak uvolníme prodejci."
              />
            </div>

            <div className="bg-trust-100 rounded-lg p-6 mt-8">
              <div className="flex gap-3">
                <Shield className="w-6 h-6 text-trust-700 flex-shrink-0" />
                <div>
                  <h3 className="font-bold text-trust-900 mb-2">
                    Vaše peníze jsou v bezpečí
                  </h3>
                  <p className="text-sm text-trust-800 leading-relaxed">
                    Pokud zboží neodpovídá popisu nebo prodávající nepředá zboží, 
                    peníze vám vrátíme. Žádné riziko!
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Pro prodávající */}
          <section className="bg-white rounded-xl p-8 shadow-sm border border-gray-200 mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center gap-3">
              <span className="text-4xl">💰</span>
              Pro prodávající
            </h2>

            <div className="space-y-6">
              <Step 
                number={1}
                title="Vytvořte inzerát"
                description="Nafotit, popsat, nastavit cenu. Trvá to pár minut. Buďte upřímní a detailní."
              />
              <Step 
                number={2}
                title="Komunikujte s kupujícími"
                description="Odpovídejte na dotazy, domluvte si předání. Rychlá komunikace = rychlejší prodej."
              />
              <Step 
                number={3}
                title="Předejte zboží"
                description="Osobně na veřejném místě nebo poštou. Označte v systému, že jste zboží předali."
              />
              <Step 
                number={4}
                title="Počkejte na potvrzení"
                description="Kupující potvrdí převzetí. Pokud to neudělá do 7 dnů, peníze dostanete automaticky."
              />
              <Step 
                number={5}
                title="Obdržte peníze"
                description="Peníze přijdou na váš účet do 2 pracovních dnů od potvrzení."
              />
            </div>

            <div className="bg-primary-50 rounded-lg p-6 mt-8">
              <div className="flex gap-3">
                <Lock className="w-6 h-6 text-primary-700 flex-shrink-0" />
                <div>
                  <h3 className="font-bold text-primary-900 mb-2">
                    Jistota platby
                  </h3>
                  <p className="text-sm text-primary-800 leading-relaxed">
                    Kupující už zaplatil, takže máte jistotu, že dostanete peníze. 
                    Žádné "zaplatím až přijdu" nebo falešné převody.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Escrow vysvětlení */}
          <section className="bg-gradient-to-br from-primary-600 to-primary-700 text-white rounded-xl p-8 shadow-lg mb-8">
            <div className="text-center mb-8">
              <Shield className="w-16 h-16 mx-auto mb-4 opacity-90" />
              <h2 className="text-3xl font-bold mb-3">
                Co je to escrow systém?
              </h2>
              <p className="text-primary-100 text-lg">
                Chytrý způsob, jak ochránit obě strany
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              <EscrowCard 
                icon={<Lock className="w-8 h-8" />}
                title="Kupující platí"
                description="Peníze jdou nejdřív k nám, ne přímo prodejci"
              />
              <EscrowCard 
                icon={<Shield className="w-8 h-8" />}
                title="My držíme"
                description="Peníze jsou v bezpečí, dokud se nedohodne předání"
              />
              <EscrowCard 
                icon={<Users className="w-8 h-8" />}
                title="Všichni spokojeni"
                description="Prodejce ví, že je zaplaceno, kupující že jsou peníze v bezpečí"
              />
            </div>
          </section>

          {/* FAQ */}
          <section className="bg-white rounded-xl p-8 shadow-sm border border-gray-200">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              Časté otázky
            </h2>

            <div className="space-y-6">
              <FAQ 
                question="Kolik stojí použití Vendly?"
                answer="Pro prodávající je vytvoření inzerátu zdarma. Poplatek 1% z hodnoty transakce (min. 10 Kč) platí kupující při nákupu. To je vše!"
              />
              <FAQ 
                question="Co když zboží neodpovídá popisu?"
                answer="Pokud zboží neodpovídá popisu, nepotvrzujte převzetí a kontaktujte podporu. Peníze vám vrátíme."
              />
              <FAQ 
                question="Kdy obdržím peníze jako prodávající?"
                answer="Peníze obdržíte do 2 pracovních dnů poté, co kupující potvrdí převzetí, nebo automaticky po 7 dnech, pokud kupující nenamítá."
              />
              <FAQ 
                question="Je Vendly bezpečné?"
                answer="Ano! Používáme escrow systém, šifrovaná data, ověření uživatelů a máme tým, který kontroluje podezřelé aktivity."
              />
              <FAQ 
                question="Mohu zrušit objednávku?"
                answer="Kupující může zrušit do 24 hodin po zaplacení, pokud prodávající ještě neoznačil předání. Poté je nutné se domluvit s prodávajícím."
              />
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}

function Step({ number, title, description }: any) {
  return (
    <div className="flex gap-4">
      <div className="flex-shrink-0 w-10 h-10 bg-primary-600 text-white rounded-full flex items-center justify-center font-bold text-lg">
        {number}
      </div>
      <div>
        <h3 className="font-semibold text-gray-900 text-lg mb-1">{title}</h3>
        <p className="text-gray-600">{description}</p>
      </div>
    </div>
  )
}

function EscrowCard({ icon, title, description }: any) {
  return (
    <div className="text-center">
      <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 rounded-xl mb-4">
        {icon}
      </div>
      <h3 className="font-semibold text-lg mb-2">{title}</h3>
      <p className="text-primary-100 text-sm">{description}</p>
    </div>
  )
}

function FAQ({ question, answer }: any) {
  return (
    <div className="border-b border-gray-200 last:border-0 pb-6 last:pb-0">
      <h3 className="font-semibold text-gray-900 text-lg mb-2">{question}</h3>
      <p className="text-gray-600">{answer}</p>
    </div>
  )
}
