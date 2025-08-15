const categorias = {
    "Atividade Física": ["Caminhada", "Ciclismo", "Academia", "Outros"],
    "Leitura": ["Ficção-Científica", "Fantasia", "Divulgação Científica", "Ciências", "Faculdade"],
    "Trabalho": ["Reunião", "Projeto", "Relatório", "Outros"],
    "Estudo": ["Curso Online", "Faculdade", "Certificação", "Outros"],
    "Hobby": ["Música", "Artesanato", "Fotografia", "Outros"],
    "Outros": ["Outros"]
};

const form = document.getElementById("atividadeForm");
const categoria = document.getElementById("categoria");
const subcategoria = document.getElementById("subcategoria");
const status = document.getElementById("status");
const dataInicio = document.getElementById("dataInicio");
const horaInicio = document.getElementById("horaInicio");
const horaFim = document.getElementById("horaFim");
const dataFim = document.getElementById("dataFim");
const listaAtividades = document.getElementById("listaAtividades");
const filtroStatus = document.getElementById("filtroStatus");

let atividades = JSON.parse(localStorage.getItem("atividades")) || [];

dataInicio.valueAsDate = new Date();

categoria.addEventListener("change", () => {
    subcategoria.innerHTML = "<option value=''>Selecione a Subcategoria</option>";
    categorias[categoria.value]?.forEach(sc => {
        let opt = document.createElement("option");
        opt.value = sc;
        opt.textContent = sc;
        subcategoria.appendChild(opt);
    });
});

status.addEventListener("change", () => {
    const agora = new Date();
    if (status.value === "Em andamento") {
        horaInicio.value = agora.toTimeString().slice(0,5);
    }
    if (status.value === "Concluída") {
        horaFim.value = agora.toTimeString().slice(0,5);
        dataFim.valueAsDate = agora;
    }
    if (status.value === "Pulada") {
        dataFim.valueAsDate = agora;
    }
});

form.addEventListener("submit", e => {
    e.preventDefault();
    const atividade = {
        categoria: categoria.value,
        subcategoria: subcategoria.value,
        atividade: document.getElementById("atividade").value,
        descricao: document.getElementById("descricao").value,
        status: status.value,
        dataInicio: dataInicio.value,
        horaInicio: horaInicio.value,
        horaFim: horaFim.value,
        dataFim: dataFim.value
    };
    atividades.push(atividade);
    localStorage.setItem("atividades", JSON.stringify(atividades));
    renderizar();
    form.reset();
    dataInicio.valueAsDate = new Date();
});

function renderizar() {
    listaAtividades.innerHTML = "";
    atividades
        .filter(a => !filtroStatus.value || a.status === filtroStatus.value)
        .forEach((a, i) => {
        let tr = document.createElement("tr");
        tr.innerHTML = `
            <td>${a.categoria}</td>
            <td>${a.subcategoria}</td>
            <td>${a.atividade}</td>
            <td>${a.descricao}</td>
            <td>${a.status}</td>
            <td>${a.dataInicio}</td>
            <td>${a.horaInicio}</td>
            <td>${a.horaFim}</td>
            <td>${a.dataFim}</td>
            <td class="center">
                <button onclick="editar(${i})" ${a.status === "Concluída" || a.status === "Pulada" ? "disabled" : ""}>Editar</button>
                <button onclick="excluir(${i})">Excluir</button>
            </td>
        `;
        if (a.status === "Concluída") tr.classList.add("status-finalizada");
        if (a.status === "Em andamento") tr.classList.add("status-andamento");
        if (a.status === "Pulada") tr.classList.add("status-pulada");
        listaAtividades.appendChild(tr);
    });
}

window.editar = i => {
    const a = atividades[i];
    categoria.value = a.categoria;
    categoria.dispatchEvent(new Event("change"));
    subcategoria.value = a.subcategoria;
    document.getElementById("atividade").value = a.atividade;
    document.getElementById("descricao").value = a.descricao;
    status.value = a.status;
    dataInicio.value = a.dataInicio;
    horaInicio.value = a.horaInicio;
    horaFim.value = a.horaFim;
    dataFim.value = a.dataFim;
    atividades.splice(i, 1);
};

window.excluir = i => {
    atividades.splice(i, 1);
    localStorage.setItem("atividades", JSON.stringify(atividades));
    renderizar();
};

document.getElementById("exportarCSV").addEventListener("click", () => {
    let csv = "Categoria,Subcategoria,Atividade,Descrição,Status,Data Início,Hora Início,Hora Fim,Data Fim\n";
    atividades.forEach(a => {
        csv += `${a.categoria},${a.subcategoria},${a.atividade},${a.descricao},${a.status},${a.dataInicio},${a.horaInicio},${a.horaFim},${a.dataFim}\n`;
    });
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "atividades.csv";
    a.click();
});

filtroStatus.addEventListener("change", renderizar);

renderizar();