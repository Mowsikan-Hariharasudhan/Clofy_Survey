import { Survey } from '@/types/survey';
import { format } from 'date-fns';
import jsPDF from 'jspdf';
import * as XLSX from 'xlsx';

// Color palette for premium look
const colors = {
  primary: { r: 79, g: 70, b: 229 }, // Indigo
  secondary: { r: 59, g: 130, b: 246 }, // Blue
  success: { r: 34, g: 197, b: 94 }, // Green
  warning: { r: 234, g: 179, b: 8 }, // Yellow
  danger: { r: 239, g: 68, b: 68 }, // Red
  dark: { r: 30, g: 41, b: 59 }, // Slate 800
  light: { r: 248, g: 250, b: 252 }, // Slate 50
  accent1: { r: 168, g: 85, b: 247 }, // Purple
  accent2: { r: 20, g: 184, b: 166 }, // Teal
  accent3: { r: 249, g: 115, b: 22 }, // Orange
  accent4: { r: 236, g: 72, b: 153 }, // Pink
};

const chartColors = [
  colors.primary,
  colors.secondary,
  colors.success,
  colors.accent1,
  colors.accent2,
  colors.accent3,
  colors.accent4,
  colors.warning,
];

// Helper to draw rounded rectangle
const drawRoundedRect = (
  doc: jsPDF,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
  fillColor?: { r: number; g: number; b: number }
) => {
  if (fillColor) {
    doc.setFillColor(fillColor.r, fillColor.g, fillColor.b);
  }
  doc.roundedRect(x, y, width, height, radius, radius, fillColor ? 'F' : 'S');
};

// Helper to draw pie chart
const drawPieChart = (
  doc: jsPDF,
  centerX: number,
  centerY: number,
  radius: number,
  data: { label: string; value: number; color: { r: number; g: number; b: number } }[]
) => {
  const total = data.reduce((sum, item) => sum + item.value, 0);
  if (total === 0) return;

  let startAngle = -Math.PI / 2; // Start from top

  data.forEach((item) => {
    const sliceAngle = (item.value / total) * 2 * Math.PI;
    const endAngle = startAngle + sliceAngle;

    // Draw slice
    doc.setFillColor(item.color.r, item.color.g, item.color.b);

    // Create path for pie slice
    const points: [number, number][] = [[centerX, centerY]];
    const steps = Math.max(1, Math.floor(sliceAngle * 20));
    
    for (let i = 0; i <= steps; i++) {
      const angle = startAngle + (sliceAngle * i) / steps;
      points.push([
        centerX + radius * Math.cos(angle),
        centerY + radius * Math.sin(angle),
      ]);
    }

    // Draw the slice using lines
    doc.setFillColor(item.color.r, item.color.g, item.color.b);
    doc.setDrawColor(255, 255, 255);
    doc.setLineWidth(0.5);
    
    // Use triangle fan approach
    for (let i = 1; i < points.length - 1; i++) {
      doc.triangle(
        points[0][0], points[0][1],
        points[i][0], points[i][1],
        points[i + 1][0], points[i + 1][1],
        'F'
      );
    }

    startAngle = endAngle;
  });
};

// Helper to draw bar chart
const drawBarChart = (
  doc: jsPDF,
  x: number,
  y: number,
  width: number,
  height: number,
  data: { label: string; value: number; color: { r: number; g: number; b: number } }[]
) => {
  const maxValue = Math.max(...data.map((d) => d.value), 1);
  const barWidth = (width - (data.length - 1) * 4) / data.length;
  const chartBottom = y + height;

  data.forEach((item, index) => {
    const barHeight = (item.value / maxValue) * (height - 20);
    const barX = x + index * (barWidth + 4);
    const barY = chartBottom - barHeight - 15;

    // Draw bar
    doc.setFillColor(item.color.r, item.color.g, item.color.b);
    drawRoundedRect(doc, barX, barY, barWidth, barHeight, 2, item.color);

    // Draw value on top
    doc.setFontSize(7);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(item.color.r, item.color.g, item.color.b);
    doc.text(item.value.toString(), barX + barWidth / 2, barY - 2, { align: 'center' });

    // Draw label below
    doc.setFontSize(6);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(colors.dark.r, colors.dark.g, colors.dark.b);
    const shortLabel = item.label.length > 10 ? item.label.substring(0, 10) + '...' : item.label;
    doc.text(shortLabel, barX + barWidth / 2, chartBottom - 5, { align: 'center' });
  });
};

