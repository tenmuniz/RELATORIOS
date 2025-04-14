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
    // First do a client-side extraction to quickly display some results
    const results = extractDataFromReport(reportText);
    
    // Then send to server for processing and storage
    fetch('/analyze', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ text: reportText })
    })
    .then(response => {
      if (!response.ok) {
        throw new Error('Erro na requisição ao servidor');
      }
      return response.json();
    })
    .then(serverData => {
      console.log('Server analysis complete:', serverData);
      
      if (serverData.success) {
        // Display the results with totals from server
        displayResults(serverData.data, serverData.totals);
      } else {
        // If server failed but we have client-side results, still show them
        displayResults(results);
        console.warn('Using client-side results due to server error');
      }
    })
    .catch(error => {
      console.error('Error sending data to server:', error);
      // If server call fails, still display the client-side results
      displayResults(results);
      showError('Não foi possível salvar os dados no servidor. Mostrando resultados locais.');
    })
    .finally(() => {
      loader.style.display = 'none';
    });
    
  } catch (error) {
    console.error('Error analyzing report:', error);
    showError('Ocorreu um erro ao analisar o relatório. Verifique o formato do texto.');
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
 * @param {object} totals - The accumulated totals
 */
function displayResults(results, totals) {
  // Update the results section for current report
  document.getElementById('locationValue').textContent = results.location;
  document.getElementById('dateValue').textContent = results.date;
  document.getElementById('shiftValue').textContent = results.shift;
  
  // Update the stats boxes for current report
  document.getElementById('peopleValue').textContent = results.people;
  document.getElementById('motorcyclesValue').textContent = results.motorcycles;
  document.getElementById('carsValue').textContent = results.cars;
  document.getElementById('bicyclesValue').textContent = results.bicycles;
  document.getElementById('totalValue').textContent = results.totalInspections;
  
  // Atualizar os novos campos adicionados no relatório atual
  if (document.getElementById('arrestsValue')) {
    document.getElementById('arrestsValue').textContent = results.arrests || 0;
  }
  
  if (document.getElementById('seizedMotorcyclesValue')) {
    document.getElementById('seizedMotorcyclesValue').textContent = results.seizedMotorcycles || 0;
  }
  
  if (document.getElementById('drugsSeizedValue')) {
    document.getElementById('drugsSeizedValue').textContent = results.drugsSeized || 0;
  }
  
  if (document.getElementById('fugitivesValue')) {
    document.getElementById('fugitivesValue').textContent = results.fugitives || 0;
  }
  
  // Update occurrence info
  document.getElementById('occurrenceValue').textContent = results.occurrence;
  
  // Update location and shift badges
  const locationBadge = document.getElementById('locationBadge');
  locationBadge.textContent = results.location;
  
  const shiftBadge = document.getElementById('shiftBadge');
  shiftBadge.textContent = results.shift === 'Diurno (07:30 às 19:30)' ? 'Diurno' : 
                          (results.shift === 'Noturno (19:30 às 07:30)' ? 'Noturno' : 'Turno Desconhecido');
  
  // Update totals if provided
  if (totals) {
    // Estatísticas básicas
    document.getElementById('totalPeopleValue').textContent = totals.people;
    document.getElementById('totalMotorcyclesValue').textContent = totals.motorcycles;
    document.getElementById('totalCarsValue').textContent = totals.cars;
    document.getElementById('totalBicyclesValue').textContent = totals.bicycles;
    document.getElementById('grandTotalValue').textContent = totals.totalInspections;
    document.getElementById('reportsCountValue').textContent = totals.reportsCount;
    
    // Novos dados adicionados (prisões e apreensões)
    if (document.getElementById('totalArrestsValue')) {
      document.getElementById('totalArrestsValue').textContent = totals.arrests || 0;
    }
    
    if (document.getElementById('totalSeizedMotorcyclesValue')) {
      document.getElementById('totalSeizedMotorcyclesValue').textContent = totals.seizedMotorcycles || 0;
    }
    
    if (document.getElementById('totalDrugsSeizedValue')) {
      document.getElementById('totalDrugsSeizedValue').textContent = totals.drugsSeized || 0;
    }
  }
  
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

/**
 * Reset all database data
 */
function resetDatabase() {
  if (confirm('ATENÇÃO: Esta ação irá apagar todos os dados do sistema. Deseja continuar?')) {
    // Mostrar loader
    document.getElementById('loader').style.display = 'block';
    
    fetch('/reset', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    })
    .then(response => {
      if (!response.ok) {
        throw new Error('Erro ao resetar o banco de dados');
      }
      return response.json();
    })
    .then(data => {
      console.log('Database reset complete:', data);
      
      // Ocultar loader
      document.getElementById('loader').style.display = 'none';
      
      // Atualizar os totais com zeros
      document.getElementById('totalPeopleValue').textContent = 0;
      document.getElementById('totalMotorcyclesValue').textContent = 0;
      document.getElementById('totalCarsValue').textContent = 0;
      document.getElementById('totalBicyclesValue').textContent = 0;
      document.getElementById('grandTotalValue').textContent = 0;
      document.getElementById('reportsCountValue').textContent = 0;
      
      // Atualizar os novos campos com zeros nos totais
      if (document.getElementById('totalArrestsValue')) {
        document.getElementById('totalArrestsValue').textContent = 0;
      }
      
      if (document.getElementById('totalSeizedMotorcyclesValue')) {
        document.getElementById('totalSeizedMotorcyclesValue').textContent = 0;
      }
      
      if (document.getElementById('totalDrugsSeizedValue')) {
        document.getElementById('totalDrugsSeizedValue').textContent = 0;
      }
      
      // Também zerar os valores do relatório atual
      document.getElementById('peopleValue').textContent = 0;
      document.getElementById('motorcyclesValue').textContent = 0;
      document.getElementById('carsValue').textContent = 0;
      document.getElementById('bicyclesValue').textContent = 0;
      document.getElementById('totalValue').textContent = 0;
      
      if (document.getElementById('arrestsValue')) {
        document.getElementById('arrestsValue').textContent = 0;
      }
      
      if (document.getElementById('seizedMotorcyclesValue')) {
        document.getElementById('seizedMotorcyclesValue').textContent = 0;
      }
      
      if (document.getElementById('drugsSeizedValue')) {
        document.getElementById('drugsSeizedValue').textContent = 0;
      }
      
      // Limpar texto do relatório e dados de localização/data
      document.getElementById('reportText').value = '';
      document.getElementById('locationValue').textContent = '';
      document.getElementById('dateValue').textContent = '';
      document.getElementById('shiftValue').textContent = '';
      document.getElementById('occurrenceValue').textContent = '';
      
      // Limpar badges
      document.getElementById('locationBadge').textContent = '';
      document.getElementById('shiftBadge').textContent = '';
      
      // Exibir mensagem de sucesso
      alert('Todos os dados foram resetados com sucesso!');
    })
    .catch(error => {
      console.error('Error resetting database:', error);
      document.getElementById('loader').style.display = 'none';
      showError('Ocorreu um erro ao tentar resetar o banco de dados: ' + error.message);
    });
  }
}
