function NumPad({ value, onChange, disabled, showDecimal, showSlash, showCaret, showX }) {
    /**
   * press(key): Handle numpad key press
   * - '0'-'9': append to value
   * - '±': toggle negative sign (add or remove from start)
   * - '.': append decimal point (only if not already present)
   * - '/': append slash for fractions (only if not already present)
   * - '^': append caret for exponents (only if not already present)
   * - 'x': append variable x
   * - '⌫': delete last character (backspace)
   */
    const press = (key) => {
        if (disabled) return
        if (key === '⌫') {
        onChange(value.slice(0, -1))
        } else if (key === '±') {
        onChange(value.startsWith('-') ? value.slice(1) : '-' + value)
        } else if (key === '.') {
        if (!value.includes('.')) onChange(value + '.')
        } else if (key === '/') {
        if (!value.includes('/')) onChange(value + '/')
        } else if (key === '^') {
        onChange(value + '^')
        } else if (key === 'x') {
        onChange(value + 'x')
        } else {
        onChange(value + key)
        }
    }

    return (
        <div className="numpad">
        <div className="numpad-row">
            {['1', '2', '3'].map((k) => (
            <button key={k} type="button" className="numpad-key" onClick={() => press(k)} disabled={disabled}>{k}</button>
            ))}
        </div>
        <div className="numpad-row">
            {['4', '5', '6'].map((k) => (
            <button key={k} type="button" className="numpad-key" onClick={() => press(k)} disabled={disabled}>{k}</button>
            ))}
        </div>
        <div className="numpad-row">
            {['7', '8', '9'].map((k) => (
            <button key={k} type="button" className="numpad-key" onClick={() => press(k)} disabled={disabled}>{k}</button>
            ))}
        </div>
        <div className="numpad-row">
            <button type="button" className="numpad-key numpad-special" onClick={() => press('±')} disabled={disabled}>±</button>
            <button type="button" className="numpad-key" onClick={() => press('0')} disabled={disabled}>0</button>
            {showDecimal && <button type="button" className="numpad-key numpad-special" onClick={() => press('.')} disabled={disabled}>.</button>}
            {showSlash && <button type="button" className="numpad-key numpad-special" onClick={() => press('/')} disabled={disabled}>/</button>}
            {showCaret && <button type="button" className="numpad-key numpad-special" onClick={() => press('^')} disabled={disabled}>^</button>}
            {showX && <button type="button" className="numpad-key numpad-special" onClick={() => press('x')} disabled={disabled}>x</button>}
            <button type="button" className="numpad-key numpad-special" onClick={() => press('⌫')} disabled={disabled}>⌫</button>
        </div>
        </div>
    )
}
export default NumPad
