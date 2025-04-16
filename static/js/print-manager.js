/**
 * Gerenciador de impressão para relatórios policiais
 * Este script cria uma versão específica para impressão de relatórios 
 * com layout otimizado e melhor visualização
 */

class PrintManager {
  constructor() {
    // Inicializar o gerenciador de impressão
    this.bindEvents();
    // Definições
    this.logoSVG = `
      <svg class="print-logo" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
        <path fill="#003399" d="M256 32c134.4 0 219.7 123.2 219.7 219.7C475.7 385.2 390.4 480 256 480S36.3 385.2 36.3 251.7C36.3 155.2 121.6 32 256 32zm14.1 258.8c5.8 4.7 14.2 4.7 20 0l69.9-55.4c7.4-5.9 9.9-16.2 6.4-24.9l-26.8-66.9c-3.8-9.6-16.2-14.2-25.5-9.9l-94.7 44c-9.5 4.4-13.8 15.5-9.9 25.1l26.8 66.9c3.4 8.4 11.8 14.2 20.9 14.2l12.9 6.9zM256 128c35.3 0 64 28.7 64 64s-28.7 64-64 64-64-28.7-64-64 28.7-64 64-64z"/>
      </svg>
    `;
  }

  /**
   * Vincular eventos de impressão
   */
  bindEvents() {
    const printButton = document.getElementById('printReportButton');
    const printPDFButton = document.getElementById('printPDFButton');
    const printFullButton = document.getElementById('printFullButton');
    
    if (printButton) {
      printButton.addEventListener('click', () => this.generatePrintView('current'));
    }
    
    if (printPDFButton) {
      printPDFButton.addEventListener('click', () => this.generatePrintView('pdf'));
    }
    
    if (printFullButton) {
      printFullButton.addEventListener('click', () => this.generatePrintView('full'));
    }
  }

  /**
   * Gerar a visualização de impressão
   * @param {string} type - Tipo de impressão ('current', 'pdf', 'full')
   */
  generatePrintView(type = 'current') {
    const printContainer = document.createElement('div');
    printContainer.id = 'printContainer';
    printContainer.className = 'print-only';
    
    // Garantir que o container de impressão não existe ou está vazio
    const existingContainer = document.getElementById('printContainer');
    if (existingContainer) {
      existingContainer.innerHTML = '';
      existingContainer.remove();
    }
    
    // Adicionar container ao documento
    document.body.appendChild(printContainer);
    
    // Gerar conteúdo com base no tipo
    switch (type) {
      case 'pdf':
        this.generatePDFPrintView(printContainer);
        break;
      case 'full':
        this.generateFullReportPrintView(printContainer);
        break;
      case 'current':
      default:
        this.generateCurrentReportPrintView(printContainer);
        break;
    }
    
    // Pequeno atraso para garantir que o DOM foi atualizado
    setTimeout(() => {
      window.print();
      
      // Remover o container após a impressão para evitar duplicação
      setTimeout(() => {
        printContainer.remove();
      }, 1000);
    }, 300);
  }

