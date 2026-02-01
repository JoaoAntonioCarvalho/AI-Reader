"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { BookMarked, X, Trash2 } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"

interface SavedWord {
    word: string
    definition: string
    synonyms: string[]
    translation: string
    mnemonic: string
    timestamp: Date
}

interface VocabularyBankProps {
    vocabulary: SavedWord[]
    onRemove: (word: string) => void
}

export function VocabularyBank({ vocabulary, onRemove }: VocabularyBankProps) {
    return (
        <Card className="shadow-lg h-[calc(100vh-8rem)] flex flex-col">
            <div className="p-4 border-b border-border">
                <div className="flex items-center gap-2">
                    <BookMarked className="h-5 w-5 text-primary" />
                    <h2 className="text-lg font-semibold text-foreground">Vocabulary Bank</h2>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                    {vocabulary.length} {vocabulary.length === 1 ? "word" : "words"} saved
                </p>
            </div>

            <ScrollArea className="flex-1">
                <div className="p-4 space-y-3">
                    {vocabulary.length === 0 ? (
                        <div className="text-center py-12">
                            <BookMarked className="h-12 w-12 text-muted-foreground/50 mx-auto mb-3" />
                            <p className="text-sm text-muted-foreground">Click on any word in the text to save it here</p>
                        </div>
                    ) : (
                        vocabulary.map((item, index) => (
                            <Card key={index} className="p-4 space-y-2 bg-card hover:bg-accent/5 transition-colors">
                                <div className="flex items-start justify-between">
                                    <h3 className="font-semibold text-base text-foreground capitalize">{item.word}</h3>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-7 w-7 -mt-1 -mr-1 text-muted-foreground hover:text-destructive"
                                        onClick={() => onRemove(item.word)}
                                    >
                                        <X className="h-4 w-4" />
                                    </Button>
                                </div>

                                <p className="text-sm text-foreground/90 leading-relaxed line-clamp-2">{item.definition}</p>

                                {item.synonyms.length > 0 && (
                                    <div className="flex flex-wrap gap-1">
                                        {item.synonyms.slice(0, 3).map((syn, synIndex) => (
                                            <span
                                                key={synIndex}
                                                className="px-2 py-0.5 bg-secondary text-secondary-foreground text-xs rounded"
                                            >
                                                {syn}
                                            </span>
                                        ))}
                                    </div>
                                )}

                                <p className="text-xs text-muted-foreground pt-1">{new Date(item.timestamp).toLocaleDateString()}</p>
                            </Card>
                        ))
                    )}
                </div>
            </ScrollArea>

            {vocabulary.length > 0 && (
                <div className="p-4 border-t border-border">
                    <Button
                        variant="outline"
                        size="sm"
                        className="w-full gap-2 text-destructive hover:text-destructive bg-transparent"
                        onClick={() => vocabulary.forEach((v) => onRemove(v.word))}
                    >
                        <Trash2 className="h-4 w-4" />
                        Clear All
                    </Button>
                </div>
            )}
        </Card>
    )
}
