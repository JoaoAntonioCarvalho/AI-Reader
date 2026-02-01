"use client"

import { useState, useEffect, useRef } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { WordData } from "./web-reader"
import { Volume2, Loader2, Languages, Lightbulb, X, Quote, AlertCircle, Book } from "lucide-react"

interface WordPopoverProps {
  word: string
  position: { x: number; y: number }
  onClose: () => void
  data?: WordData | null
  loading?: boolean
  error?: string | null
  language: string // Nova prop para o idioma selecionado
}

export function WordPopover({ word, position, onClose, data, loading, error, language }: WordPopoverProps) {
  const [isMobile, setIsMobile] = useState(false)
  const popoverRef = useRef<HTMLDivElement>(null)
  const [adjustedStyle, setAdjustedStyle] = useState<React.CSSProperties>({})

  const renderContent = (content: any) => {
    if (typeof content === 'string') return content;
    if (typeof content === 'object' && content !== null) {
      return Object.values(content)[0] as string;
    }
    return "";
  };

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768)
    checkMobile()
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  useEffect(() => {
    if (!isMobile && popoverRef.current) {
      const padding = 20
      const popoverWidth = 380
      const popoverHeight = popoverRef.current.offsetHeight || 300
      let x = position.x
      let y = position.y - 12
      let transform = "translate(-50%, -100%)"

      if (x - popoverWidth / 2 < padding) {
        x = padding
        transform = "translate(0, -100%)"
      } else if (x + popoverWidth / 2 > window.innerWidth - padding) {
        x = window.innerWidth - padding
        transform = "translate(-100%, -100%)"
      }
      if (y - popoverHeight < padding) {
        y = position.y + 25
        transform = transform.replace("-100%", "0")
      }
      setAdjustedStyle({ left: `${x}px`, top: `${y}px`, transform })
    }
  }, [position, isMobile, loading, data, error])

  const handleSpeak = () => {
    if ('speechSynthesis' in window) {
      // Cancela qualquer fala em andamento antes de começar a nova
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(word);
      utterance.lang = 'en-US';
      utterance.rate = 0.85; // Velocidade levemente reduzida para clareza
      window.speechSynthesis.speak(utterance);
    } else {
      console.error("Text-to-speech not supported in this browser.");
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center md:block">
      <div className="fixed inset-0 bg-black/10 backdrop-blur-[1px]" onClick={onClose} />
      <div
        ref={popoverRef}
        className="relative md:fixed z-[10000] animate-in fade-in zoom-in-95 duration-200 pointer-events-auto w-[90%] md:w-auto"
        style={isMobile ? {} : adjustedStyle}
        onClick={(e) => e.stopPropagation()}
      >
        <Card className="w-full max-w-[400px] shadow-2xl border-border bg-background/98 overflow-hidden border">
          <div className="p-5 space-y-4">
            {error ? (
              <div className="flex flex-col items-center justify-center py-6 gap-3 text-center">
                <AlertCircle className="h-10 w-10 text-destructive" />
                <p className="font-bold text-destructive">Erro de Conexão</p>
                <p className="text-xs text-muted-foreground px-4">{error}</p>
                <Button variant="outline" size="sm" onClick={onClose}>Fechar</Button>
              </div>
            ) : loading ? (
              <div className="flex flex-col items-center justify-center py-10 gap-3">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-sm text-muted-foreground animate-pulse font-medium">Analyzing "{word}"...</p>
              </div>
            ) : data ? (
              <>
                <div className="flex items-start justify-between gap-4 border-b pb-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-2xl font-bold capitalize truncate">{word}</h3>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={handleSpeak}
                        className="h-8 w-8 rounded-full text-primary hover:bg-primary/10"
                        title="Ouvir pronúncia"
                      >
                        <Volume2 className="h-5 w-5" />
                      </Button>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <Languages className="h-4 w-4 text-primary shrink-0" />
                      <span className="text-sm font-semibold text-primary">
                        {renderContent(data.word_translation)}
                      </span>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full h-8 w-8">
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                {/* Definição em Inglês */}
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <Book className="h-3.5 w-3.5 text-muted-foreground" />
                    <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Dictionary Definition (EN)</p>
                  </div>
                  <p className="text-sm leading-relaxed bg-muted/30 p-2 rounded-md border text-foreground/90 italic">
                    {renderContent(data.definition)}
                  </p>
                </div>

                {/* Contexto em Inglês */}
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
                    <Lightbulb className="h-3.5 w-3.5" />
                    <p className="text-[10px] font-bold uppercase tracking-widest">In this context (EN)</p>
                  </div>
                  <p className="text-sm">
                    {renderContent(data.context_definition)}
                  </p>
                </div>

                {/* Tradução da Frase Dinâmica */}
                <div className="space-y-2 p-3 bg-primary/5 rounded-lg border border-primary/10">
                  <div className="flex items-center gap-2 mb-1">
                    <Quote className="h-3 w-3 text-primary" />
                    <p className="text-[10px] font-bold uppercase tracking-widest text-primary">
                      Tradução da Frase ({language})
                    </p>
                  </div>
                  <p className="text-sm font-medium leading-snug">
                    {renderContent(data.sentence_translation)}
                  </p>
                </div>
              </>
            ) : null}
          </div>
        </Card>
      </div>
    </div>
  )
}