import { useCallback, useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'



import { filterCalendarEvents } from '../../lib/calendar/api'

import {

  clearCalendarSession,

  ensureCalendarSession,

  getCalendarSession,

  refreshCalendarSession,

} from '../../lib/calendar/session'

import { getStoredUser } from '../../lib/session'
import { useStoredUser } from '../../lib/useStoredUser'



import Calendar from '../../components/Calendar/Calendar'

import EventModal from '../../components/Calendar/EventModal'

import TodoList from '../../components/Calendar/Todolist'

import DashboardNav from '../../components/Dashboard/DashboardNav'

import DashboardLoginCard from '../../components/Dashboard/DashboardLoginCard'



import '../Dashboard/Dashboard.css'



import './Schedule.css'



function Schedule() {
  const [searchParams] = useSearchParams()
  const initialKeyword = searchParams.get('q') ?? ''

  const calendarSession = getCalendarSession()

  const [user, setUser] = useStoredUser()



  const [allEvents, setAllEvents] = useState(() => calendarSession?.events ?? [])

  const [loading, setLoading] = useState(() => !!getStoredUser() && !calendarSession)

  const [selectedDate, setSelectedDate] = useState(null)

  const [modalOpen, setModalOpen] = useState(false)

  const [keyword, setKeyword] = useState(initialKeyword)

  const [appliedKeyword, setAppliedKeyword] = useState(initialKeyword)

  const [category, setCategory] = useState('')



  const filteredEvents = useMemo(

    () => filterCalendarEvents(allEvents, { keyword: appliedKeyword, category }),

    [allEvents, appliedKeyword, category],

  )



  const reloadEvents = useCallback(async () => {

    try {

      const session = await refreshCalendarSession()

      setAllEvents(session.events)

    } catch (err) {

      console.error(err)

    }

  }, [])



  useEffect(() => {

    if (!user) {

      clearCalendarSession()

      setAllEvents([])

      setLoading(false)

      return undefined

    }



    const cached = getCalendarSession()

    if (cached) {

      setAllEvents(cached.events)

      setLoading(false)

    } else {

      setLoading(true)

    }



    let cancelled = false



    ensureCalendarSession()

      .then((session) => {

        if (!cancelled) {

          setAllEvents(session.events)

        }

      })

      .catch((err) => {

        console.error(err)

        if (!cancelled) {

          setAllEvents([])

        }

      })

      .finally(() => {

        if (!cancelled) {

          setLoading(false)

        }

      })



    return () => {

      cancelled = true

    }

  }, [user])



  const handleSearch = (e) => {

    e.preventDefault()

    setAppliedKeyword(keyword)

  }



  if (!user) {

    return (

      <div className="dashboardPage">

        <DashboardNav user={null} />

        <main className="dashboardMain">

          <div className="Dashboard">

            <div className="dashboardHeader">

              <div>

                <h1 className="dashboardTitle">학사 및 개인 일정</h1>

                <p className="dashboardSubtitle">

                  중요한 학사 일정과 나의 개인 일정을 한눈에 관리하세요

                </p>

              </div>

            </div>

            <DashboardLoginCard description="일정과 캘린더를 확인하려면 로그인해주세요." />

          </div>

        </main>

      </div>

    )

  }



  return (

    <div className="dashboardPage scheduleDashboardPage">

      <DashboardNav user={user} onLogout={() => setUser(null)} />



      <main className="dashboardMain">

        <div className="Dashboard">

          <div className="dashboardHeader">

            <div>

              <h1 className="dashboardTitle">학사 및 개인 일정</h1>

              <p className="dashboardSubtitle">

                중요한 학사 일정과 나의 개인 일정을 한눈에 관리하세요

              </p>

            </div>

          </div>



          <div className="schedule-page">

            <div className="schedule-filter-bar">

              <form onSubmit={handleSearch} className="search-form">

                <input

                  type="text"

                  placeholder="일정 키워드 검색..."

                  value={keyword}

                  onChange={(e) => setKeyword(e.target.value)}

                />

                <button type="submit">검색</button>

              </form>



              <select value={category} onChange={(e) => setCategory(e.target.value)}>

                <option value="">전체 카테고리</option>

                <option value="ACADEMIC">학사</option>

                <option value="HOLIDAY">공휴일</option>

                <option value="STUDY">학업</option>

                <option value="WORK">알바</option>

                <option value="PRIVATE">개인</option>

                <option value="OTHER">기타</option>

              </select>

            </div>



            {loading ? (

              <div className="timetableStatus timetableStatus--loading" aria-live="polite" aria-busy="true">

                <span className="timetableStatusSpinner" aria-hidden="true" />

                <span>일정을 불러오는 중...</span>

              </div>

            ) : (

              <div className="schedule-content">

                <div className="calendar-area">

                  <Calendar

                    events={filteredEvents}

                    onDateClick={(date) => {

                      setSelectedDate(date)

                      setModalOpen(true)

                    }}

                  />

                </div>



                <div className="todo-area">

                  <TodoList items={filteredEvents} onEventsChange={reloadEvents} />

                </div>

              </div>

            )}



            <EventModal

              modalOpen={modalOpen}

              closeModal={() => setModalOpen(false)}

              date={selectedDate}

              scheduleItems={filteredEvents.filter((event) => event.date === selectedDate)}

              onEventsChange={reloadEvents}

            />

          </div>

        </div>

      </main>

    </div>

  )

}



export default Schedule

