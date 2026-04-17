import { useState, useEffect, useRef, useCallback } from "react";

/* ── DATOS ─────────────────────────────────────────────────────── */
const SECRET = "eres MAGIC, nunca lo olvides";

const CKEY = {
  A:"X",B:"Z",C:"Q",D:"R",E:"V",F:"L",G:"N",H:"J",I:"K",J:"M",
  K:"P",L:"T",M:"W",N:"Y",O:"B",P:"D",Q:"F",R:"H",S:"G",T:"C",
  U:"S",V:"E",W:"A",X:"U",Y:"O",Z:"I"
};
const enc = (c) => CKEY[c.toUpperCase()] || c;

const MISSIONS = [
  {
    id:"math", icon:"🔢", name:"MATEMÁTICAS", sciClass:"sci-math", sciLabel:"Matemáticas",
    sub:"Lógica y algoritmos — los fundamentos de la Bombe",
    xp:120, unlocks:["E","R","S"],
    qs:[
      { type:"choice", q:'¿Qué modelo matemático creó Turing en 1936 que define los límites de la computación?',
        opts:["La Máquina de Turing","La Integral de Leibniz","El Teorema de Gödel","La Transformada de Fourier"],
        ok:0, exp:"¡Correcto! La Máquina de Turing es un modelo abstracto que define formalmente qué problemas pueden y no pueden ser resueltos por una computadora." },
      { type:"choice", q:"Enigma tiene 3 rotores con 26 posiciones cada uno. Solo contando los rotores, ¿cuántas configuraciones iniciales posibles hay?",
        opts:["78","676","17,576","456,976"],
        ok:2, exp:"¡Exacto! 26 × 26 × 26 = 17,576. Con el tablero de clavijas (Stecker) el total superaba los 150 trillones de configuraciones." },
      { type:"rotor", q:'En la clave de cifrado de Enigma, la "E" se codifica como "V". ¿Cuál es la letra original si el código muestra "V"?',
        encoded:"V", answer:"E", hint:"¿Qué letra se cifra como V en la tabla? Busca la inversa." }
    ]
  },
  {
    id:"linguistics", icon:"🔤", name:"LINGÜÍSTICA", sciClass:"sci-ling", sciLabel:"Lingüística",
    sub:"Patrones de lenguaje — la clave para atacar el cifrado",
    xp:110, unlocks:["M","A","G"],
    qs:[
      { type:"choice", q:'Los criptoanalistas usaban "cribs" — palabras que sabían aparecerían en el texto. ¿Cuál era la más útil?',
        opts:['"HEIL HITLER"','"WETTER" (parte meteorológica)','"ACHTUNG"','"BERLIN"'],
        ok:1, exp:'¡Sí! Los reportes del clima siempre comenzaban con "WETTER". Saber una palabra en texto plano y su versión cifrada permitía atacar toda la configuración del día.' },
      { type:"choice", q:"¿Cuál es la letra más frecuente en alemán? Identificarla en el cifrado era el primer paso del análisis de frecuencias.",
        opts:["A","Z","E","T"],
        ok:2, exp:"¡Correcto! La E es la letra más común en alemán (~17% de frecuencia). Si en el texto cifrado una letra aparece mucho, probablemente representa la E." },
      { type:"frequency", q:"Mensaje interceptado. Analiza la frecuencia y selecciona la letra más común — esa es probablemente la E cifrada.",
        cipher:"VR VG VZ WV XV VB", answer:"V",
        exp:'¡Perfecto! "V" aparece 5 veces. Dado que E es la letra más frecuente en alemán, V = E es la hipótesis más probable.' }
    ]
  },
  {
    id:"electricity", icon:"⚡", name:"INGENIERÍA", sciClass:"sci-elec", sciLabel:"Ingeniería Eléctrica",
    sub:"Circuitos y electrónica — el corazón físico de la Bombe",
    xp:130, unlocks:["I","C","N"],
    qs:[
      { type:"choice", q:"La Bombe eléctrica giraba sus rotores probando configuraciones. ¿Qué señal indicaba que encontró una configuración candidata?",
        opts:["Sonaba una alarma","Los rotores se detenían solos","Una lámpara se encendía y los rotores paraban","Imprimía el mensaje en papel"],
        ok:2, exp:"¡Correcto! Cuando el circuito eléctrico NO detectaba una contradicción lógica, los rotores se detenían y una luz indicaba posible solución." },
      { type:"choice", q:"Una debilidad crucial de Enigma: ninguna letra podía cifrarse a sí misma. ¿Cómo explotó Turing esto?",
        opts:["Usó letras raras para el ataque","Aceleró la Bombe","Eliminó todas las configuraciones donde alguna letra del crib coincidía con su posición cifrada","Construyó más rotores"],
        ok:2, exp:'¡Brillante! Si Turing sabía que el texto claro era "WETTER" y el cifrado era "XQKPBZ", ninguna letra de WETTER podía aparecer en la misma posición en XQKPBZ. Esto eliminaba millones de configuraciones.' },
      { type:"choice", q:"¿Qué componente de Enigma intercambiaba pares de letras ANTES de entrar a los rotores?",
        opts:["El reflector (Umkehrwalze)","El teclado mecánico","El tablero de clavijas (Steckerbrett)","La caja de batería"],
        ok:2, exp:"¡Exacto! El Steckerbrett conectaba pares de letras entre sí. Con 10 pares intercambiados, multiplicaba las posibilidades por más de 150 billones." }
    ]
  },
  {
    id:"team", icon:"🤝", name:"COLABORACIÓN", sciClass:"sci-team", sciLabel:"Trabajo en Equipo",
    sub:"La ciencia avanza en equipo — como en Bletchley Park",
    xp:100, unlocks:["U","O","L","V","D"],
    qs:[
      { type:"choice", q:'¿Quién mejoró la Bombe de Turing con la "diagonal board", multiplicando su eficiencia?',
        opts:["Winston Churchill","Gordon Welchman","Albert Einstein","John Von Neumann"],
        ok:1, exp:'¡Correcto! Gordon Welchman añadió la "diagonal board" en 1940. Sin esa mejora, la Bombe no habría funcionado a tiempo.' },
      { type:"choice", q:"¿Cuántas personas trabajaron en Bletchley Park durante la Segunda Guerra Mundial?",
        opts:["Menos de 100","Alrededor de 500","Más de 10,000","Solo matemáticos: unos 40"],
        ok:2, exp:"¡Impresionante! Más de 10,000 personas trabajaron allí: matemáticos, lingüistas, ingenieros y cientos de mujeres que operaban las máquinas Bombe." },
      { type:"choice", q:"¿Cuánto tiempo se estima que Bletchley Park acortó la Segunda Guerra Mundial?",
        opts:["3 meses","1 año","2 años","4 años"],
        ok:2, exp:"Los historiadores estiman ~2 años acortados y alrededor de 14 millones de vidas salvadas. Un ejemplo extraordinario de colaboración interdisciplinar." }
    ]
  }
];

