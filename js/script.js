// ============================
// SELEÇÃO DE ELEMENTOS (DOM)
// ============================

// Container onde todas as notas serão renderizadas
const notesContainer = document.querySelector("#notes-container");

// Input onde o usuário digita a nova nota
const noteInput = document.querySelector("#note-content");

// Botão de adicionar nota
const addNoteBtn = document.querySelector(".add-note");

// Input de busca
const searchInput = document.querySelector("#search-input");

// Botão de exportação
const exportBtn = document.querySelector("#export-notes");


// ============================
// FUNÇÕES PRINCIPAIS
// ============================

// Renderiza todas as notas na tela
function showNotes() {
  cleanNotes(); // limpa o container antes de renderizar novamente

  // percorre todas as notas e cria elementos HTML para cada uma
  getNotes().forEach((note) => {
    const noteElement = createNote(note.id, note.content, note.fixed);
    notesContainer.appendChild(noteElement);
  });
}


// Busca notas no localStorage
function getNotes() {
  // Recupera do localStorage ou retorna array vazio
  const notes = JSON.parse(localStorage.getItem("notes") || "[]");

  // Ordena: notas fixadas aparecem primeiro
  const orderedNotes = notes.sort((a, b) => (a.fixed > b.fixed ? -1 : 1));

  return orderedNotes;
}


// Limpa todas as notas da tela
function cleanNotes() {
  notesContainer.replaceChildren([]); // remove todos os filhos
}


// Salva as notas no localStorage
function saveNotes(notes) {
  localStorage.setItem("notes", JSON.stringify(notes));
}


// Cria um elemento de nota no DOM
function createNote(id, content, fixed) {
  const element = document.createElement("div");
  element.classList.add("note");

  // Área de texto da nota
  const textarea = document.createElement("textarea");
  textarea.value = content;
  textarea.placeholder = "Adicione algum texto...";
  element.appendChild(textarea);

  // Se estiver fixada, adiciona classe
  if (fixed) {
    element.classList.add("fixed");
  }

  // Ícone de fixar
  const pinIcon = document.createElement("i");
  pinIcon.classList.add(...["bi", "bi-pin"]);
  element.appendChild(pinIcon);

  // Ícone de deletar
  const deleteIcon = document.createElement("i");
  deleteIcon.classList.add(...["bi", "bi-x-lg"]);
  element.appendChild(deleteIcon);

  // Ícone de duplicar
  const duplicateIcon = document.createElement("i");
  duplicateIcon.classList.add(...["bi", "bi-file-earmark-plus"]);
  element.appendChild(duplicateIcon);


  // ============================
  // EVENTOS DA NOTA
  // ============================

  // Atualiza conteúdo enquanto digita
  element.querySelector("textarea").addEventListener("keydown", () => {
    const noteContent = element.querySelector("textarea").value;
    updateNote(id, noteContent);
  });

  // Deletar nota
  element.querySelector(".bi-x-lg").addEventListener("click", () => {
    deleteNote(id, element);
  });

  // Fixar/desfixar nota
  element.querySelector(".bi-pin").addEventListener("click", () => {
    toggleFixNote(id);
  });

  // Duplicar nota
  element
    .querySelector(".bi-file-earmark-plus")
    .addEventListener("click", () => {
      copyNote(id);
    });

  return element;
}


// ============================
// CRUD DE NOTAS
// ============================

// Cria nova nota
function addNote() {
  const notes = getNotes();

  
  const noteInput = document.querySelector("#note-content");

  const noteObject = {
    id: generateId(), // id único
    content: noteInput.value, // conteúdo digitado
    fixed: false, // começa não fixada
  };

  const noteElement = createNote(noteObject.id, noteObject.content);

  notesContainer.appendChild(noteElement);

  notes.push(noteObject); // adiciona no array

  saveNotes(notes); // salva no storage
}


// Gera ID aleatório
function generateId() {
  return Math.floor(Math.random() * 5000);
}


// Atualiza conteúdo da nota
function updateNote(id, newContent) {
  const notes = getNotes();

  // encontra a nota pelo id
  const targetNote = notes.filter((note) => note.id === id)[0];

  targetNote.content = newContent;

  saveNotes(notes);
}


// Deleta nota
function deleteNote(id, element) {
  const notes = getNotes().filter((note) => note.id !== id);

  saveNotes(notes);

  // remove do DOM
  notesContainer.removeChild(element);
}


// Alterna estado de fixação
function toggleFixNote(id) {
  const notes = getNotes();
  const targetNote = notes.filter((note) => note.id === id)[0];

  targetNote.fixed = !targetNote.fixed;

  saveNotes(notes);

  showNotes(); // re-renderiza para reordenar
}


// ============================
// BUSCA E DUPLICAÇÃO
// ============================

// Busca notas pelo conteúdo
function searchNotes(search) {
  const searchResults = getNotes().filter((note) =>
    note.content.includes(search)
  );

  if (search !== "") {
    cleanNotes();

    searchResults.forEach((note) => {
      const noteElement = createNote(note.id, note.content);
      notesContainer.appendChild(noteElement);
    });

    return;
  }

  cleanNotes();
  showNotes();
}


// Duplica nota existente
function copyNote(id) {
  const notes = getNotes();
  const targetNote = notes.filter((note) => note.id === id)[0];

  const noteObject = {
    id: generateId(),
    content: targetNote.content,
    fixed: false,
  };

  const noteElement = createNote(noteObject.id, noteObject.content, false);

  notesContainer.appendChild(noteElement);

  notes.push(noteObject);

  saveNotes(notes);
}


// ============================
// EXPORTAÇÃO CSV
// ============================

function exportData() {
  const notes = JSON.parse(localStorage.getItem("notes") || "[]");

  // Cria estrutura CSV
  const csvString = [
    ["ID", "Conteúdo", "Fixado?"],
    ...notes.map((note) => [note.id, note.content, note.fixed]),
  ]
    .map((e) => e.join(",")) // separa por vírgula
    .join("\n"); // quebra de linha

  // Cria link para download
  const element = document.createElement("a");

  element.href = "data:text/csv;charset=utf-8," + encodeURI(csvString);
  element.target = "_blank";
  element.download = "export.csv";

  element.click(); // dispara download
}


// ============================
// EVENTOS GLOBAIS
// ============================

// Clique no botão adicionar
addNoteBtn.addEventListener("click", () => addNote());

// Busca em tempo real
searchInput.addEventListener("keyup", (e) => {
  const search = e.target.value;
  searchNotes(search);
});

// Adicionar nota com Enter
noteInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    addNote();
  }
});

// Exportar CSV
exportBtn.addEventListener("click", () => {
  exportData();
});


// ============================
// INICIALIZAÇÃO
// ============================

// Carrega notas ao abrir a aplicação
showNotes();