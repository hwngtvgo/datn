"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Plus, Save, Trash } from "lucide-react"

export default function VocabularyNotes() {
  const [notes, setNotes] = useState<Array<{
    id: number;
    word: string;
    meaning: string;
    example: string;
  }>>([
    {
      id: 1,
      word: "accommodate",
      meaning: "cung cấp chỗ ở hoặc không gian",
      example: "The hotel can accommodate up to 500 guests.",
    },
    { id: 2, word: "deadline", meaning: "hạn chót", example: "We must meet the deadline for this project." },
  ])
  const [newNote, setNewNote] = useState({ word: "", meaning: "", example: "" })
  const [isAdding, setIsAdding] = useState(false)

  const handleAddNote = () => {
    if (!newNote.word || !newNote.meaning) return

    setNotes([...notes, { id: Date.now(), ...newNote }])
    setNewNote({ word: "", meaning: "", example: "" })
    setIsAdding(false)
  }

  const handleDeleteNote = (id: number) => {
    setNotes(notes.filter((note) => note.id !== id))
  }

  return (
    <div className="space-y-4 py-4">
      {notes.map((note) => (
        <Card key={note.id}>
          <CardContent className="p-4">
            <div className="flex justify-between items-start">
              <div>
                <h4 className="font-bold">{note.word}</h4>
                <p className="text-sm text-muted-foreground">{note.meaning}</p>
                {note.example && <p className="text-sm italic mt-2">"{note.example}"</p>}
              </div>
              <Button variant="ghost" size="icon" onClick={() => handleDeleteNote(note.id)}>
                <Trash className="h-4 w-4" />
                <span className="sr-only">Delete</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}

      {isAdding ? (
        <Card>
          <CardContent className="p-4">
            <div className="space-y-4">
              <div>
                <Label htmlFor="word">Từ vựng</Label>
                <Input
                  id="word"
                  value={newNote.word}
                  onChange={(e) => setNewNote({ ...newNote, word: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="meaning">Nghĩa</Label>
                <Input
                  id="meaning"
                  value={newNote.meaning}
                  onChange={(e) => setNewNote({ ...newNote, meaning: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="example">Ví dụ (không bắt buộc)</Label>
                <Textarea
                  id="example"
                  value={newNote.example}
                  onChange={(e: { target: { value: any } }) => setNewNote({ ...newNote, example: e.target.value })}
                  rows={2}
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsAdding(false)}>
                  Hủy
                </Button>
                <Button onClick={handleAddNote}>
                  <Save className="h-4 w-4 mr-2" />
                  Lưu
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Button onClick={() => setIsAdding(true)} className="w-full">
          <Plus className="h-4 w-4 mr-2" />
          Thêm từ vựng mới
        </Button>
      )}
    </div>
  )
}
