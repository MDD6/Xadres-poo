const state = {
  candidates: [],
  filters: {
    search: '',
    area: '',
    seniority: '',
    availability: '',
    skills: [],
    minScore: 0,
  },
  charts: {},
};

const elements = {
  candidateForm: document.getElementById('candidateForm'),
  filterForm: document.getElementById('filterForm'),
  candidateTable: document.getElementById('candidateTable'),
  candidateStatus: document.getElementById('candidateStatus'),
  totalCandidates: document.getElementById('totalCandidates'),
  availableNow: document.getElementById('availableNow'),
  uniqueSkills: document.getElementById('uniqueSkills'),
  generateReport: document.getElementById('generateReport'),
  exportCsv: document.getElementById('exportCsv'),
  scoreOutput: document.querySelector('output[data-for="score"]'),
  toggleTheme: document.getElementById('toggleTheme'),
  integrationForm: document.getElementById('integrationForm'),
  sendToSheet: document.getElementById('sendToSheet'),
  integrationStatus: document.getElementById('integrationStatus'),
};

const pdfKeywords = [
  'javascript',
  'typescript',
  'react',
  'vue',
  'angular',
  'node',
  'python',
  'sql',
  'java',
  'aws',
  'azure',
  'scrum',
  'kanban',
  'figma',
  'ux',
  'ui',
  'tensorflow',
  'docker',
  'kubernetes',
  'salesforce',
  'excel',
  'power bi',
  'tableau',
  'data studio',
];

const candidateStorageKey = 'talent-pool-candidates-v1';
const settingsStorageKey = 'talent-pool-settings-v1';

init();

function init() {
  restoreTheme();
  restoreState();
  bindEvents();
  initCharts();
  render();
}

function bindEvents() {
  elements.candidateForm.addEventListener('submit', handleCandidateSubmit);
  elements.filterForm.addEventListener('input', handleFiltersChange);
  elements.exportCsv.addEventListener('click', exportCsv);
  elements.generateReport.addEventListener('click', downloadWeeklyReport);
  elements.toggleTheme.addEventListener('click', toggleTheme);
  elements.sendToSheet.addEventListener('click', sendDataToSheet);

  const scoreRange = elements.filterForm.querySelector('input[name="score"]');
  scoreRange.addEventListener('input', () => {
    state.filters.minScore = Number(scoreRange.value);
    elements.scoreOutput.textContent = scoreRange.value;
    renderCandidates();
  });
}

async function handleCandidateSubmit(event) {
  event.preventDefault();
  const formData = new FormData(event.currentTarget);
  const candidate = {
    id: crypto.randomUUID(),
    name: formData.get('name').trim(),
    email: formData.get('email').trim(),
    phone: formData.get('phone').trim(),
    area: formData.get('area'),
    experience: Number(formData.get('experience')),
    availability: formData.get('availability'),
    skills: splitItems(formData.get('skills')),
    history: formData.get('history').trim(),
    createdAt: new Date().toISOString(),
    extractedSkills: [],
    extractedSummary: '',
  };

  const file = formData.get('resume');
  if (file && file.size) {
    try {
      const { text, keywords } = await extractPdfInsights(file);
      candidate.extractedSummary = text.slice(0, 1800);
      candidate.extractedSkills = keywords;
      candidate.skills = deduplicate([...candidate.skills, ...keywords]);
    } catch (error) {
      console.error('Erro ao ler PDF', error);
    }
  }

  candidate.seniority = inferSeniority(candidate.experience, candidate.history, candidate.skills);
  candidate.score = calculateCandidateScore(candidate);
  candidate.classificationLabel = classifyCandidate(candidate.score);

  state.candidates.push(candidate);
  persistState();
  event.currentTarget.reset();
  render();
}

function handleFiltersChange(event) {
  const formData = new FormData(event.currentTarget.closest('form'));
  state.filters.search = (formData.get('search') || '').toLowerCase().trim();
  state.filters.area = formData.get('area') || '';
  state.filters.seniority = formData.get('seniority') || '';
  state.filters.availability = formData.get('availability') || '';
  state.filters.skills = splitItems(formData.get('skills'));
  renderCandidates();
}

