<template>
  <div>
    <div class="header-bar">
      <div class="page-header">
        <h1>Dashboard de Análises</h1>
      </div>
      <button
        @click="exportToPDF"
        class="btn btn-success"
        :disabled="!isAnyChartGenerated"
      >
        Exportar para PDF
      </button>
    </div>

    <div ref="dashboardContent">

      <fieldset>
        <legend>Procedimentos por Período</legend>
        <p>Altere os filtros para atualizar os gráficos automaticamente.</p>
        <div class="filter-bar">
          <div class="form-group">
            <label>Seccional</label>
            <select v-model="periodChart.filters.seccionalId">
              <option :value="null">Todas</option>
              <option v-for="s in seccionais" :key="s.id" :value="s.id">{{ s.nome }}</option>
            </select>
          </div>
          <div class="form-group">
            <label>Cidade</label>
            <select v-model="periodChart.filters.cidadeId" :disabled="!periodChart.filters.seccionalId">
              <option :value="null">Todas</option>
              <option v-for="c in filteredCidadesPeriod" :key="c.id" :value="c.id">{{ c.nome }}</option>
            </select>
          </div>
          <div class="form-group">
            <label>Ano</label>
            <input type="number" v-model.number="periodChart.filters.year" />
          </div>
          <div class="form-group">
            <label>Mês</label>
            <select v-model="periodChart.filters.month">
              <option :value="null">Ano Completo</option>
              <option v-for="m in 12" :key="m" :value="m">{{ m }}</option>
            </select>
          </div>
        </div>
        <div v-if="periodChart.loading" class="loading-message">Atualizando...</div>
        <div v-if="periodChart.error" class="feedback-message error">{{ periodChart.error }}</div>
        <div class="charts-wrapper" v-if="periodChart.data">
          <div class="chart-container">
            <Bar :data="periodChart.data" :options="barChartOptions" ref="periodChartBarRef" />
          </div>
          <div class="chart-container">
            <Pie :data="periodChart.data" :options="pieChartOptions" ref="periodChartPieRef" />
          </div>
        </div>
      </fieldset>

      <fieldset>
        <legend>Análise de Prisões por Cidade</legend>
        <p>Altere os filtros para atualizar os gráficos automaticamente.</p>
        <div class="filter-bar">
          <div class="form-group"><label>Seccional</label><select v-model="arrestChart.filters.seccionalId"><option :value="null">Todas</option><option v-for="s in seccionais" :key="s.id" :value="s.id">{{ s.nome }}</option></select></div>
          <div class="form-group"><label>Cidade</label><select v-model="arrestChart.filters.cidadeId" :disabled="!arrestChart.filters.seccionalId"><option :value="null">Todas</option><option v-for="c in filteredCidadesArrest" :key="c.id" :value="c.id">{{ c.nome }}</option></select></div>
          <div class="form-group"><label>Ano</label><input type="number" v-model.number="arrestChart.filters.year" /></div>
          <div class="form-group"><label>Mês</label><select v-model="arrestChart.filters.month"><option :value="null">Ano Completo</option><option v-for="m in 12" :key="m" :value="m">{{ m }}</option></select></div>
          <div class="form-group"><label>Ordenar por</label><select v-model="arrestChart.filters.sortBy"><option value="desc">Maior para o Menor</option><option value="asc">Menor para o Maior</option></select></div>
        </div>
        <div v-if="arrestChart.loading" class="loading-message">Atualizando...</div>
        <div v-if="arrestChart.error" class="feedback-message error">{{ arrestChart.error }}</div>
        <div class="charts-wrapper" v-if="arrestChart.dataBar">
          <div class="chart-container"><Bar :data="arrestChart.dataBar" :options="barChartOptions" ref="arrestChartBarRef" /></div>
          <div class="chart-container"><Pie :data="arrestChart.dataPie" :options="pieChartOptions" ref="arrestChartPieRef" /></div>
        </div>
      </fieldset>
      
      <fieldset>
        <legend>Análise de Pedidos Cautelares</legend>
        <p>Altere os filtros para atualizar os gráficos automaticamente.</p>
        <div class="filter-bar">
          <div class="form-group"><label>Seccional</label><select v-model="orderChart.filters.seccionalId"><option :value="null">Todas</option><option v-for="s in seccionais" :key="s.id" :value="s.id">{{ s.nome }}</option></select></div>
          <div class="form-group"><label>Cidade</label><select v-model="orderChart.filters.cidadeId" :disabled="!orderChart.filters.seccionalId"><option :value="null">Todas</option><option v-for="c in filteredCidadesOrder" :key="c.id" :value="c.id">{{ c.nome }}</option></select></div>
          <div class="form-group"><label>Ano</label><input type="number" v-model.number="orderChart.filters.year" /></div>
          <div class="form-group"><label>Mês</label><select v-model="orderChart.filters.month"><option :value="null">Ano Completo</option><option v-for="m in 12" :key="m" :value="m">{{ m }}</option></select></div>
        </div>
        <div v-if="orderChart.loading" class="loading-message">Atualizando...</div>
        <div v-if="orderChart.error" class="feedback-message error">{{ orderChart.error }}</div>
        <div class="chart-container single" v-if="orderChart.data">
          <Bar :data="orderChart.data" :options="complexBarChartOptions" ref="orderChartBarRef" />
        </div>
      </fieldset>

      <fieldset>
        <legend>Análise de Facções</legend>
        <p>Altere os filtros para atualizar os gráficos automaticamente.</p>
        <div class="filter-bar">
          <div class="form-group"><label>Seccional</label><select v-model="factionChart.filters.seccionalId"><option :value="null">Todas</option><option v-for="s in seccionais" :key="s.id" :value="s.id">{{ s.nome }}</option></select></div>
          <div class="form-group"><label>Cidade</label><select v-model="factionChart.filters.cidadeId" :disabled="!factionChart.filters.seccionalId"><option :value="null">Todas</option><option v-for="c in filteredCidadesFaction" :key="c.id" :value="c.id">{{ c.nome }}</option></select></div>
          <div class="form-group"><label>Ano</label><input type="number" v-model.number="factionChart.filters.year" /></div>
          <div class="form-group"><label>Mês</label><select v-model="factionChart.filters.month"><option :value="null">Ano Completo</option><option v-for="m in 12" :key="m" :value="m">{{ m }}</option></select></div>
        </div>
        <div v-if="factionChart.loading" class="loading-message">Atualizando...</div>
        <div v-if="factionChart.error" class="feedback-message error">{{ factionChart.error }}</div>
        <div class="chart-container single" v-if="factionChart.data">
          <Bar :data="factionChart.data" :options="complexBarChartOptions" ref="factionChartBarRef" />
        </div>
      </fieldset>

      <fieldset>
        <legend>Natureza das Prisões Realizadas</legend>
        <p>Altere os filtros para atualizar os gráficos automaticamente.</p>
        <div class="filter-bar">
          <div class="form-group"><label>Seccional</label><select v-model="arrestTypesChart.filters.seccionalId"><option :value="null">Todas</option><option v-for="s in seccionais" :key="s.id" :value="s.id">{{ s.nome }}</option></select></div>
          <div class="form-group"><label>Cidade</label><select v-model="arrestTypesChart.filters.cidadeId" :disabled="!arrestTypesChart.filters.seccionalId"><option :value="null">Todas</option><option v-for="c in filteredCidadesArrestTypes" :key="c.id" :value="c.id">{{ c.nome }}</option></select></div>
          <div class="form-group"><label>Ano</label><input type="number" v-model.number="arrestTypesChart.filters.year" /></div>
          <div class="form-group"><label>Mês</label><select v-model="arrestTypesChart.filters.month"><option :value="null">Ano Completo</option><option v-for="m in 12" :key="m" :value="m">{{ m }}</option></select></div>
        </div>
        <div v-if="arrestTypesChart.loading" class="loading-message">Atualizando...</div>
        <div v-if="arrestTypesChart.error" class="feedback-message error">{{ arrestTypesChart.error }}</div>

        <div class="charts-wrapper" v-if="arrestTypesChart.dataBar">
          <div class="chart-container">
            <h3>Total por Tipo</h3>
            <div style="position: relative; flex-grow: 1;">
              <Bar :data="arrestTypesChart.dataBar" :options="barChartOptions" ref="arrestTypesChartBarRef" />
            </div>
          </div>
          <div class="chart-container">
            <h3>Distribuição Percentual</h3>
            <div style="position: relative; flex-grow: 1;">
              <Pie :data="arrestTypesChart.dataPie" :options="pieChartOptions" ref="arrestTypesChartPieRef" />
            </div>
          </div>
        </div>
        </fieldset>

    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed, watch } from 'vue';
