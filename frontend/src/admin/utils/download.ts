// Déclenche le téléchargement d'un fichier texte généré dans le navigateur
export function downloadTextFile(content: string, filename: string, mime = "text/csv;charset=utf-8") {
  const url = URL.createObjectURL(new Blob([content], { type: mime }));
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