function splitItems(value) {
  return (value || '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

async function extractPdfInsights(file) {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  let textContent = '';

  for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
    const page = await pdf.getPage(pageNumber);
    const content = await page.getTextContent();
    textContent +=
      ' ' +
      content.items
        .map((item) => item.str)
        .join(' ');
  }

  const normalizedText = textContent.toLowerCase();
  const foundKeywords = deduplicate(
    pdfKeywords.filter((keyword) => normalizedText.includes(keyword))
  );

  return {
    text: textContent.trim(),
    keywords: foundKeywords,
  };
}

function deduplicate(list) {
  return [...new Set(list)];
}

function inferSeniority(experience, history, skills) {
  if (experience >= 7 || hasKeywords(history, skills, ['lider', 'coordenação', 'gestão'])) {
    return 'Sênior';
  }
  if (experience >= 3) {
    return 'Pleno';
  }
  return 'Júnior';
}

function hasKeywords(history, skills, keywords) {
  const text = `${history} ${skills.join(' ')}`.toLowerCase();
  return keywords.some((word) => text.includes(word));
}

function calculateCandidateScore(candidate) {
  const { experience, skills, extractedSkills, availability, seniority } = candidate;
  let score = 0;

  score += Math.min(experience * 10, 40);

  const highValueSkills = ['python', 'react', 'node', 'aws', 'data', 'ux', 'sql'];
  const matches = skills.filter((skill) =>
    highValueSkills.some((target) => skill.toLowerCase().includes(target))
  );
  score += Math.min(matches.length * 8, 32);

  score += Math.min(extractedSkills.length * 4, 12);

  if (availability === 'Imediata') {
    score += 10;
  } else if (availability === 'Freelancer') {
    score += 6;
  }

  if (seniority === 'Sênior') {
    score += 6;
  } else if (seniority === 'Pleno') {
    score += 3;
  }

  return Math.min(100, Math.round(score));
}

function classifyCandidate(score) {
  if (score >= 75) return 'Alta prioridade';
  if (score >= 55) return 'Recomendar';
  if (score >= 40) return 'Potencial';
  return 'Monitorar';
}

function render() {
  renderCandidates();
  updateMetrics();
  updateCharts();
  updateStatusMessage();
}

function renderCandidates() {
  const rows = document.createDocumentFragment();
  const template = document.getElementById('candidateRowTemplate');

  const filteredCandidates = state.candidates.filter(applyFilters);

  filteredCandidates
    .sort((a, b) => b.score - a.score)
    .forEach((candidate) => {
      const clone = template.content.cloneNode(true);
      clone.querySelector('[data-field="name"]').textContent = candidate.name;
      clone.querySelector('[data-field="area"]').textContent = candidate.area;
      clone.querySelector('[data-field="seniority"]').textContent = candidate.seniority;
      clone.querySelector('[data-field="skills"]').textContent = candidate.skills.join(', ');
      clone.querySelector('[data-field="availability"]').textContent = candidate.availability;
      clone.querySelector('[data-field="score"]').textContent = `${candidate.score} (${candidate.classificationLabel})`;
      rows.appendChild(clone);
    });

  elements.candidateTable.replaceChildren(rows);

  elements.candidateStatus.textContent = filteredCandidates.length
    ? `${filteredCandidates.length} candidatos encontrados (de ${state.candidates.length}).`
    : state.candidates.length
    ? 'Nenhum candidato atende aos filtros atuais.'
    : 'Nenhum candidato cadastrado até o momento.';
}

function applyFilters(candidate) {
  const { search, area, seniority, availability, skills, minScore } = state.filters;
  if (area && candidate.area !== area) return false;
  if (seniority && candidate.seniority !== seniority) return false;
  if (availability && candidate.availability !== availability) return false;
  if (candidate.score < minScore) return false;

  if (skills.length) {
    const normalizedSkills = candidate.skills.map((skill) => skill.toLowerCase());
    const everySkill = skills.every((skill) =>
      normalizedSkills.some((candidateSkill) => candidateSkill.includes(skill.toLowerCase()))
    );
    if (!everySkill) return false;
  }

  if (search) {
    const content = `${candidate.name} ${candidate.area} ${candidate.seniority} ${candidate.skills.join(' ')} ${
      candidate.history
    } ${candidate.extractedSummary}`
      .toLowerCase();
    if (!content.includes(search)) return false;
  }

  return true;
}

function updateMetrics() {
  elements.totalCandidates.textContent = state.candidates.length;
  const available = state.candidates.filter((candidate) =>
    ['Imediata', 'Freelancer'].includes(candidate.availability)
  );
  elements.availableNow.textContent = available.length;

  const skills = new Set();
  state.candidates.forEach((candidate) => candidate.skills.forEach((skill) => skills.add(skill.toLowerCase())));
  elements.uniqueSkills.textContent = skills.size;
}

function initCharts() {
  const baseConfig = (overrides = {}) => {
    const { options: overrideOptions = {}, ...rest } = overrides;
    return {
      type: 'doughnut',
      data: {
        labels: [],
        datasets: [
          {
            data: [],
            backgroundColor: [
              '#3b82f6',
              '#1d4ed8',
              '#22d3ee',
              '#f97316',
              '#facc15',
              '#6366f1',
              '#14b8a6',
              '#fb7185',
            ],
          },
        ],
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              color: getComputedStyle(document.documentElement).getPropertyValue('--text-color'),
            },
          },
          tooltip: {
            callbacks: {
              label: (context) => `${context.label}: ${context.parsed}`,
            },
          },
        },
        ...overrideOptions,
      },
      ...rest,
    };
  };

  state.charts.area = new Chart(document.getElementById('areaChart'), baseConfig());
  state.charts.seniority = new Chart(
    document.getElementById('seniorityChart'),
    baseConfig({ options: { cutout: '45%' } })
  );
  state.charts.skills = new Chart(document.getElementById('skillsChart'), baseConfig());
}