import apiClient from '../../api/api';
import jsPDF from 'jspdf';
import { Pie, Bar } from 'vue-chartjs';
import { Chart as ChartJS, Title, Tooltip, Legend, ArcElement, CategoryScale, BarElement, LinearScale } from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { useNotificationStore } from '../../stores/notificationStore';

const legendSpacingPlugin = {
  id: 'legendSpacing',
  beforeInit(chart) {
    const originalFit = chart.legend.fit;
    chart.legend.fit = function fit() {
      originalFit.bind(chart.legend)();
      this.height += 60;
    }
  }
};
ChartJS.register(Title, Tooltip, Legend, ArcElement, CategoryScale, BarElement, LinearScale, ChartDataLabels, legendSpacingPlugin);

// --- ESTADO GERAL E HELPERS ---
const notificationStore = useNotificationStore();
const seccionais = ref([]);
const cidades = ref([]);
const buildParams = (filters) => new URLSearchParams(Object.entries(filters).filter(([, value]) => value !== null && value !== '').map(([key, value]) => [key, value]));
const generateRandomColors = (numColors) => Array.from({ length: numColors }, () => `hsl(${Math.floor(Math.random() * 360)}, 70%, 50%)`);

const periodChartBarRef = ref(null);
const periodChartPieRef = ref(null);
const arrestChartBarRef = ref(null);
const arrestChartPieRef = ref(null);
const orderChartBarRef = ref(null);
const factionChartBarRef = ref(null);
const arrestTypesChartPieRef = ref(null);
const arrestTypesChartBarRef = ref(null);

