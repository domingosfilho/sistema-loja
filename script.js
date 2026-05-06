let vendas = [];
let produtos = [];
let caixa = [];

async function carregarCSV(caminho) {
    let res = await fetch(caminho);
    let texto = await res.text();
    let linhas = texto.split("\n").slice(1);
    return linhas.map(l => l.split(","));
}

async function init() {
    vendas = await carregarCSV("data/vendas.csv");
    produtos = await carregarCSV("data/produtos.csv");
    caixa = await carregarCSV("data/caixa.csv");

    calcularTudo();
}

function calcularTudo() {
    let totalVendas = 0;
    let saldoCaixa = 0;
    let produtosVendidos = {};

    vendas.forEach(v => {
        let produto_id = v[1];
        let qtd = parseInt(v[2]);
        let valor = parseFloat(v[3]);

        totalVendas += valor;

        produtosVendidos[produto_id] = (produtosVendidos[produto_id] || 0) + qtd;

        let produto = produtos.find(p => p[0] == produto_id);
        if (produto) {
            produto[2] -= qtd;
        }
    });

    caixa.forEach(c => {
        let tipo = c[1];
        let valor = parseFloat(c[2]);

        if (tipo == "entrada") saldoCaixa += valor;
        else saldoCaixa -= valor;
    });

    let maisVendido = Object.entries(produtosVendidos).sort((a,b)=>b[1]-a[1])[0];

    let nomeProduto = "-";
    if (maisVendido) {
        let prod = produtos.find(p => p[0] == maisVendido[0]);
        nomeProduto = prod ? prod[1] : "-";
    }

    document.getElementById("totalVendas").innerText = "R$ " + totalVendas;
    document.getElementById("saldoCaixa").innerText = "R$ " + saldoCaixa;
    document.getElementById("maisVendido").innerText = nomeProduto;

    listarProdutos();
    listarVendas();
}

function listarProdutos() {
    let html = "";

    produtos.forEach(p => {
        html += `
        <tr>
            <td>${p[0]}</td>
            <td>${p[1]}</td>
            <td>${p[2]}</td>
            <td>R$ ${p[3]}</td>
        </tr>`;
    });

    document.getElementById("produtos").innerHTML = html;
}

function listarVendas() {
    let resumo = {};

    vendas.forEach(v => {
        let produto_id = v[1];
        let qtd = parseInt(v[2]);
        let valor = parseFloat(v[3]);

        if (!resumo[produto_id]) {
            resumo[produto_id] = { quantidade: 0, total: 0 };
        }

        resumo[produto_id].quantidade += qtd;
        resumo[produto_id].total += valor;
    });

    let html = "";

    Object.keys(resumo).forEach(id => {
        let prod = produtos.find(p => p[0] == id);

        if (prod) {
            html += `
            <tr>
                <td>${prod[1]}</td>
                <td>${resumo[id].quantidade}</td>
                <td>R$ ${prod[3]}</td>
                <td class="text-success fw-bold">R$ ${resumo[id].total}</td>
            </tr>`;
        }
    });

    document.getElementById("tabelaVendas").innerHTML = html;
}

init();