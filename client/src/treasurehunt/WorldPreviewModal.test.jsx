import { describe, it, expect, vi } from 'vitest'
import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import WorldPreviewModal from './WorldPreviewModal'

describe('WorldPreviewModal', () => {
  const mockWorld = {
    id: 'geometry-cave',
    name: 'Geometry Cave',
    icon: '📐',
    topics: [
      { topic: 'angles', status: 'active' },
      { topic: 'triangles', status: 'active' },
      { topic: 'circleth', status: 'coming_soon' },
    ],
  }

  it('renders nothing when isOpen is false', () => {
    const { container } = render(
      <WorldPreviewModal isOpen={false} world={mockWorld} onClose={vi.fn()} onContinue={vi.fn()} />
    )
    expect(container.firstChild).toBeNull()
  })

  it('renders world title, topic count, and topics when open', () => {
    render(
      <WorldPreviewModal isOpen={true} world={mockWorld} onClose={vi.fn()} onContinue={vi.fn()} />
    )

    expect(screen.getByText('Geometry Cave')).toBeDefined()
    expect(screen.getByText('2 of 3 topics available')).toBeDefined()
    expect(screen.getByText('Angles')).toBeDefined()
    expect(screen.getByText('Triangles')).toBeDefined()
    expect(screen.getByText('Circle Theorems')).toBeDefined()
    expect(screen.getByText('Soon')).toBeDefined()
  })

  it('calls onContinue when Continue button is clicked', () => {
    const onContinueMock = vi.fn()
    render(
      <WorldPreviewModal isOpen={true} world={mockWorld} onClose={vi.fn()} onContinue={onContinueMock} />
    )

    fireEvent.click(screen.getByText('Continue'))
    expect(onContinueMock).toHaveBeenCalledTimes(1)
  })

  it('calls onClose when Cancel button or Escape key is pressed', () => {
    const onCloseMock = vi.fn()
    render(
      <WorldPreviewModal isOpen={true} world={mockWorld} onClose={onCloseMock} onContinue={vi.fn()} />
    )

    fireEvent.click(screen.getByText('Cancel'))
    expect(onCloseMock).toHaveBeenCalledTimes(1)

    fireEvent.keyDown(window, { key: 'Escape' })
    expect(onCloseMock).toHaveBeenCalledTimes(2)
  })
})
