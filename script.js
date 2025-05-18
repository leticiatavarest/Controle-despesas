// Seleciona os elementos da página
const form = document.getElementById('form-despesa');
const lista = document.getElementById('lista-despesas');
const totalDiv = document.getElementById('total');
const historicoDiv = document.getElementById('historico-categorias');

let despesas = [];
let editandoIndex = null;

// Carrega as despesas do servidor ao iniciar
window.addEventListener('DOMContentLoaded', () => {
    fetch('http://localhost:3000/despesas')
        .then(res => res.json())
        .then(data => {
            despesas = data;
            atualizarLista();
            atualizarTotal();
        });
});

// Envio do formulário (adiciona ou edita)
form.addEventListener('submit', function (e) {
    e.preventDefault();

    const descricao = document.getElementById('descricao').value;
    const valor = parseFloat(document.getElementById('valor').value);
    const categoria = document.getElementById('categoria').value;

    if (!descricao || isNaN(valor) || !categoria) {
        alert("Preencha todos os campos corretamente!");
        return;
    }

    const novaDespesa = { descricao, valor, categoria };

    if (editandoIndex !== null) {
        const id = despesas[editandoIndex].id;

        fetch(`http://localhost:3000/despesas/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(novaDespesa)
        })
            .then(res => res.json())
            .then((d) => {
                despesas[editandoIndex] = d;
                atualizarLista();
                atualizarTotal();
                editandoIndex = null;
                form.reset();
            });

    } else {
        fetch('http://localhost:3000/despesas', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(novaDespesa)
        })
            .then(res => res.json())
            .then((d) => {
                despesas.push(d);
                atualizarLista();
                atualizarTotal();
                form.reset();
            });
    }
});

// Excluir despesa
function excluirDespesa(e) {
    const index = e.target.closest('button').dataset.index;
    const id = despesas[index].id;

    fetch(`http://localhost:3000/despesas/${id}`, {
        method: 'DELETE'
    })
        .then(() => {
            despesas.splice(index, 1);
            atualizarLista();
            atualizarTotal();
        });
}

// Editar despesa
function iniciarEdicao(e) {
    const index = e.target.closest('button').dataset.index;
    const despesa = despesas[index];

    document.getElementById('descricao').value = despesa.descricao;
    document.getElementById('valor').value = despesa.valor;
    document.getElementById('categoria').value = despesa.categoria;

    editandoIndex = index;
}


// Ícones por categoria
function categoriaParaIcone(categoria) {
    const icones = {
        "Alimentação": "fa-utensils",
        "Transporte": "fa-bus",
        "Saúde": "fa-heartbeat",
        "Lazer": "fa-gamepad",
        "Cartões de Crédito": "fa-credit-card",
        "Outros": "fa-ellipsis-h"
    };
    return `<i class="fas ${icones[categoria] || 'fa-tag'}"></i>`;
}

//Atualiza a lista de despesas
function atualizarLista() {
    lista.innerHTML = '';

    despesas.forEach((d, index) => {
        const item = document.createElement('li');
        const valorFormatado = d.valor.toLocaleString('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        });

        item.innerHTML = `
            <span>${d.descricao} - ${valorFormatado} ${categoriaParaIcone(d.categoria)}</span>
            <span>
                <button class="btn-editar" data-index="${index}"><i class="fas fa-pen"></i></button>
                <button class="btn-excluir" data-index="${index}"><i class="fas fa-trash-alt"></i></button>
            </span>
        `;

        lista.appendChild(item);
    });

    document.querySelectorAll('.btn-editar').forEach(btn =>
        btn.addEventListener('click', iniciarEdicao)
    );
    document.querySelectorAll('.btn-excluir').forEach(btn =>
        btn.addEventListener('click', excluirDespesa)
    );
}



// Adiciona eventos de clique aos botões
document.querySelectorAll('.btn-editar').forEach(btn =>
    btn.addEventListener('click', iniciarEdicao)
);
document.querySelectorAll('.btn-excluir').forEach(btn =>
    btn.addEventListener('click', excluirDespesa)
);



// Atualiza o total
function atualizarTotal() {
    const total = despesas.reduce((acc, d) => acc + d.valor, 0);
    const totalFormatado = total.toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    });

    totalDiv.textContent = `Total: ${totalFormatado}`;
}

// Histórico por categoria
document.getElementById('btn-historico').addEventListener('click', exibirHistoricoPorCategoria);

function exibirHistoricoPorCategoria(e) {
    e.preventDefault();
    historicoDiv.innerHTML = '';

    const categorias = {};

    despesas.forEach((d) => {
        if (!categorias[d.categoria]) {
            categorias[d.categoria] = [];
        }
        categorias[d.categoria].push(d);
    });

    if (Object.keys(categorias).length === 0) {
        historicoDiv.textContent = 'Nenhuma despesa cadastrada ainda.';
        return;
    }

    for (const categoria in categorias) {
        const categoriaTitulo = document.createElement('h3');
        categoriaTitulo.innerHTML = `${categoriaParaIcone(categoria)} Categoria: ${categoria}`;
        historicoDiv.appendChild(categoriaTitulo);

        const listaCat = document.createElement('ul');

        categorias[categoria].forEach((d) => {
            const item = document.createElement('li');
            item.innerHTML = `${d.descricao} - R$ ${d.valor.toFixed(2)}`;
            listaCat.appendChild(item);
        });

        historicoDiv.appendChild(listaCat);
    }
}