/* ── ESTILOS ────────────────────────────────────────────────────── */
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Share+Tech+Mono&family=Orbitron:wght@400;700;900&family=VT323&display=swap');
  :root {
    --g:#00ff88; --gd:#00cc66; --gg:rgba(0,255,136,0.15);
    --a:#ffbb00; --ad:#cc8800; --r:#ff4444; --cy:#00ddff;
    --bg:#020c06; --bg2:#041008; --bg3:#061510;
    --bo:rgba(0,255,136,0.2); --bob:rgba(0,255,136,0.5);
    --tx:#c8ffe0; --txd:#4a8a60;
    --fm:'Share Tech Mono',monospace;
    --fd:'Orbitron',sans-serif;
    --fr:'VT323',monospace;
  }
  .ot-root *{box-sizing:border-box;margin:0;padding:0}
  .ot-root{
    min-height:100vh;background:var(--bg);color:var(--tx);
    font-family:var(--fm);padding:1rem;max-width:600px;margin:0 auto;
    position:relative;
  }
  .ot-root::before{
    content:'';position:fixed;top:0;left:0;right:0;bottom:0;
    background:repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(0,0,0,0.08) 2px,rgba(0,0,0,0.08) 4px);
    pointer-events:none;z-index:9999;
  }
  /* header */
  .ot-header{text-align:center;padding:2rem 0 1.5rem;border-bottom:1px solid var(--bo);margin-bottom:1.5rem}
  .ot-title{font-family:var(--fd);font-size:clamp(18px,5vw,26px);font-weight:900;color:var(--g);
    letter-spacing:4px;text-shadow:0 0 20px var(--g),0 0 40px rgba(0,255,136,0.3);margin-bottom:4px}
  .ot-sub{font-family:var(--fr);font-size:18px;color:var(--txd);letter-spacing:2px}
  /* tbox */
  .tbox{background:var(--bg2);border:1px solid var(--bo);border-radius:8px;padding:1.25rem;
    margin-bottom:1rem;position:relative}
  .tbox[data-label]::before{content:attr(data-label);position:absolute;top:-10px;left:12px;
    font-size:10px;color:var(--gd);background:var(--bg2);padding:0 6px;letter-spacing:2px}
  .tbox.amber{border-color:rgba(255,187,0,0.3)}
  .tbox.amber[data-label]::before{color:var(--ad)}
  .tbox.cyan{border-color:rgba(0,221,255,0.3)}
  /* buttons */
  .btn{display:inline-block;font-family:var(--fm);font-size:13px;padding:10px 20px;
    border-radius:6px;cursor:pointer;transition:all 0.2s;margin:4px;letter-spacing:1px;border:none;background:transparent}
  .btn-g{border:1px solid var(--g);color:var(--g)}
  .btn-g:hover{background:var(--gg);box-shadow:0 0 12px rgba(0,255,136,0.3)}
  .btn-a{border:1px solid var(--a);color:var(--a)}
  .btn-a:hover{background:rgba(255,187,0,0.1);box-shadow:0 0 12px rgba(255,187,0,0.3)}
  .btn-big{font-size:15px;padding:14px 32px;font-family:var(--fd);font-weight:700;letter-spacing:2px}
  /* inputs */
  .inp{background:var(--bg3);border:1px solid var(--bo);color:var(--g);font-family:var(--fm);
    padding:10px 14px;border-radius:6px;font-size:14px;width:100%;outline:none;transition:border-color 0.2s}
  .inp:focus{border-color:var(--gd);box-shadow:0 0 8px rgba(0,255,136,0.2)}
  .inp::placeholder{color:var(--txd)}
  .inp-grid{display:grid;grid-template-columns:1fr 1fr;gap:8px}
  @media(max-width:400px){.inp-grid{grid-template-columns:1fr}}
  /* progress */
  .pbar-track{height:4px;background:var(--bg3);border-radius:2px;overflow:hidden;margin:6px 0}
  .pbar-fill{height:100%;background:var(--g);border-radius:2px;
    transition:width 0.6s cubic-bezier(.4,0,.2,1);box-shadow:0 0 6px var(--g)}
  .pbar-lbl{font-size:10px;color:var(--txd);letter-spacing:1px}
  /* xp */
  .xp-pill{display:inline-flex;align-items:center;gap:6px;
    background:rgba(255,187,0,0.1);border:1px solid rgba(255,187,0,0.4);
    color:var(--a);font-size:12px;padding:4px 10px;border-radius:20px}
  /* cipher */
  .cipher-wrap{background:var(--bg);border:1px solid var(--bo);border-radius:8px;padding:1rem}
  .cipher-row{display:flex;flex-wrap:wrap;gap:4px;justify-content:center}
  .cchar{display:flex;flex-direction:column;align-items:center;width:32px;min-height:50px;
    justify-content:center;background:var(--bg3);border:1px solid var(--bo);
    border-radius:4px;padding:4px 2px;transition:all 0.3s}
  .cchar.unlocked{border-color:var(--gd);background:rgba(0,255,136,0.05)}
  .cchar.sp{background:transparent;border-color:transparent;width:10px}
  .ctop{font-size:13px;font-weight:bold;line-height:1}
  .ctop.enc{color:var(--r)} .ctop.dec{color:var(--g);text-shadow:0 0 6px var(--g)}
  .cbot{font-size:11px;color:var(--g);line-height:1;margin-top:3px;min-height:13px}
  .cbot.hidden{color:var(--txd)}
  /* avatar */
  .av-ring{width:70px;height:70px;border-radius:50%;border:2px solid var(--g);
    display:flex;align-items:center;justify-content:center;font-size:32px;
    box-shadow:0 0 20px rgba(0,255,136,0.3);margin:0 auto 8px;background:var(--bg2);transition:all 0.4s}
  /* sci tags */
  .sci-tag{display:inline-flex;align-items:center;gap:4px;font-size:11px;
    padding:3px 10px;border-radius:20px;margin:2px;font-family:var(--fm)}
  .sci-math{background:rgba(0,150,255,0.15);border:1px solid rgba(0,150,255,0.5);color:#66aaff}
  .sci-ling{background:rgba(170,102,255,0.15);border:1px solid rgba(170,102,255,0.5);color:#cc99ff}
  .sci-elec{background:rgba(255,187,0,0.15);border:1px solid rgba(255,187,0,0.5);color:var(--a)}
  .sci-team{background:rgba(0,255,136,0.12);border:1px solid rgba(0,255,136,0.4);color:var(--g)}
  /* mission grid */
  .mgrid{display:grid;grid-template-columns:1fr 1fr;gap:10px}
  @media(max-width:400px){.mgrid{grid-template-columns:1fr}}
  .mcard{background:var(--bg2);border:1px solid var(--bo);border-radius:10px;padding:1rem;
    cursor:pointer;transition:all 0.25s;position:relative;overflow:hidden}
  .mcard:hover{border-color:var(--bob);background:var(--bg3);transform:translateY(-2px)}
  .mcard.done{border-color:rgba(0,255,136,0.4);cursor:default}
  .mcard.done:hover{transform:none}
  .done-badge{position:absolute;top:8px;right:8px;background:rgba(0,255,136,0.2);
    border:1px solid var(--g);color:var(--g);font-size:9px;padding:2px 6px;border-radius:10px}
  /* question */
  .qbox{background:var(--bg2);border:1px solid var(--bo);border-radius:10px;padding:1.5rem}
  .qtxt{font-size:14px;color:var(--cy);line-height:1.6;margin-bottom:1.25rem}
  .opt{display:block;width:100%;text-align:left;background:var(--bg3);border:1px solid var(--bo);
    color:var(--tx);font-family:var(--fm);padding:12px 14px;border-radius:6px;cursor:pointer;
    margin:6px 0;font-size:13px;transition:all 0.2s}
  .opt:hover{background:var(--gg);border-color:var(--gd)}
  .opt.ok{background:rgba(0,255,136,0.15);border-color:var(--g);color:var(--g)}
  .opt.no{background:rgba(255,68,68,0.15);border-color:var(--r);color:#ff8888}
  /* rotor */
  .rgrid{display:grid;grid-template-columns:repeat(auto-fill,minmax(42px,1fr));gap:5px;margin:10px 0}
  .rkey{height:42px;display:flex;align-items:center;justify-content:center;
    background:var(--bg3);border:1px solid var(--bo);border-radius:6px;
    font-size:16px;font-weight:bold;color:var(--g);cursor:pointer;transition:all 0.15s}
  .rkey:hover{background:var(--gg);border-color:var(--g)}
  .rkey.rk-ok{background:rgba(0,255,136,0.2);border-color:var(--g);box-shadow:0 0 8px rgba(0,255,136,0.4)}
  .rkey.rk-no{background:rgba(255,68,68,0.15);border-color:var(--r);color:#ff8888}
  /* freq */
  .fgrid{display:flex;flex-wrap:wrap;gap:6px;margin:10px 0}
  .fcard{background:var(--bg3);border:1px solid var(--bo);border-radius:6px;
    padding:8px 12px;cursor:pointer;text-align:center;min-width:50px;transition:all 0.2s}
  .fcard:hover{background:var(--gg);border-color:var(--gd)}
  .fcard.fc-ok{background:rgba(0,255,136,0.15);border-color:var(--g)}
  .fcard.fc-no{background:rgba(255,68,68,0.1);border-color:var(--r)}
  /* feedback */
  .fb{padding:12px;border-radius:8px;font-size:13px;line-height:1.6;margin:10px 0}
  .fb-ok{background:rgba(0,255,136,0.1);border:1px solid rgba(0,255,136,0.4);color:#88ffcc}
  .fb-no{background:rgba(255,68,68,0.08);border:1px solid rgba(255,68,68,0.4);color:#ffaaaa}
  /* reveal */
  .rv-wrap{display:flex;flex-wrap:wrap;gap:4px;justify-content:center;padding:1.5rem 0}
  .rv-char{font-family:var(--fd);font-size:clamp(16px,4vw,24px);font-weight:900;
    color:var(--g);padding:7px 9px;background:rgba(0,255,136,0.1);border:1px solid var(--g);
    border-radius:6px;text-shadow:0 0 10px var(--g);
    animation:cpop 0.4s cubic-bezier(.34,1.56,.64,1) both}
  @keyframes cpop{from{transform:scale(0) rotateY(90deg);opacity:0}to{transform:scale(1) rotateY(0);opacity:1}}
  .rv-sp{width:14px;display:inline-block}
  /* cert */
  .cert-box{background:var(--bg2);border:1px solid rgba(0,255,136,0.4);
    border-radius:12px;padding:1.5rem;text-align:center;margin-bottom:1rem}
  .qr-wrap{background:white;padding:16px;border-radius:10px;display:inline-block}
  /* misc */
  .label{font-size:10px;color:var(--txd);letter-spacing:3px;text-transform:uppercase;margin-bottom:6px}
  .muted{color:var(--txd);font-size:12px}
  .divider{border:none;border-top:1px solid var(--bo);margin:1rem 0}
  .stars{font-size:26px;letter-spacing:4px;color:var(--a)}
  .fade-in{animation:fadeIn 0.35s ease-out}
  @keyframes fadeIn{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
  .row{display:flex;flex-wrap:wrap;gap:6px}
  .between{justify-content:space-between;align-items:center}
  .tc{text-align:center}
`;

/* ── COMPONENTES PEQUEÑOS ───────────────────────────────────────── */
function TBox({ label, variant, children, style }) {
  return (
    <div className={`tbox${variant ? " " + variant : ""}`} data-label={label} style={style}>
      {children}
    </div>
  );
}

function Btn({ variant = "g", big, onClick, disabled, children, style }) {
  return (
    <button
      className={`btn btn-${variant}${big ? " btn-big" : ""}`}
      onClick={onClick} disabled={disabled} style={style}
    >{children}</button>
  );
}

function ProgressBar({ pct, label }) {
  return (
    <div>
      <div className="pbar-track"><div className="pbar-fill" style={{ width: pct + "%" }} /></div>
      {label && <div className="pbar-lbl">{label}</div>}
    </div>
  );
}

function CipherDisplay({ done }) {
  const unlocked = [];
  done.forEach(id => MISSIONS.find(x => x.id === id).unlocks.forEach(l => unlocked.push(l)));

  return (
    <div className="cipher-wrap">
      <div className="cipher-row">
        {SECRET.toUpperCase().split("").map((c, i) => {
          if (c === " ") return <div key={i} className="cchar sp" />;
          if (c === "," || c === "!") return (
            <div key={i} className="cchar unlocked">
              <span className="ctop dec">{c}</span>
              <span className="cbot">{c}</span>
            </div>
          );
          const isUnlocked = unlocked.includes(c);
          return (
            <div key={i} className={`cchar${isUnlocked ? " unlocked" : ""}`}>
              <span className={`ctop ${isUnlocked ? "dec" : "enc"}`}>{isUnlocked ? c : enc(c)}</span>
              <span className={`cbot${isUnlocked ? "" : " hidden"}`}>{isUnlocked ? c : "?"}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ── PANTALLA: BIENVENIDA ───────────────────────────────────────── */
function Welcome({ onStart }) {
  const [players, setPlayers] = useState(0);
  const [names, setNames] = useState([]);

  const handlePlayers = (n) => {
    setPlayers(n);
    setNames(Array(n).fill(""));
  };

  const handleName = (i, v) => {
    const arr = [...names]; arr[i] = v; setNames(arr);
  };

  const handleStart = () => {
    const resolved = names.map((n, i) => n.trim() || `Agente ${i + 1}`);
    onStart(resolved);
  };

  return (
    <div className="fade-in">
      <div className="ot-header">
        <div className="ot-title">⚙ OPERACIÓN TURING</div>
        <div className="ot-sub">BLETCHLEY PARK · 1942</div>
      </div>

      <TBox label="MISIÓN CLASIFICADA">
        <p style={{ fontSize: 13, color: "var(--tx)", lineHeight: 1.7, marginBottom: 10 }}>
          Los nazis usan la máquina <span style={{ color: "var(--a)" }}>ENIGMA</span> para cifrar todos sus mensajes de guerra.
          Nadie ha podido romperla... hasta ahora.
        </p>
        <p style={{ fontSize: 13, color: "var(--tx)", lineHeight: 1.7 }}>
          Turing necesita agentes que dominen <span style={{ color: "var(--cy)" }}>múltiples ciencias</span> para construir
          la <strong style={{ color: "var(--g)" }}>Bombe</strong> y descifrar el mensaje más importante de la guerra.
          Ese mensaje... es para ti.
        </p>
      </TBox>

      <TBox label="AGENTES DE MISIÓN" variant="amber">
        <p className="label" style={{ marginBottom: 10 }}>¿Cuántos agentes participan?</p>
        <div className="row" style={{ marginBottom: 14 }}>
          {[1, 2, 3, 4].map(n => (
            <Btn key={n} variant={players === n ? "a" : "g"} onClick={() => handlePlayers(n)}>
              {n === 1 ? "1 agente" : `${n} agentes`}
            </Btn>
          ))}
        </div>
        {players > 0 && (
          <div>
            <p className="label" style={{ marginBottom: 8 }}>Nombres en clave:</p>
            <div className="inp-grid">
              {Array.from({ length: players }).map((_, i) => (
                <input key={i} className="inp" type="text" maxLength={14}
                  placeholder={`Nombre agente ${i + 1}`}
                  value={names[i] || ""}
                  onChange={e => handleName(i, e.target.value)} />
              ))}
            </div>
          </div>
        )}
      </TBox>

      {players > 0 && (
        <div className="tc" style={{ padding: "1rem 0" }}>
          <Btn variant="a" big onClick={handleStart}>► INICIAR MISIÓN</Btn>
        </div>
      )}
    </div>
  );
}

/* ── PANTALLA: HUB ──────────────────────────────────────────────── */
function Hub({ state, onMission, onFinal }) {
  const { xp, done, sciences, names } = state;
  const pct = Math.round((done.length / MISSIONS.length) * 100);
  const avatarIcons = ["🕵", "🔍", "🧠", "⚙", "🏆"];

  return (
    <div className="fade-in">
      <div className="row between" style={{ marginBottom: "1rem" }}>
        <div className="ot-title" style={{ fontSize: 14 }}>⚙ OP. TURING</div>
        <span className="xp-pill">⚡ {xp} XP</span>
      </div>

      <TBox label="PROGRESO DE MISIÓN">
        <ProgressBar pct={pct}
          label={`Descifrado: ${pct}% — ${pct < 100 ? "Completa misiones para revelar el mensaje" : "¡Listo para descifrar!"}`} />
      </TBox>

      <TBox label="TU AVATAR">
        <div className="tc">
          <div className="av-ring">{avatarIcons[Math.min(done.length, 4)]}</div>
          <div style={{ fontFamily: "var(--fd)", fontSize: 13, color: "var(--a)", marginBottom: 8 }}>
            {names.join(" & ")}
          </div>
          <div>
            {sciences.length === 0
              ? <span className="muted">Sin ciencias aún — completa misiones</span>
              : sciences.map(id => {
                  const m = MISSIONS.find(x => x.id === id);
                  return <span key={id} className={`sci-tag ${m.sciClass}`}>{m.icon} {m.sciLabel}</span>;
                })}
          </div>
        </div>
      </TBox>

      <TBox label="MENSAJE CIFRADO INTERCEPTADO">
        <CipherDisplay done={done} />
        <p className="muted tc" style={{ marginTop: 8, fontSize: 10 }}>
          Cada misión revela más letras del mensaje secreto
        </p>
      </TBox>

      <p className="label" style={{ marginBottom: 10 }}>MÓDULOS DE ENTRENAMIENTO:</p>
      <div className="mgrid">
        {MISSIONS.map(m => {
          const isDone = done.includes(m.id);
          return (
            <div key={m.id} className={`mcard${isDone ? " done" : ""}`}
              onClick={() => !isDone && onMission(m.id)}>
              {isDone && <div className="done-badge">✓ OK</div>}
              <div style={{ fontSize: 26, marginBottom: 6 }}>{m.icon}</div>
              <div style={{ fontFamily: "var(--fd)", fontSize: 11, fontWeight: 700, color: "var(--tx)", marginBottom: 4, letterSpacing: 1 }}>
                {m.name}
              </div>
              <div style={{ fontSize: 10, color: "var(--txd)", lineHeight: 1.5 }}>
                {isDone ? `+${m.xp} XP obtenidos` : m.sub}
              </div>
            </div>
          );
        })}
      </div>

      {done.length === MISSIONS.length && (
        <div className="tc" style={{ marginTop: "1.5rem" }}>
          <Btn variant="a" big onClick={onFinal}>⚙ DESCIFRAR MENSAJE FINAL</Btn>
        </div>
      )}
    </div>
  );
}

/* ── PANTALLA: MISIÓN ───────────────────────────────────────────── */
function Mission({ missionId, onBack, onComplete }) {
  const m = MISSIONS.find(x => x.id === missionId);
  const [qIdx, setQIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [answered, setAnswered] = useState(false);
  const [selected, setSelected] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [finished, setFinished] = useState(false);

  const q = m.qs[qIdx];

  const answer = (ok, exp, sel = null) => {
    if (answered) return;
    setAnswered(true);
    setSelected(sel);
    setFeedback({ ok, text: exp });
    if (ok) setScore(s => s + 1);
  };

  const next = () => {
    if (qIdx + 1 >= m.qs.length) {
      setFinished(true);
      onComplete(m.id, m.xp, m.unlocks);
    } else {
      setQIdx(i => i + 1);
      setAnswered(false);
      setSelected(null);
      setFeedback(null);
    }
  };

  const pct = Math.round((qIdx / m.qs.length) * 100);
  const stars = Math.round((score / m.qs.length) * 100) >= 80 ? "★★★"
    : Math.round((score / m.qs.length) * 100) >= 50 ? "★★☆" : "★☆☆";

  if (finished) {
    return (
      <div className="fade-in">
        <div className="qbox tc">
          <div style={{ fontSize: 52, margin: "1rem 0" }}>{m.icon}</div>
          <div style={{ fontFamily: "var(--fd)", fontSize: 20, color: "var(--a)", marginBottom: 6 }}>MISIÓN COMPLETADA</div>
          <div className="stars" style={{ marginBottom: 12 }}>{stars}</div>
          <div style={{ color: "var(--g)", fontSize: 15, marginBottom: 8 }}>
            +{m.xp} XP · <span className={`sci-tag ${m.sciClass}`}>{m.sciLabel}</span>
          </div>
          <div className="fb fb-ok" style={{ margin: "12px 0" }}>
            <p style={{ marginBottom: 4 }}>Letras desbloqueadas en el mensaje:</p>
            <p style={{ fontFamily: "var(--fd)", fontSize: 22, letterSpacing: 6, color: "var(--a)", marginTop: 6 }}>
              {m.unlocks.join("  ")}
            </p>
          </div>
          <Btn variant="a" big onClick={onBack} style={{ marginTop: 8 }}>← VOLVER AL HUB</Btn>
        </div>
      </div>
    );
  }

  return (
    <div className="fade-in">
      <div className="row" style={{ alignItems: "center", gap: 10, marginBottom: "1rem" }}>
        <Btn variant="g" style={{ padding: "6px 12px", fontSize: 12 }} onClick={onBack}>← HUB</Btn>
        <div>
          <div style={{ fontFamily: "var(--fd)", fontSize: "clamp(13px,3.5vw,16px)", fontWeight: 700, color: "var(--a)" }}>
            {m.icon} {m.name}
          </div>
          <div className="muted" style={{ fontSize: 11 }}>{m.sub}</div>
        </div>
      </div>

      <TBox label="PROGRESO">
        <ProgressBar pct={pct} label={`Pregunta ${qIdx + 1} de ${m.qs.length}`} />
      </TBox>

      <div className="qbox fade-in" key={qIdx}>
        <p className="qtxt">{q.q}</p>

        {q.type === "choice" && (
          <div>
            {q.opts.map((opt, i) => (
              <button key={i} className={`opt${answered ? (i === q.ok ? " ok" : i === selected ? " no" : "") : ""}`}
                onClick={() => answer(i === q.ok, q.exp, i)} disabled={answered}>
                {String.fromCharCode(65 + i)}. {opt}
              </button>
            ))}
          </div>
        )}

        {q.type === "rotor" && (
          <div>
            <p className="muted" style={{ marginBottom: 8 }}>Selecciona la letra ORIGINAL (antes de cifrarse):</p>
            <div className="rgrid">
              {"ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("").map(l => (
                <div key={l}
                  className={`rkey${answered && l === q.answer ? " rk-ok" : answered && l === selected ? " rk-no" : ""}`}
                  onClick={() => {
                    if (!answered) {
                      const ok = l === q.answer;
                      answer(ok, ok
                        ? `¡Correcto! "${q.encoded}" descifrado = "${q.answer}". Dominaste la lógica de los rotores.`
                        : `La respuesta es "${q.answer}". Recuerda: buscamos qué letra ORIGINAL se cifra como "${q.encoded}".`, l);
                    }
                  }}>{l}</div>
              ))}
            </div>
            <p className="muted" style={{ fontSize: 11, marginTop: 4 }}>💡 {q.hint}</p>
          </div>
        )}

        {q.type === "frequency" && (() => {
          const freq = {};
          q.cipher.replace(/ /g, "").split("").forEach(c => { freq[c] = (freq[c] || 0) + 1; });
          const sorted = Object.entries(freq).sort((a, b) => b[1] - a[1]);
          return (
            <div>
              <div style={{ background: "var(--bg)", padding: 12, borderRadius: 8, border: "1px solid var(--bo)", marginBottom: 12 }}>
                <p className="muted" style={{ fontSize: 10, marginBottom: 6 }}>TEXTO CIFRADO INTERCEPTADO:</p>
                <p style={{ fontFamily: "var(--fr)", fontSize: 26, letterSpacing: 8, color: "var(--r)" }}>{q.cipher}</p>
              </div>
              <p className="muted" style={{ marginBottom: 8 }}>Frecuencia de cada letra — selecciona la MÁS frecuente:</p>
              <div className="fgrid">
                {sorted.map(([l, n]) => (
                  <div key={l}
                    className={`fcard${answered && l === q.answer ? " fc-ok" : answered && l === selected ? " fc-no" : ""}`}
                    onClick={() => {
                      if (!answered) {
                        const ok = l === q.answer;
                        answer(ok, q.exp, l);
                      }
                    }}>
                    <div style={{ fontSize: 20, color: "var(--g)", fontWeight: "bold" }}>{l}</div>
                    <div style={{ fontSize: 10, color: "var(--txd)" }}>{n}×</div>
                  </div>
                ))}
              </div>
            </div>
          );
        })()}

        {feedback && (
          <div>
            <div className={`fb ${feedback.ok ? "fb-ok" : "fb-no"}`}>
              {feedback.ok ? "✓ " : "✗ "}{feedback.text}
            </div>
            <Btn variant="a" onClick={next} style={{ marginTop: 8 }}>
              {qIdx + 1 >= m.qs.length ? "Completar misión ⚙" : "Siguiente pregunta →"}
            </Btn>
          </div>
        )}
      </div>
    </div>
  );
}

/* ── PANTALLA: FINAL ────────────────────────────────────────────── */
function Final({ state, onCert }) {
  const [chars, setChars] = useState([]);

  useEffect(() => {
    const arr = SECRET.toUpperCase().split("");
    arr.forEach((c, i) => {
      setTimeout(() => setChars(prev => [...prev, c]), 400 + i * 100);
    });
  }, []);

  return (
    <div className="fade-in">
      <div className="ot-header">
        <div className="ot-title" style={{ color: "var(--a)" }}>⚙ BOMBE ACTIVADA</div>
        <div className="ot-sub">DESCIFRADO EN PROCESO...</div>
      </div>

      <TBox label="DESCIFRADO EN CURSO">
        <div className="rv-wrap">
          {chars.map((c, i) =>
            c === " "
              ? <div key={i} className="rv-sp" />
              : <div key={i} className="rv-char" style={{ animationDelay: "0s" }}>{c}</div>
          )}
        </div>
      </TBox>

      <TBox label="¿QUIÉN FUE ALAN TURING?" variant="cyan">
        <p style={{ fontSize: 13, color: "var(--tx)", lineHeight: 1.7, marginBottom: 10 }}>
          Alan Turing nunca escuchó estas palabras. En 1952 fue arrestado por ser gay. Fue sometido a castración química
          por el gobierno que había salvado. Murió en 1954, a los 41 años.
        </p>
        <p style={{ fontSize: 13, color: "var(--tx)", lineHeight: 1.7 }}>
          En 2009 el gobierno británico se disculpó. En 2013 recibió un indulto real póstumo. En 2021 apareció en el billete de £50.
          <br /><br />
          <strong style={{ color: "var(--a)" }}>
            Su trabajo con matemáticos, lingüistas, ingenieros y operadoras salvó ~14 millones de vidas
            y acortó la guerra 2 años.
          </strong>{" "}
          Igual que tú: unió ciencias para resolver lo imposible.
        </p>
      </TBox>

      <div className="tc" style={{ marginTop: "1rem" }}>
        <Btn variant="a" big onClick={onCert}>Ver certificado y QR ↗</Btn>
      </div>
    </div>
  );
}

/* ── PANTALLA: CERTIFICADO ──────────────────────────────────────── */
function Certificate({ state, onReset }) {
  const qrRef = useRef(null);
  const { names, xp, sciences } = state;
  const nameStr = names.join(" & ");
  const sciStr = sciences.map(id => MISSIONS.find(x => x.id === id).sciLabel).join(" · ");
  const qrText = `OPERACIÓN TURING COMPLETADA\nAgentes: ${nameStr}\nXP Total: ${xp}\nCiencias: ${sciStr}\nMensaje: ERES MAGIC, NUNCA LO OLVIDES`;

  useEffect(() => {
    if (!qrRef.current) return;
    setTimeout(() => {
      try {
        // eslint-disable-next-line no-undef
        new QRCode(qrRef.current, {
          text: qrText, width: 200, height: 200,
          colorDark: "#000000", colorLight: "#ffffff",
          correctLevel: 1
        });
      } catch (e) {
        if (qrRef.current) qrRef.current.innerHTML = "<p style='color:#f87171;font-size:12px;padding:1rem'>QR no disponible. Muestra el certificado en pantalla.</p>";
      }
    }, 300);
  }, []);

  return (
    <div className="fade-in">
      <div className="ot-header">
        <div className="ot-title" style={{ color: "var(--a)" }}>CERTIFICADO DE DESCIFRADO</div>
        <div className="ot-sub">OPERACIÓN TURING · COMPLETADA</div>
      </div>

      <div className="cert-box">
        <p className="muted" style={{ marginBottom: 12 }}>CÓDIGO QR — COMPARTE TU LOGRO</p>
        <div className="tc" style={{ marginBottom: 12 }}>
          <div className="qr-wrap"><div ref={qrRef} /></div>
        </div>
        <p className="muted" style={{ fontSize: 11 }}>Escanea con tu celular — contiene tu certificado completo</p>
      </div>

      <TBox label="AGENTES CERTIFICADOS" variant="amber">
        <p style={{ fontFamily: "var(--fd)", fontSize: 16, color: "var(--a)", marginBottom: 6 }}>{nameStr}</p>
        <p className="muted">XP Total: <strong style={{ color: "var(--g)" }}>{xp} puntos</strong></p>
        <hr className="divider" />
        <p className="label" style={{ marginBottom: 6 }}>CIENCIAS DOMINADAS:</p>
        <div>
          {sciences.map(id => {
            const m = MISSIONS.find(x => x.id === id);
            return <span key={id} className={`sci-tag ${m.sciClass}`}>{m.icon} {m.sciLabel}</span>;
          })}
        </div>
      </TBox>

      <TBox label="MENSAJE DESCIFRADO">
        <p style={{ fontFamily: "var(--fd)", fontSize: "clamp(12px,3.5vw,17px)", color: "var(--g)",
          letterSpacing: 2, textAlign: "center", textShadow: "0 0 15px var(--g)" }}>
          "{SECRET.toUpperCase()}"
        </p>
      </TBox>

      <div className="tc" style={{ padding: "1rem 0" }}>
        <Btn variant="g" onClick={onReset}>↺ Nueva misión</Btn>
      </div>
    </div>
  );
}

/* ── APP PRINCIPAL ──────────────────────────────────────────────── */
export default function OperacionTuring() {
  const [screen, setScreen] = useState("welcome");
  const [gameState, setGameState] = useState({
    names: ["Agente"], xp: 0, sciences: [], done: []
  });
  const [activeMission, setActiveMission] = useState(null);

  const handleStart = useCallback((names) => {
    setGameState({ names, xp: 0, sciences: [], done: [] });
    setScreen("hub");
  }, []);

  const handleMission = useCallback((id) => {
    setActiveMission(id);
    setScreen("mission");
  }, []);

  const handleComplete = useCallback((id, xpGain, unlocks) => {
    setGameState(prev => {
      if (prev.done.includes(id)) return prev;
      return {
        ...prev,
        xp: prev.xp + xpGain,
        done: [...prev.done, id],
        sciences: [...prev.sciences, id]
      };
    });
  }, []);

  const handleBack = useCallback(() => setScreen("hub"), []);
  const handleFinal = useCallback(() => setScreen("final"), []);
  const handleCert = useCallback(() => setScreen("cert"), []);
  const handleReset = useCallback(() => {
    setGameState({ names: ["Agente"], xp: 0, sciences: [], done: [] });
    setScreen("welcome");
  }, []);

  return (
    <>
      <style>{CSS}</style>
      <div className="ot-root">
        {screen === "welcome" && <Welcome onStart={handleStart} />}
        {screen === "hub" && <Hub state={gameState} onMission={handleMission} onFinal={handleFinal} />}
        {screen === "mission" && (
          <Mission
            key={activeMission}
            missionId={activeMission}
            onBack={handleBack}
            onComplete={handleComplete}
          />
        )}
        {screen === "final" && <Final state={gameState} onCert={handleCert} />}
        {screen === "cert" && <Certificate state={gameState} onReset={handleReset} />}
      </div>
    </>
  );
}
