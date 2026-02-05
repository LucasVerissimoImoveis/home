const questions = [
  {
    key: "nome",
    label: "Qual nome do comprador?",
    type: "text",
    weight: 20
  },
  {
    key: "whatsapp",
    label: "Qual seu WhatsApp?",
    description: "Digite seu número com DDD. Esse será o principal meio de contato.",
    type: "whatsapp",
    weight: 20
  },
  {
    key: "nascimento",
    label: "Qual a data de nascimento do comprador?",
    description: "Digite sua data de nascimento completa.",
    type: "date",
    weight: 15
  },
  {
    key: "carteira",
    label: "O comprador(a) tem mais de 3 anos de carteira assinada somados?",
    description:
      "Pode somar todos os períodos trabalhados com carteira assinada. Não precisa ser no mesmo emprego.",
    type: "choice",
    options: ["Sim", "Não"],
    weight: 15
  },
  {
    key: "dependentes",
    label: "O(a) comprador(a) possui algum dependente?",
    description:
      "Considere apenas parentes de até 3º grau que NÃO tenham renda formal, não sejam aposentados, concursados ou servidores públicos.",
    type: "grid",
    options: ["Marido/Esposa", "Pai", "Mãe", "Tio(a)", "Avô", "Avó", "Filho(a)", "Não tenho"],
    weight: 10
  },
  {
    key: "renda",
    label: "Qual a renda total da família?",
    description:
      "Informe a renda bruta e formal do comprador. Caso seja casado(a), inclua também a renda do cônjuge.",
    type: "number",
    weight: 10
  },
  {
    key: "financiado",
    label: "Você já comprou algum imóvel financiado?",
    type: "choice",
    options: ["Sim", "Não"],
    weight: 5
  },
  {
    key: "cpf",
    label: "Digite seu CPF",
    description: "Digite apenas números.",
    type: "cpf",
    weight: 5
  }
];

let index = 0;
const answers = {};

const questionEl = document.getElementById("question");
const progressEl = document.getElementById("progress");

/* ================= RENDER ================= */

function render() {
  const q = questions[index];
  questionEl.innerHTML = "";

  const h2 = document.createElement("h2");
  h2.innerText = q.label;
  questionEl.appendChild(h2);

  if (q.description) {
    const p = document.createElement("p");
    p.innerText = q.description;
    questionEl.appendChild(p);
  }

  /* INPUTS */
  if (["text", "number", "date", "cpf", "whatsapp"].includes(q.type)) {
    const input = document.createElement("input");
    input.type = q.type === "number" ? "number" : "text";
    input.id = q.key;

    if (answers[q.key]) {
      input.value = answers[q.key];
    }

    input.oninput = () => {
      if (q.type === "date") input.value = maskDate(input.value);
      if (q.type === "cpf") input.value = maskCPF(input.value);
      if (q.type === "whatsapp") input.value = maskWhats(input.value);
    };

    questionEl.appendChild(input);
    input.focus();
  }

  /* CHOICE */
  if (q.type === "choice") {
    q.options.forEach(opt => {
      const btn = document.createElement("button");
      btn.innerText = opt;

      if (answers[q.key] === opt) btn.classList.add("active");

      btn.onclick = () => {
        answers[q.key] = opt;
        nextQuestion();
      };

      questionEl.appendChild(btn);
    });
  }

  /* GRID */
  if (q.type === "grid") {
    const grid = document.createElement("div");
    grid.className = "grid";

    q.options.forEach(opt => {
      const btn = document.createElement("button");
      btn.innerText = opt;

      if (answers[q.key] === opt) btn.classList.add("active");

      btn.onclick = () => {
        answers[q.key] = opt;
        nextQuestion();
      };

      grid.appendChild(btn);
    });

    questionEl.appendChild(grid);
  }

  renderNavigation();
  updateProgress();
}

/* ================= NAV ================= */

function renderNavigation() {
  const nav = document.createElement("div");
  nav.className = "nav-buttons";

  const back = document.createElement("button");
  back.innerText = "Voltar";
  back.disabled = index === 0;
  back.onclick = prevQuestion;

  const next = document.createElement("button");
  next.innerText = index === questions.length - 1 ? "Finalizar" : "Próxima";
  next.onclick = nextQuestion;

  nav.appendChild(back);
  nav.appendChild(next);
  questionEl.appendChild(nav);
}

/* ================= FLOW ================= */

function nextQuestion() {
  const q = questions[index];

  if (["text", "number", "date", "cpf", "whatsapp"].includes(q.type)) {
    const input = document.getElementById(q.key);
    if (!input || !input.value.trim()) {
      alert("Ficou faltando a resposta ☺");
      return;
    }
    answers[q.key] = input.value.trim();
  }

  index++;
  index < questions.length ? render() : finish();
}

function prevQuestion() {
  if (index === 0) return;
  index--;
  render();
}

/* ================= PROGRESS ================= */

function updateProgress() {
  const total = questions.reduce((s, q) => s + q.weight, 0);
  const done = questions.slice(0, index).reduce((s, q) => s + q.weight, 0);
  progressEl.style.width = (done / total) * 100 + "%";
}

/* ================= FINISH ================= */

function finish() {
  let msg = "📋 *Novo pré-cadastro para simulação de financiamento imobiliário*\n\n";

  questions.forEach(q => {
    msg += `\`${q.label}:\`\n*${answers[q.key]}*\n\n`;
  });

  const payload = {
    nome: answers.nome || "Não informado",
    whatsapp: answers.whatsapp || "Não informado",
    nascimento: answers.nascimento || "Não informado",
    carteira_assinada: answers.carteira || "Não informado",
    dependentes: answers.dependentes || "Não informado",
    renda_familiar: answers.renda || "Não informado",
    financiamento_anterior: answers.financiado || "Não informado",
    cpf: answers.cpf || "Não informado"
  };

  fetch("https://hook.us2.make.com/fi621r3kboamr14gyp8vcfcdvm21ssxf", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });

  window.location.href =
    "https://wa.me/5583981104822?text=" + encodeURIComponent(msg);
}

/* ================= MASKS ================= */

function maskDate(v) {
  return v.replace(/\D/g, "")
    .replace(/(\d{2})(\d)/, "$1/$2")
    .replace(/(\d{2})(\d)/, "$1/$2")
    .replace(/(\d{4}).*/, "$1");
}

function maskCPF(v) {
  return v.replace(/\D/g, "")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d{1,2})/, "$1-$2")
    .replace(/(-\d{2}).*/, "$1");
}

function maskWhats(v) {
  return v.replace(/\D/g, "")
    .replace(/(\d{2})(\d)/, "($1) $2")
    .replace(/(\d{1})(\d{4})(\d{4})$/, "$1 $2-$3");
}

render();
