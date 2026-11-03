import { describe, it, expect, vi, beforeEach } from 'vitest'
import React from 'react'
import { render, screen, fireEvent, act } from '@testing-library/react'
import TreasureHuntApp from './TreasureHuntApp'

describe('TreasureHuntApp direct world loading', () => {
  beforeEach(() => {
    localStorage.clear()
    sessionStorage.setItem('th-how-to-play-seen', '1')
    vi.stubGlobal(
      'fetch',
      vi.fn().mockImplementation(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve([]),
        })
      )
    )
  })

  it('renders the selected world directly without flashing all worlds grid when initialWorldId is provided', () => {
    const onBackMock = vi.fn()
    act(() => {
      render(<TreasureHuntApp initialWorldId="merchants-market" onBack={onBackMock} />)
    })

    // Heading should be Merchant's Market, NOT general all worlds grid
    expect(screen.getByRole('heading', { level: 1 }).textContent).toBe("Merchant's Market")
    // Subtitle should be world-specific
    expect(screen.getByText("Treasure Hunt — Merchant's Market")).toBeDefined()
    // Confidence selection for this world should be shown immediately
    expect(screen.getByText("How confident are you in Merchant's Market?")).toBeDefined()
    // All worlds grid titles should NOT be rendered in the document
    expect(screen.queryByText('Island of Numbers')).toBeNull()
    expect(screen.queryByText('Calculus Cliffs')).toBeNull()
  })

  it('shows resume prompt on top of the selected world if progress was saved', () => {
    const onBackMock = vi.fn()
    const progressKey = 'tenali-treasurehunt-progress-guest'
    localStorage.setItem(
      progressKey,
      JSON.stringify({
        'merchants-market': {
          topicTiers: { percent: 'easy' },
          hasPlayed: true,
        },
      })
    )

    act(() => {
      render(<TreasureHuntApp initialWorldId="merchants-market" onBack={onBackMock} />)
    })

    // Resume prompt should appear
    expect(
      screen.getByText("You've played this world before. Use your previous difficulty levels or recalibrate from scratch.")
    ).toBeDefined()
    // It should have Use previous difficulty levels, Start fresh, and Cancel
    expect(screen.getByText('Use previous difficulty levels')).toBeDefined()
    expect(screen.getByText('Start fresh')).toBeDefined()
    expect(screen.getByText('Cancel')).toBeDefined()

    // All worlds hub should NOT be in the background
    expect(screen.queryByText('Island of Numbers')).toBeNull()

    // Clicking Cancel calls onBack
    act(() => {
      fireEvent.click(screen.getByText('Cancel'))
    })
    expect(onBackMock).toHaveBeenCalledTimes(1)
  })

  it('calls onBack directly when clicking Back button', () => {
    const onBackMock = vi.fn()
    act(() => {
      render(<TreasureHuntApp initialWorldId="merchants-market" onBack={onBackMock} />)
    })

    act(() => {
      fireEvent.click(screen.getByText('← Back'))
    })
    expect(onBackMock).toHaveBeenCalledTimes(1)
  })
})
