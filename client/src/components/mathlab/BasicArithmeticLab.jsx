//BasicArithmeticLabApp
import GenericLab from './GenericLab';

function BasicArithmeticLab({ onBack }) {
    const renderCustom = (q, ans, setAns, submitAns, revealed) => {
        if (q.template === 'missing_number' || q.template === 'greater_smaller') {
        const parts = q.prompt.split(' ');
        return (
            <div className="math-bubble-row">
            {parts.map((p, i) => {
                if (p === '?' || p === '__') {
                return (
                    <input key={i} type="text" className="fun-input"
                    value={ans} onChange={e => !revealed && setAns(e.target.value)}
                    placeholder="?" disabled={revealed} autoFocus />
                );
                }
                if (['×', '÷', '+', '-', '=', '>', '<'].includes(p)) {
                return <span key={i} className="math-bubble op">{p}</span>;
                }
                return <span key={i} className="math-bubble">{p}</span>;
            })}
            </div>
        );
        }
        if (q.template === 'true_false') {
        const eq = q.prompt.replace('Is ', '').replace(' ?', '').split(' ');
        return (
            <div style={{ textAlign: 'center' }}>
            <div className="math-bubble-row" style={{ marginBottom: '10px' }}>
                {eq.map((p, i) => {
                if (['×', '÷', '+', '-', '='].includes(p)) return <span key={i} className="math-bubble op">{p}</span>;
                return <span key={i} className="math-bubble">{p}</span>;
                })}
            </div>
            <p style={{ fontSize: '2rem', fontFamily: 'Quicksand, sans-serif', color: 'var(--kid-secondary)' }}>True or False?</p>
            <div className="emoji-container" style={{ gap: '20px' }}>
                <button className={`kid-btn-choice ${ans === 'True' ? 'selected' : ''}`} onClick={() => !revealed && setAns('True')} disabled={revealed} style={{ fontSize: '2rem' }}>👍 True</button>
                <button className={`kid-btn-choice ${ans === 'False' ? 'selected' : ''}`} onClick={() => !revealed && setAns('False')} disabled={revealed} style={{ fontSize: '2rem' }}>👎 False</button>
            </div>
            </div>
        );
        }
        return (
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
            <p style={{ fontSize: '2.5rem', fontFamily: 'Quicksand, sans-serif', color: 'var(--kid-secondary)', lineHeight: 1.4 }}>{q.prompt}</p>
            {!q.options && (
            <input type="text" className="fun-input"
                value={ans} onChange={e => !revealed && setAns(e.target.value)}
                placeholder="?" disabled={revealed} autoFocus />
            )}
        </div>
        );
    };
    return <GenericLab title="Origin" subtitle="Mixed multiplication & division templates" endpoint="/api/basic-arithmetic-lab" onBack={onBack} renderQuestionCustom={renderCustom} />;
}

export default BasicArithmeticLab;
