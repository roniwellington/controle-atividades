/* =================== Utilidades =================== */
const KEY = "atividades"; // mesma chave da sua app principal
const lerAtividades = () => {
  try { return JSON.parse(localStorage.getItem(KEY)) || []; }
  catch { return []; }
};
const parseDate = (s) => s ? new Date(s+"T00:00:00") : null;
const parseTime = (t) => {
  if(!t) return null;
  const [h,m] = t.split(":").map(Number);
  return {h, m};
};
const diffMinutesSameDay = (d, t1, t2) => {
  if(!d || !t1 || !t2) return null;
  const base = new Date(d+"T00:00:00");
  const a = new Date(base); a.setHours(t1.h, t1.m, 0, 0);
  const b = new Date(base); b.setHours(t2.h, t2.m, 0, 0);
  return Math.max(0, (b - a) / 60000);
};
const fmt = (n) => new Intl.NumberFormat('pt-BR').format(n);
const pct = (p) => (p*100).toFixed(0) + "%";

/* =============== Filtros (data & status) =============== */
const $inicio = document.getElementById("inicio");
const $fim = document.getElementById("fim");
const $fStatus = document.getElementById("fStatus");
const $aplicar = document.getElementById("aplicar");
const $limpar = document.getElementById("limpar");

/* =============== KPIs =================== */
const $kTotal = document.getElementById("kTotal");
const $kDone = document.getElementById("kDone");
const $kDoing = document.getElementById("kDoing");
const $kSkipped = document.getElementById("kSkipped");
const $kNot = document.getElementById("kNot");
const $kRate = document.getElementById("kRate");

/* =============== Narrativa =================== */
const $narr = document.getElementById("narrativa");
const $extra = document.getElementById("extras");

/* =============== Charts =================== */
let chartStatus, chartCategoria, chartLinha;

/* =============== Pipeline =================== */
function filtrar(dados){
  const di = parseDate($inicio.value);
  const df = parseDate($fim.value);
  const st = $fStatus.value;

  return dados.filter(a=>{
    // Consideramos a data de início para o filtro de período
    const d = parseDate(a.dataInicio);
    const dentroInicio = di ? (d && d >= di) : true;
    const dentroFim = df ? (d && d <= df) : true;
    const okData = dentroInicio && dentroFim;
    const okStatus = st ? a.status === st : true;
    return okData && okStatus;
  });
}

function agregados(dados){
  const total = dados.length;
  const byStatus = {"Concluída":0,"Em andamento":0,"Pulada":0,"Não Iniciada":0};
  const byCategoria = {};
  const concluidasPorDia = {}; // chave: dataFim

  let somaMinutos = 0, contDur = 0;

  dados.forEach(a=>{
    byStatus[a.status] = (byStatus[a.status]||0)+1;
    byCategoria[a.categoria] = (byCategoria[a.categoria]||0)+1;

    if(a.status === "Concluída" && a.dataFim){
      concluidasPorDia[a.dataFim] = (concluidasPorDia[a.dataFim]||0)+1;
      const min = diffMinutesSameDay(a.dataInicio, parseTime(a.horaInicio), parseTime(a.horaFim));
      if(min !== null){ somaMinutos += min; contDur++; }
    }
  });

  const taxa = total ? (byStatus["Concluída"] / total) : 0;
  const mediaMin = contDur ? (somaMinutos / contDur) : 0;

  // Ordena a série temporal
  const labelsLinha = Object.keys(concluidasPorDia).sort();
  const dadosLinha = labelsLinha.map(k=>concluidasPorDia[k]);

  // Top categoria
  let topCat = null, topVal = 0;
  for(const [k,v] of Object.entries(byCategoria)){
    if(v>topVal){ topVal=v; topCat=k; }
  }

  return {
    total, byStatus, byCategoria, taxa, mediaMin, labelsLinha, dadosLinha, topCat, topVal
  };
}

function atualizaKPIs(agg){
  $kTotal.textContent = fmt(agg.total);
  $kDone.textContent = fmt(agg.byStatus["Concluída"]||0);
  $kDoing.textContent = fmt(agg.byStatus["Em andamento"]||0);
  $kSkipped.textContent = fmt(agg.byStatus["Pulada"]||0);
  $kNot.textContent = fmt(agg.byStatus["Não Iniciada"]||0);
  $kRate.textContent = pct(agg.taxa||0);
}

