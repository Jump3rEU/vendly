'use client'

import { useState, useEffect } from 'react'
import { AlertTriangle, X } from 'lucide-react'

interface ScamDetectorProps {
  text: string
  onFlagsChange?: (flags: string[]) => void
}

export default function ScamDetector({ text, onFlagsChange }: ScamDetectorProps) {
  const [flags, setFlags] = useState<string[]>([])

  useEffect(() => {
    const checkText = () => {
      const detectedFlags: string[] = []
      const lowerText = text.toLowerCase()

      // Suspicious patterns - same as in ai-service.ts quickScamCheck
      const patterns = [
        { pattern: /(?:whatsapp|telegram|viber|signal)[\s:]+[\+\d]/i, flag: 'Kontakt mimo platformu' },
        { pattern: /(?:western union|moneygram|bitcoi|krypto)/i, flag: 'Neobvyklá platební metoda' },
        { pattern: /(?:ihned|rychle|dnes|teď|naléhavé|limited|limited time|poslední|nutno prodat)/i, flag: 'Naléhavá taktika' },
        { pattern: /(?:100%|zaručen[oýá]|garantovan[oýá]|bez rizika|záruka vrácení peněz)/i, flag: 'Nerealistické garance' },
        { pattern: /(?:win|vyhr[aá]l|loterie|dárek|zdarma|free|akce|sleva 90)/i, flag: 'Příliš dobré na pravdu' },
        { pattern: /(?:předplacen[oýá]|platba předem|záloha|depositum)/i, flag: 'Platba předem' },
      ]

      for (const { pattern, flag } of patterns) {
        if (pattern.test(text)) {
          detectedFlags.push(flag)
        }
      }

      // Check for email/phone
      if (/[\w\.-]+@[\w\.-]+\.\w+/.test(text)) {
        detectedFlags.push('Email v textu')
      }
      if (/[\+\d]{9,}/.test(text.replace(/\s/g, ''))) {
        detectedFlags.push('Telefonní číslo v textu')
      }

      setFlags(detectedFlags)
      onFlagsChange?.(detectedFlags)
    }

    const debounce = setTimeout(checkText, 500)
    return () => clearTimeout(debounce)
  }, [text, onFlagsChange])

  if (flags.length === 0) return null

  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
      <div className="flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <h4 className="font-semibold text-yellow-900 mb-2">
            Detekováno podezřelé obsahy
          </h4>
          <div className="space-y-1 mb-3">
            {flags.map((flag, index) => (
              <div key={index} className="flex items-center gap-2 text-sm text-yellow-800">
                <X className="w-4 h-4" />
                <span>{flag}</span>
              </div>
            ))}
          </div>
          <p className="text-sm text-yellow-700">
            Tyto prvky mohou být považovány za podezřelé. Doporučujeme je odstranit pro lepší důvěryhodnost.
          </p>
        </div>
      </div>
    </div>
  )
}
