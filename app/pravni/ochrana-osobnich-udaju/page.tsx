import { Metadata } from 'next'
import { Shield, Eye, Lock, FileText } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Ochrana osobních údajů - Vendly',
}

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-white py-12">
      <div className="safe-container">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Zásady ochrany osobních údajů
            </h1>
            <p className="text-gray-600">
              GDPR compliant • Platné od 1. ledna 2026
            </p>
          </div>

          {/* GDPR Notice */}
          <div className="bg-primary-50 border-2 border-primary-500 rounded-xl p-6 mb-8">
            <div className="flex gap-3">
              <Shield className="w-6 h-6 text-primary-600 flex-shrink-0" />
              <div>
                <h2 className="font-bold text-primary-900 mb-2">
                  Vaše soukromí je pro nás prioritou
                </h2>
                <p className="text-sm text-primary-800 leading-relaxed">
                  Zpracováváme vaše osobní údaje v souladu s GDPR a českým zákonem o ochraně 
                  osobních údajů. Máte právo na přístup, opravu a výmaz svých dat.
                </p>
              </div>
            </div>
          </div>

          <div className="prose prose-lg max-w-none">
            <Section title="1. Správce osobních údajů">
              <p>
                <strong>Správce:</strong><br />
                Vendly s.r.o.<br />
                IČO: 12345678<br />
                Sídlo: Praha 1, Česká republika<br />
                E-mail: gdpr@vendly.cz<br />
                Telefon: +420 XXX XXX XXX
              </p>
            </Section>

            <Section title="2. Jaké údaje sbíráme">
              <DataCategory 
                icon={<Eye className="w-5 h-5" />}
                title="Základní údaje účtu"
                items={[
                  'Jméno a příjmení',
                  'E-mailová adresa',
                  'Telefonní číslo',
                  'Datum registrace'
                ]}
              />

              <DataCategory 
                icon={<Lock className="w-5 h-5" />}
                title="Platební údaje"
                items={[
                  'Bankovní účet (pro výplaty)',
                  'Platební data (zpracovává platební brána, ne Vendly)',
                  'Historie transakcí'
                ]}
              />

              <DataCategory 
                icon={<FileText className="w-5 h-5" />}
                title="Údaje o aktivitě"
                items={[
                  'Vytvořené inzeráty',
                  'Vyhledávání a prohlížení',
                  'Zprávy mezi uživateli',
                  'Hodnocení a recenze'
                ]}
              />

              <DataCategory 
                icon={<Shield className="w-5 h-5" />}
                title="Technické údaje"
                items={[
                  'IP adresa',
                  'Typ zařízení a prohlížeče',
                  'Cookies (viz Cookie Policy)'
                ]}
              />
            </Section>

            <Section title="3. K čemu údaje používáme">
              <p>
                <strong>Vaše data používáme pouze k:</strong>
              </p>
              <ul>
                <li>Poskytování služeb platformy Vendly</li>
                <li>Zpracování transakcí a escrow plateb</li>
                <li>Komunikaci mezi uživateli</li>
                <li>Prevenci podvodů a zajištění bezpečnosti</li>
                <li>Zákaznické podpoře</li>
                <li>Zlepšování služeb (anonymizovaná data)</li>
                <li>Plnění právních povinností</li>
              </ul>

              <p className="font-bold text-primary-600">
                Nikdy neprodáváme vaše osobní údaje třetím stranám!
              </p>
            </Section>

            <Section title="4. Sdílení údajů s třetími stranami">
              <p>
                <strong>Vaše údaje sdílíme pouze s:</strong>
              </p>

              <ThirdParty 
                name="Platební brána"
                purpose="Zpracování plateb"
                data="Platební údaje (nikoliv celá čísla karet)"
                note="Platební data zpracovává certifikovaná platební brána, ne Vendly"
              />

              <ThirdParty 
                name="Hosting služby"
                purpose="Provoz platformy"
                data="Technické údaje serveru"
                note="Servery v EU s GDPR compliance"
              />

              <ThirdParty 
                name="Orgány činné v trestním řízení"
                purpose="Plnění zákonných povinností"
                data="Dle zákonného požadavku"
                note="Pouze na základě právního příkazu"
              />

              <p className="font-bold mt-4">
                Nikdy nesdílíme data pro marketingové účely třetích stran.
              </p>
            </Section>

            <Section title="5. Vaše práva (GDPR)">
              <p>
                <strong>Máte právo na:</strong>
              </p>

              <Right 
                title="Přístup k údajům"
                description="Můžete požádat o kopii všech vašich osobních údajů"
              />

              <Right 
                title="Opravu údajů"
                description="Můžete požádat o opravu nesprávných nebo neúplných údajů"
              />

              <Right 
                title="Výmaz údajů ('právo být zapomenut')"
                description="Můžete požádat o smazání vašich dat (s výjimkami dle zákona)"
              />

              <Right 
                title="Omezení zpracování"
                description="Můžete požádat o omezení zpracování vašich údajů"
              />

              <Right 
                title="Přenositelnost údajů"
                description="Můžete získat své údaje ve strojově čitelném formátu"
              />

              <Right 
                title="Námitku proti zpracování"
                description="Můžete vznést námitku proti konkrétnímu zpracování"
              />

              <Right 
                title="Stížnost u dozorového úřadu"
                description="Můžete podat stížnost u Úřadu pro ochranu osobních údajů"
              />

              <p className="mt-4">
                <strong>Jak uplatnit svá práva:</strong><br />
                E-mail: gdpr@vendly.cz<br />
                Odpovíme do 30 dnů od přijetí žádosti.
              </p>
            </Section>

            <Section title="6. Jak dlouho uchováváme data">
              <ul>
                <li><strong>Účty aktivních uživatelů:</strong> Po dobu existence účtu</li>
                <li><strong>Transakční data:</strong> 10 let (daňové povinnosti)</li>
                <li><strong>Komunikace:</strong> 3 roky po poslední aktivitě</li>
                <li><strong>Neaktivní účty:</strong> 2 roky nečinnosti, pak smazání</li>
                <li><strong>Cookies:</strong> Viz Cookie Policy</li>
              </ul>
            </Section>

            <Section title="7. Zabezpečení dat">
              <p>
                <strong>Jak chráníme vaše data:</strong>
              </p>
              <ul>
                <li>Šifrované připojení (HTTPS/SSL)</li>
                <li>Šifrování citlivých dat v databázi</li>
                <li>Pravidelné bezpečnostní audity</li>
                <li>Omezený přístup zaměstnanců k datům</li>
                <li>Dvoufaktorová autentifikace</li>
                <li>Monitoring podezřelých aktivit</li>
              </ul>
            </Section>

            <Section title="8. Cookies a tracking">
              <p>
                Používáme minimální množství cookies pro fungování platformy. 
                Detailní informace najdete v naší <a href="/pravni/cookies" className="text-primary-600 underline">Cookie Policy</a>.
              </p>

              <p>
                <strong>Nepoužíváme:</strong>
              </p>
              <ul>
                <li>Reklamní cookies třetích stran</li>
                <li>Social media tracking</li>
                <li>Behavioral advertising</li>
              </ul>
            </Section>

            <Section title="9. Práva dětí">
              <p className="font-bold">
                Platforma Vendly je určena pro uživatele starší 18 let.
              </p>
              <p>
                Uživatelé ve věku 13-17 let mohou platformu používat pouze s explicitním 
                souhlasem zákonného zástupce. Pokud zjistíme, že dítě mladší 13 let 
                používá platformu, účet okamžitě zablokujeme.
              </p>
            </Section>

            <Section title="10. Mezinárodní přenosy dat">
              <p>
                <strong>Vaše data zpracováváme primárně v EU.</strong>
              </p>
              <p>
                V případě přenosu mimo EU zajišťujeme odpovídající úroveň ochrany pomocí:
              </p>
              <ul>
                <li>Standardních smluvních doložek EU</li>
                <li>GDPR-compliant poskytovatelů</li>
                <li>Adekvátních bezpečnostních opatření</li>
              </ul>
            </Section>

            <Section title="11. Změny těchto zásad">
              <p>
                Můžeme tyto zásady aktualizovat. O změnách vás budeme informovat:
              </p>
              <ul>
                <li>E-mailem (u významných změn)</li>
                <li>Oznámením na platformě</li>
                <li>Aktualizací data "Platné od"</li>
              </ul>
            </Section>

            <Section title="12. Kontakt">
              <p>
                <strong>Pro otázky ohledně ochrany osobních údajů:</strong>
              </p>
              <p>
                E-mail: gdpr@vendly.cz<br />
                Telefon: +420 XXX XXX XXX<br />
                Poštovní adresa: Vendly s.r.o., Praha 1, Česká republika
              </p>

              <p className="mt-4">
                <strong>Úřad pro ochranu osobních údajů:</strong><br />
                <a href="https://www.uoou.cz" target="_blank" rel="noopener noreferrer" className="text-primary-600 underline">
                  www.uoou.cz
                </a>
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

function DataCategory({ icon, title, items }: any) {
  return (
    <div className="bg-gray-50 rounded-lg p-4 my-4">
      <div className="flex items-center gap-2 mb-3">
        <div className="text-primary-600">{icon}</div>
        <h3 className="font-semibold text-gray-900">{title}</h3>
      </div>
      <ul className="space-y-1 text-sm text-gray-700">
        {items.map((item: string, i: number) => (
          <li key={i}>• {item}</li>
        ))}
      </ul>
    </div>
  )
}

function ThirdParty({ name, purpose, data, note }: any) {
  return (
    <div className="border-l-4 border-primary-500 pl-4 my-4">
      <div className="font-semibold text-gray-900">{name}</div>
      <div className="text-sm text-gray-700 mt-1">
        <div><strong>Účel:</strong> {purpose}</div>
        <div><strong>Data:</strong> {data}</div>
        <div className="text-xs text-gray-600 mt-1 italic">{note}</div>
      </div>
    </div>
  )
}

function Right({ title, description }: any) {
  return (
    <div className="my-3">
      <div className="font-semibold text-gray-900">✓ {title}</div>
      <div className="text-sm text-gray-700 ml-4">{description}</div>
    </div>
  )
}
