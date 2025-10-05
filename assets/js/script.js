let atividades = JSON.parse(localStorage.getItem("atividades")) || [];
const tbody = document.getElementById("listaAtividades");
const form = document.getElementById("atividadeForm");

let editIndex = null; // null = novo | número = edição

// ======= LISTAR ATIVIDADES NA TABELA =======
function renderTabela() {
  tbody.innerHTML = "";
  atividades.forEach((a, index) => {
    let tr = document.createElement("tr");


    // Definir cor do status
    let statusColor = "";
    switch (a.status.toLowerCase()) {
      //case "não iniciada":
       // statusColor = "background-color: white; color: black;";
       // break;
      case "em andamento":
        statusColor = "background-color: yellow; color: black;";
        break;
      case "concluída":
        statusColor = "background-color: lightgreen; color: black;";
        break;
      case "pulada":
        statusColor = "background-color: red; color: white;";
        break;
    }


    tr.innerHTML = `
      <td>${a.id}</td>
      <td>${a.categoria}</td>
      <td>${a.subcategoria}</td>
      <td>${a.atividade}</td>
      <td>${a.descricao}</td>
      <td style="${statusColor}">${a.status}</td>
      <td>${a.dataInicio}</td>
      <td>${a.horaInicio || "-"}</td>
      <td>${a.horaFim || "-"}</td>
      <td>${a.dataFim || "-"}</td>
      <td>
        <button onclick="editarAtividade(${index})">✏️ Editar</button>
        <button onclick="excluirAtividade(${index})">🗑️ Excluir</button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}
renderTabela();

// ======= SUBMETER FORM (NOVO OU EDITAR) =======
form.addEventListener("submit", function(e) {
  e.preventDefault();

  const nova = {
    id: editIndex === null ? Date.now() : atividades[editIndex].id, // gera id se for novo
    categoria: document.getElementById("categoria").value,
    subcategoria: document.getElementById("subcategoria").value,
    atividade: document.getElementById("atividade").value,
    descricao: document.getElementById("descricao").value,
    status: document.getElementById("status").value,
    dataInicio: document.getElementById("dataInicio").value,
    horaInicio: document.getElementById("horaInicio").value,
    horaFim: document.getElementById("horaFim").value,
    dataFim: document.getElementById("dataFim").value
  };

  if (editIndex !== null) {
    atividades[editIndex] = nova; // edição
    editIndex = null;
  } else {
    atividades.push(nova); // novo
  }

  localStorage.setItem("atividades", JSON.stringify(atividades));
  renderTabela();
  fecharFormulario();
  form.reset();
});

// ======= EDITAR ATIVIDADE =======
function editarAtividade(index) {
  const a = atividades[index];
  editIndex = index;

  // Preenche formulário
  document.getElementById("categoria").value = a.categoria;
  atualizarSubcategorias(a.categoria);
  document.getElementById("subcategoria").value = a.subcategoria;
  document.getElementById("atividade").value = a.atividade;
  document.getElementById("descricao").value = a.descricao;
  document.getElementById("status").value = a.status;
  document.getElementById("dataInicio").value = a.dataInicio;
  document.getElementById("horaInicio").value = a.horaInicio;
  document.getElementById("horaFim").value = a.horaFim;
  document.getElementById("dataFim").value = a.dataFim;

  toggleForm(); // abre formulário já preenchido
}

// ======= EXCLUIR ATIVIDADE =======
function excluirAtividade(index) {
  if (confirm("Deseja realmente excluir esta atividade?")) {
    atividades.splice(index, 1);
    localStorage.setItem("atividades", JSON.stringify(atividades));
    renderTabela();
  }
}

// ======= FORM CONTROLS =======
function toggleForm() {
  document.getElementById("formContainer").style.display = "block";
}
function fecharFormulario() {
  document.getElementById("formContainer").style.display = "none";
  form.reset();
  editIndex = null; // volta para "novo" quando fechar
}

// ======= SUBCATEGORIAS DINÂMICAS =======
const categorias = {
  "Atividade Física": ["Caminhada", "Ciclismo", "Academia", "Outros"],
  "Leitura": ["Ficção-Científica", "Fantasia", "Divulgação Científica", "Ciências", "Faculdade"],
  "Trabalho": ["Reunião", "Projeto", "Relatório", "Outros"],
  "Estudo": ["Curso Online", "Faculdade", "Certificação", "Outros"],
  "Hobby": ["Música", "Artesanato", "Fotografia", "Outros"],
  "Outros": ["Outros"]
};

const categoria = document.getElementById("categoria");
const subcategoria = document.getElementById("subcategoria");

function atualizarSubcategorias(cat) {
  subcategoria.innerHTML = "<option value=''>Selecione a Subcategoria</option>";
  categorias[cat]?.forEach(sc => {
    let opt = document.createElement("option");
    opt.value = sc;
    opt.textContent = sc;
    subcategoria.appendChild(opt);
  });
}

categoria?.addEventListener("change", () => {
  atualizarSubcategorias(categoria.value);
});


// ======= EXPORTAR CSV =======
function exportCSV() {
  if (atividades.length === 0) return alert("Nenhum dado para exportar.");
  let csv = "Categoria,Subcategoria,Atividade,Descrição,Status,Data Início,Hora Início,Hora Fim,Data Fim\n";
  atividades.forEach(a => {
    csv += `${a.categoria},${a.subcategoria},${a.atividade},${a.descricao},${a.status},${a.dataInicio},${a.horaInicio||""},${a.horaFim||""},${a.dataFim||""}\n`;
  });
  let blob = new Blob([csv], { type: "text/csv" });
  let url = URL.createObjectURL(blob);
  let a = document.createElement("a");
  a.href = url; a.download = "relatorio.csv"; a.click();
}

// ======= LIMPAR DADOS =======
function clearStorage() {
  if (confirm("Deseja realmente apagar todos os dados?")) {
    localStorage.removeItem("atividades");
    location.reload();
  }
}

// ======= EXPORTAR PDF =======
async function exportPDF() {
  if (atividades.length === 0) return alert("Nenhum dado para exportar.");
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  doc.setFontSize(16);
  doc.text("Relatório de Atividades", 14, 20);
  doc.setFontSize(10);
  doc.text("Gerado em: " + new Date().toLocaleString(), 14, 28);

  doc.autoTable({
    startY: 40,
    head: [["Categoria","Subcategoria","Atividade","Descrição","Status","Data Início","Hora Início","Hora Fim","Data Fim"]],
    body: atividades.map(a => [
      a.categoria, a.subcategoria, a.atividade, a.descricao, a.status,
      a.dataInicio, a.horaInicio || "-", a.horaFim || "-", a.dataFim || "-"
    ])
  });

  doc.save("relatorio.pdf");
}