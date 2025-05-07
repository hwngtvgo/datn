"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from "@/components/ui/drawer"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BookOpen } from "lucide-react"
import VocabularyNotes from "./VocabularyNotes.tsx"

export default function DrawerContainer() {
  const [open, setOpen] = useState(false)

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <Button variant="outline" size="icon" className="fixed bottom-4 left-4 rounded-full h-12 w-12 shadow-lg">
          <BookOpen className="h-6 w-6" />
          <span className="sr-only">Open notes</span>
        </Button>
      </DrawerTrigger>
      <DrawerContent className="h-[80vh]">
        <DrawerHeader>
          <DrawerTitle>Ghi Chú Học Tập</DrawerTitle>
        </DrawerHeader>
        <div className="px-4">
          <Tabs defaultValue="vocabulary">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="vocabulary">Từ Vựng</TabsTrigger>
              <TabsTrigger value="grammar">Ngữ Pháp</TabsTrigger>
              <TabsTrigger value="listening">Nghe</TabsTrigger>
            </TabsList>
            <TabsContent value="vocabulary">
              <VocabularyNotes />
            </TabsContent>
            <TabsContent value="grammar">
              <div className="py-4">
                <p className="text-center text-muted-foreground">Chưa có ghi chú ngữ pháp nào.</p>
              </div>
            </TabsContent>
            <TabsContent value="listening">
              <div className="py-4">
                <p className="text-center text-muted-foreground">Chưa có ghi chú luyện nghe nào.</p>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </DrawerContent>
    </Drawer>
  )
}
