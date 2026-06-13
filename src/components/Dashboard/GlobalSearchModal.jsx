import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { groupSearchResults, searchGlobal } from '../../lib/globalSearch'
import './GlobalSearchModal.css'

export default function GlobalSearchModal({ open, onClose }) {
  const navigate = useNavigate()
  const inputRef = useRef(null)
  const [query, setQuery] = useState('')
  const [activeIndex, setActiveIndex] = useState(0)

  const results = useMemo(() => searchGlobal(query), [query])
  const groupedResults = useMemo(() => groupSearchResults(results), [results])
  const flatResults = useMemo(
    () => groupedResults.flatMap((group) => group.items),
    [groupedResults],
  )

  useEffect(() => {
    if (!open) return undefined

    setQuery('')
    setActiveIndex(0)

    const frame = requestAnimationFrame(() => {
      inputRef.current?.focus()
    })

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    document.body.style.overflow = 'hidden'

    return () => {
      cancelAnimationFrame(frame)
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = ''
    }
  }, [open, onClose])

  useEffect(() => {
    setActiveIndex(0)
  }, [query])

  if (!open) return null

  const handleSelect = (item) => {
    onClose()
    navigate(item.path)
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    if (flatResults[activeIndex]) {
      handleSelect(flatResults[activeIndex])
    }
  }

  const handleInputKeyDown = (event) => {
    if (!flatResults.length) return

    if (event.key === 'ArrowDown') {
      event.preventDefault()
      setActiveIndex((prev) => (prev + 1) % flatResults.length)
    } else if (event.key === 'ArrowUp') {
      event.preventDefault()
      setActiveIndex((prev) => (prev - 1 + flatResults.length) % flatResults.length)
    }
  }

  let resultOffset = 0

  return (
    <div className="globalSearchOverlay" onClick={onClose}>
      <div
        className="globalSearchModal"
        role="dialog"
        aria-modal="true"
        aria-label="전역 검색"
        onClick={(event) => event.stopPropagation()}
      >
        <form className="globalSearchForm" onSubmit={handleSubmit}>
          <span className="globalSearchIcon" aria-hidden="true">
            <svg viewBox="0 0 24 24" width="20" height="20">
              <circle
                cx="11"
                cy="11"
                r="7"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              />
              <path
                d="m16 16 4 4"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </span>
          <input
            ref={inputRef}
            type="search"
            className="globalSearchInput"
            placeholder="페이지, 과제, 장학금, 시설, 수업, 일정 검색..."
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={handleInputKeyDown}
            aria-label="검색어 입력"
          />
          <button type="button" className="globalSearchClose" onClick={onClose} aria-label="검색 닫기">
            ESC
          </button>
        </form>

        <div className="globalSearchResults" role="listbox" aria-label="검색 결과">
          {query.trim() === '' ? (
            <p className="globalSearchHint">UniDash의 메뉴와 콘텐츠를 빠르게 찾아보세요.</p>
          ) : results.length === 0 ? (
            <p className="globalSearchEmpty">검색 결과가 없습니다.</p>
          ) : (
            groupedResults.map((group) => (
              <section key={group.category} className="globalSearchGroup">
                <h3 className="globalSearchGroupTitle">{group.label}</h3>
                <ul className="globalSearchList">
                  {group.items.map((item) => {
                    const currentIndex = resultOffset
                    resultOffset += 1
                    const isActive = currentIndex === activeIndex

                    return (
                      <li key={item.id}>
                        <button
                          type="button"
                          className={`globalSearchItem ${isActive ? 'active' : ''}`}
                          role="option"
                          aria-selected={isActive}
                          onMouseEnter={() => setActiveIndex(currentIndex)}
                          onClick={() => handleSelect(item)}
                        >
                          <span className="globalSearchItemTitle">{item.title}</span>
                          {item.subtitle ? (
                            <span className="globalSearchItemSubtitle">{item.subtitle}</span>
                          ) : null}
                        </button>
                      </li>
                    )
                  })}
                </ul>
              </section>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
