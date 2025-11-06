// lib/pdfGenerator.ts

import jsPDF from "jspdf";
import { Doc } from "@/convex/_generated/dataModel";
import { toast } from "sonner";

// Definimos el tipo que espera esta función.
type MuestraConDetalles = Doc<"Muestras"> & { 
  clienteNombre: string; 
  estadoNombre: string; 
  estadoColor: string; 
  analisisNombre: string; 
};

// Exportamos la función que genera el PDF
export const generateMuestraPdf = (muestra: MuestraConDetalles) => {
  try {
    const doc = new jsPDF();
    const fecha = new Date(muestra.fechaRegistro).toLocaleString();

    // Título y datos del cliente
    doc.setFontSize(18);
    doc.text("Resultados de Análisis", 105, 20, { align: "center" });
    
    doc.setFontSize(12);
    doc.text(`Cliente: ${muestra.clienteNombre}`, 14, 35);
    doc.text(`Análisis: ${muestra.analisisNombre}`, 14, 42);
    doc.text(`Fecha de Registro: ${fecha}`, 14, 49);

    // Encabezados de la tabla (Ahora con 4 columnas)
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text("Parámetro", 14, 60);
    doc.text("Valor", 90, 60); // Ajustado
    doc.text("Unidades", 125, 60); // Nueva columna
    doc.text("Referencia", 160, 60); // Ajustado
    doc.line(14, 62, 196, 62); // Línea separadora


    // Contenido de la tabla
    doc.setFont("helvetica", "normal");
    let yPos = 70;
    (muestra.resultados ?? []).forEach(r => {
      // Solo imprimir resultados que tengan valor
      if (r.valor !== null && r.valor !== undefined) {
        
        doc.text(r.nombre, 14, yPos);
        doc.text(String(r.valor), 90, yPos); // Ajustado
        doc.text(r.medicion, 125, yPos);      // Nueva columna
        doc.text(r.estandar, 160, yPos);      // Ajustado

        yPos += 7; // Siguiente línea
      }
    });

    // Guardar el PDF
    doc.save(`Resultados-${muestra.clienteNombre}-${muestra._id.substring(0, 6)}.pdf`);
    toast.success("PDF generado.");

  } catch (error) {
    console.error(error);
    toast.error("Error al generar el PDF.");
  }
};