function narrativa(agg){
  const {total, byStatus, taxa, mediaMin, topCat, topVal} = agg;
  if(!total){
    $narr.textContent = "Nenhuma atividade encontrada para o período/critério selecionado.";
    $extra.textContent = "";
    return;
  }
  const concl = byStatus["Concluída"]||0;
  const andamento = byStatus["Em andamento"]||0;
  const puladas = byStatus["Pulada"]||0;
  const nao = byStatus["Não Iniciada"]||0;

  const partes = [];
  partes.push(`Você registrou ${fmt(total)} atividade(s) no recorte atual.`);
  if(concl) partes.push(`Concluiu ${fmt(concl)} (${pct(taxa)}).`);
  if(andamento) partes.push(`Tem ${fmt(andamento)} em andamento — boa!`);
  if(puladas) partes.push(`Pulou ${fmt(puladas)} — observe padrões para ajustar sua rotina.`);
  if(nao) partes.push(`${fmt(nao)} ainda não iniciadas — priorize as mais importantes.`);

  $narr.innerHTML = `
    <span class="badge">✅ Concluídas: ${fmt(concl)}</span>
    <span class="badge">⏳ Em andamento: ${fmt(andamento)}</span>
    <span class="badge">⛔ Puladas: ${fmt(puladas)}</span>
    <span class="badge">🗂️ Não iniciadas: ${fmt(nao)}</span>
  `;

  const mins = Math.round(mediaMin);
  const durTxt = mins ? `Tempo médio por atividade concluída: ~${mins} min.` : `Sem dados suficientes de duração (preencha Hora início e Hora fim).`;
  const topTxt = topCat ? `Categoria mais ativa: ${topCat} (${fmt(topVal)}).` : "";

  $extra.textContent = `${partes.join(" ")} ${topTxt} ${durTxt}`;
}

/* --------------- Charts helpers --------------- */
function criaOuAtualizaChart(inst, ctx, tipo, dados, opcoes){
  if(inst){ inst.data = dados; inst.options = opcoes; inst.update(); return inst; }
  return new Chart(ctx, {type:tipo, data:dados, options:opcoes});
}

function desenharCharts(agg){
  const labelsStatus = ["Concluída","Em andamento","Pulada","Não Iniciada"];
  const dataStatus = labelsStatus.map(k=>agg.byStatus[k]||0);

  chartStatus = criaOuAtualizaChart(
    chartStatus,
    document.getElementById("chartStatus"),
    "doughnut",
    {
      labels: labelsStatus,
      datasets:[{ data: dataStatus }]
    },
    {
      responsive:true,
      plugins:{ legend:{ position:"bottom" }, tooltip:{enabled:true} },
      cutout:"55%"
    }
  );

  const labelsCat = Object.keys(agg.byCategoria);
  const dataCat = Object.values(agg.byCategoria);

  chartCategoria = criaOuAtualizaChart(
    chartCategoria,
    document.getElementById("chartCategoria"),
    "bar",
    {
      labels: labelsCat,
      datasets:[{ label:"Atividades", data: dataCat }]
    },
    {
      responsive:true,
      plugins:{ legend:{ display:false } },
      scales:{
        x:{ grid:{ display:false } },
        y:{ beginAtZero:true, ticks:{ precision:0 } }
      }
    }
  );

  chartLinha = criaOuAtualizaChart(
    chartLinha,
    document.getElementById("chartLinha"),
    "line",
    {
      labels: agg.labelsLinha,
      datasets:[{ label:"Concluídas por dia", data: agg.dadosLinha, tension:.3, fill:false }]
    },
    {
      responsive:true,
      plugins:{ legend:{ display:true, position:"top" } },
      scales:{
        x:{ grid:{ display:false } },
        y:{ beginAtZero:true, ticks:{ precision:0 } }
      }
    }
  );
}

/* --------------- Load + Apply --------------- */
function aplicar(){
  const base = lerAtividades();
  const dados = filtrar(base);
  const agg = agregados(dados);
  atualizaKPIs(agg);
  narrativa(agg);
  desenharCharts(agg);
}

$aplicar.addEventListener("click", aplicar);
$limpar.addEventListener("click", ()=>{
  $inicio.value = ""; $fim.value=""; $fStatus.value="";
  aplicar();
});

/* Sugere período padrão (últimos 30 dias) */
(function sugereDatas(){
  const hoje = new Date();
  const ini = new Date(hoje); ini.setDate(ini.getDate()-30);
  $inicio.valueAsDate = ini;
  $fim.valueAsDate = hoje;
})();

aplicar();

/* Atualização automática ao focar a aba (caso dados mudem na página principal) */
window.addEventListener("focus", aplicar);