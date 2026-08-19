import './lifehearts.css'

/**
 * Displays up to maxLives hearts. Optional breakingIndex animates the heart just lost.
 */
export default function LifeHearts({
  lives,
  maxLives = 3,
  breakingIndex = null,
  size = 'md',
}) {
  return (
    <div className={`th-life-hearts th-life-hearts--${size}`} aria-label={`${lives} of ${maxLives} lives`}>
      {Array.from({ length: maxLives }, (_, i) => {
        const filled = i < lives
        const breaking = breakingIndex === i
        let heartClass = 'th-life-heart'
        if (breaking) heartClass += ' breaking'
        else if (filled) heartClass += ' filled'
        else heartClass += ' empty'

        return (
          <span key={i} className={heartClass}>
            {breaking ? '💔' : filled ? '♥' : '♡'}
          </span>
        )
      })}
    </div>
  )
}
