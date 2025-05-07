"use client"

import { useState } from "react"
import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { Search, Plus, MoreHorizontal, ArrowUpDown, ChevronDown, Download, Trash, Pencil, Eye } from "lucide-react"

const courses = [
  {
    id: "1",
    title: "TOEIC Full Preparation",
    level: "All Levels",
    status: "published",
    students: 452,
    createdAt: "2023-01-10",
    updatedAt: "2023-03-15",
  },
  {
    id: "2",
    title: "Listening Mastery",
    level: "Intermediate",
    status: "published",
    students: 328,
    createdAt: "2023-02-05",
    updatedAt: "2023-03-20",
  },
  {
    id: "3",
    title: "Grammar Essentials",
    level: "Beginner",
    status: "published",
    students: 271,
    createdAt: "2023-01-20",
    updatedAt: "2023-02-28",
  },
  {
    id: "4",
    title: "Business Vocabulary",
    level: "Advanced",
    status: "published",
    students: 184,
    createdAt: "2023-02-15",
    updatedAt: "2023-03-10",
  },
  {
    id: "5",
    title: "Reading Comprehension",
    level: "Intermediate",
    status: "draft",
    students: 0,
    createdAt: "2023-03-01",
    updatedAt: "2023-03-01",
  },
  {
    id: "6",
    title: "Speaking Practice",
    level: "All Levels",
    status: "published",
    students: 156,
    createdAt: "2023-01-15",
    updatedAt: "2023-02-20",
  },
  {
    id: "7",
    title: "TOEIC Test Strategies",
    level: "Advanced",
    status: "published",
    students: 203,
    createdAt: "2022-12-10",
    updatedAt: "2023-03-05",
  },
  {
    id: "8",
    title: "Vocabulary Builder",
    level: "Beginner",
    status: "draft",
    students: 0,
    createdAt: "2023-03-10",
    updatedAt: "2023-03-10",
  },
]

export default function AdminCourses() {
  const [searchTerm, setSearchTerm] = useState("")

  const filteredCourses = courses.filter(
    (course) =>
      course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.level.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Courses</h2>
          <p className="text-muted-foreground">Manage your TOEIC preparation courses</p>
        </div>
        <Button asChild>
          <Link to="/admin/courses/add">
            <Plus className="mr-2 h-4 w-4" /> Add Course
          </Link>
        </Button>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search courses..."
              className="pl-8 w-[300px]"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="ml-auto">
                <ChevronDown className="mr-2 h-4 w-4" /> Filter
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[200px]">
              <DropdownMenuLabel>Filter by</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <div className="flex items-center gap-2 w-full">
                  <input type="checkbox" id="published" className="h-4 w-4" />
                  <label htmlFor="published">Published</label>
                </div>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <div className="flex items-center gap-2 w-full">
                  <input type="checkbox" id="draft" className="h-4 w-4" />
                  <label htmlFor="draft">Draft</label>
                </div>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <div className="flex items-center gap-2 w-full">
                  <input type="checkbox" id="beginner" className="h-4 w-4" />
                  <label htmlFor="beginner">Beginner</label>
                </div>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <div className="flex items-center gap-2 w-full">
                  <input type="checkbox" id="intermediate" className="h-4 w-4" />
                  <label htmlFor="intermediate">Intermediate</label>
                </div>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <div className="flex items-center gap-2 w-full">
                  <input type="checkbox" id="advanced" className="h-4 w-4" />
                  <label htmlFor="advanced">Advanced</label>
                </div>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <Button variant="outline" size="sm" className="w-full">
                Apply Filters
              </Button>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <Button variant="outline" size="sm" className="ml-auto">
          <Download className="mr-2 h-4 w-4" /> Export
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[300px]">
                <div className="flex items-center gap-1">
                  Course Title
                  <ArrowUpDown className="h-4 w-4" />
                </div>
              </TableHead>
              <TableHead>
                <div className="flex items-center gap-1">
                  Level
                  <ArrowUpDown className="h-4 w-4" />
                </div>
              </TableHead>
              <TableHead>
                <div className="flex items-center gap-1">
                  Status
                  <ArrowUpDown className="h-4 w-4" />
                </div>
              </TableHead>
              <TableHead>
                <div className="flex items-center gap-1">
                  Students
                  <ArrowUpDown className="h-4 w-4" />
                </div>
              </TableHead>
              <TableHead>
                <div className="flex items-center gap-1">
                  Last Updated
                  <ArrowUpDown className="h-4 w-4" />
                </div>
              </TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredCourses.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center h-24">
                  No courses found.
                </TableCell>
              </TableRow>
            ) : (
              filteredCourses.map((course) => (
                <TableRow key={course.id}>
                  <TableCell>
                    <div className="font-medium">{course.title}</div>
                  </TableCell>
                  <TableCell>{course.level}</TableCell>
                  <TableCell>
                    <Badge variant={course.status === "published" ? "default" : "secondary"}>
                      {course.status === "published" ? "Published" : "Draft"}
                    </Badge>
                  </TableCell>
                  <TableCell>{course.students}</TableCell>
                  <TableCell>{new Date(course.updatedAt).toLocaleDateString()}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Actions</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>
                          <Eye className="mr-2 h-4 w-4" /> View Course
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Pencil className="mr-2 h-4 w-4" /> Edit
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-red-600">
                          <Trash className="mr-2 h-4 w-4" /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          Showing <strong>1</strong> to <strong>{filteredCourses.length}</strong> of{" "}
          <strong>{filteredCourses.length}</strong> courses
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" disabled>
            Previous
          </Button>
          <Button variant="outline" size="sm" className="px-4">
            1
          </Button>
          <Button variant="outline" size="sm" disabled>
            Next
          </Button>
        </div>
      </div>
    </div>
  )
}
