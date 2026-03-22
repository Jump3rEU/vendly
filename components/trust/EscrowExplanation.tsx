import { Shield, Lock, CheckCircle } from 'lucide-react'

export default function EscrowExplanation() {
  return (
    <div className="bg-gradient-to-br from-primary-50 via-primary-50 to-primary-100 rounded-2xl p-7 border border-primary-200 shadow-soft">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center shadow-soft">
          <Shield className="w-5 h-5 text-white" />
        </div>
        <h3 className="font-bold text-lg text-gray-900">
          Jak funguje escrow ochrana?
        </h3>
      </div>

      <div className="space-y-4">
        <Step 
          number={1}
          icon={<Lock className="w-4 h-4" />}
          text="Zaplatíte bezpečně přes Vendly"
        />
        <Step 
          number={2}
          icon={<Shield className="w-4 h-4" />}
          text="Peníze držíme, dokud zboží nepřevezmete"
        />
        <Step 
          number={3}
          icon={<CheckCircle className="w-4 h-4" />}
          text="Po potvrzení uvolníme peníze prodejci"
        />
      </div>

      <div className="mt-5 pt-5 border-t border-primary-200">
        <p className="text-sm text-primary-900 leading-relaxed">
          <strong>Vendly drží vaše peníze v bezpečí.</strong> Platforma dočasně 
          uchovává platbu jako nezávislý prostředník. Prodejce získá peníze až 
          po vašem potvrzení převzetí.
        </p>
      </div>
    </div>
  )
}

function Step({ number, icon, text }: any) {
  return (
    <div className="flex items-center gap-3.5">
      <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-600 text-white rounded-xl flex items-center justify-center text-sm font-bold shadow-soft">
        {number}
      </div>
      <div className="flex items-center gap-2.5 text-sm text-gray-700">
        <div className="text-primary-600">{icon}</div>
        <span className="font-medium">{text}</span>
      </div>
    </div>
  )
}
