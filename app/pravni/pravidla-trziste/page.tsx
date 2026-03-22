import { Metadata } from 'next'
import { AlertTriangle, ShieldOff, Ban } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Pravidla tržiště - Vendly',
}

export default function PravidlaTrzistePage() {
  return (
    <div className="min-h-screen bg-white py-12">
      <div className="safe-container">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Pravidla tržiště
            </h1>
            <p className="text-gray-600">
              Co lze a nelze prodávat na Vendly
            </p>
          </div>

          {/* Warning */}
          <div className="bg-danger-100 border-2 border-danger-500 rounded-xl p-6 mb-8">
            <div className="flex gap-3">
              <AlertTriangle className="w-6 h-6 text-danger-700 flex-shrink-0" />
              <div>
                <h2 className="font-bold text-danger-900 mb-2">
                  Porušení pravidel má vážné následky
                </h2>
                <p className="text-sm text-danger-800 leading-relaxed">
                  Prodej zakázaných položek nebo porušení pravidel vede k okamžitému 
                  zablokování účtu a může být nahlášeno orgánům činným v trestním řízení.
                </p>
              </div>
            </div>
          </div>

          <div className="prose prose-lg max-w-none">
            <Section title="1. Obecná pravidla chování">
              <p>
                <strong>Na platformě Vendly je vyžadováno:</strong>
              </p>
              <ul>
                <li>Slušné a respektující jednání vůči ostatním uživatelům</li>
                <li>Pravdivé a úplné popisy nabízeného zboží</li>
                <li>Dodržování zákonů České republiky a EU</li>
                <li>Odpovědné chování jako prodávající nebo kupující</li>
                <li>Komunikace pouze prostřednictvím platformy</li>
                <li>Provádění plateb pouze přes Vendly</li>
              </ul>
            </Section>

            <Section title="2. Zakázané položky (KOMPLETNÍ SEZNAM)">
              <ForbiddenCategory 
                title="Zbraně a nebezpečné předměty"
                items={[
                  'Střelné zbraně všeho druhu',
                  'Střelivo a výbušniny',
                  'Chladné zbraně (nože, meče atd.)',
                  'Zneškodněné zbraně',
                  'Airsoftové a paintballové zbraně realistického vzhledu',
                  'Paralyzéry a elektrošokové zbraně',
                  'Pepřové spreje nad povolenou koncentraci',
                  'Samostříly a luky vysokého výkonu'
                ]}
              />

              <ForbiddenCategory 
                title="Drogy a psychotropní látky"
                items={[
                  'Nelegální drogy všech druhů',
                  'Marihuána a cannabis produkty',
                  'Předchůdci drog',
                  'Psychoaktivní houby',
                  'Syntetické drogy',
                  'Léky na předpis (bez lékařského předpisu)',
                  'Předměty výslovně určené k užívání drog'
                ]}
              />

              <ForbiddenCategory 
                title="Padělaný a pirátský obsah"
                items={[
                  'Padělky značkového zboží',
                  'Pirátský software',
                  'Nelegální kopie her, filmů, hudby',
                  'Falešné doklady',
                  'Padělané peníze',
                  'Produkty porušující autorská práva'
                ]}
              />

              <ForbiddenCategory 
                title="Ukradené zboží"
                items={[
                  'Jakékoliv zboží, o kterém víte nebo tušíte, že je ukradené',
                  'Zboží bez dokladu o původu (u elektroniky vyšší hodnoty)',
                  'Registrační značky a doklady vozidel'
                ]}
              />

              <ForbiddenCategory 
                title="Živé bytosti"
                items={[
                  'Živá zvířata',
                  'Ohrožené druhy (živé i vycpané)',
                  'Části těl chráněných živočichů',
                  'Exotická zvířata'
                ]}
              />

              <ForbiddenCategory 
                title="Lidské tělo a orgány"
                items={[
                  'Lidské orgány',
                  'Lidské tkáně',
                  'Tělesné tekutiny',
                  'Části lidského těla',
                  'Vlasy (s výjimkou paruky od autorizovaných prodejců)'
                ]}
              />

              <ForbiddenCategory 
                title="Sexuální obsah a služby"
                items={[
                  'Pornografický materiál',
                  'Sexuální služby',
                  'Předměty sexuální povahy (použité)',
                  'Erotické služby',
                  'Doprovod'
                ]}
              />

              <ForbiddenCategory 
                title="Nebezpečné látky"
                items={[
                  'Chemické látky pro výrobu drog',
                  'Jedy a toxiny',
                  'Radioaktivní materiály',
                  'Výbušniny',
                  'Pesticidy zakázané v EU'
                ]}
              />

              <ForbiddenCategory 
                title="Extrémistický obsah"
                items={[
                  'Materiály podporující terorismus',
                  'Nacistická symbolika',
                  'Extremistická literatura',
                  'Propagace násilí',
                  'Rasistický obsah'
                ]}
              />

              <ForbiddenCategory 
                title="Hazardní hry a loterie"
                items={[
                  'Nelegální hazardní hry',
                  'Nepovolené loterie',
                  'Hacknuté herní účty',
                  'Nelegální sázky'
                ]}
              />

              <ForbiddenCategory 
                title="Služby vyžadující licenci"
                items={[
                  'Lékařské služby bez licence',
                  'Právní služby bez oprávnění',
                  'Finanční poradenství bez licence',
                  'Stavební práce bez živnostenského oprávnění'
                ]}
              />

              <ForbiddenCategory 
                title="Osobní údaje a účty"
                items={[
                  'Osobní údaje třetích osob',
                  'E-mailové databáze',
                  'Hacknute účty',
                  'Ukradené přihlašovací údaje',
                  'Čísla kreditních karet'
                ]}
              />
            </Section>

            <Section title="3. Podmíněně povolené položky">
              <p>
                <strong>Tyto položky jsou povoleny pouze za určitých podmínek:</strong>
              </p>

              <ConditionalItem 
                title="Léky volně prodejné"
                condition="Pouze léky dostupné bez receptu, v originálním balení, s platnou exspirací"
              />

              <ConditionalItem 
                title="Alkohol"
                condition="Pouze pro osoby 18+, uzavřený, nepoškozeného obalu"
              />

              <ConditionalItem 
                title="Tabákové výrobky"
                condition="Pouze pro osoby 18+, v originálním balení"
              />

              <ConditionalItem 
                title="Nože a nářadí"
                condition="Pouze běžné kuchyňské a pracovní nástroje, ne bojové nože"
              />

              <ConditionalItem 
                title="Repliky zbraní"
                condition="Musí být zřejmé, že jde o hračku/repliku, ne realistický vzhled"
              />

              <ConditionalItem 
                title="Použitá spodní prádlo"
                condition="ZAKÁZÁNO - hygienické důvody"
              />
            </Section>

            <Section title="4. Povinnosti prodávajícího">
              <p>
                <strong>Každý prodávající musí:</strong>
              </p>
              <ul>
                <li>Poskytnout pravdivý a kompletní popis položky</li>
                <li>Uvést všechny vady a nedostatky</li>
                <li>Nahrát skutečné fotografie vlastního zboží</li>
                <li>Odpovídat na dotazy kupujících</li>
                <li>Předat zboží ve stavu odpovídajícím popisu</li>
                <li>Být vlastníkem nebo mít oprávnění k prodeji</li>
                <li>Neprodávat zakázané položky</li>
                <li>Dodržovat zákonné lhůty a povinnosti</li>
              </ul>
            </Section>

            <Section title="5. Povinnosti kupujícího">
              <p>
                <strong>Každý kupující musí:</strong>
              </p>
              <ul>
                <li>Řádně si přečíst popis před koupí</li>
                <li>Klást dotazy v případě nejasností</li>
                <li>Zkontrolovat zboží při převzetí</li>
                <li>Potvrdit převzetí v systému</li>
                <li>Nepoužívat platformu k podvodům</li>
                <li>Zaplatit za zboží přes Vendly</li>
                <li>Hodnotit prodejce poctivě</li>
              </ul>
            </Section>

            <Section title="6. Zákaz podvodného jednání">
              <p className="font-bold text-danger-600">
                Přísně ZAKÁZÁNO:
              </p>
              <ul>
                <li>Falešné inzeráty (prodej neexistujícího zboží)</li>
                <li>Phishing a získávání citlivých údajů</li>
                <li>Manipulace s fotografiemi</li>
                <li>Nesprávné označení stavu zboží</li>
                <li>Záměrné zatajení vad</li>
                <li>Prodej jedné položky vícekrát</li>
                <li>Obcházení escrow systému</li>
                <li>Vytváření falešných účtů</li>
                <li>Manipulace s hodnocením</li>
                <li>Nátlak na pozitivní hodnocení</li>
              </ul>
            </Section>

            <Section title="7. Sankce za porušení pravidel">
              <p>
                <strong>Při porušení pravidel můžeme:</strong>
              </p>

              <Sanction 
                severity="Lehké porušení"
                action="Varování, dočasné omezení funkcí"
                examples="Nepřesný popis, pomalá komunikace"
              />

              <Sanction 
                severity="Střední porušení"
                action="Dočasné pozastavení účtu (7-30 dní)"
                examples="Opakované stížnosti, obcházení systému"
              />

              <Sanction 
                severity="Těžké porušení"
                action="Trvalé zablokování účtu + nahlášení orgánům"
                examples="Prodej zakázaných položek, podvod, ukradené zboží"
              />
            </Section>

            <Section title="8. Hlášení porušení">
              <p>
                <strong>Pokud narazíte na porušení pravidel:</strong>
              </p>
              <ul>
                <li>Použijte tlačítko "Nahlásit" u inzerátu nebo uživatele</li>
                <li>Popište problém co nejpřesněji</li>
                <li>Přiložte screenshoty, pokud máte</li>
                <li>Můžete být kontaktováni pro další informace</li>
              </ul>

              <p className="mt-4">
                <strong>Kontakt pro nahlášení:</strong><br />
                E-mail: abuse@vendly.cz<br />
                Odpovíme do 24 hodin
              </p>
            </Section>

            <Section title="9. Spolupráce s orgány">
              <p>
                Vendly spolupracuje s:
              </p>
              <ul>
                <li>Policií České republiky</li>
                <li>Celní správou</li>
                <li>Živnostenským úřadem</li>
                <li>Dalšími příslušnými orgány</li>
              </ul>

              <p className="font-bold">
                Při podezření z trestné činnosti předáváme důkazy orgánům činným v trestním řízení.
              </p>
            </Section>

            <Section title="10. Změny pravidel">
              <p>
                Vendly si vyhrazuje právo aktualizovat tato pravidla. 
                Uživatelé budou o změnách informováni e-mailem.
              </p>
            </Section>

            <p className="font-bold text-lg mt-8">
              Poslední aktualizace: 1. ledna 2026
            </p>
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

function ForbiddenCategory({ title, items }: any) {
  return (
    <div className="bg-danger-50 border-l-4 border-danger-500 rounded-lg p-4 my-4">
      <div className="flex items-center gap-2 mb-3">
        <Ban className="w-5 h-5 text-danger-700" />
        <h3 className="font-bold text-danger-900">{title}</h3>
      </div>
      <ul className="space-y-1 text-sm text-danger-800">
        {items.map((item: string, i: number) => (
          <li key={i}>✗ {item}</li>
        ))}
      </ul>
    </div>
  )
}

function ConditionalItem({ title, condition }: any) {
  return (
    <div className="border-l-4 border-warning-500 pl-4 my-3">
      <div className="font-semibold text-gray-900">{title}</div>
      <div className="text-sm text-gray-700 mt-1">
        <strong>Podmínka:</strong> {condition}
      </div>
    </div>
  )
}

function Sanction({ severity, action, examples }: any) {
  return (
    <div className="border-l-4 border-gray-300 pl-4 my-3">
      <div className="font-bold text-gray-900">{severity}</div>
      <div className="text-sm text-gray-700 mt-1">
        <div><strong>Sankce:</strong> {action}</div>
        <div className="text-xs text-gray-600 mt-1"><em>Příklady: {examples}</em></div>
      </div>
    </div>
  )
}
