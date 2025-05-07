"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"

export default function Account() {
  const [user] = useState({
    name: "John Doe",
    email: "john.doe@example.com",
    avatar: "",
    initials: "JD",
    subscription: "Premium",
    testsTaken: 12,
    averageScore: 720,
  })

  return (
    <div className="container py-10">
      <div className="flex flex-col md:flex-row gap-8">
        <div className="md:w-1/3">
          <Card>
            <CardHeader>
              <div className="flex flex-col items-center space-y-3">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={user.avatar} alt={user.name} />
                  <AvatarFallback className="text-xl">{user.initials}</AvatarFallback>
                </Avatar>
                <div className="text-center">
                  <CardTitle>{user.name}</CardTitle>
                  <CardDescription>{user.email}</CardDescription>
                </div>
                <Badge variant="secondary">{user.subscription} Member</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tests Taken</span>
                  <span className="font-medium">{user.testsTaken}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Average Score</span>
                  <span className="font-medium">{user.averageScore}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Member Since</span>
                  <span className="font-medium">Jan 2023</span>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full">
                View Progress Report
              </Button>
            </CardFooter>
          </Card>
        </div>

        <div className="md:w-2/3">
          <Tabs defaultValue="profile">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="profile">Profile</TabsTrigger>
              <TabsTrigger value="subscription">Subscription</TabsTrigger>
              <TabsTrigger value="notifications">Notifications</TabsTrigger>
            </TabsList>

            <TabsContent value="profile" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Profile Information</CardTitle>
                  <CardDescription>Update your account information</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input id="name" defaultValue={user.name} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" defaultValue={user.email} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="current-password">Current Password</Label>
                    <Input id="current-password" type="password" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="new-password">New Password</Label>
                    <Input id="new-password" type="password" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirm-password">Confirm New Password</Label>
                    <Input id="confirm-password" type="password" />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button>Save Changes</Button>
                </CardFooter>
              </Card>
            </TabsContent>

            <TabsContent value="subscription" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Subscription Plan</CardTitle>
                  <CardDescription>Manage your subscription</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium">Current Plan: Premium</h3>
                        <p className="text-sm text-muted-foreground">Renews on October 15, 2023</p>
                      </div>
                      <Badge>Active</Badge>
                    </div>

                    <div className="border rounded-lg p-4">
                      <div className="flex justify-between items-center mb-4">
                        <div>
                          <h4 className="font-medium">Premium Plan</h4>
                          <p className="text-sm text-muted-foreground">$15.99 per month</p>
                        </div>
                        <Badge variant="outline">Current</Badge>
                      </div>
                      <ul className="space-y-2 text-sm">
                        <li className="flex items-center gap-2">
                          <div className="h-2 w-2 rounded-full bg-primary"></div>
                          <span>Unlimited practice tests</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <div className="h-2 w-2 rounded-full bg-primary"></div>
                          <span>Detailed performance analytics</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <div className="h-2 w-2 rounded-full bg-primary"></div>
                          <span>Access to all learning materials</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button variant="outline">Cancel Subscription</Button>
                  <Button>Change Plan</Button>
                </CardFooter>
              </Card>
            </TabsContent>

            <TabsContent value="notifications" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Notification Settings</CardTitle>
                  <CardDescription>Manage how you receive notifications</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="email-notifications">Email Notifications</Label>
                      <p className="text-sm text-muted-foreground">Receive emails about your account activity</p>
                    </div>
                    <Switch id="email-notifications" defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="marketing-emails">Marketing Emails</Label>
                      <p className="text-sm text-muted-foreground">Receive emails about new features and offers</p>
                    </div>
                    <Switch id="marketing-emails" />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="study-reminders">Study Reminders</Label>
                      <p className="text-sm text-muted-foreground">Get reminders to practice regularly</p>
                    </div>
                    <Switch id="study-reminders" defaultChecked />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button>Save Preferences</Button>
                </CardFooter>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
