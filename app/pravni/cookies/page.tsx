import { Metadata } from 'next'
import { Cookie, CheckCircle, XCircle } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Cookie Policy - Vendly',
}

export default function CookiesPage() {
  return (
    <div className="min-h-screen bg-white py-12">
      <div className="safe-container">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Zásady používání cookies
            </h1>
            <p className="text-gray-600">
              Jak Vendly používá soubory cookies
            </p>
          </div>

          {/* Notice */}
          <div className="bg-primary-50 border-2 border-primary-500 rounded-xl p-6 mb-8">
            <div className="flex gap-3">
              <Cookie className="w-6 h-6 text-primary-600 flex-shrink-0" />
              <div>
                <h2 className="font-bold text-primary-900 mb-2">
                  Minimální použití cookies
                </h2>
                <p className="text-sm text-primary-800 leading-relaxed">
                  Vendly používá pouze nezbytné cookies pro fungování platformy. 
                  Nepoužíváme reklamní cookies třetích stran ani tracking pro behaviorální reklamu.
                </p>
              </div>
            </div>
          </div>

          <div className="prose prose-lg max-w-none">
            <Section title="1. Co jsou cookies?">
              <p>
                Cookies jsou malé textové soubory, které se ukládají do vašeho zařízení 
                (počítač, telefon, tablet) při návštěvě webových stránek. Umožňují stránkám 
                zapamatovat si vaše akce a preference po určitou dobu.
              </p>
            </Section>

            <Section title="2. Jaké cookies používáme">
              <CookieCategory 
                title="Nezbytně nutné cookies"
                required={true}
                description="Tyto cookies jsou nezbytné pro základní funkčnost platformy."
                examples={[
                  'Cookies pro přihlášení',
                  'Cookies pro zabezpečení (CSRF ochrana)',
                  'Cookies pro správu session',
                  'Cookies pro jazyk a region'
                ]}
                duration="Session nebo do odhlášení"
                canDisable={false}
              />

              <CookieCategory 
                title="Funkční cookies"
                required={false}
                description="Tyto cookies zlepšují funkcionalitu a personalizaci."
                examples={[
                  'Zapamatování filtrov v vyhledávání',
                  'Uložení nastavení zobrazení',
                  'Preferované kategorie'
                ]}
                duration="30 dní"
                canDisable={true}
              />

              <CookieCategory 
                title="Analytické cookies"
                required={false}
                description="Pomáhají nám pochopit, jak používáte platformu."
                examples={[
                  'Počet návštěv',
                  'Čas strávený na stránkách',
                  'Navigační vzory (anonymizované)'
                ]}
                duration="1 rok"
                canDisable={true}
              />
            </Section>

            <Section title="3. Co NEPOUŽÍVÁME">
              <div className="bg-trust-50 rounded-lg p-6 my-4 border-2 border-trust-200">
                <h3 className="font-bold text-trust-900 mb-3 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5" />
                  Vendly NEPOUŽÍVÁ:
                </h3>
                <ul className="space-y-2 text-sm text-trust-800">
                  <li>✓ Reklamní cookies třetích stran</li>
                  <li>✓ Social media tracking cookies</li>
                  <li>✓ Behavioral advertising cookies</li>
                  <li>✓ Retargeting cookies</li>
                  <li>✓ Fingerprinting technologie</li>
                </ul>
              </div>
            </Section>

            <Section title="4. Jak řídit cookies">
              <p>
                <strong>Máte plnou kontrolu nad cookies:</strong>
              </p>

              <ControlMethod 
                title="V nastavení Vendly"
                description="Přejděte do Nastavení > Soukromí > Cookies a upravte své preference"
                recommended={true}
              />

              <ControlMethod 
                title="V prohlížeči"
                description="Můžete blokovat nebo mazat cookies přímo v nastavení vašeho prohlížeče"
                recommended={false}
              />

              <div className="bg-warning-100 border-l-4 border-warning-500 p-4 my-4">
                <p className="text-sm text-warning-800">
                  <strong>Upozornění:</strong> Blokování nezbytných cookies může narušit 
                  funkčnost platformy (např. nebudete se moci přihlásit).
                </p>
              </div>
            </Section>

            <Section title="5. Detailní seznam cookies">
              <div className="overflow-x-auto my-6">
                <table className="min-w-full border border-gray-300 text-sm">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="border border-gray-300 px-4 py-2 text-left">Název</th>
                      <th className="border border-gray-300 px-4 py-2 text-left">Účel</th>
                      <th className="border border-gray-300 px-4 py-2 text-left">Typ</th>
                      <th className="border border-gray-300 px-4 py-2 text-left">Trvání</th>
                    </tr>
                  </thead>
                  <tbody>
                    <CookieRow 
                      name="vendly_session"
                      purpose="Udržení přihlášení"
                      type="Nezbytný"
                      duration="Session"
                    />
                    <CookieRow 
                      name="csrf_token"
                      purpose="Ochrana proti CSRF útokům"
                      type="Nezbytný"
                      duration="Session"
                    />
                    <CookieRow 
                      name="cookie_consent"
                      purpose="Zapamatování souhlasu s cookies"
                      type="Nezbytný"
                      duration="1 rok"
                    />
                    <CookieRow 
                      name="user_preferences"
                      purpose="Uložení nastavení uživatele"
                      type="Funkční"
                      duration="30 dní"
                    />
                    <CookieRow 
                      name="analytics_id"
                      purpose="Anonymní analýza návštěvnosti"
                      type="Analytický"
                      duration="1 rok"
                    />
                  </tbody>
                </table>
              </div>
            </Section>

            <Section title="6. Cookies třetích stran">
              <p>
                <strong>Vendly používá služby třetích stran pro:</strong>
              </p>

              <ThirdPartyCookie 
                provider="Platební brána"
                purpose="Zpracování plateb"
                cookies="Session cookies pro bezpečnost platby"
                link="viz dokumentace platební brány"
              />

              <p className="mt-4">
                <strong>Důležité:</strong> Tyto služby mají vlastní cookie policy, 
                které najdete na jejich webových stránkách.
              </p>
            </Section>

            <Section title="7. Jak odstranit cookies">
              <p>
                <strong>Postup v jednotlivých prohlížečích:</strong>
              </p>

              <BrowserInstruction 
                browser="Google Chrome"
                steps={[
                  'Nastavení > Soukromí a zabezpečení > Cookies a další data webu',
                  'Klikněte na "Zobrazit všechny cookies a data webu"',
                  'Vyhledejte "vendly.cz" a klikněte na ikonu koše'
                ]}
              />

              <BrowserInstruction 
                browser="Mozilla Firefox"
                steps={[
                  'Nastavení > Soukromí & Zabezpečení',
                  'Cookies a data stránek > Spravovat data',
                  'Vyhledejte "vendly.cz" a klikněte na Odstranit'
                ]}
              />

              <BrowserInstruction 
                browser="Safari"
                steps={[
                  'Předvolby > Soukromí > Spravovat data webů',
                  'Vyhledejte "vendly.cz"',
                  'Klikněte na Odstranit'
                ]}
              />

              <BrowserInstruction 
                browser="Microsoft Edge"
                steps={[
                  'Nastavení > Cookies a oprávnění webu',
                  'Spravovat a odstranit cookies a data webu',
                  'Zobrazit všechna cookies > Vyhledejte "vendly.cz"'
                ]}
              />
            </Section>

            <Section title="8. Změny v Cookie Policy">
              <p>
                Můžeme tuto Cookie Policy čas od času aktualizovat. O změnách vás 
                budeme informovat oznámením na platformě nebo e-mailem.
              </p>
              <p>
                Doporučujeme pravidelně kontrolovat tuto stránku pro případné změny.
              </p>
            </Section>

            <Section title="9. Kontakt">
              <p>
                <strong>Pro otázky ohledně cookies:</strong>
              </p>
              <p>
                E-mail: privacy@vendly.cz<br />
                Telefon: +420 XXX XXX XXX
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

function CookieCategory({ title, required, description, examples, duration, canDisable }: any) {
  return (
    <div className="bg-gray-50 rounded-lg p-6 my-4 border-2 border-gray-200">
      <div className="flex items-start justify-between mb-3">
        <h3 className="font-bold text-gray-900">{title}</h3>
        {required ? (
          <span className="text-xs bg-danger-100 text-danger-700 px-2 py-1 rounded font-medium">
            Povinné
          </span>
        ) : (
          <span className="text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded font-medium">
            Volitelné
          </span>
        )}
      </div>
      <p className="text-sm text-gray-700 mb-3">{description}</p>
      <div className="text-sm text-gray-600 mb-2">
        <strong>Příklady:</strong>
        <ul className="mt-1 space-y-1 ml-4">
          {examples.map((ex: string, i: number) => (
            <li key={i}>• {ex}</li>
          ))}
        </ul>
      </div>
      <div className="flex items-center justify-between text-xs text-gray-600 mt-3 pt-3 border-t border-gray-200">
        <span><strong>Trvání:</strong> {duration}</span>
        <span>
          {canDisable ? (
            <span className="text-primary-600">Lze zakázat</span>
          ) : (
            <span className="text-danger-600">Nelze zakázat</span>
          )}
        </span>
      </div>
    </div>
  )
}

function ControlMethod({ title, description, recommended }: any) {
  return (
    <div className="border-l-4 border-primary-500 pl-4 my-3">
      <div className="flex items-center gap-2">
        <div className="font-semibold text-gray-900">{title}</div>
        {recommended && (
          <span className="text-xs bg-primary-100 text-primary-700 px-2 py-0.5 rounded">
            Doporučeno
          </span>
        )}
      </div>
      <div className="text-sm text-gray-700 mt-1">{description}</div>
    </div>
  )
}

function CookieRow({ name, purpose, type, duration }: any) {
  return (
    <tr>
      <td className="border border-gray-300 px-4 py-2 font-mono text-xs">{name}</td>
      <td className="border border-gray-300 px-4 py-2">{purpose}</td>
      <td className="border border-gray-300 px-4 py-2">{type}</td>
      <td className="border border-gray-300 px-4 py-2">{duration}</td>
    </tr>
  )
}

function ThirdPartyCookie({ provider, purpose, cookies, link }: any) {
  return (
    <div className="bg-gray-50 rounded-lg p-4 my-3">
      <div className="font-semibold text-gray-900 mb-1">{provider}</div>
      <div className="text-sm text-gray-700">
        <div><strong>Účel:</strong> {purpose}</div>
        <div><strong>Cookies:</strong> {cookies}</div>
        <div className="text-xs text-gray-600 mt-1"><em>{link}</em></div>
      </div>
    </div>
  )
}

function BrowserInstruction({ browser, steps }: any) {
  return (
    <div className="my-4">
      <div className="font-semibold text-gray-900 mb-2">{browser}:</div>
      <ol className="text-sm text-gray-700 space-y-1 ml-6">
        {steps.map((step: string, i: number) => (
          <li key={i}>{i + 1}. {step}</li>
        ))}
      </ol>
    </div>
  )
}
