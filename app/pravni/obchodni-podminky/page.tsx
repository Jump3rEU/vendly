import { Metadata } from 'next'
import { Shield, AlertTriangle } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Obchodní podmínky - Vendly',
}

export default function ObchodniPodminkyPage() {
  return (
    <div className="min-h-screen bg-white py-12">
      <div className="safe-container">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Obchodní podmínky
            </h1>
            <p className="text-gray-600">
              Platné od 1. ledna 2026 • Verze 1.0
            </p>
          </div>

          {/* Important Notice */}
          <div className="bg-primary-50 border-2 border-primary-500 rounded-xl p-6 mb-8">
            <div className="flex gap-3">
              <Shield className="w-6 h-6 text-primary-600 flex-shrink-0" />
              <div>
                <h2 className="font-bold text-primary-900 mb-2">
                  Vendly je zprostředkovatelská platforma
                </h2>
                <p className="text-sm text-primary-800 leading-relaxed">
                  Vendly propojuje kupující a prodávající, ale není prodávajícím ani kupujícím zboží. 
                  Poskytujeme technickou infrastrukturu a escrow systém pro bezpečné transakce.
                </p>
              </div>
            </div>
          </div>

          <div className="prose prose-lg max-w-none">
            <Section title="1. Základní ustanovení">
              <p>
                Tyto obchodní podmínky (dále jen "Podmínky") upravují vztah mezi provozovatelem 
                platformy Vendly (dále jen "Platforma" nebo "Vendly") a uživateli platformy 
                (dále jen "Uživatel", "Kupující" nebo "Prodávající").
              </p>
              <p>
                <strong>Provozovatel:</strong><br />
                Vendly s.r.o.<br />
                IČO: 12345678<br />
                Sídlo: Praha 1, Česká republika<br />
                E-mail: info@vendly.cz
              </p>
            </Section>

            <Section title="2. Role platformy (KRITICKÉ)">
              <div className="bg-warning-100 border-l-4 border-warning-500 p-4 my-4">
                <div className="flex gap-3">
                  <AlertTriangle className="w-5 h-5 text-warning-700 flex-shrink-0" />
                  <div className="text-sm text-warning-800">
                    <strong>Důležité upozornění:</strong> Vendly není stranou kupní smlouvy 
                    mezi Kupujícím a Prodávajícím.
                  </div>
                </div>
              </div>

              <p><strong>Vendly NENÍ:</strong></p>
              <ul>
                <li>Prodávající zboží nabízeného na platformě</li>
                <li>Kupující zboží na platformě</li>
                <li>Poskytovatel záruky na kvalitu nebo stav zboží</li>
                <li>Přepravní společnost</li>
                <li>Bankovní instituce</li>
              </ul>

              <p><strong>Vendly JE:</strong></p>
              <ul>
                <li>Zprostředkovatelská platforma propojující kupující a prodávající</li>
                <li>Poskytovatel technické infrastruktury pro inzeráty</li>
                <li>Dočasný držitel plateb v rámci escrow systému</li>
                <li>Poskytovatel nástrojů pro komunikaci mezi uživateli</li>
                <li>Mediátor v případě sporů (bez právní odpovědnosti za výsledek)</li>
              </ul>
            </Section>

            <Section title="3. Odpovědnost prodávajících">
              <p>
                <strong>Prodávající je plně odpovědný za:</strong>
              </p>
              <ul>
                <li>Pravdivost a úplnost popisu nabízeného zboží</li>
                <li>Stav, kvalitu a funkčnost zboží</li>
                <li>Vlastnictví nebo oprávnění k prodeji zboží</li>
                <li>Dodržování zákonů České republiky a EU</li>
                <li>Komunikaci s kupujícím</li>
                <li>Předání zboží kupujícímu</li>
              </ul>

              <p>
                <strong>Prodávající prohlašuje, že:</strong>
              </p>
              <ul>
                <li>Je vlastníkem zboží nebo má právo je prodat</li>
                <li>Zboží není kradené, padělané ani jinak získané nelegálně</li>
                <li>Popis zboží odpovídá skutečnosti</li>
                <li>Neprodává zakázané položky (viz bod 5)</li>
              </ul>
            </Section>

            <Section title="4. Odpovědnost kupujících">
              <p>
                <strong>Kupující je odpovědný za:</strong>
              </p>
              <ul>
                <li>Přečtení a pochopení popisu zboží před koupí</li>
                <li>Komunikaci s prodávajícím ohledně nejasností</li>
                <li>Kontrolu zboží při převzetí</li>
                <li>Potvrzení převzetí v systému Vendly</li>
                <li>Platbu za zboží prostřednictvím platformy</li>
              </ul>

              <p>
                <strong>Kupující bere na vědomí, že:</strong>
              </p>
              <ul>
                <li>Vendly neposkytuje záruku na zakoupené zboží</li>
                <li>Odpovědnost za stav zboží nese prodávající</li>
                <li>Kontrola zboží před potvrzením převzetí je v jeho zájmu</li>
              </ul>
            </Section>

            <Section title="5. Zakázané položky">
              <p>
                <strong>Na platformě je zakázán prodej:</strong>
              </p>
              <ul>
                <li>Zbraní, střeliva, výbušnin</li>
                <li>Drog a psychotropních látek</li>
                <li>Padělků a pirátského softwaru</li>
                <li>Ukradeného zboží</li>
                <li>Nebezpečných chemikálií</li>
                <li>Živých zvířat</li>
                <li>Lidských orgánů a částí těla</li>
                <li>Pornografického materiálu</li>
                <li>Služeb sexuální povahy</li>
                <li>Materiálů podporujících násilí nebo terorismus</li>
              </ul>

              <p>
                <strong>Sankce:</strong> Porušení tohoto ustanovení vede k okamžitému zablokování 
                účtu a nahlášení příslušným orgánům.
              </p>
            </Section>

            <Section title="6. Escrow systém a platby">
              <p>
                <strong>Jak funguje escrow:</strong>
              </p>
              <ol>
                <li>Kupující zaplatí prostřednictvím platformy</li>
                <li>Vendly dočasně drží peníze jako nezávislý prostředník</li>
                <li>Prodávající předá zboží kupujícímu</li>
                <li>Kupující potvrdí převzetí a spokojenost</li>
                <li>Vendly uvolní peníze prodávajícímu</li>
              </ol>

              <p>
                <strong>Důležité:</strong>
              </p>
              <ul>
                <li>Vendly není banka - pouze dočasně drží prostředky</li>
                <li>Peníze jsou uvolněny po potvrzení kupujícího nebo po uplynutí lhůty</li>
                <li>Vendly si vyhrazuje právo zadržet platbu v případě sporu</li>
                <li>Vendly si vyhrazuje právo vrátit platbu v případě podvodu</li>
              </ul>

              <p>
                <strong>Poplatek platformy:</strong> 1% z hodnoty transakce, min. 10 Kč
              </p>
            </Section>

            <Section title="7. Řešení sporů">
              <p>
                V případě sporu mezi kupujícím a prodávajícím:
              </p>
              <ul>
                <li>Vendly může nabídnout mediaci (bez záruky výsledku)</li>
                <li>Vendly může zadržet platbu do vyřešení sporu</li>
                <li>Vendly není povinna rozhodovat spor</li>
                <li>Konečné rozhodnutí je na uživatelích nebo soudu</li>
                <li>Vendly nezodpovídá za výsledek sporu</li>
              </ul>
            </Section>

            <Section title="8. Omezení odpovědnosti platformy">
              <p className="font-bold">
                Vendly NEODPOVÍDÁ za:
              </p>
              <ul>
                <li>Kvalitu, stav nebo funkčnost nabízeného zboží</li>
                <li>Pravdivost popisů inzerátů</li>
                <li>Jednání prodávajících nebo kupujících</li>
                <li>Ztráty vzniklé z transakcí mezi uživateli</li>
                <li>Nedodání zboží prodávajícím</li>
                <li>Poškození zboží při přepravě</li>
                <li>Technické problémy mimo kontrolu Vendly</li>
              </ul>

              <p>
                <strong>Maximální odpovědnost Vendly je omezena na výši poplatku 
                zaplaceného za konkrétní transakci.</strong>
              </p>
            </Section>

            <Section title="9. Zákaz obcházení platformy">
              <p>
                Uživatelé se zavazují:
              </p>
              <ul>
                <li>Provádět všechny platby pouze přes platformu Vendly</li>
                <li>Neobcházet escrow systém</li>
                <li>Nepoužívat platformu pouze k získání kontaktů</li>
              </ul>

              <p>
                <strong>Porušení vede k:</strong>
              </p>
              <ul>
                <li>Ztrátě práva na ochranu platformy</li>
                <li>Zablokování účtu</li>
                <li>Ztrátě nároku na podporu v případě sporu</li>
              </ul>
            </Section>

            <Section title="10. Suspendace a zablokování účtu">
              <p>
                <strong>Vendly může pozastavit nebo zablokovat účet v případě:</strong>
              </p>
              <ul>
                <li>Porušení těchto Podmínek</li>
                <li>Podezření z podvodného jednání</li>
                <li>Prodeje zakázaných položek</li>
                <li>Opakovaných stížností uživatelů</li>
                <li>Žádosti orgánů činných v trestním řízení</li>
              </ul>

              <p>
                <strong>Při zablokování účtu:</strong>
              </p>
              <ul>
                <li>Nedokončené transakce budou zrušeny</li>
                <li>Peníze v escrow budou vráceny nebo zadrženy podle situace</li>
                <li>Uživatel ztrácí přístup k platformě</li>
              </ul>
            </Section>

            <Section title="11. Právo platformy zadržet nebo vrátit platbu">
              <p>
                <strong>Vendly má právo:</strong>
              </p>
              <ul>
                <li>Zadržet platbu v případě podezření z podvodu</li>
                <li>Vrátit platbu kupujícímu v případě prokázaného podvodu</li>
                <li>Nevydat platbu prodávajícímu při porušení Podmínek</li>
                <li>Spolupracovat s orgány činnými v trestním řízení</li>
              </ul>
            </Section>

            <Section title="12. Rozhodné právo">
              <p>
                <strong>Tyto Podmínky se řídí právem České republiky a Evropské unie.</strong>
              </p>
              <p>
                Spory budou řešeny příslušnými soudy České republiky.
              </p>
            </Section>

            <Section title="13. Závěrečná ustanovení">
              <p>
                Vendly si vyhrazuje právo změnit tyto Podmínky. Uživatelé budou informováni 
                e-mailem a musí potvrdit souhlas s novými podmínkami.
              </p>
              <p>
                Používáním platformy uživatel potvrzuje, že se seznámil s těmito Podmínkami 
                a souhlasí s nimi.
              </p>
              <p className="font-bold mt-8">
                Poslední aktualizace: 1. ledna 2026
              </p>
            </Section>
          </div>
        </div>
      </div>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-4">{title}</h2>
      {children}
    </section>
  )
}