// Helper to draw horizontal bar chart
const drawHorizontalBarChart = (
  doc: jsPDF,
  x: number,
  y: number,
  width: number,
  data: { label: string; value: number; color: { r: number; g: number; b: number } }[]
) => {
  const maxValue = Math.max(...data.map((d) => d.value), 1);
  const barHeight = 8;
  const barSpacing = 12;
  const labelWidth = 60;
  const chartWidth = width - labelWidth - 25;

  data.forEach((item, index) => {
    const barY = y + index * barSpacing;
    const barWidth = (item.value / maxValue) * chartWidth;

    // Draw label
    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(colors.dark.r, colors.dark.g, colors.dark.b);
    const shortLabel = item.label.length > 18 ? item.label.substring(0, 18) + '...' : item.label;
    doc.text(shortLabel, x, barY + 5);

    // Draw bar background
    doc.setFillColor(240, 240, 240);
    drawRoundedRect(doc, x + labelWidth, barY, chartWidth, barHeight, 2, { r: 240, g: 240, b: 240 });

    // Draw bar
    if (barWidth > 0) {
      doc.setFillColor(item.color.r, item.color.g, item.color.b);
      drawRoundedRect(doc, x + labelWidth, barY, barWidth, barHeight, 2, item.color);
    }

    // Draw value
    doc.setFontSize(7);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(colors.dark.r, colors.dark.g, colors.dark.b);
    doc.text(item.value.toString(), x + labelWidth + chartWidth + 5, barY + 5);
  });
};

// Helper to draw stat card
const drawStatCard = (
  doc: jsPDF,
  x: number,
  y: number,
  width: number,
  height: number,
  title: string,
  value: string,
  color: { r: number; g: number; b: number }
) => {
  // Card background
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(230, 230, 230);
  doc.setLineWidth(0.5);
  doc.roundedRect(x, y, width, height, 4, 4, 'FD');

  // Color accent bar
  doc.setFillColor(color.r, color.g, color.b);
  doc.roundedRect(x, y, 4, height, 2, 2, 'F');

  // Title
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 100, 100);
  doc.text(title, x + 10, y + 12);

  // Value
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(color.r, color.g, color.b);
  doc.text(value, x + 10, y + 28);
};

// Helper to draw legend
const drawLegend = (
  doc: jsPDF,
  x: number,
  y: number,
  data: { label: string; color: { r: number; g: number; b: number }; value?: number }[]
) => {
  data.forEach((item, index) => {
    const legendY = y + index * 10;
    
    // Color box
    doc.setFillColor(item.color.r, item.color.g, item.color.b);
    doc.rect(x, legendY, 6, 6, 'F');
    
    // Label
    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(colors.dark.r, colors.dark.g, colors.dark.b);
    const labelText = item.value !== undefined ? `${item.label}: ${item.value}` : item.label;
    doc.text(labelText, x + 9, legendY + 5);
  });
};

