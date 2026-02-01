"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { BookOpen, Eraser, ClipboardPaste, FileText, Globe } from "lucide-react"
import { WordPopover } from "@/components/word-popover"

const API_URL = "https://ai-reader-n8xz.onrender.com/analisar";

const LANGUAGES = [
  { code: "pt", name: "Portuguese" },
  { code: "es", name: "Spanish" },
  { code: "fr", name: "French" },
  { code: "de", name: "German" },
  { code: "it", name: "Italian" },
  { code: "zh", name: "Chinese" },
  { code: "ja", name: "Japanese" },
  { code: "ru", name: "Russian" },
  { code: "ar", name: "Arabic" },
  { code: "hi", name: "Hindi" },
];

export interface WordData {
  definition: string
  synonyms: string[]
  context_definition: string
  word_translation: string
  sentence_translation: string
}

export function WebReader() {
  const [text, setText] = useState("")
  const [inputText, setInputText] = useState("")
  const [isEditing, setIsEditing] = useState(true)
  const [selectedWord, setSelectedWord] = useState<string | null>(null)
  const [targetLang, setTargetLang] = useState("Portuguese")
  const [popoverPosition, setPopoverPosition] = useState({ x: 0, y: 0 })
  const [showPopover, setShowPopover] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [currentWordData, setCurrentWordData] = useState<WordData | null>(null)
  const [apiError, setApiError] = useState<string | null>(null)

  useEffect(() => {
    setIsEditing(text.trim().length === 0)
  }, [text])

  const handleConfirmText = () => {
    if (inputText.trim()) setText(inputText)
  }

  const handleClosePopover = () => {
    setShowPopover(false)
    setSelectedWord(null)
    setCurrentWordData(null)
    setApiError(null)
  }

  const handleWordClick = async (e: React.MouseEvent) => {
    if (isLoading) return

    const target = e.target as HTMLElement
    const word = target.textContent?.trim().replace(/[.,!?;:()]/g, "")
    const contextSentence = target.parentElement?.textContent || text;

    if (!word) return

    setPopoverPosition({ x: e.clientX, y: e.clientY })
    setSelectedWord(word)
    setShowPopover(true)
    setIsLoading(true)
    setApiError(null)

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          word,
          sentence: contextSentence,
          language: targetLang
        }),
      });

      if (!response.ok) throw new Error('Server error');
      const data = await response.json();
      setCurrentWordData(data);
    } catch (error: any) {
      setApiError("Connection lost or timeout.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur shadow-sm">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between gap-2">

          {/* Logo e Título */}
          <div className="flex items-center gap-2 min-w-0">
            <BookOpen className="h-6 w-6 text-primary shrink-0" />
            <h1 className="text-lg font-bold tracking-tight truncate hidden xs:block">
              Web Reader
            </h1>
          </div>

          {/* Controles: Seletor e Botão New */}
          <div className="flex items-center gap-2 shrink-0">
            <div className="flex items-center gap-1.5 bg-muted/50 px-2 py-1.5 rounded-full border border-border/60">
              <Globe className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
              <select
                className="bg-transparent text-xs font-bold focus:outline-none cursor-pointer pr-1"
                value={targetLang}
                onChange={(e) => setTargetLang(e.target.value)}
              >
                {LANGUAGES.map((l) => (
                  <option key={l.code} value={l.name}>{l.name}</option>
                ))}
              </select>
            </div>

            {!isEditing && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => { setText(""); setInputText("") }}
                className="h-9 px-2 sm:px-3 text-xs gap-1.5 hover:bg-destructive/10 hover:text-destructive"
              >
                <Eraser className="h-4 w-4" />
                <span className="hidden sm:inline">New Text</span>
              </Button>
            )}
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 flex justify-center">
        <div className="w-full max-w-4xl">
          {isEditing ? (
            <Card className="p-6 space-y-4 shadow-xl border-dashed border-2">
              <div className="flex flex-col items-center justify-center py-6 text-center">
                <div className="bg-primary/10 p-4 rounded-full mb-4">
                  <ClipboardPaste className="h-8 w-8 text-primary" />
                </div>
                <h2 className="text-2xl font-bold">Reader Mode</h2>
                <p className="text-muted-foreground mt-1">Paste your text and click on any word</p>
              </div>

              <Textarea
                placeholder="Paste English text here..."
                className="min-h-[300px] text-base sm:text-lg p-4 resize-none leading-relaxed"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
              />

              <Button className="w-full h-12 text-lg gap-2" onClick={handleConfirmText} disabled={!inputText.trim()}>
                <FileText className="h-5 w-5" /> Start Reading
              </Button>
            </Card>
          ) : (
            <Card className="p-6 sm:p-10 shadow-lg border-border/40 min-h-[60vh]">
              <article className="prose prose-slate prose-lg max-w-none font-serif leading-relaxed whitespace-pre-wrap">
                {text.split("\n").map((paragraph, pIndex) => (
                  <p key={pIndex} className="mb-4 text-lg sm:text-xl">
                    {paragraph.split(/\s+/).map((word, wIndex) => (
                      <span
                        key={wIndex}
                        className="cursor-pointer hover:bg-primary/10 hover:text-primary rounded px-0.5 transition-all inline-block"
                        onClick={handleWordClick}
                      >
                        {word}{" "}
                      </span>
                    ))}
                  </p>
                ))}
              </article>
            </Card>
          )}
        </div>
      </main>

      {showPopover && selectedWord && (
        <WordPopover
          word={selectedWord}
          data={currentWordData}
          loading={isLoading}
          error={apiError}
          position={popoverPosition}
          onClose={handleClosePopover}
          language={targetLang}
        />
      )}
    </div>
  )
}