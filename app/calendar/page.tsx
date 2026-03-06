import { createServiceClient } from '@/lib/supabase/server'
import { getUser } from '@/lib/auth'
import Card from '@/components/ui/Card'
import BottomNav from '@/components/BottomNav'

export default async function CalendarPage() {
  const supabase = createServiceClient()
  const user = await getUser()

  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59).toISOString()

  const [{ data: meals }, { data: workouts }] = await Promise.all([
    supabase
      .from('meals')
      .select('logged_at, calories')
      .eq('user_id', user.id)
      .gte('logged_at', startOfMonth)
      .lte('logged_at', endOfMonth),
    supabase
      .from('workouts')
      .select('performed_at, calories_burned')
      .eq('user_id', user.id)
      .gte('performed_at', startOfMonth)
      .lte('performed_at', endOfMonth),
  ])

  const dayData: Record<string, { meals: number; calories: number; workouts: number; burned: number }> = {}

  for (const meal of meals ?? []) {
    const day = meal.logged_at.split('T')[0]
    if (!dayData[day]) dayData[day] = { meals: 0, calories: 0, workouts: 0, burned: 0 }
    dayData[day].meals += 1
    dayData[day].calories += meal.calories ?? 0
  }

  for (const workout of workouts ?? []) {
    const day = workout.performed_at.split('T')[0]
    if (!dayData[day]) dayData[day] = { meals: 0, calories: 0, workouts: 0, burned: 0 }
    dayData[day].workouts += 1
    dayData[day].burned += workout.calories_burned ?? 0
  }

  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()
  const firstDayOfWeek = new Date(now.getFullYear(), now.getMonth(), 1).getDay()
  const monthName = now.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })

  const days = Array.from({ length: daysInMonth }, (_, i) => {
    const dayNum = i + 1
    const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`
    return { dayNum, dateStr, data: dayData[dateStr] }
  })

  return (
    <div className="px-4 py-6">
      <h1 className="mb-6 text-2xl font-bold">Calendar</h1>

      <Card>
        <h2 className="mb-4 text-center font-semibold">{monthName}</h2>
        <div className="grid grid-cols-7 gap-1 text-center text-xs">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
            <div key={d} className="py-1 font-medium text-gray-400">{d}</div>
          ))}
          {Array.from({ length: firstDayOfWeek }).map((_, i) => (
            <div key={`empty-${i}`} />
          ))}
          {days.map(({ dayNum, data }) => {
            const isToday = dayNum === now.getDate()
            const hasData = !!data
            return (
              <div
                key={dayNum}
                className={`rounded-lg py-2 ${
                  isToday ? 'bg-primary-600 font-bold text-white' : ''
                } ${hasData && !isToday ? 'bg-primary-50' : ''}`}
              >
                <span className="text-sm">{dayNum}</span>
                {hasData && (
                  <div className="mt-0.5 flex justify-center gap-0.5">
                    {data.meals > 0 && <span className="h-1 w-1 rounded-full bg-green-400" />}
                    {data.workouts > 0 && <span className="h-1 w-1 rounded-full bg-blue-400" />}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </Card>

      {Object.entries(dayData)
        .sort(([a], [b]) => b.localeCompare(a))
        .slice(0, 7)
        .map(([date, data]) => (
          <Card key={date} className="mt-3">
            <p className="text-sm font-medium">
              {new Date(date + 'T12:00:00').toLocaleDateString('en-US', {
                weekday: 'short',
                month: 'short',
                day: 'numeric',
              })}
            </p>
            <div className="mt-1 flex gap-4 text-xs text-gray-500">
              <span>{data.meals} meals</span>
              <span>{data.calories} kcal eaten</span>
              <span>{data.workouts} workouts</span>
              <span>{data.burned} kcal burned</span>
            </div>
          </Card>
        ))}

      <BottomNav />
    </div>
  )
}