// --- LÓGICA REATIVA PARA CADA GRÁFICO ---
const createChartLogic = (apiEndpoint) => reactive({
  loading: false, error: null, data: null, dataBar: null, dataPie: null,
  filters: { year: new Date().getFullYear(), month: null, seccionalId: null, cidadeId: null, sortBy: 'desc' },
  async generate() {
    this.loading = true; this.error = null; this.data = null; this.dataBar = null; this.dataPie = null;
    try {
      const response = await apiClient.get(apiEndpoint, { params: buildParams(this.filters) });
      if (!response.data || response.data.length === 0 || (response.data[0] && response.data[0].total_crimes === 0)) {
        this.error = "Nenhum dado encontrado para os filtros selecionados.";
        return;
      }
      this.processData(response.data);
    } catch (e) {
      this.error = `Falha ao gerar o gráfico: ${e.message}`;
      notificationStore.showNotification({ message: this.error });
    } finally {
      this.loading = false;
    }
  },
  processData(data) { /* Placeholder */ }
});

const periodChart = createChartLogic('/admin/stats/monthly');
periodChart.processData = function(data) {
  const stats = data[0];
  const elucidados = parseInt(stats.crimes_elucidados, 10);
  const naoElucidados = parseInt(stats.total_crimes, 10) - elucidados;
  const total = parseInt(stats.total_crimes, 10);
  const percElucidados = total > 0 ? (elucidados / total * 100).toFixed(1) : 0;
  this.data = {
    labels: ['Elucidados', 'Não Elucidados'],
    datasets: [{ label: `Procedimentos (${total}) - Resolubilidade: ${percElucidados}%`, backgroundColor: ['#28a745', '#dc3545'], data: [elucidados, naoElucidados] }],
  };
};

const arrestChart = createChartLogic('/admin/stats/arrests-by-city');
arrestChart.processData = function(data) {
  const labels = data.map(item => item.cidade_nome);
  const values = data.map(item => item.total_prisoes);
  this.dataBar = { labels, datasets: [{ label: 'Total de Prisões', backgroundColor: '#007bff', data: values }] };
  this.dataPie = { labels, datasets: [{ backgroundColor: generateRandomColors(values.length), data: values }] };
};