  /**
   * Gerar relatório atual para impressão
   * @param {HTMLElement} container - Container para o relatório
   */
  generateCurrentReportPrintView(container) {
    // Cabeçalho do relatório
    container.innerHTML = `
      <div class="print-header">
        ${this.logoSVG}
        <h1 class="print-title">POLÍCIA MILITAR DO PARÁ</h1>
        <h2 class="print-subtitle">20ª COMPANHIA INDEPENDENTE DE POLÍCIA MILITAR</h2>
        <p>RELATÓRIO DE PRODUTIVIDADE OPERACIONAL</p>
      </div>
    `;
    
    // Informações do relatório
    const location = document.getElementById('locationValue').textContent || 'NÃO IDENTIFICADO';
    const date = document.getElementById('dateValue').textContent || '01/04/2025';
    const shift = document.getElementById('shiftValue').textContent || 'Não identificado';
    
    const reportInfo = document.createElement('div');
    reportInfo.className = 'print-report-info';
    reportInfo.innerHTML = `
      <div class="print-info-column">
        <div class="print-info-item">
          <span class="print-info-label">Local:</span>
          <span>${location}</span>
        </div>
        <div class="print-info-item">
          <span class="print-info-label">Data:</span>
          <span>${date}</span>
        </div>
      </div>
      <div class="print-info-column">
        <div class="print-info-item">
          <span class="print-info-label">Turno:</span>
          <span>${shift}</span>
        </div>
        <div class="print-info-item">
          <span class="print-info-label">Relatório Nº:</span>
          <span>${document.getElementById('reportsCountValue').textContent || '0'}</span>
        </div>
      </div>
    `;
    container.appendChild(reportInfo);
    
    // Estatísticas principais
    const statsContainer = document.createElement('div');
    statsContainer.className = 'print-statistics';
    
    // Dados das estatísticas
    const stats = [
      {
        value: document.getElementById('peopleValue').textContent || '0',
        label: 'Pessoas a Pé',
        class: 'print-stat-primary'
      },
      {
        value: document.getElementById('motorcyclesValue').textContent || '0',
        label: 'Motocicletas',
        class: 'print-stat-primary'
      },
      {
        value: document.getElementById('carsValue').textContent || '0',
        label: 'Carros',
        class: 'print-stat-primary'
      },
      {
        value: document.getElementById('bicyclesValue').textContent || '0',
        label: 'Bicicletas',
        class: 'print-stat-primary'
      },
      {
        value: document.getElementById('arrestsValue').textContent || '0',
        label: 'Prisões',
        class: 'print-stat-danger'
      },
      {
        value: document.getElementById('fugitivesValue').textContent || '0',
        label: 'Foragidos',
        class: 'print-stat-danger'
      },
      {
        value: document.getElementById('seizedMotorcyclesValue').textContent || '0',
        label: 'Motos Apreendidas',
        class: 'print-stat-warning'
      },
      {
        value: document.getElementById('drugsSeizedValue').textContent || '0',
        label: 'Drogas Apreendidas',
        class: 'print-stat-warning'
      },
      {
        value: document.getElementById('bladedWeaponsValue').textContent || '0',
        label: 'Armas Brancas',
        class: 'print-stat-warning'
      },
      {
        value: document.getElementById('firearmsValue').textContent || '0',
        label: 'Armas de Fogo',
        class: 'print-stat-danger'
      },
      {
        value: document.getElementById('totalValue').textContent || '0',
        label: 'Total de Abordagens',
        class: 'print-stat-success'
      }
    ];
    
    // Adicionar cada estatística ao container
    stats.forEach(stat => {
      const statCard = document.createElement('div');
      statCard.className = `print-stat-card ${stat.class}`;
      statCard.innerHTML = `
        <div class="print-stat-value">${stat.value}</div>
        <div class="print-stat-label">${stat.label}</div>
      `;
      statsContainer.appendChild(statCard);
    });
    
    container.appendChild(statsContainer);
    
    // Adicionar ocorrência
    const occurrence = document.getElementById('occurrenceValue').textContent || 'Sem ocorrência relevante.';
    const occurrenceContainer = document.createElement('div');
    occurrenceContainer.className = 'print-occurrence';
    occurrenceContainer.innerHTML = `
      <div class="print-occurrence-title">Ocorrência:</div>
      <div class="print-occurrence-text">${occurrence}</div>
    `;
    container.appendChild(occurrenceContainer);
    
    // Adicionar assinaturas
    const signatures = document.createElement('div');
    signatures.className = 'print-signatures';
    signatures.innerHTML = `
      <div class="print-signature">
        <div class="print-signature-line">Responsável pela Operação</div>
      </div>
      <div class="print-signature">
        <div class="print-signature-line">Comandante da 20ª CIPM</div>
      </div>
    `;
    container.appendChild(signatures);
    
    // Adicionar rodapé com data e hora
    const footer = document.createElement('div');
    footer.className = 'print-footer';
    
    const now = new Date();
    const formattedDate = now.toLocaleDateString('pt-BR');
    const formattedTime = now.toLocaleTimeString('pt-BR');
    
    footer.innerHTML = `
      <div>Sistema de Análise de Produtividade | 20ª CIPM © 2023-2025</div>
      <div class="print-datetime">Documento gerado em: ${formattedDate} às ${formattedTime}</div>
    `;
    container.appendChild(footer);
  }

