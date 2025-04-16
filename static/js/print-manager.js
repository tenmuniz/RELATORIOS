/**
 * Gerenciador de impressão para relatórios policiais
 * Este script cria uma versão específica para impressão de relatórios 
 * com layout otimizado e melhor visualização
 */

class PrintManager {
  constructor() {
    // Inicializar o gerenciador de impressão
    this.bindEvents();
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
}

// Inicializar o gerenciador de impressão quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
  window.printManager = new PrintManager();
});