const orderChart = createChartLogic('/admin/stats/judicial-orders-by-city');
orderChart.processData = function(data) {
  this.data = {
    labels: data.map(s => s.cidade_nome),
    datasets: [
      { label: 'P. Preventiva', backgroundColor: '#007bff', data: data.map(s => s.preventiva) },
      { label: 'P. Temporária', backgroundColor: '#28a745', data: data.map(s => s.temporaria) },
      { label: 'Outros Pedidos', backgroundColor: '#6c757d', data: data.map(s => s.total_pedidos - s.preventiva - s.temporaria) },
    ]
  };
};

const factionChart = createChartLogic('/admin/stats/faction-involvement');
factionChart.processData = function(data) {
  this.data = {
    labels: data.map(s => s.faccao),
    datasets: [
      { label: 'Crimes na Área', backgroundColor: '#0d6efd', data: data.map(s => s.crimes_area) },
      { label: 'Infratores da Facção', backgroundColor: '#dc3545', data: data.map(s => s.infratores) },
      { label: 'Vítimas da Facção', backgroundColor: '#198754', data: data.map(s => s.vitimas) },
    ]
  };
};

// SUGESTÃO: Padroniza o último gráfico para usar a fábrica
const arrestTypesChart = createChartLogic('/admin/stats/arrest-types');
arrestTypesChart.processData = function(data) {
  const labels = data.map(item => item.tipoPrisao);
  const values = data.map(item => item.total);
  this.dataBar = { labels, datasets: [{ label: 'Total por Tipo de Prisão', backgroundColor: '#fd7e14', data: values }] };
  this.dataPie = { labels, datasets: [{ backgroundColor: generateRandomColors(values.length), data: values }] };
};

const allCharts = [periodChart, arrestChart, orderChart, factionChart, arrestTypesChart];
allCharts.forEach(chart => {
  watch(() => chart.filters.seccionalId, () => { chart.filters.cidadeId = null; });
  watch(chart.filters, () => chart.generate(), { deep: true, immediate: false });
});

const filteredCidadesPeriod = computed(() => !periodChart.filters.seccionalId ? cidades.value : cidades.value.filter(c => c.seccionalId === periodChart.filters.seccionalId));
const filteredCidadesArrest = computed(() => !arrestChart.filters.seccionalId ? cidades.value : cidades.value.filter(c => c.seccionalId === arrestChart.filters.seccionalId));
const filteredCidadesOrder = computed(() => !orderChart.filters.seccionalId ? cidades.value : cidades.value.filter(c => c.seccionalId === orderChart.filters.seccionalId));
const filteredCidadesFaction = computed(() => !factionChart.filters.seccionalId ? cidades.value : cidades.value.filter(c => c.seccionalId === factionChart.filters.seccionalId));
const filteredCidadesArrestTypes = computed(() => !arrestTypesChart.filters.seccionalId ? cidades.value : cidades.value.filter(c => c.seccionalId === arrestTypesChart.filters.seccionalId));

// =================================================================
// OPÇÕES GERAIS DOS GRÁFICOS (VERSÃO FINAL E EXPLÍCITA)
// =================================================================
const pieChartOptions = {
  responsive: true,
  animation: false,
  maintainAspectRatio: false,
  aspectRatio: 1,
  layout: {
    padding: {
      top: 30 // Adiciona o espaçamento no topo
    }
  },
  plugins: {
    legend: {
      position: 'top',
      labels: { font: { size: 16 } }
    },
    datalabels: {
      formatter: (value, ctx) => {
        let sum = ctx.chart.data.datasets[0].data.reduce((a, b) => a + b, 0);
        return sum === 0 ? '0.0%' : (value * 100 / sum).toFixed(1) + '%';
      },
      color: '#fff',
      font: { weight: 'bold', size: 14 }
    }
  }
};

