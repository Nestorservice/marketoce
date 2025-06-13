
import jsPDF from 'jspdf';

interface ShoppingItem {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  category: string;
  estimatedPrice: number;
  purchased: boolean;
}

interface ShoppingList {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  householdSize: number;
  estimatedBudget: number;
  estimatedTime: number;
  items: ShoppingItem[];
}

export const generateShoppingListPDF = (list: ShoppingList) => {
  const doc = new jsPDF();
  
  // Configuration
  const pageWidth = doc.internal.pageSize.width;
  const margin = 20;
  let yPosition = 30;
  
  // Titre principal
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(34, 139, 34); // Vert
  doc.text('🛒 Liste de Courses', margin, yPosition);
  yPosition += 15;
  
  // Sous-titre
  doc.setFontSize(16);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 100, 100);
  doc.text(list.name, margin, yPosition);
  yPosition += 20;
  
  // Informations générales
  doc.setFontSize(12);
  doc.setTextColor(0, 0, 0);
  doc.text(`📅 Période: ${list.startDate} au ${list.endDate}`, margin, yPosition);
  yPosition += 8;
  doc.text(`👥 Foyer: ${list.householdSize} personne${list.householdSize > 1 ? 's' : ''}`, margin, yPosition);
  yPosition += 8;
  doc.text(`💰 Budget estimé: ${list.estimatedBudget.toFixed(2)}€`, margin, yPosition);
  yPosition += 8;
  doc.text(`⏱️ Temps estimé: ${list.estimatedTime} minutes`, margin, yPosition);
  yPosition += 20;
  
  // Ligne de séparation
  doc.setDrawColor(200, 200, 200);
  doc.line(margin, yPosition, pageWidth - margin, yPosition);
  yPosition += 15;
  
  // Grouper les articles par catégorie
  const categories = list.items.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, ShoppingItem[]>);
  
  // Afficher chaque catégorie
  Object.entries(categories).forEach(([category, items]) => {
    // Vérifier si on a assez de place, sinon nouvelle page
    if (yPosition > 250) {
      doc.addPage();
      yPosition = 30;
    }
    
    // Titre de catégorie
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(51, 51, 51);
    doc.text(`📦 ${category.toUpperCase()}`, margin, yPosition);
    yPosition += 10;
    
    // Articles de la catégorie
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    
    items.forEach((item) => {
      if (yPosition > 270) {
        doc.addPage();
        yPosition = 30;
      }
      
      // Checkbox
      doc.setDrawColor(100, 100, 100);
      doc.rect(margin, yPosition - 3, 4, 4);
      
      // Nom de l'article
      doc.setTextColor(item.purchased ? 150 : 0, item.purchased ? 150 : 0, item.purchased ? 150 : 0);
      doc.text(`${item.name}`, margin + 10, yPosition);
      
      // Quantité et prix
      const quantityText = `${item.quantity} ${item.unit}`;
      const priceText = `${item.estimatedPrice.toFixed(2)}€`;
      
      doc.text(quantityText, pageWidth - 80, yPosition);
      doc.text(priceText, pageWidth - 40, yPosition);
      
      yPosition += 8;
    });
    
    yPosition += 10;
  });
  
  // Résumé en bas
  if (yPosition > 250) {
    doc.addPage();
    yPosition = 30;
  }
  
  yPosition += 10;
  doc.setDrawColor(200, 200, 200);
  doc.line(margin, yPosition, pageWidth - margin, yPosition);
  yPosition += 15;
  
  // Statistiques finales
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(34, 139, 34);
  
  const totalItems = list.items.length;
  const completedItems = list.items.filter(item => item.purchased).length;
  const progression = Math.round((completedItems / totalItems) * 100);
  
  doc.text(`📊 Résumé:`, margin, yPosition);
  yPosition += 10;
  
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(0, 0, 0);
  doc.text(`• Articles total: ${totalItems}`, margin + 5, yPosition);
  yPosition += 8;
  doc.text(`• Articles cochés: ${completedItems}`, margin + 5, yPosition);
  yPosition += 8;
  doc.text(`• Progression: ${progression}%`, margin + 5, yPosition);
  yPosition += 8;
  doc.text(`• Budget total: ${list.estimatedBudget.toFixed(2)}€`, margin + 5, yPosition);
  
  // Pied de page
  const currentDate = new Date().toLocaleDateString('fr-FR');
  doc.setFontSize(8);
  doc.setTextColor(150, 150, 150);
  doc.text(`Généré le ${currentDate} par SmartMeal`, margin, doc.internal.pageSize.height - 10);
  
  // Télécharger le PDF
  doc.save(`liste-courses-${list.name}-${list.startDate}.pdf`);
};
