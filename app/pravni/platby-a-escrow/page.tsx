import { Metadata } from 'next'
import { Shield, Lock, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Platby a Escrow - Vendly',
}

export default function PlatbyEscrowPage() {
  return (
    <div className="min-h-screen bg-white py-12">
      <div className="safe-container">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Platby a Escrow systém
            </h1>
            <p className="text-gray-600">
              Jak funguje bezpečné platební řešení Vendly
            </p>
          </div>

          {/* Main Explanation */}
          <div className="bg-primary-50 border-2 border-primary-500 rounded-xl p-6 mb-8">
            <div className="flex gap-3">
              <Shield className="w-8 h-8 text-primary-600 flex-shrink-0" />
              <div>
                <h2 className="font-bold text-primary-900 text-lg mb-2">
                  Co je escrow systém?
                </h2>
                <p className="text-sm text-primary-800 leading-relaxed mb-3">
                  Escrow je systém, kdy Vendly dočasně drží vaše peníze jako nezávislý 
                  prostředník. Prodávající obdrží peníze až poté, co kupující potvrdí 
                  převzetí a spokojenost se zbožím.
                </p>
                <p className="text-sm text-primary-800 leading-relaxed font-bold">
                  Vendly není banka - pouze dočasně drží platbu pro vaši ochranu.
                </p>
              </div>
            </div>
          </div>

          <div className="prose prose-lg max-w-none">
            <Section title="1. Jak escrow funguje krok za krokem">
              <div className="space-y-4 my-6">
                <EscrowStep 
                  number={1}
                  title="Kupující zaplatí"
                  description="Kupující zaplatí za zboží prostřednictvím Vendly. Platba probíhá přes zabezpečenou platební bránu."
                  icon={<Lock className="w-5 h-5" />}
                  status="safe"
                />

                <EscrowStep 
                  number={2}
                  title="Vendly drží peníze"
                  description="Peníze jsou bezpečně uloženy na escrow účtu Vendly. Prodávající je ještě nemá k dispozici."
                  icon={<Shield className="w-5 h-5" />}
                  status="pending"
                />

                <EscrowStep 
                  number={3}
                  title="Prodávající předá zboží"
                  description="Prodávající předá zboží kupujícímu osobně nebo ho odešle. Kupující zkontroluje stav."
                  icon={<RefreshCw className="w-5 h-5" />}
                  status="pending"
                />

                <EscrowStep 
                  number={4}
                  title="Kupující potvrdí"
                  description="Kupující potvrdí v systému Vendly, že zboží převzal a je spokojený."
                  icon={<CheckCircle className="w-5 h-5" />}
                  status="confirm"
                />

                <EscrowStep 
                  number={5}
                  title="Vendly uvolní peníze"
                  description="Po potvrzení Vendly uvolní peníze prodávajícímu. Transakce je dokončena."
                  icon={<CheckCircle className="w-5 h-5" />}
                  status="complete"
                />
              </div>
            </Section>

            <Section title="2. Poplatky a ceny">
              <p>
                <strong>Poplatek platformy Vendly:</strong>
              </p>
              <ul>
                <li><strong>1 %</strong> z hodnoty transakce</li>
                <li><strong>Minimum:</strong> 10 Kč za transakci</li>
                <li><strong>Maximum:</strong> 500 Kč za transakci</li>
              </ul>

              <div className="bg-gray-50 rounded-lg p-4 my-4">
                <strong>Příklad výpočtu:</strong><br />
                <div className="mt-2 space-y-1 text-sm">
                  <div>Cena zboží: 18 900 Kč</div>
                  <div>Poplatek Vendly (1%): 189 Kč</div>
                  <div className="font-bold pt-2 border-t border-gray-200">
                    Celkem zaplatí kupující: 19 089 Kč
                  </div>
                  <div className="font-bold text-primary-600">
                    Prodávající obdrží: 18 900 Kč
                  </div>
                </div>
              </div>

              <p className="text-sm text-gray-600">
                <em>Poplatek platí kupující. Prodávající obdrží plnou cenu zboží.</em>
              </p>
            </Section>

            <Section title="3. Podporované způsoby platby">
              <p>
                <strong>Aktuálně podporujeme:</strong>
              </p>

              <PaymentMethod 
                name="Platební karta"
                description="Visa, Mastercard - okamžitá platba"
                fee="Žádný další poplatek"
              />

              <PaymentMethod 
                name="Bankovní převod"
                description="Online bankovnictví - zpracování do 24 hodin"
                fee="Žádný další poplatek"
              />

              <p className="font-bold text-primary-600 mt-4">
                NIKDY neplaťte mimo platformu Vendly! Ztratíte ochranu escrow systému.
              </p>
            </Section>

            <Section title="4. Kdy jsou peníze uvolněny prodávajícímu">
              <p>
                <strong>Peníze jsou uvolněny v těchto případech:</strong>
              </p>

              <ReleaseScenario 
                title="Potvrzení kupujícím"
                description="Kupující potvrdí převzetí a spokojenost v systému"
                timeframe="Okamžitě po potvrzení"
                status="standard"
              />

              <ReleaseScenario 
                title="Automatické uvolnění"
                description="Pokud kupující nepotvrdí ani nenamítá do 7 dnů od převzetí"
                timeframe="7 dní od označení 'zboží odesláno/předáno'"
                status="automatic"
              />

              <ReleaseScenario 
                title="Po vyřešení sporu"
                description="Pokud byl spor a byl vyřešen ve prospěch prodávajícího"
                timeframe="Podle rozhodnutí"
                status="dispute"
              />
            </Section>

            <Section title="5. Vrácení peněz kupujícímu">
              <p>
                <strong>Peníze jsou vráceny kupujícímu v těchto případech:</strong>
              </p>

              <RefundScenario 
                title="Prodávající zruší objednávku"
                description="Prodávající oznámí, že nemůže zboží dodat"
                action="Automatický refund do 3 pracovních dnů"
              />

              <RefundScenario 
                title="Zboží neodpovídá popisu"
                description="Kupující prokáže, že zboží výrazně neodpovídá popisu"
                action="Refund po vyřešení sporu"
              />

              <RefundScenario 
                title="Prodávající nepředá zboží"
                description="Prodávající nepředá zboží do 14 dnů"
                action="Automatický refund"
              />

              <RefundScenario 
                title="Prokázaný podvod"
                description="Vendly zjistí podvodné jednání prodávajícího"
                action="Okamžitý refund + blokace účtu prodávajícího"
              />
            </Section>

            <Section title="6. Spory a reklamace">
              <div className="bg-warning-100 border-l-4 border-warning-500 p-4 my-4">
                <div className="flex gap-3">
                  <AlertCircle className="w-5 h-5 text-warning-700 flex-shrink-0" />
                  <div className="text-sm text-warning-800">
                    <strong>Důležité:</strong> Vendly může nabídnout mediaci, ale není 
                    povinna rozhodnout spor. Konečné rozhodnutí je na stranách nebo soudu.
                  </div>
                </div>
              </div>

              <p>
                <strong>Jak nahlásit spor:</strong>
              </p>
              <ol>
                <li>Klikněte na "Nahlásit problém" u transakce</li>
                <li>Popište problém a přiložte důkazy (fotky, zprávy)</li>
                <li>Vendly pozastaví uvolnění peněz</li>
                <li>Kontaktujeme obě strany</li>
                <li>Pokusíme se o mediaci</li>
                <li>Rozhodneme nebo doporučíme další kroky</li>
              </ol>

              <p className="mt-4">
                <strong>Lhůta pro spor:</strong> Do 7 dnů od převzetí zboží
              </p>
            </Section>

            <Section title="7. Bezpečnost plateb">
              <p>
                <strong>Jak chráníme vaše platby:</strong>
              </p>
              <ul>
                <li>Platební brána s PCI DSS certifikací</li>
                <li>Šifrované připojení (SSL/TLS)</li>
                <li>3D Secure ověření pro karty</li>
                <li>Oddělené escrow účty</li>
                <li>Monitoring podezřelých transakcí</li>
                <li>Ochrana proti podvodům</li>
              </ul>

              <p className="font-bold text-primary-600 mt-4">
                Vendly NIKDY neuvidí čísla vašich karet. Platby zpracovává certifikovaná 
                platební brána.
              </p>
            </Section>

            <Section title="8. Role Vendly v platbách (KRITICKÉ)">
              <div className="bg-gray-50 rounded-lg p-6 my-4 border-2 border-gray-300">
                <h3 className="font-bold text-gray-900 mb-3">Vendly JE:</h3>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li>✓ Dočasný držitel platby (escrow agent)</li>
                  <li>✓ Poskytovatel technické infrastruktury</li>
                  <li>✓ Mediátor v případě sporu (bez garancevýsledku)</li>
                </ul>

                <h3 className="font-bold text-gray-900 mb-3 mt-4">Vendly NENÍ:</h3>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li>✗ Banka nebo finanční instituce</li>
                  <li>✗ Poskytovatel záruky na zboží</li>
                  <li>✗ Soudce v právních sporech</li>
                  <li>✗ Pojišťovna</li>
                </ul>
              </div>
            </Section>

            <Section title="9. Právo Vendly zadržet nebo vrátit platbu">
              <p>
                <strong>Vendly má právo:</strong>
              </p>
              <ul>
                <li>Zadržet platbu v případě podezření z podvodu</li>
                <li>Zadržet platbu během řešení sporu</li>
                <li>Vrátit platbu kupujícímu při prokázaném podvodu</li>
                <li>Nevydat platbu při porušení Obchodních podmínek</li>
                <li>Spolupracovat s bankami a orgány při vyšetřování</li>
              </ul>
            </Section>

            <Section title="10. Daňové povinnosti">
              <p>
                <strong>Důležité pro prodávající:</strong>
              </p>
              <ul>
                <li>Jste odpovědní za vlastní daňové povinnosti</li>
                <li>Vendly není daňovým poradcem</li>
                <li>Příjmy z prodeje mohou podléhat zdanění</li>
                <li>Konzultujte s daňovým poradcem</li>
              </ul>

              <p>
                <strong>Vendly poskytuje:</strong>
              </p>
              <ul>
                <li>Přehled transakcí ke stažení</li>
                <li>Potvrzení o obdržení peněz</li>
              </ul>
            </Section>

            <Section title="11. Kontakt pro platební dotazy">
              <p>
                <strong>Pro otázky ohledně plateb:</strong>
              </p>
              <p>
                E-mail: payments@vendly.cz<br />
                Telefon: +420 XXX XXX XXX<br />
                Podpora: Po-Pá 9:00-17:00
              </p>

              <p className="mt-4">
                <strong>Pro nahlášení problému s platbou:</strong><br />
                Použijte tlačítko "Nahlásit problém" u transakce nebo napište na abuse@vendly.cz
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

function EscrowStep({ number, title, description, icon, status }: any) {
  const statusColors: any = {
    safe: 'bg-trust-100 border-trust-300',
    pending: 'bg-warning-100 border-warning-300',
    confirm: 'bg-primary-100 border-primary-300',
    complete: 'bg-trust-100 border-trust-300',
  }

  return (
    <div className={`border-2 rounded-lg p-4 ${statusColors[status]}`}>
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0 w-10 h-10 bg-white rounded-full flex items-center justify-center font-bold text-lg border-2 border-gray-300">
          {number}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <div className="text-gray-700">{icon}</div>
            <h3 className="font-bold text-gray-900">{title}</h3>
          </div>
          <p className="text-sm text-gray-700">{description}</p>
        </div>
      </div>
    </div>
  )
}

function PaymentMethod({ name, description, fee }: any) {
  return (
    <div className="border-l-4 border-primary-500 pl-4 my-3">
      <div className="font-semibold text-gray-900">{name}</div>
      <div className="text-sm text-gray-700">{description}</div>
      <div className="text-xs text-gray-600 mt-1"><em>{fee}</em></div>
    </div>
  )
}

function ReleaseScenario({ title, description, timeframe, status }: any) {
  return (
    <div className="bg-gray-50 rounded-lg p-4 my-3">
      <div className="font-semibold text-gray-900 mb-1">{title}</div>
      <div className="text-sm text-gray-700">{description}</div>
      <div className="text-xs text-primary-600 mt-2 font-medium">⏱️ {timeframe}</div>
    </div>
  )
}

function RefundScenario({ title, description, action }: any) {
  return (
    <div className="border-l-4 border-danger-500 pl-4 my-3">
      <div className="font-semibold text-gray-900">{title}</div>
      <div className="text-sm text-gray-700 mt-1">{description}</div>
      <div className="text-sm text-danger-600 font-medium mt-2">→ {action}</div>
    </div>
  )
}