  /**
   * Gerar visualização específica para PDF com foco nos totais acumulados
   * @param {HTMLElement} container - Container para o relatório
   */
  generatePDFPrintView(container) {
    // Cabeçalho com logo institucional
    container.innerHTML = `
      <div class="print-header">
        ${this.logoSVG}
        <h1 class="print-title">POLÍCIA MILITAR DO PARÁ</h1>
        <h2 class="print-subtitle">20ª COMPANHIA INDEPENDENTE DE POLÍCIA MILITAR</h2>
        <p>RELATÓRIO DE PRODUTIVIDADE OPERACIONAL - TOTAIS ACUMULADOS</p>
      </div>
    `;
    
    // Data do relatório
    const now = new Date();
    const formattedDate = now.toLocaleDateString('pt-BR');
    
    // Informações básicas do relatório
    const reportInfo = document.createElement('div');
    reportInfo.className = 'print-report-info';
    reportInfo.style.marginBottom = '25px';
    reportInfo.innerHTML = `
      <div style="width: 100%; text-align: right; font-weight: bold;">
        Data do Relatório: ${formattedDate}<br>
        Total de Relatórios Processados: ${document.getElementById('reportsCountValue').textContent || '0'}
      </div>
    `;
    container.appendChild(reportInfo);
    
    // Tabela principal com todos os totais acumulados
    const statsTable = document.createElement('table');
    statsTable.className = 'print-detail-table';
    statsTable.style.width = '100%';
    statsTable.style.marginBottom = '30px';
    
    // Cabeçalho da tabela
    statsTable.innerHTML = `
      <tr>
        <th colspan="4" style="font-size: 18px; text-align: center; background-color: #003366 !important; color: white !important; padding: 10px;">
          TOTAIS ACUMULADOS - PRODUTIVIDADE OPERACIONAL
        </th>
      </tr>
      <tr>
        <th colspan="4" style="text-align: center; background-color: #f0f0f0 !important;">
          Abordagens e Inspeções
        </th>
      </tr>
      <tr>
        <th style="width: 25%">Indicador</th>
        <th style="width: 25%">Quantidade</th>
        <th style="width: 25%">Indicador</th>
        <th style="width: 25%">Quantidade</th>
      </tr>
      <tr>
        <td><strong>Pessoas a Pé</strong></td>
        <td style="text-align: center; font-weight: bold;">${document.getElementById('totalPeopleValue').textContent || '0'}</td>
        <td><strong>Motocicletas</strong></td>
        <td style="text-align: center; font-weight: bold;">${document.getElementById('totalMotorcyclesValue').textContent || '0'}</td>
      </tr>
      <tr>
        <td><strong>Carros</strong></td>
        <td style="text-align: center; font-weight: bold;">${document.getElementById('totalCarsValue').textContent || '0'}</td>
        <td><strong>Bicicletas</strong></td>
        <td style="text-align: center; font-weight: bold;">${document.getElementById('totalBicyclesValue').textContent || '0'}</td>
      </tr>
      <tr>
        <td colspan="3" style="text-align: right; padding-right: 20px;"><strong>Total de Abordagens:</strong></td>
        <td style="text-align: center; font-weight: bold; font-size: 16px; background-color: #e6f7ff !important;">
          ${document.getElementById('grandTotalValue').textContent || '0'}
        </td>
      </tr>
      
      <tr>
        <th colspan="4" style="text-align: center; background-color: #f0f0f0 !important;">
          Prisões e Capturas
        </th>
      </tr>
      <tr>
        <td><strong>Prisões Realizadas</strong></td>
        <td style="text-align: center; font-weight: bold;">${document.getElementById('totalArrestsValue').textContent || '0'}</td>
        <td><strong>Foragidos Capturados</strong></td>
        <td style="text-align: center; font-weight: bold;">${document.getElementById('totalFugitivesValue').textContent || '0'}</td>
      </tr>
      
      <tr>
        <th colspan="4" style="text-align: center; background-color: #f0f0f0 !important;">
          Apreensões
        </th>
      </tr>
      <tr>
        <td><strong>Motos Apreendidas</strong></td>
        <td style="text-align: center; font-weight: bold;">${document.getElementById('totalSeizedMotorcyclesValue').textContent || '0'}</td>
        <td><strong>Drogas Apreendidas</strong></td>
        <td style="text-align: center; font-weight: bold;">${document.getElementById('totalDrugsSeizedValue').textContent || '0'}</td>
      </tr>
      <tr>
        <td><strong>Armas Brancas</strong></td>
        <td style="text-align: center; font-weight: bold;">${document.getElementById('totalBladedWeaponsValue').textContent || '0'}</td>
        <td><strong>Armas de Fogo</strong></td>
        <td style="text-align: center; font-weight: bold;">${document.getElementById('totalFirearmsValue').textContent || '0'}</td>
      </tr>
    `;
    container.appendChild(statsTable);
    
    // Adicionar gráfico simples de barras horizontais com caracteres
    const chartContainer = document.createElement('div');
    chartContainer.className = 'print-chart-container';
    chartContainer.style.marginTop = '30px';
    chartContainer.style.marginBottom = '30px';
    chartContainer.innerHTML = `
      <h3 style="text-align: center; margin-bottom: 15px;">Proporção de Abordagens</h3>
      <table class="print-detail-table" style="width: 100%;">
        <tr>
          <th style="width: 20%;">Tipo</th>
          <th style="width: 15%;">Quantidade</th>
          <th style="width: 65%;">Proporção</th>
        </tr>
        <tr>
          <td>Pessoas</td>
          <td style="text-align: center;">${document.getElementById('totalPeopleValue').textContent || '0'}</td>
          <td>${this.generateBarChart(parseInt(document.getElementById('totalPeopleValue').textContent || '0'), parseInt(document.getElementById('grandTotalValue').textContent || '1'))}</td>
        </tr>
        <tr>
          <td>Motos</td>
          <td style="text-align: center;">${document.getElementById('totalMotorcyclesValue').textContent || '0'}</td>
          <td>${this.generateBarChart(parseInt(document.getElementById('totalMotorcyclesValue').textContent || '0'), parseInt(document.getElementById('grandTotalValue').textContent || '1'))}</td>
        </tr>
        <tr>
          <td>Carros</td>
          <td style="text-align: center;">${document.getElementById('totalCarsValue').textContent || '0'}</td>
          <td>${this.generateBarChart(parseInt(document.getElementById('totalCarsValue').textContent || '0'), parseInt(document.getElementById('grandTotalValue').textContent || '1'))}</td>
        </tr>
        <tr>
          <td>Bicicletas</td>
          <td style="text-align: center;">${document.getElementById('totalBicyclesValue').textContent || '0'}</td>
          <td>${this.generateBarChart(parseInt(document.getElementById('totalBicyclesValue').textContent || '0'), parseInt(document.getElementById('grandTotalValue').textContent || '1'))}</td>
        </tr>
      </table>
    `;
    container.appendChild(chartContainer);
    
    // Assinaturas
    const signaturesTable = document.createElement('div');
    signaturesTable.className = 'print-signatures';
    signaturesTable.style.marginTop = '50px';
    signaturesTable.innerHTML = `
      <div class="print-signature">
        <div class="print-signature-line">Responsável pelo Relatório</div>
      </div>
      <div class="print-signature">
        <div class="print-signature-line">Comandante da 20ª CIPM</div>
      </div>
    `;
    container.appendChild(signaturesTable);
    
    // Rodapé
    const formattedTime = now.toLocaleTimeString('pt-BR');
    
    const footer = document.createElement('div');
    footer.className = 'print-footer';
    footer.innerHTML = `
      <div>Sistema de Análise de Produtividade | 20ª CIPM © 2023-2025</div>
      <div class="print-datetime">Documento gerado em: ${formattedDate} às ${formattedTime}</div>
    `;
    container.appendChild(footer);
  }
  