const barChartOptions = {
  responsive: true,
  animation: false,
  maintainAspectRatio: false,
  layout: {
    padding: {
      top: 30 // Adiciona o espaçamento no topo
    }
  },
  plugins: {
    legend: {
      position: 'top',
      labels: { font: { size: 16 } }
    },
    datalabels: {
      anchor: 'end',
      align: 'top',
      formatter: (value) => value > 0 ? value : '',
      color: '#6c757d',
      font: { weight: 'bold', size: 16 }
    }
  },
  scales: {
    y: { beginAtZero: true, ticks: { stepSize: 1, font: { size: 16 } } },
    x: { ticks: { font: { size: 16 } } }
  }
};

const complexBarChartOptions = {
  ...barChartOptions, // A herança aqui é segura pois não sobrescrevemos 'layout'
  scales: {
    ...barChartOptions.scales,
    x: { ...barChartOptions.scales.x, stacked: false },
    y: { ...barChartOptions.scales.y, stacked: false }
  }
};
const isAnyChartGenerated = computed(() => !!(periodChart.data || arrestChart.dataBar || orderChart.data || factionChart.data || arrestTypesChart.data));

// =================================================================
// LÓGICA DE EXPORTAÇÃO PARA PDF (COM TODAS AS FONTES AUMENTADAS)
// =================================================================
const exportToPDF = async () => {
  const pdf = new jsPDF({ orientation: 'p', unit: 'mm', format: 'a4' });

  const chartList = [
    { component: periodChartBarRef.value, title: 'Procedimentos por Período (Barras)', filters: periodChart.filters, type: 'bar' },
    { component: periodChartPieRef.value, title: 'Procedimentos por Período (Pizza)', filters: periodChart.filters, type: 'pie' },
    { component: arrestChartBarRef.value, title: 'Quantidade de Prisões por Cidade', filters: arrestChart.filters, type: 'bar' },
    { component: arrestChartPieRef.value, title: 'Distribuição Percentual de Prisões', filters: arrestChart.filters, type: 'pie' },
    { component: orderChartBarRef.value, title: 'Análise de Pedidos Cautelares', filters: orderChart.filters, type: 'bar' },
    { component: factionChartBarRef.value, title: 'Envolvimento de Facções em CVLIs', filters: factionChart.filters, type: 'bar' },
    { component: arrestTypesChartBarRef.value, title: 'Natureza das Prisões (Barras)', filters: arrestTypesChart.filters, type: 'bar' },
    { component: arrestTypesChartPieRef.value, title: 'Natureza das Prisões (Pizza)', filters: arrestTypesChart.filters, type: 'pie' },
  ];
  
  const generatedCharts = chartList.filter(c => c.component && c.component.chart);

  if (generatedCharts.length === 0) {
    notificationStore.showNotification({ message: 'Nenhum gráfico foi gerado para exportar.', type: 'info' });
    return;
  }

  pdf.setFontSize(22).text('Relatório de Análise - CVLI', 105, 140, { align: 'center' });
  pdf.setFontSize(12).text(`Gerado em: ${new Date().toLocaleDateString('pt-BR')}`, 105, 155, { align: 'center' });

  const findNameById = (list, id) => list.find(i => i.id === id)?.nome || 'Todas';

  for (const chartInfo of generatedCharts) {
    pdf.addPage();
    // ... (código do título e subtítulo permanece o mesmo) ...
    pdf.setFontSize(16).text(chartInfo.title, 105, 20, { align: 'center' });
    const { seccionalId, cidadeId, year, month } = chartInfo.filters;
    const seccionalNome = findNameById(seccionais.value, seccionalId);
    let subtitle = `Filtros: Seccional ${seccionalNome} | Cidade: ${cidadeId ? findNameById(cidades.value, cidadeId) : 'Todas'} | Período: ${month ? `${month}/` : ''}${year || 'Todos'}`;
    pdf.setFontSize(10).setTextColor(100).text(subtitle, 105, 28, { align: 'center' }).setTextColor(0);

    const chart = chartInfo.component.chart;
    const options = chart.options;
    const isPie = chartInfo.type === 'pie';

    // --- MANIPULAÇÃO TEMPORÁRIA DAS OPÇÕES ---
    const originalFontSizes = { /* ... (salva fontes) ... */ };
    const originalMaintainAspectRatio = isPie ? options.maintainAspectRatio : null;

    options.plugins.legend.labels.font.size = 24;
    if (options.plugins.datalabels?.font) options.plugins.datalabels.font.size = 22;
    if (options.scales?.x?.ticks?.font) options.scales.x.ticks.font.size = 18;
    if (options.scales?.y?.ticks?.font) options.scales.y.ticks.font.size = 18;

    // Se for um gráfico de pizza, FORÇA a proporção correta para o PDF
    if (isPie) {
      options.maintainAspectRatio = true;
      options.aspectRatio = 1;
    }
    
    chart.update('none');
    // --- FIM DA MANIPULAÇÃO ---

    const renderWidth = isPie ? 1000 : 1200;
    const renderHeight = isPie ? 1000 : 800;
    const aspectRatio = renderHeight / renderWidth;

    const container = chart.canvas.parentNode;
    const { width: originalWidth, height: originalHeight } = container.style;
    container.style.width = `${renderWidth}px`;
    container.style.height = `${renderHeight}px`;
    chart.resize();
    await new Promise(resolve => setTimeout(resolve, 300));
    const imgData = chart.toBase64Image();

    // --- RESTAURAÇÃO DAS OPÇÕES ---
    options.plugins.legend.labels.font.size = originalFontSizes.legend;
    if (options.plugins.datalabels?.font) options.plugins.datalabels.font.size = originalFontSizes.datalabels;
    if (options.scales?.x?.ticks?.font) options.scales.x.ticks.font.size = originalFontSizes.xTicks;
    if (options.scales?.y?.ticks?.font) options.scales.y.ticks.font.size = originalFontSizes.yTicks;

    // Restaura a opção de proporção original do gráfico de pizza
    if (isPie) {
      options.maintainAspectRatio = originalMaintainAspectRatio;
    }
    
    chart.update('none');
    // --- FIM DA RESTAURAÇÃO ---
    
    container.style.width = originalWidth;
    container.style.height = originalHeight;
    chart.resize();
    
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const imgWidth = pdfWidth - 40;
    const imgHeight = imgWidth * aspectRatio;
    pdf.addImage(imgData, 'PNG', 20, 40, imgWidth, imgHeight);
  }
  pdf.save(`relatorio-cvli-${new Date().toLocaleDateString('pt-BR')}.pdf`);
};



