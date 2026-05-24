import jsPDF from "jspdf";

const C = {
  primary:  [100, 70, 200],
  dark:     [18,  18,  18],
  gray:     [110, 110, 120],
  lightBg:  [248, 248, 252],
  border:   [220, 220, 228],
  white:    [255, 255, 255],
  positive: [16,  185, 129],
  neutral:  [245, 158,  11],
  negative: [244,  63,  94],
};

const sentColor = (s) => s === "positivo" ? C.positive : s === "negativo" ? C.negative : C.neutral;
const sentLabel = (s) => s === "positivo" ? "POSITIVO" : s === "negativo" ? "NEGATIVO" : "NEUTRO";
const sentIcon  = (s) => s === "positivo" ? "+" : s === "negativo" ? "-" : "~";
const pct       = (n, t) => t > 0 ? Math.round((n / t) * 100) : 0;

export function generarReporteDocente(docente, evaluaciones, institucion = "NLP EVAL") {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const W = 210, H = 297, M = 18, CW = W - M * 2;

  // HEADER
  doc.setFillColor(...C.dark);
  doc.rect(0, 0, W, 32, "F");
  doc.setFillColor(...C.primary);
  doc.rect(0, 30, W, 2.5, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.setTextColor(...C.white);
  doc.text("NLP EVAL", M, 13);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.text("Sistema de Evaluacion Docente con Inteligencia Artificial", M, 20);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text("REPORTE DE DESEMPENO", W - M, 13, { align: "right" });
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.text("Generado: " + new Date().toLocaleDateString("es-CO"), W - M, 20, { align: "right" });

  let y = 42;

  // INFO DOCENTE
  doc.setFont("helvetica", "bold");
  doc.setFontSize(17);
  doc.setTextColor(...C.dark);
  doc.text(docente.nombre || "Docente", M, y); y += 6;
  if (docente.docente?.titulo) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(...C.gray);
    doc.text(docente.docente.titulo, M, y); y += 5;
  }
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(...C.gray);
  if (docente.email) { doc.text("Email: " + docente.email, M, y); y += 4.5; }
  y += 3;
  doc.setDrawColor(...C.primary);
  doc.setLineWidth(0.6);
  doc.line(M, y, W - M, y); y += 9;

  // ESTADISTICAS
  const total = evaluaciones.length;
  const pos   = evaluaciones.filter(e => e.nlp?.sentiment === "positivo").length;
  const neg   = evaluaciones.filter(e => e.nlp?.sentiment === "negativo").length;
  const neu   = evaluaciones.filter(e => e.nlp?.sentiment === "neutro").length;
  const score = total > 0 ? evaluaciones.reduce((a, e) => a + (e.nlp?.score ?? 0), 0) / total : 0;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(...C.dark);
  doc.text("RESUMEN DE DESEMPENO", M, y); y += 7;

  const bw = (CW - 6) / 4;
  [
    { label: "Total",     value: String(total),               color: C.primary   },
    { label: "Positivas", value: pos + " (" + pct(pos,total) + "%)", color: C.positive },
    { label: "Neutras",   value: neu + " (" + pct(neu,total) + "%)", color: C.neutral  },
    { label: "Negativas", value: neg + " (" + pct(neg,total) + "%)", color: C.negative },
  ].forEach((c, i) => {
    const x = M + i * (bw + 2);
    doc.setFillColor(...C.lightBg);
    doc.roundedRect(x, y, bw, 18, 2, 2, "F");
    doc.setFillColor(...c.color);
    doc.roundedRect(x, y, bw, 2.5, 1, 1, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(...C.dark);
    doc.text(c.value, x + bw / 2, y + 11, { align: "center" });
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.setTextColor(...C.gray);
    doc.text(c.label, x + bw / 2, y + 16, { align: "center" });
  });
  y += 24;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(...C.dark);
  doc.text("Score promedio: " + score.toFixed(3) + "  (escala -1.0 a +1.0)", M, y); y += 5;

  // Barra distribucion
  doc.setFillColor(...C.border);
  doc.roundedRect(M, y, CW, 5, 2, 2, "F");
  let barX = M;
  [[pos, C.positive],[neu, C.neutral],[neg, C.negative]].forEach(([n, color]) => {
    if (n > 0 && total > 0) {
      const w = (n / total) * CW;
      doc.setFillColor(...color);
      doc.rect(barX, y, w, 5, "F");
      barX += w;
    }
  });
  y += 8;

  [[C.positive,"Positivo " + pct(pos,total) + "%"],[C.neutral,"Neutro " + pct(neu,total) + "%"],[C.negative,"Negativo " + pct(neg,total) + "%"]]
    .forEach(([color, text], i) => {
      const x = M + i * 48;
      doc.setFillColor(...color);
      doc.circle(x + 2, y - 1.5, 1.5, "F");
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(...C.gray);
      doc.text(text, x + 5.5, y);
    });
  y += 10;

  // COMENTARIOS
  doc.setDrawColor(...C.border);
  doc.setLineWidth(0.3);
  doc.line(M, y, W - M, y); y += 8;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(...C.dark);
  doc.text("COMENTARIOS RECIBIDOS (" + total + ")", M, y); y += 8;

  if (total === 0) {
    doc.setFont("helvetica", "italic");
    doc.setFontSize(9);
    doc.setTextColor(...C.gray);
    doc.text("No hay comentarios registrados.", M, y);
  } else {
    evaluaciones.forEach((ev) => {
      const color = sentColor(ev.nlp?.sentiment);
      const lines = doc.splitTextToSize('"' + ev.comentario + '"', CW - 10);
      const razonLines = ev.nlp?.razon ? doc.splitTextToSize('IA: "' + ev.nlp.razon + '"', CW - 10) : [];
      const cardH = 14 + lines.length * 4.2 + (razonLines.length > 0 ? razonLines.length * 3.8 + 2 : 0);

      if (y + cardH + 4 > H - 18) { doc.addPage(); y = 20; }

      doc.setFillColor(...C.lightBg);
      doc.roundedRect(M, y, CW, cardH, 2, 2, "F");
      doc.setFillColor(...color);
      doc.roundedRect(M, y, 3, cardH, 1, 1, "F");

      doc.setFont("helvetica", "bold");
      doc.setFontSize(7.5);
      doc.setTextColor(...color);
      doc.text(sentIcon(ev.nlp?.sentiment) + " " + sentLabel(ev.nlp?.sentiment), M + 6, y + 7);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(7);
      doc.setTextColor(...C.gray);
      doc.text("Score: " + (ev.nlp?.score ?? 0).toFixed(3) + "  Confianza: " + Math.round((ev.nlp?.confianza ?? 0) * 100) + "%", M + 42, y + 7);
      doc.text(new Date(ev.createdAt).toLocaleDateString("es-CO"), W - M - 1, y + 7, { align: "right" });

      doc.setFont("helvetica", "normal");
      doc.setFontSize(8.5);
      doc.setTextColor(...C.dark);
      doc.text(lines, M + 6, y + 13);

      if (razonLines.length > 0) {
        doc.setFont("helvetica", "italic");
        doc.setFontSize(7.5);
        doc.setTextColor(...C.gray);
        doc.text(razonLines, M + 6, y + 13 + lines.length * 4.2 + 2);
      }
      y += cardH + 4;
    });
  }

  // FOOTER
  const pages = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pages; i++) {
    doc.setPage(i);
    doc.setFillColor(...C.lightBg);
    doc.rect(0, H - 11, W, 11, "F");
    doc.setFillColor(...C.primary);
    doc.rect(0, H - 11, W, 1, "F");
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.setTextColor(...C.gray);
    doc.text("NLP EVAL  |  " + institucion + "  |  Documento generado automaticamente", M, H - 4);
    doc.text("Pagina " + i + " de " + pages, W - M, H - 4, { align: "right" });
  }

  doc.save("Reporte_" + (docente.nombre || "docente").replace(/\s+/g, "_") + "_" + new Date().toISOString().split("T")[0] + ".pdf");
}
