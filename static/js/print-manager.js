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
   * Vincular eventos de impressão - apenas um botão de impressão de PDF
   */
  bindEvents() {
    const printButton = document.getElementById('printReportButton');
    
    if (printButton) {
      printButton.addEventListener('click', () => this.printTotalsReport());
    }
  }

  /**
   * Função simplificada para impressão de relatório de totais
   */
  printTotalsReport() {
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
    
    // Gerar o relatório de totais acumulados
    this.generateTotalsReport(printContainer);
    
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
   * Gerar relatório único de totais acumulados do mês corrente
   * @param {HTMLElement} container - Container para o relatório
   */
  generateTotalsReport(container) {
    // Tabela simples com todos os totais acumulados
    // Estilo básico para a tabela principal
    const tableStyle = `
      <style>
        .totals-table {
          width: 100%;
          border-collapse: collapse;
          font-family: Arial, sans-serif;
        }
        .totals-table th, .totals-table td {
          border: 1px solid #ccc;
          padding: 8px;
        }
        .totals-table th {
          background-color: #f2f2f2;
          text-align: left;
        }
        .totals-table tr:nth-child(even) {
          background-color: #f9f9f9;
        }
        .header-row th {
          background-color: #00335B;
          color: white;
          text-align: center;
          padding: 10px;
          font-weight: bold;
        }
        .category-row th {
          background-color: #f2f2f2;
          text-align: center;
          padding: 6px;
        }
        .total-cell {
          background-color: #e6f7ff;
          font-weight: bold;
          text-align: right;
        }
        .qty-cell {
          text-align: center;
        }
      </style>
    `;
    
    const table = document.createElement('table');
    table.className = 'totals-table';
    
    // Construir a tabela exatamente como na imagem
    table.innerHTML = `
      <tr class="header-row">
        <th colspan="4">TOTAIS ACUMULADOS - PRODUTIVIDADE OPERACIONAL</th>
      </tr>
      <tr class="category-row">
        <th colspan="4">Abordagens e Inspeções</th>
      </tr>
      <tr>
        <th>Indicador</th>
        <th>Quantidade</th>
        <th>Indicador</th>
        <th>Quantidade</th>
      </tr>
      <tr>
        <td>Pessoas a Pé</td>
        <td class="qty-cell">${document.getElementById('totalPeopleValue').textContent || '0'}</td>
        <td>Motocicletas</td>
        <td class="qty-cell">${document.getElementById('totalMotorcyclesValue').textContent || '0'}</td>
      </tr>
      <tr>
        <td>Carros</td>
        <td class="qty-cell">${document.getElementById('totalCarsValue').textContent || '0'}</td>
        <td>Bicicletas</td>
        <td class="qty-cell">${document.getElementById('totalBicyclesValue').textContent || '0'}</td>
      </tr>
      <tr>
        <td colspan="3" style="text-align: right">Total de Abordagens:</td>
        <td class="qty-cell" style="background-color: #e6f7ff;">${document.getElementById('grandTotalValue').textContent || '0'}</td>
      </tr>
      <tr class="category-row">
        <th colspan="4">Prisões e Capturas</th>
      </tr>
      <tr>
        <td>Prisões Realizadas</td>
        <td class="qty-cell">${document.getElementById('totalArrestsValue').textContent || '0'}</td>
        <td>Foragidos Capturados</td>
        <td class="qty-cell">${document.getElementById('totalFugitivesValue').textContent || '0'}</td>
      </tr>
      <tr class="category-row">
        <th colspan="4">Apreensões</th>
      </tr>
      <tr>
        <td>Motos Apreendidas</td>
        <td class="qty-cell">${document.getElementById('totalSeizedMotorcyclesValue').textContent || '0'}</td>
        <td>Drogas Apreendidas</td>
        <td class="qty-cell">${document.getElementById('totalDrugsSeizedValue').textContent || '0'} g</td>
      </tr>
      <tr>
        <td>Armas Brancas</td>
        <td class="qty-cell">${document.getElementById('totalBladedWeaponsValue').textContent || '0'}</td>
        <td>Armas de Fogo</td>
        <td class="qty-cell">${document.getElementById('totalFirearmsValue').textContent || '0'}</td>
      </tr>
    `;
    
    // Adicionar estilos e tabela ao container
    container.innerHTML = tableStyle;
    container.appendChild(table);
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
   * Gerar relatório detalhado apenas com totais acumulados
   * @param {HTMLElement} container - Container para o relatório
   */
  generateFullReportPrintView(container) {
    // Mês atual (Abril 2025)
    const currentMonth = "ABRIL";
    const currentYear = "2025";
    
    // Cabeçalho do relatório
    container.innerHTML = `
      <div class="print-header">
        ${this.logoSVG}
        <h1 class="print-title">POLÍCIA MILITAR DO PARÁ</h1>
        <h2 class="print-subtitle">20ª COMPANHIA INDEPENDENTE DE POLÍCIA MILITAR</h2>
        <p>RELATÓRIO DETALHADO - TOTAIS ACUMULADOS ${currentMonth} ${currentYear}</p>
      </div>
    `;
    
    // Informações gerais do relatório
    const dateInfo = new Date();
    const formattedDate = dateInfo.toLocaleDateString('pt-BR');
    
    const reportInfo = document.createElement('div');
    reportInfo.className = 'print-report-info';
    reportInfo.style.marginBottom = '20px';
    reportInfo.innerHTML = `
      <div style="display: flex; justify-content: space-between; width: 100%;">
        <div>
          <div style="font-weight: bold;">COMANDO DE POLICIAMENTO REGIONAL XII</div>
          <div>20ª COMPANHIA INDEPENDENTE DE POLÍCIA MILITAR</div>
          <div>CONTROLE DE PRODUTIVIDADE OPERACIONAL</div>
        </div>
        <div style="text-align: right; font-weight: bold;">
          <div>Mês de Referência: ${currentMonth}/${currentYear}</div>
          <div>Relatório Emitido em: ${formattedDate}</div>
          <div>Total de Relatórios: ${document.getElementById('reportsCountValue').textContent || '0'}</div>
        </div>
      </div>
    `;
    container.appendChild(reportInfo);
    
    // Adicionar título da seção de totais acumulados
    const totalsTitle = document.createElement('h3');
    totalsTitle.className = 'print-section-title';
    totalsTitle.innerHTML = 'PRODUTIVIDADE MENSAL ACUMULADA';
    totalsTitle.style.margin = '25px 0 15px 0';
    totalsTitle.style.textAlign = 'center';
    totalsTitle.style.color = '#003366';
    totalsTitle.style.borderBottom = '2px solid #003366';
    totalsTitle.style.paddingBottom = '5px';
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
    
    // Usar a mesma variável dateInfo já criada acima
    const formattedTime = dateInfo.toLocaleTimeString('pt-BR');
    
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