// --- HOOK ONMOUNTED ---
onMounted(async () => {
  try {
    const response = await apiClient.get('/form-options');
    seccionais.value = response.data.seccionais;
    cidades.value = response.data.cidades;
    
    await Promise.all(allCharts.map(chart => chart.generate()));

    // --- INÍCIO DO CÓDIGO DE DEPURAÇÃO ---
    // Adicione um pequeno atraso para garantir que o Vue renderizou o gráfico na tela
    setTimeout(() => {
      // Vamos inspecionar as opções do primeiro gráfico de barras para ver o que está acontecendo
      if (periodChartBarRef.value) {
        console.log(">>>> OPÇÕES DO GRÁFICO SENDO USADAS:", periodChartBarRef.value.chart.options);
      } else {
        console.log(">>>> Referência do gráfico 'periodChartBarRef' não encontrada.");
      }
    }, 1000); // 1 segundo de atraso
    // --- FIM DO CÓDIGO DE DEPURAÇÃO ---

  } catch (err) {
    notificationStore.showNotification({ message: 'Não foi possível carregar os dados iniciais do dashboard.' });
  }
});
</script>


<style scoped>
.header-bar {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
}
.header-bar .page-header {
  margin-bottom: 0;
}
fieldset {
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 1.5rem;
  margin-bottom: 2rem;
  background-color: var(--surface-color);
}
legend {
  font-size: 1.2rem;
  font-weight: 600;
  padding: 0 0.5rem;
}
.charts-wrapper {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 2rem;
  margin-top: 1.5rem;
}
.chart-container {
  position: relative;
  height: 550px;
  width: 100%;
  display: flex;
  flex-direction: column;
}
.chart-container.single {
  max-width: 800px;
  margin-left: auto;
  margin-right: auto;
}
/* NOVO ESTILO PARA O TÍTULO */
.chart-container h3 {
  text-align: center;
  margin-bottom: 0.75rem;
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-color-muted);
  flex-shrink: 0; /* Impede que o título encolha */
}
</style>