"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { BookOpen, Eraser, ClipboardPaste, FileText, Upload, Globe } from "lucide-react"
import { WordPopover } from "@/components/word-popover"

const API_URL = "http://127.0.0.1:3001/analisar";

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
          language: targetLang // Enviando o idioma selecionado
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
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3">
              <BookOpen className="h-6 w-6 text-primary" />
              <h1 className="text-xl font-semibold tracking-tight">Web Reader</h1>
            </div>

            {/* Seletor de Idioma */}
            <div className="hidden md:flex items-center gap-2 bg-muted/50 px-3 py-1.5 rounded-full border">
              <Globe className="h-4 w-4 text-muted-foreground" />
              <select
                className="bg-transparent text-sm font-medium focus:outline-none cursor-pointer"
                value={targetLang}
                onChange={(e) => setTargetLang(e.target.value)}
              >
                {LANGUAGES.map((l) => (
                  <option key={l.code} value={l.name}>{l.name}</option>
                ))}
              </select>
            </div>
          </div>

          {!isEditing && (
            <Button variant="ghost" size="sm" onClick={() => { setText(""); setInputText("") }} className="gap-2">
              <Eraser className="h-4 w-4" /> New Text
            </Button>
          )}
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 flex justify-center">
        <div className="w-full max-w-4xl">
          {isEditing ? (
            <Card className="p-6 space-y-4 shadow-xl border-dashed border-2">
              <div className="flex flex-col items-center justify-center py-6 text-center">
                <div className="bg-primary/10 p-4 rounded-full mb-4">
                  <ClipboardPaste className="h-8 w-8 text-primary" />
                </div>
                <h2 className="text-2xl font-bold">Reader Mode</h2>
                <p className="text-muted-foreground mt-1">Select your language and paste text</p>
              </div>

              <Textarea
                placeholder="Paste english text here..."
                className="min-h-[300px] text-lg p-4 resize-none leading-relaxed"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
              />

              <Button className="w-full h-12 text-lg gap-2" onClick={handleConfirmText} disabled={!inputText.trim()}>
                <FileText className="h-5 w-5" /> Start Reading
              </Button>
            </Card>
          ) : (
            <Card className="p-6 sm:p-10 shadow-lg border-border/40">
              <article className="prose prose-slate prose-lg max-w-none font-serif leading-relaxed whitespace-pre-wrap">
                {text.split("\n").map((paragraph, pIndex) => (
                  <p key={pIndex} className="mb-4">
                    {paragraph.split(/\s+/).map((word, wIndex) => (
                      <span
                        key={wIndex}
                        className="cursor-pointer hover:text-primary transition-colors inline-block"
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