function updateCharts() {
  const legendColor = getComputedStyle(document.documentElement).getPropertyValue('--text-color');
  Object.values(state.charts).forEach((chart) => {
    if (!chart) return;
    chart.options.plugins.legend.labels.color = legendColor;
  });

  updateChart(state.charts.area, countBy(state.candidates, 'area'));
  updateChart(state.charts.seniority, countBy(state.candidates, 'seniority'));
  const skillFrequency = countSkills(state.candidates).slice(0, 8);
  updateChart(
    state.charts.skills,
    Object.fromEntries(skillFrequency.map(({ skill, count }) => [skill, count]))
  );
}

function updateChart(chart, dataMap) {
  if (!chart) return;
  const labels = Object.keys(dataMap);
  chart.data.labels = labels;
  chart.data.datasets[0].data = Object.values(dataMap);
  chart.update();
}

function countBy(list, key) {
  return list.reduce((acc, item) => {
    const group = item[key] || 'Não informado';
    acc[group] = (acc[group] || 0) + 1;
    return acc;
  }, {});
}

function countSkills(candidates) {
  const counter = new Map();
  candidates.forEach((candidate) => {
    candidate.skills.forEach((skill) => {
      const normalized = skill.trim();
      if (!normalized) return;
      counter.set(normalized, (counter.get(normalized) || 0) + 1);
    });
  });
  return Array.from(counter, ([skill, count]) => ({ skill, count })).sort((a, b) => b.count - a.count);
}

function updateStatusMessage() {
  if (!state.candidates.length) {
    elements.candidateStatus.textContent = 'Nenhum candidato cadastrado até o momento.';
    return;
  }
  const filtered = state.candidates.filter(applyFilters);
  elements.candidateStatus.textContent = filtered.length
    ? `${filtered.length} candidatos encontrados (de ${state.candidates.length}).`
    : 'Nenhum candidato atende aos filtros atuais.';
}

