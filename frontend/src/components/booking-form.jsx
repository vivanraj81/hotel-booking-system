import React, { useState } from "react"
import { Calendar } from "./ui/calendar"
import { Button } from "./ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card"
import { format } from "date-fns"

export default function BookingForm() {
  const [selectedDate, setSelectedDate] = useState()
  
  // Calculate date range for next 7 days
  const today = new Date()
  const maxDate = new Date()
  maxDate.setDate(today.getDate() + 7)

  const handleBooking = () => {
    if (selectedDate) {
      alert(`Booking confirmed for: ${format(selectedDate, 'PPP')}`)
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Select Booking Date</CardTitle>
        <CardDescription>
          Choose a date within the next 7 days for your booking
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={setSelectedDate}
          disabled={{
            before: today,
            after: maxDate
          }}
          className="rounded-md border"
        />
        
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">
            Selected: {selectedDate ? format(selectedDate, 'PPP') : 'No date selected'}
          </p>
          
          <Button 
            onClick={handleBooking}
            disabled={!selectedDate}
            className="w-full"
          >
            Book Now
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
