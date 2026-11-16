// Crédito "Desarrollado por Sinopia Labs" para el footer.
// Hereda el color y la fuente del footer; trae sus propios estilos (.sl-credito).

const URL_SINOPIA =
  'https://sinopialabs.cl/?utm_source=fuegodance&utm_medium=referral&utm_campaign=credito-footer'

const CSS = `
.sl-credito{display:inline-flex;align-items:center;gap:.4em;padding:.25em 0;border-radius:4px;color:inherit;text-decoration:none;font-size:.8125rem;line-height:1.2;opacity:.72;transition:opacity .2s ease}
.sl-credito:hover,.sl-credito:focus-visible{opacity:1}
.sl-credito:focus-visible{outline:2px solid currentColor;outline-offset:3px}
.sl-credito__marca{font-weight:600;text-underline-offset:3px}
.sl-credito:hover .sl-credito__marca{text-decoration:underline}
.sl-credito svg{width:1.2em;height:1.2em;flex:none;overflow:visible}
.sl-credito rect{transform-box:fill-box;transition:transform .35s cubic-bezier(.3,.7,.2,1)}
.sl-credito:hover .sl-c1,.sl-credito:focus-visible .sl-c1{transform:translateX(-31%)}
.sl-credito:hover .sl-c3,.sl-credito:focus-visible .sl-c3{transform:translateX(31%)}
@media (prefers-reduced-motion:reduce){.sl-credito,.sl-credito rect{transition:none}}
`

export default function SinopiaCredito({ className = '' }) {
  return (
    <>
      <style>{CSS}</style>
      <a
        href={URL_SINOPIA}
        target="_blank"
        rel="noopener"
        title="Sitio desarrollado por Sinopia Labs (abre en una pestaña nueva)"
        className={`sl-credito ${className}`.trim()}
      >
        <span>Desarrollado por</span>
        <svg viewBox="0 0 64 64" aria-hidden="true" focusable="false">
          <rect className="sl-c1" x="20" y="9" width="35" height="12" rx="6" fill="#E3997A" />
          <rect className="sl-c2" x="9" y="26" width="46" height="12" rx="6" fill="#CB5A33" />
          <rect className="sl-c3" x="9" y="43" width="35" height="12" rx="6" fill="#A33A1A" />
        </svg>
        <span className="sl-credito__marca">Sinopia Labs</span>
      </a>
    </>
  )
}
