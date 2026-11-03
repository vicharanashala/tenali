import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { render, screen } from '@testing-library/react';
import SectionDrilldownView from './SectionDrilldownView';
import CategoryCardsGrid from './CategoryCardsGrid';
import { TILES } from '../features/tiles';

describe('SectionDrilldownView', () => {
  it('renders section header, puzzle count, and child tiles', () => {
    const mockSection = {
      key: 'language-words',
      title: 'Language & Literacy',
      icon: '📚',
      subtitle: 'Crosswords, Word Searches, Word Creator & Verbal Logic',
      color: 'teal',
    };

    const mockTiles = [
      { key: 'crossword', name: 'Crossword Puzzle', subtitle: 'Fill clues', color: 'orange' },
      { key: 'wordsearch', name: 'Word Search', subtitle: 'Hunt words', color: 'blue' },
    ];

    render(
      <SectionDrilldownView
        section={mockSection}
        tiles={mockTiles}
        completedTopics={[]}
        goldMastery={[]}
        renderCard={(app) => (
          <div key={app.key} data-testid="tile-card">
            {app.name}
          </div>
        )}
      />
    );

    expect(screen.getByText('Language & Literacy')).toBeDefined();
    expect(screen.getByText('2 puzzles')).toBeDefined();
    expect(screen.getAllByTestId('tile-card').length).toBe(2);
  });
});

describe('CategoryCardsGrid', () => {
  it('renders all sections and triggers section selection on click', () => {
    const mockSections = [
      { key: 'number-foundations', title: 'Number Foundations', icon: '🔢', subtitle: 'Arithmetic', color: 'blue' },
      { key: 'language-words', title: 'Language & Literacy', icon: '📚', subtitle: 'Word Games', color: 'teal' },
    ];

    const mockTiles = [
      { key: 'addition', category: 'number-foundations' },
      { key: 'crossword', category: 'language-words' },
    ];

    const onSelectSectionMock = vi.fn();

    render(
      <CategoryCardsGrid
        sections={mockSections}
        tiles={mockTiles}
        completedTopics={[]}
        goldMastery={[]}
        onSelectSection={onSelectSectionMock}
      />
    );

    expect(screen.getByText('Number Foundations')).toBeDefined();
    expect(screen.getByText('Language & Literacy')).toBeDefined();
  });

  it('correctly maps visual-universe and contrast-challenge tiles from TILES', () => {
    const visualTiles = TILES.filter(t => t.category === 'visual-universe' && !t.foldInto);
    expect(visualTiles.length).toBe(4);
    expect(visualTiles.map(t => t.key)).toEqual([
      'visual-math-lab-redux',
      'mensuration-lab',
      'comic-addition',
      'basic-arith-lab',
    ]);

    const contrastTiles = TILES.filter(t => t.category === 'contrast-challenge' && !t.foldInto);
    expect(contrastTiles.length).toBe(15);
    expect(contrastTiles.some(t => t.key === 'contrastlist')).toBe(false);
    expect(contrastTiles.some(t => t.key === 'contrast-area-perimeter')).toBe(true);
  });

  it('correctly maps vachana tile to language-words category', () => {
    const vachanaTile = TILES.find(t => t.key === 'vachana');
    expect(vachanaTile).toBeDefined();
    expect(vachanaTile.category).toBe('language-words');
    expect(vachanaTile.name).toBe('Vachana');

    const languageTiles = TILES.filter(t => t.category === 'language-words' && !t.foldInto);
    expect(languageTiles.some(t => t.key === 'vachana')).toBe(true);
  });

  it('correctly maps curiosity mode to shelf (Puzzles & Play)', () => {
    const curiosityTile = TILES.find(t => t.key === 'curiosity');
    expect(curiosityTile).toBeDefined();
    expect(curiosityTile.category).toBe('shelf');
    expect(curiosityTile.name).toBe('Curiosity Mode');
  });

  it('correctly maps treasure-hunt, math-riddles, and coding-playground tiles', () => {
    const treasureTiles = TILES.filter(t => t.category === 'treasure-hunt' && !t.foldInto);
    expect(treasureTiles.length).toBe(13); // exactly 13 adventure worlds, hub removed
    expect(treasureTiles.some(t => t.key === 'treasurehunt')).toBe(false);
    expect(treasureTiles.some(t => t.key === 'treasurehunt-island-of-numbers')).toBe(true);
    expect(treasureTiles.some(t => t.key === 'treasurehunt-geometry-cave')).toBe(true);
    expect(treasureTiles.some(t => t.key === 'treasurehunt-endless-treasure')).toBe(true);
    treasureTiles.forEach(t => {
      expect(t.subtitle).toMatch(/\d+ of \d+ topics ready/);
    });

    const riddleTiles = TILES.filter(t => t.category === 'math-riddles' && !t.foldInto);
    expect(riddleTiles.length).toBe(4); // 4 distinct types, mixed removed
    expect(riddleTiles.map(t => t.key)).toEqual([
      'riddle-find-rule',
      'riddle-sequence',
      'riddle-logic',
      'riddle-image',
    ]);
    riddleTiles.forEach(t => {
      expect(t.name).toBeDefined();
      expect(t.subtitle).toBeDefined();
      expect(t.example).toBeDefined();
    });

    const codingTiles = TILES.filter(t => t.category === 'coding-playground' && !t.foldInto);
    expect(codingTiles.length).toBe(2);
    expect(codingTiles.map(t => t.key)).toEqual(['playground', 'local-compiler']);
  });

  it('ensures all registered tiles have a valid category', () => {
    TILES.forEach(tile => {
      expect(tile.category).toBeDefined();
      expect(typeof tile.category).toBe('string');
      expect(tile.category.length).toBeGreaterThan(0);
    });
  });
});
