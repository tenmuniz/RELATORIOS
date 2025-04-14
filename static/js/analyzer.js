/**
 * Police Report Analyzer
 * Handles text analysis for police productivity reports
 * for the 20th Military Police Unit
 */

// Initialize when DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
  console.log('Police Report Analyzer initialized');
  setupEventListeners();
});

/**
 * Set up event listeners for the page
 */
function setupEventListeners() {
  const analyzeButton = document.getElementById('analyzeButton');
  const clearButton = document.getElementById('clearButton');
  
  if (analyzeButton) {
    analyzeButton.addEventListener('click', analyzeReport);
  }
  
  if (clearButton) {
    clearButton.addEventListener('click', clearForm);
  }
}

/**
 * Analyze the police report text
 */
function analyzeReport() {
  // Get the report text
  const reportText = document.getElementById('reportText').value.trim();
  const errorMessage = document.getElementById('errorMessage');
  const loader = document.getElementById('loader');
  
  // Hide previous error messages and show loader
  errorMessage.style.display = 'none';
  loader.style.display = 'block';
  
  // Validate input
  if (!reportText) {
    showError('Por favor, insira o texto do relatório para análise.');
    loader.style.display = 'none';
    return;
  }
  
  try {
    // Process the report text
    const results = extractDataFromReport(reportText);
    
    // Display the results
    displayResults(results);
    
    // Optional: Send to server for additional processing
    sendToServer(reportText);
    
  } catch (error) {
    console.error('Error analyzing report:', error);
    showError('Ocorreu um erro ao analisar o relatório. Verifique o formato do texto.');
  } finally {
    loader.style.display = 'none';
  }
}

/**
 * Extract data from the report text
 * @param {string} text - The report text
 * @returns {object} - Extracted data
 */
function extractDataFromReport(text) {
  // Normalize text
  const normalizedText = text.toUpperCase();
  
  // Extract location
  let location = 'NÃO IDENTIFICADO';
  if (normalizedText.includes('MUANÁ')) {
    location = 'MUANÁ';
  } else if (normalizedText.includes('PONTA DE PEDRAS')) {
    location = 'PONTA DE PEDRAS';
  }
  
  // Extract date
  const dateMatch = text.match(/\d{2}\/\d{2}\/\d{4}/g);
  const date = dateMatch ? dateMatch[0] : 'Não encontrada';
  
  // Extract shift
  let shift = 'Não identificado';
  if (normalizedText.includes('07:30') && normalizedText.includes('19:30')) {
    shift = 'Diurno (07:30 às 19:30)';
  } else if (normalizedText.includes('19:30') && normalizedText.includes('07:30')) {
    shift = 'Noturno (19:30 às 07:30)';
  }
  
  // Extract inspection counts
  const peopleMatch = normalizedText.match(/PESSOAS A PÉ\s*:\s*(\d+)/i);
  const motorcyclesMatch = normalizedText.match(/MOTOS\s*:\s*(\d+)/i);
  const carsMatch = normalizedText.match(/CARRO[S]*\s*:\s*(\d+)/i);
  const bicyclesMatch = normalizedText.match(/BICICLETAS\s*:\s*(\d+)/i);
  
  // Extract occurrence
  const occurrenceMatch = normalizedText.match(/OCORRÊNCIA[^:]*:\s*(.+?)(?=\n|$)/i);
  let occurrence = 'Sem ocorrência relevante';
  if (occurrenceMatch && occurrenceMatch[1]) {
    occurrence = occurrenceMatch[1].trim();
    // Limit length for display
    if (occurrence.length > 200) {
      occurrence = occurrence.substring(0, 200) + '...';
    }
  }
  
  // Calculate total inspections
  const peopleCount = peopleMatch ? parseInt(peopleMatch[1]) : 0;
  const motorcyclesCount = motorcyclesMatch ? parseInt(motorcyclesMatch[1]) : 0;
  const carsCount = carsMatch ? parseInt(carsMatch[1]) : 0;
  const bicyclesCount = bicyclesMatch ? parseInt(bicyclesMatch[1]) : 0;
  const totalInspections = peopleCount + motorcyclesCount + carsCount + bicyclesCount;
  
  return {
    location,
    date,
    shift,
    people: peopleCount,
    motorcycles: motorcyclesCount,
    cars: carsCount,
    bicycles: bicyclesCount,
    totalInspections,
    occurrence
  };
}

/**
 * Display the analysis results in the UI
 * @param {object} results - The extracted data
 */
function displayResults(results) {
  // Update the results section
  document.getElementById('locationValue').textContent = results.location;
  document.getElementById('dateValue').textContent = results.date;
  document.getElementById('shiftValue').textContent = results.shift;
  
  // Update the stats boxes
  document.getElementById('peopleValue').textContent = results.people;
  document.getElementById('motorcyclesValue').textContent = results.motorcycles;
  document.getElementById('carsValue').textContent = results.cars;
  document.getElementById('bicyclesValue').textContent = results.bicycles;
  document.getElementById('totalValue').textContent = results.totalInspections;
  
  // Update occurrence info
  document.getElementById('occurrenceValue').textContent = results.occurrence;
  
  // Update location and shift badges
  const locationBadge = document.getElementById('locationBadge');
  locationBadge.textContent = results.location;
  
  const shiftBadge = document.getElementById('shiftBadge');
  shiftBadge.textContent = results.shift === 'Diurno (07:30 às 19:30)' ? 'Diurno' : 
                          (results.shift === 'Noturno (19:30 às 07:30)' ? 'Noturno' : 'Turno Desconhecido');
  
  // Show the results section
  const resultsSection = document.getElementById('resultsSection');
  resultsSection.classList.add('show');
  
  // Scroll to results
  resultsSection.scrollIntoView({ behavior: 'smooth' });
}

/**
 * Send the report text to the server for additional processing
 * @param {string} text - The report text
 */
function sendToServer(text) {
  fetch('/analyze', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ text })
  })
  .then(response => {
    if (!response.ok) {
      throw new Error('Erro na requisição ao servidor');
    }
    return response.json();
  })
  .then(data => {
    console.log('Server analysis complete:', data);
    // Could use server data for additional features in the future
  })
  .catch(error => {
    console.error('Error sending data to server:', error);
    // Fail silently - frontend analysis still works
  });
}

/**
 * Show an error message
 * @param {string} message - The error message to display
 */
function showError(message) {
  const errorMessage = document.getElementById('errorMessage');
  errorMessage.textContent = message;
  errorMessage.style.display = 'block';
}

/**
 * Clear only the input form without hiding results
 */
function clearForm() {
  document.getElementById('reportText').value = '';
  document.getElementById('errorMessage').style.display = 'none';
}

/**
 * Export data to CSV (future enhancement)
 */
function exportToCSV() {
  // Implementation for a future enhancement
  alert('Funcionalidade de exportação será implementada em breve!');
}
