const cardapio = [

    {
        dia: "Segunda-feira",
        prato: "Frango Assado",
        acompanhamento: "Arroz, feijão e salada"
    },

    {
        dia: "Terça-feira",
        prato: "Carne Moída com Legumes",
        acompanhamento: "Arroz, feijão e cenoura"
    },

    {
        dia: "Quarta-feira",
        prato: "Macarrão com Molho de Carne",
        acompanhamento: "Salada e fruta"
    },

    {
        dia: "Quinta-feira",
        prato: "Frango ao Molho",
        acompanhamento: "Arroz, feijão e legumes"
    },

    {
        dia: "Sexta-feira",
        prato: "Arroz com Carne e Legumes",
        acompanhamento: "Salada e fruta"
    }

];


// Elementos da página

const listaCardapio =
    document.getElementById("listaCardapio");

const diaHoje =
    document.getElementById("diaHoje");

const pratoHoje =
    document.getElementById("pratoHoje");

const acompanhamentoHoje =
    document.getElementById("acompanhamentoHoje");


// Descobre o dia atual

const data = new Date();

const diaSemana = data.getDay();

/*

0 = Domingo
1 = Segunda
2 = Terça
3 = Quarta
4 = Quinta
5 = Sexta
6 = Sábado

*/


// Criar os cards da semana

cardapio.forEach((refeicao, index) => {

    const card =
        document.createElement("div");

    card.classList.add("card");


    if(index + 1 === diaSemana) {

        card.classList.add("atual");

    }


    card.innerHTML = `

        <h3>
            ${refeicao.dia}
        </h3>

        <h4>
            ${refeicao.prato}
        </h4>

        <p>
            ${refeicao.acompanhamento}
        </p>

    `;


    listaCardapio.appendChild(card);

});


// Mostrar comida de hoje

if(diaSemana >= 1 && diaSemana <= 5) {

    const refeicaoHoje =
        cardapio[diaSemana - 1];

    diaHoje.textContent =
        refeicaoHoje.dia;

    pratoHoje.textContent =
        refeicaoHoje.prato;

    acompanhamentoHoje.textContent =
        refeicaoHoje.acompanhamento;

}

else {

    diaHoje.textContent =
        "Final de semana";

    pratoHoje.textContent =
        "Não há aula hoje";

    acompanhamentoHoje.textContent =
        "Confira o cardápio da próxima semana.";

}