function exportCsv() {
  if (!state.candidates.length) return;
  const headers = [
    'Nome',
    'E-mail',
    'Telefone',
    'Área',
    'Experiência (anos)',
    'Disponibilidade',
    'Senioridade',
    'Competências',
    'Classificação',
    'Pontuação',
  ];

  const rows = state.candidates.map((candidate) => [
    candidate.name,
    candidate.email,
    candidate.phone,
    candidate.area,
    candidate.experience,
    candidate.availability,
    candidate.seniority,
    candidate.skills.join(' | '),
    candidate.classificationLabel,
    candidate.score,
  ]);

  const csvContent = [headers, ...rows]
    .map((columns) =>
      columns
        .map((value) => `"${String(value ?? '').replace(/"/g, '""')}"`)
        .join(';')
    )
    .join('\n');

  downloadFile(new Blob([csvContent], { type: 'text/csv;charset=utf-8;' }), 'banco-talentos.csv');
}

function downloadWeeklyReport() {
  const summary = createWeeklySummary();
  downloadFile(new Blob([summary], { type: 'text/plain;charset=utf-8;' }), 'relatorio-semanal.txt');
}

function createWeeklySummary() {
  const total = state.candidates.length;
  const byArea = countBy(state.candidates, 'area');
  const bySeniority = countBy(state.candidates, 'seniority');
  const topSkills = countSkills(state.candidates).slice(0, 10);

  return `Relatório semanal - Banco de Talentos\n\nTotal de candidatos: ${total}\n\nDistribuição por área:\n${formatMap(byArea)}\n\nDistribuição por senioridade:\n${formatMap(bySeniority)}\n\nCompetências mais comuns:\n${topSkills
    .map((item) => `- ${item.skill}: ${item.count}`)
    .join('\n')}\n\nGerado em ${new Date().toLocaleString('pt-BR')}.`;
}

function formatMap(map) {
  return Object.entries(map)
    .map(([key, value]) => `- ${key}: ${value}`)
    .join('\n');
}

function downloadFile(blob, filename) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

function toggleTheme() {
  document.documentElement.classList.toggle('dark');
  persistTheme();
  render();
}

function restoreTheme() {
  const stored = localStorage.getItem(settingsStorageKey);
  if (!stored) return;
  const { theme } = JSON.parse(stored);
  if (theme === 'dark') {
    document.documentElement.classList.add('dark');
  }
}

function persistTheme() {
  const current = localStorage.getItem(settingsStorageKey);
  const settings = current ? JSON.parse(current) : {};
  settings.theme = document.documentElement.classList.contains('dark') ? 'dark' : 'light';
  localStorage.setItem(settingsStorageKey, JSON.stringify(settings));
}

function persistState() {
  localStorage.setItem(candidateStorageKey, JSON.stringify(state.candidates));
}

function restoreState() {
  try {
    const storedCandidates = localStorage.getItem(candidateStorageKey);
    if (storedCandidates) {
      state.candidates = JSON.parse(storedCandidates);
    }
    elements.filterForm.reset();
  } catch (error) {
    console.error('Erro ao restaurar dados do navegador', error);
  }
}

function createPayload() {
  const summary = {
    totalCandidates: state.candidates.length,
    generatedAt: new Date().toISOString(),
    candidates: state.candidates,
    charts: {
      area: countBy(state.candidates, 'area'),
      seniority: countBy(state.candidates, 'seniority'),
      skills: countSkills(state.candidates).slice(0, 10),
    },
  };

  const formData = new FormData(elements.integrationForm);
  return {
    payload: summary,
    sheetUrl: formData.get('sheetUrl'),
    reportEmail: formData.get('reportEmail'),
  };
}

async function sendDataToSheet() {
  const { sheetUrl, payload, reportEmail } = createPayload();
  if (!sheetUrl) {
    elements.integrationStatus.textContent = 'Informe a URL do webhook ou planilha.';
    return;
  }

  elements.integrationStatus.textContent = 'Enviando dados...';
  try {
    const response = await fetch(sheetUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...payload, reportEmail }),
    });

    if (!response.ok) {
      throw new Error('Resposta inválida do servidor');
    }

    elements.integrationStatus.textContent = 'Relatório enviado com sucesso!';
  } catch (error) {
    console.error('Erro ao enviar dados', error);
    elements.integrationStatus.textContent = 'Falha ao enviar dados. Verifique a URL.';
  }
}

window.addEventListener('storage', () => {
  restoreState();
  render();
});
