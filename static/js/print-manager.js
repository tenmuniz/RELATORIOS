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
    
    // Mostrar indicador de carregamento
    const loadingIndicator = document.createElement('div');
    loadingIndicator.className = 'loading-print';
    loadingIndicator.textContent = 'Carregando dados para impressão...';
    printContainer.appendChild(loadingIndicator);
    
    // Buscar dados por localização para gerar o relatório separado por município
    fetch('/api/reports-by-location')
      .then(response => response.json())
      .then(data => {
        // Remover indicador de carregamento
        loadingIndicator.remove();
        
        if (data.success) {
          // Gerar o relatório de totais acumulados (primeira página)
          this.generateTotalsReport(printContainer);
          
          // Adicionar quebra de página
          const pageBreak = document.createElement('div');
          pageBreak.className = 'page-break';
          printContainer.appendChild(pageBreak);
          
          // Gerar relatório por localização (segunda página)
          this.generateLocationReport(printContainer, data.locations);
          
          // Pequeno atraso para garantir que o DOM foi atualizado
          setTimeout(() => {
            window.print();
            
            // Remover o container após a impressão para evitar duplicação
            setTimeout(() => {
              printContainer.remove();
            }, 1000);
          }, 300);
        } else {
          console.error('Erro ao buscar dados por localização:', data.error);
          alert('Não foi possível carregar os dados por localização. Tentando carregar somente o relatório de totais.');
          
          // Gerar apenas o relatório de totais se houver erro
          this.generateTotalsReport(printContainer);
          
          setTimeout(() => {
            window.print();
            
            setTimeout(() => {
              printContainer.remove();
            }, 1000);
          }, 300);
        }
      })
      .catch(error => {
        console.error('Erro na requisição de dados por localização:', error);
        loadingIndicator.remove();
        
        // Em caso de erro, gerar apenas o relatório de totais
        this.generateTotalsReport(printContainer);
        
        setTimeout(() => {
          window.print();
          
          setTimeout(() => {
            printContainer.remove();
          }, 1000);
        }, 300);
      });
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
        #printContainer {
          max-width: 800px;
          margin: 0 auto;
          padding: 10px 0;
        }
        
        .totals-table {
          width: 100%;
          border-collapse: collapse;
          font-family: Arial, sans-serif;
          margin-bottom: 30px;
          page-break-inside: avoid;
        }
        .totals-table th, .totals-table td {
          border: 1px solid #000;
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
          padding: 8px;
          font-weight: bold;
          font-size: 12pt;
        }
        .category-row th {
          background-color: #f2f2f2;
          text-align: center;
          padding: 5px;
          font-weight: bold;
        }
        .qty-cell {
          text-align: center;
        }
        .total-row td {
          background-color: #e6f7ff;
          font-weight: normal;
        }
        .page-break {
          page-break-after: always;
          height: 0;
          display: block;
          clear: both;
        }
        .location-title {
          margin-top: 15px;
          margin-bottom: 8px;
          font-size: 14pt;
          font-weight: bold;
          color: #333;
          text-align: center;
        }
        .loading-print {
          text-align: center;
          padding: 20px;
          font-size: 16px;
          color: #666;
        }
        h2 {
          color: #00335B;
          margin-top: 10px;
          margin-bottom: 20px;
          font-size: 16pt;
          text-align: center;
          font-weight: bold;
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
      <tr class="total-row">
        <td colspan="3" style="text-align: right">Total de Abordagens:</td>
        <td class="qty-cell">${document.getElementById('grandTotalValue').textContent || '0'}</td>
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
    if (!container.querySelector('style')) {
      const styleElement = document.createElement('style');
      styleElement.textContent = tableStyle;
      container.appendChild(styleElement);
    }
    
    // Adicionar título para a primeira página
    const title = document.createElement('h2');
    title.textContent = 'RELATÓRIO GERAL - TOTAIS ACUMULADOS';
    title.style.textAlign = 'center';
    title.style.marginBottom = '20px';
    container.appendChild(title);
    
    container.appendChild(table);
  }
  
  /**
   * Gerar relatório separado por localização
   * @param {HTMLElement} container - Container para o relatório
   * @param {Object} locationsData - Dados separados por localização
   */
  generateLocationReport(container, locationsData) {
    // Título para a página de relatório por localização
    const title = document.createElement('h2');
    title.textContent = 'RELATÓRIO POR MUNICÍPIO';
    title.style.textAlign = 'center';
    title.style.marginBottom = '20px';
    container.appendChild(title);
    
    // Verificar se existem dados
    if (!locationsData || Object.keys(locationsData).length === 0) {
      const noDataMsg = document.createElement('p');
      noDataMsg.textContent = 'Não há dados disponíveis por município.';
      noDataMsg.style.textAlign = 'center';
      container.appendChild(noDataMsg);
      return;
    }
    
    // Processar cada localização (município)
    Object.keys(locationsData).forEach(location => {
      const locationData = locationsData[location];
      
      // Adicionar título do município
      const locationTitle = document.createElement('div');
      locationTitle.className = 'location-title';
      locationTitle.textContent = `MUNICÍPIO: ${location}`;
      container.appendChild(locationTitle);
      
      // Criar tabela para este município
      const locationTable = document.createElement('table');
      locationTable.className = 'totals-table';
      
      // Construir a tabela para este município
      locationTable.innerHTML = `
        <tr class="header-row">
          <th colspan="4">PRODUTIVIDADE OPERACIONAL - ${location.toUpperCase()}</th>
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
          <td class="qty-cell">${locationData.people || 0}</td>
          <td>Motocicletas</td>
          <td class="qty-cell">${locationData.motorcycles || 0}</td>
        </tr>
        <tr>
          <td>Carros</td>
          <td class="qty-cell">${locationData.cars || 0}</td>
          <td>Bicicletas</td>
          <td class="qty-cell">${locationData.bicycles || 0}</td>
        </tr>
        <tr class="total-row">
          <td colspan="3" style="text-align: right">Total de Abordagens:</td>
          <td class="qty-cell">${locationData.total_inspections || 0}</td>
        </tr>
        <tr class="category-row">
          <th colspan="4">Prisões e Capturas</th>
        </tr>
        <tr>
          <td>Prisões Realizadas</td>
          <td class="qty-cell">${locationData.arrests || 0}</td>
          <td>Foragidos Capturados</td>
          <td class="qty-cell">${locationData.fugitives || 0}</td>
        </tr>
        <tr class="category-row">
          <th colspan="4">Apreensões</th>
        </tr>
        <tr>
          <td>Motos Apreendidas</td>
          <td class="qty-cell">${locationData.seized_motorcycles || 0}</td>
          <td>Drogas Apreendidas</td>
          <td class="qty-cell">${this.formatDrugsAmount(locationData.drugs_seized || 0)}</td>
        </tr>
        <tr>
          <td>Armas Brancas</td>
          <td class="qty-cell">${locationData.bladed_weapons || 0}</td>
          <td>Armas de Fogo</td>
          <td class="qty-cell">${locationData.firearms || 0}</td>
        </tr>
        <tr class="total-row">
          <td colspan="3" style="text-align: right">Total de Relatórios:</td>
          <td class="qty-cell">${locationData.reports_count || 0}</td>
        </tr>
      `;
      
      container.appendChild(locationTable);
      
      // Adicionar espaço entre as tabelas, exceto a última
      if (Object.keys(locationsData).indexOf(location) < Object.keys(locationsData).length - 1) {
        const spacer = document.createElement('div');
        spacer.style.height = '30px';
        container.appendChild(spacer);
      }
    });
  }
  
  /**
   * Formata a quantidade de drogas para exibição (g ou kg)
   * @param {number} amount - Quantidade em gramas
   * @returns {string} - Valor formatado
   */
  formatDrugsAmount(amount) {
    if (amount >= 999) {
      // Converter para kg e mostrar com até 3 casas decimais
      return `${(amount / 1000).toFixed(3)} kg`;
    } else {
      // Manter em gramas com uma casa decimal
      return `${amount.toFixed(1)} g`;
    }
  }
}

// Inicializar o gerenciador de impressão quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
  window.printManager = new PrintManager();
});