// PDF Export with rich charts
export const downloadPDF = (surveys: Survey[], stats: any): void => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 14;
  let yPos = 0;

  // ===== COVER PAGE =====
  // Header gradient background
  doc.setFillColor(colors.primary.r, colors.primary.g, colors.primary.b);
  doc.rect(0, 0, pageWidth, 80, 'F');
  
  // Secondary accent
  doc.setFillColor(colors.secondary.r, colors.secondary.g, colors.secondary.b);
  doc.triangle(pageWidth - 60, 0, pageWidth, 0, pageWidth, 80, 'F');

  // Title
  doc.setFontSize(28);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(255, 255, 255);
  doc.text('Survey Analytics', pageWidth / 2, 35, { align: 'center' });
  
  doc.setFontSize(14);
  doc.setFont('helvetica', 'normal');
  doc.text('Premium Dashboard Report', pageWidth / 2, 48, { align: 'center' });

  // Report info box
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(margin, 70, pageWidth - margin * 2, 30, 4, 4, 'F');
  
  doc.setFontSize(10);
  doc.setTextColor(colors.dark.r, colors.dark.g, colors.dark.b);
  doc.text(`Generated: ${format(new Date(), 'PPPP')}`, margin + 10, 85);
  doc.text(`Total Surveys: ${surveys.length}`, pageWidth - margin - 10, 85, { align: 'right' });

  yPos = 115;

  // ===== KEY METRICS CARDS =====
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(colors.dark.r, colors.dark.g, colors.dark.b);
  doc.text('Key Performance Metrics', margin, yPos);
  yPos += 10;

  const cardWidth = (pageWidth - margin * 2 - 15) / 4;
  const cardHeight = 35;

  drawStatCard(doc, margin, yPos, cardWidth, cardHeight, 'Total Surveys', stats.total?.toString() || '0', colors.primary);
  drawStatCard(doc, margin + cardWidth + 5, yPos, cardWidth, cardHeight, 'This Week', stats.thisWeek?.toString() || '0', colors.success);
  drawStatCard(doc, margin + (cardWidth + 5) * 2, yPos, cardWidth, cardHeight, 'With Software', `${stats.withSoftwarePercent || 0}%`, colors.secondary);
  drawStatCard(doc, margin + (cardWidth + 5) * 3, yPos, cardWidth, cardHeight, 'Pending', stats.pending?.toString() || '0', colors.warning);

  yPos += cardHeight + 20;

  // ===== SOFTWARE ADOPTION PIE CHART =====
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(colors.dark.r, colors.dark.g, colors.dark.b);
  doc.text('Software Adoption Overview', margin, yPos);
  yPos += 10;

  // Chart container
  doc.setFillColor(colors.light.r, colors.light.g, colors.light.b);
  doc.roundedRect(margin, yPos, (pageWidth - margin * 2) / 2 - 5, 70, 4, 4, 'F');

  const pieData = [
    { label: 'With Software', value: stats.withSoftware || 0, color: colors.success },
    { label: 'Without Software', value: stats.withoutSoftware || 0, color: colors.danger },
  ];

  drawPieChart(doc, margin + 45, yPos + 35, 25, pieData);
  drawLegend(doc, margin + 80, yPos + 25, pieData);

  // ===== SHOP TYPE DISTRIBUTION =====
  const shopTypeStartX = margin + (pageWidth - margin * 2) / 2 + 5;
  doc.setFillColor(colors.light.r, colors.light.g, colors.light.b);
  doc.roundedRect(shopTypeStartX, yPos, (pageWidth - margin * 2) / 2 - 5, 70, 4, 4, 'F');

  // Calculate shop types
  const shopTypes = surveys.reduce((acc, s) => {
    const type = s.common.shopType || 'Unknown';
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const shopTypeData = Object.entries(shopTypes)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map((entry, index) => ({
      label: entry[0],
      value: entry[1],
      color: chartColors[index % chartColors.length],
    }));

  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(colors.dark.r, colors.dark.g, colors.dark.b);
  doc.text('Shop Type Distribution', shopTypeStartX + 5, yPos + 10);

  drawHorizontalBarChart(doc, shopTypeStartX + 5, yPos + 18, (pageWidth - margin * 2) / 2 - 15, shopTypeData);

  yPos += 80;

  // ===== NEW PAGE FOR DETAILED ANALYTICS =====
  doc.addPage();
  yPos = 20;

  // Page header
  doc.setFillColor(colors.primary.r, colors.primary.g, colors.primary.b);
  doc.rect(0, 0, pageWidth, 15, 'F');
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(255, 255, 255);
  doc.text('Detailed Analytics', margin, 10);

  yPos = 30;

  // ===== BILLING HANDLER ANALYSIS =====
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(colors.dark.r, colors.dark.g, colors.dark.b);
  doc.text('Billing Handler Distribution', margin, yPos);
  yPos += 10;

  const billingHandlers = surveys.reduce((acc, s) => {
    const handler = s.common.billingHandler || 'Unknown';
    acc[handler] = (acc[handler] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const handlerData = Object.entries(billingHandlers)
    .sort((a, b) => b[1] - a[1])
    .map((entry, index) => ({
      label: entry[0],
      value: entry[1],
      color: chartColors[index % chartColors.length],
    }));

  doc.setFillColor(colors.light.r, colors.light.g, colors.light.b);
  doc.roundedRect(margin, yPos, pageWidth - margin * 2, 50, 4, 4, 'F');
  
  drawBarChart(doc, margin + 10, yPos + 5, pageWidth - margin * 2 - 20, 40, handlerData);
  yPos += 60;

  // ===== BILLS PER DAY ANALYSIS =====
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(colors.dark.r, colors.dark.g, colors.dark.b);
  doc.text('Bills Per Day Distribution', margin, yPos);
  yPos += 10;

  const billsPerDay = surveys.reduce((acc, s) => {
    const bills = s.common.billsPerDay || 'Unknown';
    acc[bills] = (acc[bills] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const billsData = Object.entries(billsPerDay)
    .sort((a, b) => b[1] - a[1])
    .map((entry, index) => ({
      label: entry[0],
      value: entry[1],
      color: chartColors[index % chartColors.length],
    }));

  doc.setFillColor(colors.light.r, colors.light.g, colors.light.b);
  doc.roundedRect(margin, yPos, pageWidth - margin * 2, 50, 4, 4, 'F');
  
  drawBarChart(doc, margin + 10, yPos + 5, pageWidth - margin * 2 - 20, 40, billsData);
  yPos += 60;

  // ===== SOFTWARE USER INSIGHTS =====
  const softwareUsers = surveys.filter(s => s.hasBillingSoftware && s.softwarePath);
  
  if (softwareUsers.length > 0) {
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(colors.dark.r, colors.dark.g, colors.dark.b);
    doc.text('Software User Insights', margin, yPos);
    yPos += 10;

    // Satisfaction analysis
    const satisfaction = softwareUsers.reduce((acc, s) => {
      const sat = s.softwarePath?.satisfaction || 'Unknown';
      acc[sat] = (acc[sat] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const satData = Object.entries(satisfaction)
      .sort((a, b) => b[1] - a[1])
      .map((entry, index) => ({
        label: entry[0],
        value: entry[1],
        color: chartColors[index % chartColors.length],
      }));

    doc.setFillColor(colors.light.r, colors.light.g, colors.light.b);
    doc.roundedRect(margin, yPos, (pageWidth - margin * 2) / 2 - 5, 55, 4, 4, 'F');
    
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text('Satisfaction Levels', margin + 5, yPos + 10);
    drawHorizontalBarChart(doc, margin + 5, yPos + 15, (pageWidth - margin * 2) / 2 - 15, satData.slice(0, 4));

    // Device usage
    const devices = softwareUsers.reduce((acc, s) => {
      (s.softwarePath?.devices || []).forEach(device => {
        acc[device] = (acc[device] || 0) + 1;
      });
      return acc;
    }, {} as Record<string, number>);

    const deviceData = Object.entries(devices)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 4)
      .map((entry, index) => ({
        label: entry[0],
        value: entry[1],
        color: chartColors[index % chartColors.length],
      }));

    const deviceChartX = margin + (pageWidth - margin * 2) / 2 + 5;
    doc.setFillColor(colors.light.r, colors.light.g, colors.light.b);
    doc.roundedRect(deviceChartX, yPos, (pageWidth - margin * 2) / 2 - 5, 55, 4, 4, 'F');
    
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text('Device Usage', deviceChartX + 5, yPos + 10);
    drawHorizontalBarChart(doc, deviceChartX + 5, yPos + 15, (pageWidth - margin * 2) / 2 - 15, deviceData);

    yPos += 65;
  }

  // ===== SURVEY LIST PAGE =====
  doc.addPage();
  yPos = 20;

  // Page header
  doc.setFillColor(colors.primary.r, colors.primary.g, colors.primary.b);
  doc.rect(0, 0, pageWidth, 15, 'F');
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(255, 255, 255);
  doc.text('Survey Details', margin, 10);

  yPos = 25;

  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(colors.dark.r, colors.dark.g, colors.dark.b);
  doc.text('Recent Surveys', margin, yPos);
  yPos += 8;

  // Table header background
  doc.setFillColor(colors.primary.r, colors.primary.g, colors.primary.b);
  doc.rect(margin, yPos, pageWidth - margin * 2, 8, 'F');

  // Table headers
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(255, 255, 255);
  doc.text('Shop Name', margin + 3, yPos + 5.5);
  doc.text('Type', margin + 55, yPos + 5.5);
  doc.text('Software', margin + 90, yPos + 5.5);
  doc.text('Handler', margin + 115, yPos + 5.5);
  doc.text('Surveyor', margin + 145, yPos + 5.5);
  doc.text('Date', margin + 175, yPos + 5.5);
  yPos += 10;

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(colors.dark.r, colors.dark.g, colors.dark.b);

  surveys.slice(0, 40).forEach((survey, index) => {
    if (yPos > pageHeight - 20) {
      doc.addPage();
      yPos = 20;
      
      // Repeat header
      doc.setFillColor(colors.primary.r, colors.primary.g, colors.primary.b);
      doc.rect(margin, yPos, pageWidth - margin * 2, 8, 'F');
      doc.setFontSize(8);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(255, 255, 255);
      doc.text('Shop Name', margin + 3, yPos + 5.5);
      doc.text('Type', margin + 55, yPos + 5.5);
      doc.text('Software', margin + 90, yPos + 5.5);
      doc.text('Handler', margin + 115, yPos + 5.5);
      doc.text('Surveyor', margin + 145, yPos + 5.5);
      doc.text('Date', margin + 175, yPos + 5.5);
      yPos += 10;
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(colors.dark.r, colors.dark.g, colors.dark.b);
    }

    // Alternating row colors
    if (index % 2 === 0) {
      doc.setFillColor(248, 250, 252);
      doc.rect(margin, yPos - 3, pageWidth - margin * 2, 7, 'F');
    }

    doc.setFontSize(7);
    doc.text(survey.common.shopName.substring(0, 22), margin + 3, yPos + 1);
    doc.text(survey.common.shopType.substring(0, 12), margin + 55, yPos + 1);
    
    // Software badge
    const hasSoftware = survey.hasBillingSoftware;
    doc.setFillColor(hasSoftware ? colors.success.r : colors.danger.r, hasSoftware ? colors.success.g : colors.danger.g, hasSoftware ? colors.success.b : colors.danger.b);
    doc.roundedRect(margin + 90, yPos - 2, 12, 5, 1, 1, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(5);
    doc.text(hasSoftware ? 'Yes' : 'No', margin + 93, yPos + 1);
    
    doc.setTextColor(colors.dark.r, colors.dark.g, colors.dark.b);
    doc.setFontSize(7);
    doc.text(survey.common.billingHandler.substring(0, 10), margin + 115, yPos + 1);
    doc.text(survey.common.surveyorName.substring(0, 12), margin + 145, yPos + 1);
    doc.text(format(new Date(survey.createdAt), 'MM/dd/yy'), margin + 175, yPos + 1);
    
    yPos += 7;
  });

  if (surveys.length > 40) {
    yPos += 5;
    doc.setFontSize(9);
    doc.setFont('helvetica', 'italic');
    doc.setTextColor(100, 100, 100);
    doc.text(`+ ${surveys.length - 40} more surveys not shown`, margin, yPos);
  }

  // ===== FOOTER ON LAST PAGE =====
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(150, 150, 150);
  doc.text(`Report generated by Survey Dashboard • ${format(new Date(), 'PPP')}`, pageWidth / 2, pageHeight - 10, { align: 'center' });

  // Save PDF
  doc.save(`survey_analytics_report_${format(new Date(), 'yyyy-MM-dd')}.pdf`);
};

// Excel Export (unchanged)
export const downloadExcel = (surveys: Survey[]): void => {
  const surveysData = surveys.map(s => ({
    'ID': s.id,
    'Shop Name': s.common.shopName,
    'Owner Name': s.common.ownerName || '',
    'Phone Number': s.common.phoneNumber || '',
    'Shop Type': s.common.shopType,
    'Bills Per Day': s.common.billsPerDay,
    'Billing Handler': s.common.billingHandler,
    'Surveyor': s.common.surveyorName,
    'Has Software': s.hasBillingSoftware ? 'Yes' : 'No',
    'Status': s.status,
    'Created At': format(new Date(s.createdAt), 'yyyy-MM-dd HH:mm'),
    'Latitude': s.common.location?.latitude || '',
    'Longitude': s.common.location?.longitude || '',
  }));

  const softwareUsersData = surveys
    .filter(s => s.hasBillingSoftware && s.softwarePath)
    .map(s => ({
      'Shop Name': s.common.shopName,
      'Software Name': s.softwarePath?.softwareName || '',
      'Usage Duration': s.softwarePath?.usageDuration || '',
      'Devices': s.softwarePath?.devices?.join(', ') || '',
      'Features Used': s.softwarePath?.featuresUsed?.join(', ') || '',
      'Satisfaction': s.softwarePath?.satisfaction || '',
      'Pain Points': s.softwarePath?.painPoints?.join(', ') || '',
      'Yearly Cost': s.softwarePath?.yearlyCost || '',
      'Value for Money': s.softwarePath?.valueForMoney || '',
      'Switching Willingness': s.softwarePath?.switchingWillingness || '',
      'Compared With Competitors': s.softwarePath?.extended?.comparedWithCompetitors || '',
      'Vendor Loyalty': s.softwarePath?.extended?.vendorLoyalty?.toString() || '',
    }));

  const nonSoftwareUsersData = surveys
    .filter(s => !s.hasBillingSoftware && s.noSoftwarePath)
    .map(s => ({
      'Shop Name': s.common.shopName,
      'Billing Methods': s.noSoftwarePath?.currentBillingMethods?.join(', ') || '',
      'Customers Ask GST': s.noSoftwarePath?.customersAskGST || '',
      'Considered Software': s.noSoftwarePath?.consideredSoftware ? 'Yes' : 'No',
      'Current Difficulties': s.noSoftwarePath?.currentDifficulties?.join(', ') || '',
      'Lost Money': s.noSoftwarePath?.lostMoneyDueToMistakes || '',
      'Interested in Trying': s.noSoftwarePath?.interestedInTrying || '',
      'Monthly Budget': s.noSoftwarePath?.monthlyBudget || '',
      'Ideal Software Likelihood': s.noSoftwarePath?.extended?.idealSoftwareLikelihood || '',
    }));

  const withSoftware = surveys.filter(s => s.hasBillingSoftware).length;
  const withoutSoftware = surveys.filter(s => !s.hasBillingSoftware).length;

  const summaryData = [
    { 'Metric': 'Total Surveys', 'Value': surveys.length },
    { 'Metric': 'With Software', 'Value': withSoftware },
    { 'Metric': 'Without Software', 'Value': withoutSoftware },
    { 'Metric': 'With Software %', 'Value': `${surveys.length > 0 ? Math.round((withSoftware / surveys.length) * 100) : 0}%` },
    { 'Metric': 'Report Generated', 'Value': format(new Date(), 'yyyy-MM-dd HH:mm:ss') },
  ];

  const wb = XLSX.utils.book_new();

  const summaryWs = XLSX.utils.json_to_sheet(summaryData);
  XLSX.utils.book_append_sheet(wb, summaryWs, 'Summary');

  const surveysWs = XLSX.utils.json_to_sheet(surveysData);
  XLSX.utils.book_append_sheet(wb, surveysWs, 'All Surveys');

  if (softwareUsersData.length > 0) {
    const softwareWs = XLSX.utils.json_to_sheet(softwareUsersData);
    XLSX.utils.book_append_sheet(wb, softwareWs, 'Software Users');
  }

  if (nonSoftwareUsersData.length > 0) {
    const nonSoftwareWs = XLSX.utils.json_to_sheet(nonSoftwareUsersData);
    XLSX.utils.book_append_sheet(wb, nonSoftwareWs, 'Non-Software Users');
  }

  XLSX.writeFile(wb, `surveys_${format(new Date(), 'yyyy-MM-dd')}.xlsx`);
};
