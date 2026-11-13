const PM_STYLES = `
.pm-shell {
    max-width: 900px;
    margin: 0 auto;
    padding: 24px 16px 64px;
    color: var(--clr-text, #fff);
    font-family: var(--font-body, system-ui, sans-serif);
}
.pm-topbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 16px;
}
.pm-brand {
    display: flex;
    align-items: center;
    gap: 12px;
}
.pm-brand h1 {
    margin: 0;
    font-size: 1.5rem;
    font-weight: 800;
    color: var(--clr-text, #fff);
}
.pm-icon-btn {
    background: var(--clr-card, rgba(255, 255, 255, 0.08));
    border: 1.5px solid var(--clr-border, rgba(255, 255, 255, 0.15));
    border-radius: 8px;
    color: var(--clr-text, #fff);
    font-size: 1.2rem;
    padding: 6px 12px;
    cursor: pointer;
    transition: background 0.15s;
}
.pm-icon-btn:hover {
    background: var(--clr-hover-strong, rgba(255, 255, 255, 0.15));
}
.pm-intro {
    margin-bottom: 24px;
    color: var(--clr-text-soft, #a89e94);
    font-size: 0.95rem;
    line-height: 1.5;
}
.pm-empty {
    text-align: center;
    padding: 40px 16px;
    color: var(--clr-text-soft, #a89e94);
    font-size: 0.95rem;
    background: var(--clr-card, rgba(255, 255, 255, 0.03));
    border: 1px dashed var(--clr-border, rgba(255, 255, 255, 0.12));
    border-radius: 12px;
    margin: 20px 0;
}
.pm-stats-bar {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 12px;
    margin: 20px 0;
}
.pm-stat {
    background: var(--clr-card, rgba(255, 255, 255, 0.05));
    border: 1px solid var(--clr-border, rgba(255, 255, 255, 0.1));
    border-radius: 10px;
    padding: 12px;
    text-align: center;
}
.pm-stat-num {
    font-size: 1.4rem;
    font-weight: 800;
    color: var(--clr-text, #fff);
}
.pm-stat-label {
    font-size: 0.75rem;
    color: var(--clr-text-soft, #a89e94);
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin-top: 4px;
}
.pm-goal-card {
    background: var(--clr-card, rgba(255, 255, 255, 0.05));
    border: 1.5px solid var(--clr-border, rgba(255, 255, 255, 0.12));
    border-radius: 12px;
    padding: 18px 20px;
    margin-bottom: 24px;
}
.pm-goal-label {
    font-size: 0.95rem;
    font-weight: 700;
    margin-bottom: 12px;
    color: var(--clr-text, #fff);
}
.pm-path-section {
    margin: 32px 0;
}
.pm-section-heading {
    font-size: 1.15rem;
    font-weight: 800;
    margin-bottom: 16px;
    color: var(--clr-text, #fff);
}
.pm-grid-heading {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin: 40px 0 12px;
}
.pm-grid-filter {
    padding: 8px 12px;
    border-radius: 8px;
    border: 1.5px solid var(--clr-border, rgba(255, 255, 255, 0.15));
    background: var(--clr-card, rgba(255, 255, 255, 0.05));
    color: var(--clr-text, #fff);
    font-size: 0.85rem;
    outline: none;
}
.pm-grid-filter:focus {
    border-color: var(--clr-accent, #e8864a);
}
.pm-hint {
    font-size: 0.8rem;
    color: var(--clr-text-soft, #a89e94);
    margin-bottom: 16px;
}
.pm-module-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 12px;
}
.pm-card {
    position: relative;
    background: var(--clr-card, rgba(255, 255, 255, 0.04));
    border: 1.5px solid var(--clr-border, rgba(255, 255, 255, 0.1));
    border-radius: 10px;
    padding: 14px;
    text-align: left;
    cursor: pointer;
    transition: transform 0.15s, border-color 0.15s, background 0.15s;
    color: var(--clr-text, #fff);
    font-family: inherit;
}
.pm-card:hover {
    transform: translateY(-2px);
    border-color: var(--clr-accent, #e8864a);
    background: var(--clr-hover-strong, rgba(255, 255, 255, 0.08));
}
.pm-card.dimmed {
    opacity: 0.45;
}
.pm-card::before {
    content: '';
    position: absolute;
    top: 14px;
    left: 14px;
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: var(--dot, var(--clr-accent, #e8864a));
    display: none;
}
.pm-card-badge {
    position: absolute;
    top: 8px;
    right: 8px;
    font-size: 0.65rem;
    font-weight: 800;
    padding: 2px 6px;
    border-radius: 6px;
}
.pm-card-badge.goal {
    background: var(--clr-accent, #e8864a);
    color: #fff;
}
.pm-card-badge.step {
    background: #5cb87a;
    color: #fff;
}
.pm-card-label {
    font-size: 0.9rem;
    font-weight: 700;
    margin-bottom: 4px;
    padding-right: 32px;
}
.pm-card-sub {
    font-size: 0.75rem;
    color: var(--clr-text-soft, #a89e94);
    line-height: 1.3;
}
`;

const QUEST_BANNER_STYLES = `
.quest-banner-row {
    display: flex;
    justify-content: center;
    margin-bottom: 24px;
    padding: 0 16px;
}
.quest-banner-btn {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
    max-width: 568px;
    background: linear-gradient(135deg, rgba(254, 180, 123, 0.08) 0%, rgba(255, 126, 95, 0.08) 100%);
    border: 1.5px solid var(--clr-accent, #feb47b);
    border-radius: 12px;
    padding: 16px 20px;
    text-align: left;
    cursor: pointer;
    box-shadow: var(--shadow-card);
    transition: transform 0.2s, box-shadow 0.2s, background 0.2s;
    font-family: var(--font-body, system-ui, sans-serif);
}
.quest-banner-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 18px rgba(254, 180, 123, 0.18);
    background: linear-gradient(135deg, rgba(254, 180, 123, 0.15) 0%, rgba(255, 126, 95, 0.15) 100%);
}
.quest-banner-content {
    flex: 1;
}
.quest-banner-header {
    display: flex;
    align-items: center;
    gap: 6px;
    margin-bottom: 4px;
}
.quest-banner-tag {
    font-size: 0.72rem;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 0.8px;
    color: var(--clr-accent, #feb47b);
    font-family: var(--font-body, system-ui, sans-serif);
}
.quest-banner-title {
    margin: 0;
    font-size: 1.08rem;
    font-weight: 700;
    color: var(--clr-text, #fff);
    font-family: var(--font-body, system-ui, sans-serif);
}
.quest-banner-subtitle {
    margin: 0;
    font-size: 0.8rem;
    color: var(--clr-text-soft, #a89e94);
    line-height: 1.4;
    font-family: var(--font-body, system-ui, sans-serif);
}
.quest-banner-arrow {
    font-size: 1.3rem;
    color: var(--clr-accent, #feb47b);
    margin-left: 12px;
    font-weight: bold;
    transition: transform 0.2s;
}
.quest-banner-btn:hover .quest-banner-arrow {
    transform: translateX(2px);
}
`;


export { PM_STYLES, QUEST_BANNER_STYLES };