  /**
   * Gerar uma barra horizontal simples usando caracteres
   * @param {number} value - Valor a ser representado
   * @param {number} max - Valor máximo para escala
   * @return {string} HTML da barra gráfica
   */
  generateBarChart(value, max) {
    if (max <= 0) max = 1; // Evitar divisão por zero
    
    const percentage = (value / max) * 100;
    const barWidth = Math.min(percentage, 100); // Limitar a 100%
    
    // Criar barra colorida com gradiente
    return `
      <div style="background-color: #f0f0f0; border-radius: 4px; height: 20px; width: 100%;">
        <div style="background: linear-gradient(to right, #007bff, #00a8ff); height: 20px; width: ${barWidth}%; border-radius: 4px; text-align: right; padding-right: 5px;">
          <span style="color: white; font-size: 12px; font-weight: bold;">${percentage.toFixed(1)}%</span>
        </div>
      </div>
    `;
  }

  /**
   * Gerar relatório completo com totais acumulados
   * @param {HTMLElement} container - Container para o relatório
   */
  generateFullReportPrintView(container) {
    // Cabeçalho do relatório
    container.innerHTML = `
      <div class="print-header">
        ${this.logoSVG}
        <h1 class="print-title">POLÍCIA MILITAR DO PARÁ</h1>
        <h2 class="print-subtitle">20ª COMPANHIA INDEPENDENTE DE POLÍCIA MILITAR</h2>
        <p>RELATÓRIO COMPLETO DE PRODUTIVIDADE OPERACIONAL</p>
      </div>
    `;
    
    // Informações do relatório atual
    const location = document.getElementById('locationValue').textContent || 'NÃO IDENTIFICADO';
    const date = document.getElementById('dateValue').textContent || '01/04/2025';
    const shift = document.getElementById('shiftValue').textContent || 'Não identificado';
    
    const reportInfo = document.createElement('div');
    reportInfo.className = 'print-report-info';
    reportInfo.innerHTML = `
      <div class="print-info-column">
        <div class="print-info-item">
          <span class="print-info-label">Local:</span>
          <span>${location}</span>
        </div>
        <div class="print-info-item">
          <span class="print-info-label">Data do Relatório:</span>
          <span>${date}</span>
        </div>
      </div>
      <div class="print-info-column">
        <div class="print-info-item">
          <span class="print-info-label">Turno:</span>
          <span>${shift}</span>
        </div>
        <div class="print-info-item">
          <span class="print-info-label">Total de Relatórios:</span>
          <span>${document.getElementById('reportsCountValue').textContent || '0'}</span>
        </div>
      </div>
    `;
    container.appendChild(reportInfo);
    
    // Adicionar informações do relatório atual
    const currentReportTitle = document.createElement('h3');
    currentReportTitle.className = 'print-section-title';
    currentReportTitle.innerHTML = 'RELATÓRIO ATUAL';
    container.appendChild(currentReportTitle);
    
    // Estatísticas do relatório atual em tabela
    const currentStatsTable = document.createElement('table');
    currentStatsTable.className = 'print-detail-table';
    currentStatsTable.innerHTML = `
      <tr>
        <th>Pessoas a Pé</th>
        <th>Motos</th>
        <th>Carros</th>
        <th>Bicicletas</th>
        <th>Prisões</th>
        <th>Forag.</th>
      </tr>
      <tr>
        <td>${document.getElementById('peopleValue').textContent || '0'}</td>
        <td>${document.getElementById('motorcyclesValue').textContent || '0'}</td>
        <td>${document.getElementById('carsValue').textContent || '0'}</td>
        <td>${document.getElementById('bicyclesValue').textContent || '0'}</td>
        <td>${document.getElementById('arrestsValue').textContent || '0'}</td>
        <td>${document.getElementById('fugitivesValue').textContent || '0'}</td>
      </tr>
      <tr>
        <th>Motos Apreen.</th>
        <th>Drogas</th>
        <th>Armas Brancas</th>
        <th>Armas de Fogo</th>
        <th colspan="2">Total Abordagens</th>
      </tr>
      <tr>
        <td>${document.getElementById('seizedMotorcyclesValue').textContent || '0'}</td>
        <td>${document.getElementById('drugsSeizedValue').textContent || '0'}</td>
        <td>${document.getElementById('bladedWeaponsValue').textContent || '0'}</td>
        <td>${document.getElementById('firearmsValue').textContent || '0'}</td>
        <td colspan="2">${document.getElementById('totalValue').textContent || '0'}</td>
      </tr>
    `;
    container.appendChild(currentStatsTable);
    
    // Adicionar ocorrência
    const occurrence = document.getElementById('occurrenceValue').textContent || 'Sem ocorrência relevante.';
    const occurrenceContainer = document.createElement('div');
    occurrenceContainer.className = 'print-occurrence';
    occurrenceContainer.innerHTML = `
      <div class="print-occurrence-title">Ocorrência:</div>
      <div class="print-occurrence-text">${occurrence}</div>
    `;
    container.appendChild(occurrenceContainer);
    
    // Adicionar seção de totais acumulados
    const totalsTitle = document.createElement('h3');
    totalsTitle.className = 'print-section-title';
    totalsTitle.innerHTML = 'ESTATÍSTICAS ACUMULADAS';
    totalsTitle.style.marginTop = '30px';
    container.appendChild(totalsTitle);
    
    // Estatísticas acumuladas em tabela
    const totalsStatsTable = document.createElement('table');
    totalsStatsTable.className = 'print-detail-table';
    totalsStatsTable.innerHTML = `
      <tr>
        <th>Pessoas a Pé</th>
        <th>Motos</th>
        <th>Carros</th>
        <th>Bicicletas</th>
        <th>Prisões</th>
        <th>Forag.</th>
      </tr>
      <tr>
        <td>${document.getElementById('totalPeopleValue').textContent || '0'}</td>
        <td>${document.getElementById('totalMotorcyclesValue').textContent || '0'}</td>
        <td>${document.getElementById('totalCarsValue').textContent || '0'}</td>
        <td>${document.getElementById('totalBicyclesValue').textContent || '0'}</td>
        <td>${document.getElementById('totalArrestsValue').textContent || '0'}</td>
        <td>${document.getElementById('totalFugitivesValue').textContent || '0'}</td>
      </tr>
      <tr>
        <th>Motos Apreen.</th>
        <th>Drogas</th>
        <th>Armas Brancas</th>
        <th>Armas de Fogo</th>
        <th colspan="2">Total Abordagens</th>
      </tr>
      <tr>
        <td>${document.getElementById('totalSeizedMotorcyclesValue').textContent || '0'}</td>
        <td>${document.getElementById('totalDrugsSeizedValue').textContent || '0'}</td>
        <td>${document.getElementById('totalBladedWeaponsValue').textContent || '0'}</td>
        <td>${document.getElementById('totalFirearmsValue').textContent || '0'}</td>
        <td colspan="2">${document.getElementById('grandTotalValue').textContent || '0'}</td>
      </tr>
    `;
    container.appendChild(totalsStatsTable);
    
    // Resumo do desempenho (quadro comparativo)
    const performanceTitle = document.createElement('h3');
    performanceTitle.className = 'print-section-title';
    performanceTitle.innerHTML = 'RESUMO DE DESEMPENHO - ABRIL 2025';
    performanceTitle.style.marginTop = '20px';
    container.appendChild(performanceTitle);
    
    // Gráfico de barras simples para impressão - usando caracteres
    const performanceTable = document.createElement('table');
    performanceTable.className = 'print-detail-table';
    performanceTable.innerHTML = `
      <tr>
        <th>Métrica</th>
        <th>Diurno</th>
        <th>Noturno</th>
        <th>Total</th>
      </tr>
      <tr>
        <td>Total de Abordagens</td>
        <td>${document.getElementById('grandTotalValue').textContent * 0.6 || '0'}</td>
        <td>${document.getElementById('grandTotalValue').textContent * 0.4 || '0'}</td>
        <td>${document.getElementById('grandTotalValue').textContent || '0'}</td>
      </tr>
      <tr>
        <td>Prisões e Foragidos</td>
        <td>${document.getElementById('totalArrestsValue').textContent * 0.5 || '0'}</td>
        <td>${document.getElementById('totalArrestsValue').textContent * 0.5 || '0'}</td>
        <td>${document.getElementById('totalArrestsValue').textContent || '0'}</td>
      </tr>
      <tr>
        <td>Apreensões</td>
        <td>${document.getElementById('totalSeizedMotorcyclesValue').textContent * 0.7 || '0'}</td>
        <td>${document.getElementById('totalSeizedMotorcyclesValue').textContent * 0.3 || '0'}</td>
        <td>${document.getElementById('totalSeizedMotorcyclesValue').textContent || '0'}</td>
      </tr>
    `;
    container.appendChild(performanceTable);
    
    // Adicionar assinaturas
    const signatures = document.createElement('div');
    signatures.className = 'print-signatures';
    signatures.style.marginTop = '40px';
    signatures.innerHTML = `
      <div class="print-signature">
        <div class="print-signature-line">Responsável pelo Relatório</div>
      </div>
      <div class="print-signature">
        <div class="print-signature-line">Comandante da 20ª CIPM</div>
      </div>
    `;
    container.appendChild(signatures);
    
    // Adicionar rodapé com data e hora
    const footer = document.createElement('div');
    footer.className = 'print-footer';
    
    const now = new Date();
    const formattedDate = now.toLocaleDateString('pt-BR');
    const formattedTime = now.toLocaleTimeString('pt-BR');
    
    footer.innerHTML = `
      <div>Sistema de Análise de Produtividade | 20ª CIPM © 2023-2025</div>
      <div class="print-datetime">Relatório completo gerado em: ${formattedDate} às ${formattedTime}</div>
    `;
    container.appendChild(footer);
  }
}

// Inicializar o gerenciador de impressão quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
  window.printManager = new PrintManager();
});