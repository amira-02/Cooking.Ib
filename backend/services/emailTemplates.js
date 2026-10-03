// Email simple contenant un code à 6 chiffres (version texte + HTML)
function codeEmail({ code, intro, outro = "Ce code expire dans 10 minutes. Si vous n'êtes pas à l'origine de cette demande, ignorez cet email." }) {
  return {
    text: `${intro}\n\n${code}\n\n${outro}`,
    html: `<div style="font-family:Arial,sans-serif;color:#4A3028;max-width:480px">
             <p style="font-size:18px;font-family:Georgia,serif">Cooking <em>Ib</em></p>
             <p>${intro}</p>
             <p style="font-size:30px;font-weight:bold;letter-spacing:8px;background:#FFF9F3;border:1px solid #F4E9DE;border-radius:12px;padding:16px;text-align:center">${code}</p>
             <p style="color:#85695D;font-size:13px">${outro}</p>
           </div>`,
  };
}

module.exports = { codeEmail };
