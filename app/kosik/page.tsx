'use client'

import { useState } from 'react'
import { Shield, Lock, AlertCircle, CheckCircle, CreditCard } from 'lucide-react'
import Button from '@/components/ui/Button'

export default function KosikPage() {
  const [acceptedPaymentTerms, setAcceptedPaymentTerms] = useState(false)

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="safe-container">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
              Dokončení objednávky
            </h1>
            <p className="text-gray-600">
              Vaše peníze budou v bezpečí, dokud zboží nepřevezmete
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Escrow Explanation (CRITICAL - NO ANIMATIONS) */}
              <div className="bg-primary-50 border-2 border-primary-500 rounded-xl p-6">
                <div className="flex gap-3 mb-4">
                  <Shield className="w-6 h-6 text-primary-600 flex-shrink-0" />
                  <div>
                    <h2 className="font-bold text-primary-900 text-lg mb-2">
                      Jak funguje bezpečná platba
                    </h2>
                    <p className="text-sm text-primary-800 leading-relaxed">
                      <strong>Vendly dočasně drží vaše peníze jako escrow systém.</strong>
                      {' '}To znamená, že prodávající obdrží peníze až poté, co potvrdíte převzetí 
                      a spokojenos s zbožím.
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  <ProcessStep 
                    number={1}
                    title="Zaplatíte"
                    description="Peníze bezpečně držíme"
                  />
                  <ProcessStep 
                    number={2}
                    title="Převezmete zboží"
                    description="Zkontrolujete stav"
                  />
                  <ProcessStep 
                    number={3}
                    title="Potvrdíte"
                    description="Uvolníme peníze prodejci"
                  />
                </div>
              </div>

              {/* Platform Role Explanation (CRITICAL) */}
              <div className="bg-white rounded-xl p-6 border-2 border-gray-200">
                <div className="flex gap-3">
                  <AlertCircle className="w-6 h-6 text-gray-600 flex-shrink-0" />
                  <div>
                    <h3 className="font-bold text-gray-900 mb-2">
                      Role platformy Vendly
                    </h3>
                    <div className="text-sm text-gray-700 space-y-2 leading-relaxed">
                      <p>
                        <strong>Vendly je zprostředkovatelská platforma</strong> a nemá roli prodávajícího.
                      </p>
                      <ul className="space-y-1 ml-4">
                        <li>• Za popis a stav zboží odpovídá prodávající</li>
                        <li>• Vendly neposkytuje záruku na zboží</li>
                        <li>• Vendly dočasně drží platbu pro vaši ochranu</li>
                        <li>• V případě sporu můžeme pomoci s mediací</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment Method */}
              <div className="bg-white rounded-xl p-6 border border-gray-200">
                <h3 className="font-semibold text-gray-900 mb-4">
                  Způsob platby
                </h3>
                
                <div className="space-y-3">
                  <label className="flex items-center gap-3 p-4 border-2 border-primary-500 rounded-lg cursor-pointer bg-primary-50">
                    <input 
                      type="radio" 
                      name="payment" 
                      defaultChecked 
                      className="w-5 h-5 text-primary-600"
                    />
                    <CreditCard className="w-5 h-5 text-primary-600" />
                    <div className="flex-1">
                      <div className="font-semibold text-gray-900">Platební karta</div>
                      <div className="text-xs text-gray-600">Visa, Mastercard</div>
                    </div>
                  </label>

                  <label className="flex items-center gap-3 p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-gray-300">
                    <input 
                      type="radio" 
                      name="payment" 
                      className="w-5 h-5 text-primary-600"
                    />
                    <div className="flex-1">
                      <div className="font-semibold text-gray-900">Bankovní převod</div>
                      <div className="text-xs text-gray-600">Platba bankou</div>
                    </div>
                  </label>
                </div>
              </div>

              {/* Legal Acceptance (CRITICAL - NO ANIMATIONS) */}
              <div className="bg-white rounded-xl p-6 border border-gray-200">
                <h3 className="font-semibold text-gray-900 mb-4">
                  Potvrzení podmínek
                </h3>

                <label className="flex items-start gap-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={acceptedPaymentTerms}
                    onChange={(e) => setAcceptedPaymentTerms(e.target.checked)}
                    className="mt-1 w-5 h-5 text-primary-600 border-gray-300 rounded focus:ring-2 focus:ring-primary-500"
                    required
                  />
                  <div className="text-sm text-gray-700 leading-relaxed">
                    <p className="mb-2">
                      <strong>Rozumím a souhlasím:</strong>
                    </p>
                    <ul className="space-y-1 ml-4 text-xs">
                      <li>• Vendly drží mou platbu jako escrow systém</li>
                      <li>• Prodávající obdrží peníze až po mém potvrzení</li>
                      <li>• Za stav zboží odpovídá prodávající, ne Vendly</li>
                      <li>• Přečetl/a jsem{' '}
                        <a href="/pravni/platby-a-escrow" className="text-primary-600 underline">
                          Podmínky plateb a escrow
                        </a>
                      </li>
                      <li>• Souhlasím s{' '}
                        <a href="/pravni/obchodni-podminky" className="text-primary-600 underline">
                          Obchodními podmínkami
                        </a>
                      </li>
                    </ul>
                  </div>
                </label>
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl p-6 border border-gray-200 sticky top-24">
                <h3 className="font-semibold text-gray-900 mb-4">
                  Shrnutí objednávky
                </h3>

                {/* Item */}
                <div className="mb-4 pb-4 border-b border-gray-200">
                  <div className="flex gap-3 mb-2">
                    <div className="w-16 h-16 bg-gray-200 rounded flex items-center justify-center text-2xl">
                      📱
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-gray-900 text-sm">
                        iPhone 13 Pro - 256GB
                      </div>
                      <div className="text-xs text-gray-500">
                        Praha 5
                      </div>
                    </div>
                  </div>
                </div>

                {/* Price Breakdown */}
                <div className="space-y-2 mb-4 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Cena zboží</span>
                    <span className="font-semibold">18 900 Kč</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Poplatek Vendly</span>
                    <span className="font-semibold">189 Kč</span>
                  </div>
                  <div className="pt-2 border-t border-gray-200 flex justify-between text-lg">
                    <span className="font-bold text-gray-900">Celkem</span>
                    <span className="font-bold text-primary-600">19 089 Kč</span>
                  </div>
                </div>

                {/* Trust Badge */}
                <div className="bg-trust-100 rounded-lg p-3 mb-4">
                  <div className="flex items-center gap-2 text-trust-700 text-sm">
                    <Lock className="w-4 h-4" />
                    <span className="font-medium">Chráněno escrow systémem</span>
                  </div>
                </div>

                {/* Pay Button */}
                <Button 
                  size="lg" 
                  variant="primary" 
                  fullWidth
                  disabled={!acceptedPaymentTerms}
                >
                  <CheckCircle className="w-5 h-5 mr-2" />
                  Zaplatit bezpečně
                </Button>

                <p className="text-xs text-gray-500 text-center mt-3">
                  Platba probíhá přes zabezpečenou bránu
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function ProcessStep({ number, title, description }: any) {
  return (
    <div className="flex items-center gap-3 bg-white rounded-lg p-3">
      <div className="flex-shrink-0 w-8 h-8 bg-primary-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
        {number}
      </div>
      <div>
        <div className="font-semibold text-gray-900 text-sm">{title}</div>
        <div className="text-xs text-gray-600">{description}</div>
      </div>
    </div>
  )
}
